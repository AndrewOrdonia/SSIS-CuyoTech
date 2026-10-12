<?php
declare(strict_types=1);

namespace App\Controllers;

use App\{Database, Request, Response, Students};

final class StudentController
{
    public function profile(Request $req): void
    {
        $row = Database::one(
            'SELECT s.student_no, s.year_level, p.code AS program, p.name AS program_name, u.name, u.username
               FROM students s
               JOIN users u ON u.id = s.user_id
               JOIN programs p ON p.id = s.program_id
              WHERE s.user_id = ?',
            [$req->user['id']]
        );
        if (!$row) {
            Response::json(['message' => 'Student record not found.'], 404);
        }
        $row['year_level'] = (int) $row['year_level'];
        Response::json($row);
    }

    public function grades(Request $req): void
    {
        $sid = Students::idForUser($req->user['id']);
        $rows = Database::all(
            'SELECT e.id, c.code, c.title, c.units, e.grade
               FROM enrollments e
               JOIN course_offerings o ON o.id = e.offering_id
               JOIN courses c ON c.id = o.course_id
              WHERE e.student_id = ? AND e.grade IS NOT NULL
              ORDER BY e.id',
            [$sid]
        );
        Response::json(array_map(fn($r) => [
            'id' => (int) $r['id'],
            'course' => ['code' => $r['code'], 'title' => $r['title'], 'units' => (int) $r['units']],
            'grade' => (float) $r['grade'],
        ], $rows));
    }

    public function subjects(Request $req): void
    {
        $sid = Students::idForUser($req->user['id']);
        $rows = Database::all(
            'SELECT e.id, c.code, c.title, c.units, o.schedule
               FROM enrollments e
               JOIN course_offerings o ON o.id = e.offering_id
               JOIN courses c ON c.id = o.course_id
               JOIN terms t ON t.id = o.term_id
              WHERE e.student_id = ? AND t.is_current = 1
              ORDER BY c.code',
            [$sid]
        );
        Response::json(array_map(fn($r) => [
            'id' => (int) $r['id'],
            'code' => $r['code'],
            'title' => $r['title'],
            'units' => (int) $r['units'],
            'schedule' => $r['schedule'],
        ], $rows));
    }

    public function dashboard(Request $req): void
    {
        $sid = Students::idForUser($req->user['id']);

        $enrolled = (int) Database::value(
            'SELECT COUNT(*) FROM enrollments e
               JOIN course_offerings o ON o.id = e.offering_id
               JOIN terms t ON t.id = o.term_id
              WHERE e.student_id = ? AND t.is_current = 1',
            [$sid]
        );
        $pendingDocs = (int) Database::value(
            "SELECT COUNT(*) FROM document_requests WHERE student_id = ? AND status IN ('pending','processing')",
            [$sid]
        );
        $totalDepts = (int) Database::value('SELECT COUNT(*) FROM departments');
        $approved = (int) Database::value("SELECT COUNT(*) FROM clearances WHERE student_id = ? AND status = 'approved'", [$sid]);
        $rejected = (int) Database::value("SELECT COUNT(*) FROM clearances WHERE student_id = ? AND status = 'rejected'", [$sid]);

        $clearance = 'In Progress';
        if ($rejected > 0) {
            $clearance = 'On Hold';
        } elseif ($totalDepts > 0 && $approved === $totalDepts) {
            $clearance = 'Cleared';
        }

        $activity = [];

        foreach (Database::all(
            'SELECT dt.name, r.status, r.updated_at AS happened_at FROM document_requests r
               JOIN document_types dt ON dt.id = r.document_type_id
              WHERE r.student_id = ? ORDER BY r.updated_at DESC LIMIT 3',
            [$sid]
        ) as $r) {
            $map = [
                'pending' => ['Pending approval', 'amber'],
                'processing' => ['Being processed', 'blue'],
                'approved' => ['Approved', 'emerald'],
                'rejected' => ['Request rejected', 'red'],
            ];
            [$sub, $tone] = $map[$r['status']] ?? [$r['status'], 'gray'];
            $activity[] = ['type' => 'document', 'title' => 'Requested ' . $r['name'], 'subtitle' => $sub, 'tone' => $tone, 'happened_at' => $r['happened_at']];
        }

        foreach (Database::all(
            'SELECT c.code, e.grade, e.graded_at AS happened_at FROM enrollments e
               JOIN course_offerings o ON o.id = e.offering_id
               JOIN courses c ON c.id = o.course_id
              WHERE e.student_id = ? AND e.grade IS NOT NULL AND e.graded_at IS NOT NULL
              ORDER BY e.graded_at DESC LIMIT 3',
            [$sid]
        ) as $r) {
            $activity[] = ['type' => 'grade', 'title' => 'Grade posted for ' . $r['code'] . ': ' . (float) $r['grade'], 'subtitle' => 'Official release', 'tone' => 'gray', 'happened_at' => $r['happened_at']];
        }

        foreach (Database::all(
            "SELECT d.name, cl.status, cl.processed_at AS happened_at FROM clearances cl
               JOIN departments d ON d.id = cl.department_id
              WHERE cl.student_id = ? AND cl.status <> 'pending' AND cl.processed_at IS NOT NULL
              ORDER BY cl.processed_at DESC LIMIT 3",
            [$sid]
        ) as $r) {
            $ok = $r['status'] === 'approved';
            $activity[] = [
                'type' => 'clearance',
                'title' => 'Clearance from ' . $r['name'] . ($ok ? ' approved' : ' rejected'),
                'subtitle' => $ok ? 'Completed' : 'Action required',
                'tone' => $ok ? 'emerald' : 'red',
                'happened_at' => $r['happened_at'],
            ];
        }

        foreach (Database::all(
            'SELECT p.amount, p.reference_no, p.paid_at AS happened_at FROM payments p
               JOIN charges c ON c.id = p.charge_id
              WHERE c.student_id = ? ORDER BY p.paid_at DESC LIMIT 3',
            [$sid]
        ) as $r) {
            $activity[] = ['type' => 'payment', 'title' => 'Payment of P' . number_format((float) $r['amount'], 2) . ' received', 'subtitle' => 'Ref. ' . $r['reference_no'], 'tone' => 'gray', 'happened_at' => $r['happened_at']];
        }

        usort($activity, fn($a, $b) => strcmp($b['happened_at'], $a['happened_at']));

        Response::json([
            'stats' => [
                'enrolled_subjects' => $enrolled,
                'pending_documents' => $pendingDocs,
                'outstanding_balance' => Students::balance($sid),
                'clearance' => $clearance,
            ],
            'activity' => array_slice($activity, 0, 5),
        ]);
    }
}
