<?php
declare(strict_types=1);

namespace App\Controllers;

use App\{Audit, Config, Database, HttpException, Request, Response, Students, Validator};

final class RegistrarController
{
    private const GRADES = [1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 5.0];

    /** All enrollments of one student (every term). */
    public function studentEnrollments(Request $req): void
    {
        $student = Students::requireExisting($req->params['id']);
        $rows = Database::all(
            'SELECT e.id, e.grade, t.name AS term, t.is_current, o.schedule,
                    c.id AS course_id, c.code, c.title, c.units
               FROM enrollments e
               JOIN course_offerings o ON o.id = e.offering_id
               JOIN courses c ON c.id = o.course_id
               JOIN terms t ON t.id = o.term_id
              WHERE e.student_id = ?
              ORDER BY t.is_current DESC, t.id DESC, c.code',
            [$student['id']]
        );
        Response::json([
            'student' => [
                'id' => (int) $student['id'],
                'student_no' => $student['student_no'],
                'name' => $student['name'],
                'program' => $student['program'],
                'year_level' => (int) $student['year_level'],
            ],
            'enrollments' => array_map(fn($r) => [
                'id' => (int) $r['id'],
                'term' => $r['term'],
                'is_current' => (bool) $r['is_current'],
                'schedule' => $r['schedule'],
                'grade' => $r['grade'] !== null ? (float) $r['grade'] : null,
                'course' => [
                    'id' => (int) $r['course_id'],
                    'code' => $r['code'],
                    'title' => $r['title'],
                    'units' => (int) $r['units'],
                ],
            ], $rows),
        ]);
    }

    /** Enroll a student in one or more courses for the current term (creates tuition charges). */
    public function enroll(Request $req): void
    {
        $data = Validator::validate($req->body, ['student_id' => 'required|int|min:1']);
        $courseIds = $req->input('course_ids');
        if (!is_array($courseIds) || !$courseIds || count($courseIds) > 12) {
            throw new HttpException(422, 'Select at least one course (maximum of 12).', ['course_ids' => ['Select at least one course (maximum of 12).']]);
        }
        $courseIds = array_values(array_unique(array_map('intval', $courseIds)));
        $student = Students::requireExisting($data['student_id']);
        $rate = (float) Config::get('TUITION_PER_UNIT', '500');

        $enrolled = [];
        $skipped = [];
        $pdo = Database::pdo();
        $pdo->beginTransaction();
        try {
            foreach ($courseIds as $courseId) {
                $off = Database::one(
                    'SELECT o.id AS offering_id, c.code, c.title, c.units
                       FROM course_offerings o
                       JOIN courses c ON c.id = o.course_id
                       JOIN terms t ON t.id = o.term_id
                      WHERE c.id = ? AND t.is_current = 1',
                    [$courseId]
                );
                if (!$off) {
                    throw new HttpException(422, "Course #$courseId is not offered this term.");
                }
                $exists = Database::value(
                    'SELECT id FROM enrollments WHERE student_id = ? AND offering_id = ?',
                    [$student['id'], $off['offering_id']]
                );
                if ($exists !== null) {
                    $skipped[] = $off['code'];
                    continue;
                }
                $enrollmentId = Database::insert(
                    'INSERT INTO enrollments (student_id, offering_id, enrolled_by) VALUES (?, ?, ?)',
                    [$student['id'], $off['offering_id'], $req->user['id']]
                );
                Database::run(
                    'INSERT INTO charges (student_id, enrollment_id, description, amount) VALUES (?, ?, ?, ?)',
                    [$student['id'], $enrollmentId, 'Tuition - ' . $off['code'] . ' ' . $off['title'], round($rate * (int) $off['units'], 2)]
                );
                $enrolled[] = $off['code'];
            }
            $pdo->commit();
        } catch (\Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }

        Audit::log($req->user['id'], 'enrolled', $student['student_no'] . ': ' . implode(',', $enrolled));
        Response::json([
            'message' => count($enrolled) . ' subject(s) enrolled.',
            'enrolled' => $enrolled,
            'skipped' => $skipped,
        ], 201);
    }

    /** Remove a current-term enrollment that has no grade and no payment yet. */
    public function removeEnrollment(Request $req): void
    {
        $id = $req->params['id'];
        $row = Database::one(
            'SELECT e.id, e.grade, t.is_current, c.id AS charge_id
               FROM enrollments e
               JOIN course_offerings o ON o.id = e.offering_id
               JOIN terms t ON t.id = o.term_id
               LEFT JOIN charges c ON c.enrollment_id = e.id
              WHERE e.id = ?',
            [$id]
        );
        if (!$row) {
            throw new HttpException(404, 'Enrollment not found.');
        }
        if (!(int) $row['is_current'] || $row['grade'] !== null) {
            throw new HttpException(422, 'Only current-term subjects without a grade can be removed.');
        }
        if ($row['charge_id'] !== null && (float) Database::value('SELECT COALESCE(SUM(amount),0) FROM payments WHERE charge_id = ?', [$row['charge_id']]) > 0) {
            throw new HttpException(422, 'This subject already has a payment and cannot be removed.');
        }
        Database::run('DELETE FROM enrollments WHERE id = ?', [$id]); // charge is removed by ON DELETE CASCADE
        Audit::log($req->user['id'], 'enrollment_removed', "Enrollment #$id");
        Response::json(['message' => 'Subject removed.']);
    }

    public function encodeGrade(Request $req): void
    {
        $data = Validator::validate($req->body, [
            'student_id' => 'required|int|min:1',
            'course_id' => 'required|int|min:1',
            'grade' => 'required|numeric',
        ]);
        if (!in_array(round($data['grade'], 2), self::GRADES, true)) {
            throw new HttpException(422, 'Grade must be one of 1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00 or 5.00.', ['grade' => ['Invalid grade value.']]);
        }

        $row = Database::one(
            'SELECT e.id, e.grade FROM enrollments e
               JOIN course_offerings o ON o.id = e.offering_id
               JOIN terms t ON t.id = o.term_id
              WHERE e.student_id = ? AND o.course_id = ?
              ORDER BY t.is_current DESC, e.id DESC LIMIT 1',
            [$data['student_id'], $data['course_id']]
        );
        if (!$row) {
            throw new HttpException(404, 'The student is not enrolled in this course.');
        }

        Database::run(
            'UPDATE enrollments SET grade = ?, graded_by = ?, graded_at = NOW() WHERE id = ?',
            [round($data['grade'], 2), $req->user['id'], $row['id']]
        );
        Audit::log($req->user['id'], 'grade_encoded', "Enrollment #{$row['id']}: " . ($row['grade'] ?? 'none') . ' -> ' . round($data['grade'], 2));
        Response::json(['id' => (int) $row['id'], 'grade' => round($data['grade'], 2)]);
    }
}
