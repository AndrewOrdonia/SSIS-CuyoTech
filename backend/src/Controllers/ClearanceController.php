<?php
declare(strict_types=1);

namespace App\Controllers;

use App\{Audit, Database, HttpException, Request, Response, Students, Validator};

final class ClearanceController
{
    /** Department staff: every student with the status of THEIR department's clearance. */
    public function index(Request $req): void
    {
        $deptId = $req->user['department_id'];
        if ($deptId === null) {
            throw new HttpException(403, 'Your account is not assigned to a department.');
        }
        $params = [$deptId];
        $where = '';
        $search = trim((string) ($req->query['search'] ?? ''));
        if ($search !== '') {
            $where = ' WHERE (u.name LIKE ? OR s.student_no LIKE ?)';
            $params[] = '%' . $search . '%';
            $params[] = '%' . $search . '%';
        }

        $rows = Database::all(
            'SELECT s.id, s.student_no, u.name, p.code AS program,
                    COALESCE(cl.status, \'pending\') AS status, cl.remarks
               FROM students s
               JOIN users u ON u.id = s.user_id
               JOIN programs p ON p.id = s.program_id
               LEFT JOIN clearances cl ON cl.student_id = s.id AND cl.department_id = ?'
            . $where . ' ORDER BY u.name LIMIT 100',
            $params
        );
        $dept = Database::one('SELECT name FROM departments WHERE id = ?', [$deptId]);

        Response::json([
            'department' => $dept['name'] ?? '',
            'students' => array_map(fn($r) => [
                'id' => (int) $r['id'],
                'student_no' => $r['student_no'],
                'name' => $r['name'],
                'program' => $r['program'],
                'status' => $r['status'],
                'remarks' => $r['remarks'],
            ], $rows),
        ]);
    }

    /** Clearance status of one student across all departments. Students may only view their own. */
    public function show(Request $req): void
    {
        $studentId = $req->params['student_id'];
        if ($req->user['role'] === 'student' && Students::idForUser($req->user['id']) !== $studentId) {
            Audit::log($req->user['id'], 'access_denied', "Clearance of student #$studentId");
            throw new HttpException(403, 'You can only view your own clearance.');
        }
        Students::requireExisting($studentId);

        $rows = Database::all(
            'SELECT d.name AS department, COALESCE(cl.status, \'pending\') AS status, cl.remarks
               FROM departments d
               LEFT JOIN clearances cl ON cl.department_id = d.id AND cl.student_id = ?
              ORDER BY d.id',
            [$studentId]
        );
        Response::json($rows);
    }

    /** Department staff approves / rejects a student for their own department only. */
    public function update(Request $req): void
    {
        $deptId = $req->user['department_id'];
        if ($deptId === null) {
            throw new HttpException(403, 'Your account is not assigned to a department.');
        }
        $data = Validator::validate($req->body, [
            'status' => 'required|in:pending,approved,rejected',
            'remarks' => 'string|max:255',
        ]);
        if ($data['status'] === 'rejected' && empty($data['remarks'])) {
            throw new HttpException(422, 'Please provide remarks when rejecting a clearance.', ['remarks' => ['Remarks are required when rejecting.']]);
        }
        $studentId = $req->params['student_id'];
        Students::requireExisting($studentId);

        Database::run(
            'INSERT INTO clearances (student_id, department_id, status, remarks, processed_by, processed_at)
             VALUES (?, ?, ?, ?, ?, NOW())
             ON DUPLICATE KEY UPDATE status = VALUES(status), remarks = VALUES(remarks),
                                     processed_by = VALUES(processed_by), processed_at = NOW()',
            [$studentId, $deptId, $data['status'], $data['remarks'] ?? null, $req->user['id']]
        );
        Audit::log($req->user['id'], 'clearance_updated', "Student #$studentId dept #$deptId -> " . $data['status']);
        Response::json(['student_id' => $studentId, 'status' => $data['status'], 'remarks' => $data['remarks'] ?? null]);
    }
}
