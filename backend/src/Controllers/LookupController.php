<?php
declare(strict_types=1);

namespace App\Controllers;

use App\{Database, Request, Response};

final class LookupController
{
    /** Staff search for students (name or student number). */
    public function students(Request $req): void
    {
        $search = trim((string) ($req->query['search'] ?? ''));
        $sql = 'SELECT s.id, s.student_no, s.year_level, u.name, p.code AS program
                  FROM students s
                  JOIN users u ON u.id = s.user_id AND u.is_active = 1
                  JOIN programs p ON p.id = s.program_id';
        $params = [];
        if ($search !== '') {
            $sql .= ' WHERE u.name LIKE ? OR s.student_no LIKE ?';
            $params = ['%' . $search . '%', '%' . $search . '%'];
        }
        $sql .= ' ORDER BY u.name LIMIT 50';

        Response::json(array_map(fn($r) => [
            'id' => (int) $r['id'],
            'student_no' => $r['student_no'],
            'name' => $r['name'],
            'program' => $r['program'],
            'year_level' => (int) $r['year_level'],
        ], Database::all($sql, $params)));
    }

    /** Courses offered in the current term. `id` is the course id. */
    public function courses(Request $req): void
    {
        $rows = Database::all(
            'SELECT c.id, c.code, c.title, c.units, o.schedule, t.name AS term
               FROM course_offerings o
               JOIN courses c ON c.id = o.course_id
               JOIN terms t ON t.id = o.term_id
              WHERE t.is_current = 1
              ORDER BY c.code'
        );
        Response::json(array_map(fn($r) => [
            'id' => (int) $r['id'],
            'code' => $r['code'],
            'title' => $r['title'],
            'units' => (int) $r['units'],
            'schedule' => $r['schedule'],
            'term' => $r['term'],
        ], $rows));
    }
}
