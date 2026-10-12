<?php
declare(strict_types=1);

namespace App\Controllers;

use App\{Audit, Database, HttpException, Request, Response, Validator};

final class AdminController
{
    private const ROLES = 'student,registrar,cashier,department,admin';

    public function users(Request $req): void
    {
        $rows = Database::all(
            'SELECT u.id, u.name, u.username, u.role, u.is_active, d.name AS department, s.student_no
               FROM users u
               LEFT JOIN departments d ON d.id = u.department_id
               LEFT JOIN students s ON s.user_id = u.id
              ORDER BY u.id'
        );
        Response::json(array_map(fn($r) => [
            'id' => (int) $r['id'],
            'name' => $r['name'],
            'username' => $r['username'],
            'role' => $r['role'],
            'is_active' => (bool) $r['is_active'],
            'department' => $r['department'],
            'student_no' => $r['student_no'],
        ], $rows));
    }

    public function meta(Request $req): void
    {
        Response::json([
            'roles' => explode(',', self::ROLES),
            'programs' => Database::all('SELECT id, code, name FROM programs ORDER BY code'),
            'departments' => Database::all('SELECT id, code, name FROM departments ORDER BY name'),
        ]);
    }

    public function create(Request $req): void
    {
        $data = Validator::validate($req->body, [
            'name' => 'required|string|min:2|max:120',
            'username' => 'required|string|regex:/^[A-Za-z0-9._-]{4,50}$/',
            'role' => 'required|in:' . self::ROLES,
            'password' => 'required|string|min:8|max:100',
        ]);
        $this->assertStrongPassword($data['password']);

        $extra = [];
        if ($data['role'] === 'student') {
            $extra = Validator::validate($req->body, [
                'student_no' => 'required|string|regex:/^[0-9]{4}-[0-9]{5}$/',
                'program_id' => 'required|int|min:1',
                'year_level' => 'required|int|min:1|max:6',
            ]);
            if (!Database::value('SELECT id FROM programs WHERE id = ?', [$extra['program_id']])) {
                throw new HttpException(422, 'The selected program is invalid.', ['program_id' => ['The selected program is invalid.']]);
            }
            if (Database::value('SELECT id FROM students WHERE student_no = ?', [$extra['student_no']])) {
                throw new HttpException(422, 'That student number is already in use.', ['student_no' => ['That student number is already in use.']]);
            }
        } elseif ($data['role'] === 'department') {
            $extra = Validator::validate($req->body, ['department_id' => 'required|int|min:1']);
            if (!Database::value('SELECT id FROM departments WHERE id = ?', [$extra['department_id']])) {
                throw new HttpException(422, 'The selected department is invalid.', ['department_id' => ['The selected department is invalid.']]);
            }
        }
        if (Database::value('SELECT id FROM users WHERE username = ?', [$data['username']])) {
            throw new HttpException(422, 'That username is already taken.', ['username' => ['That username is already taken.']]);
        }

        $pdo = Database::pdo();
        $pdo->beginTransaction();
        try {
            $userId = Database::insert(
                'INSERT INTO users (department_id, username, password_hash, name, role) VALUES (?, ?, ?, ?, ?)',
                [$extra['department_id'] ?? null, $data['username'], password_hash($data['password'], PASSWORD_BCRYPT), $data['name'], $data['role']]
            );
            if ($data['role'] === 'student') {
                Database::run(
                    'INSERT INTO students (user_id, program_id, student_no, year_level) VALUES (?, ?, ?, ?)',
                    [$userId, $extra['program_id'], $extra['student_no'], $extra['year_level']]
                );
            }
            $pdo->commit();
        } catch (\Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }

        Audit::log($req->user['id'], 'user_created', $data['username'] . ' (' . $data['role'] . ')');
        Response::json([
            'id' => $userId,
            'name' => $data['name'],
            'username' => $data['username'],
            'role' => $data['role'],
            'is_active' => true,
        ], 201);
    }

    /** Update name / active flag / password (role cannot be changed). */
    public function update(Request $req): void
    {
        $id = $req->params['id'];
        $target = Database::one('SELECT id, username FROM users WHERE id = ?', [$id]);
        if (!$target) {
            throw new HttpException(404, 'User not found.');
        }

        $sets = [];
        $params = [];
        $changes = [];

        if (array_key_exists('name', $req->body)) {
            $d = Validator::validate($req->body, ['name' => 'required|string|min:2|max:120']);
            $sets[] = 'name = ?';
            $params[] = $d['name'];
            $changes[] = 'name';
        }
        if (array_key_exists('is_active', $req->body)) {
            $active = filter_var($req->body['is_active'], FILTER_VALIDATE_BOOLEAN);
            if (!$active && $id === $req->user['id']) {
                throw new HttpException(422, 'You cannot deactivate your own account.');
            }
            $sets[] = 'is_active = ?';
            $params[] = $active ? 1 : 0;
            $changes[] = $active ? 'activated' : 'deactivated';
        }
        if (!empty($req->body['password'])) {
            $d = Validator::validate($req->body, ['password' => 'required|string|min:8|max:100']);
            $this->assertStrongPassword($d['password']);
            $sets[] = 'password_hash = ?';
            $params[] = password_hash($d['password'], PASSWORD_BCRYPT);
            $sets[] = 'failed_attempts = 0';
            $sets[] = 'locked_until = NULL';
            $changes[] = 'password reset';
        }
        if (!$sets) {
            throw new HttpException(422, 'Nothing to update.');
        }

        $params[] = $id;
        Database::run('UPDATE users SET ' . implode(', ', $sets) . ' WHERE id = ?', $params);

        // deactivation or password reset must end any existing sessions
        if (in_array('deactivated', $changes, true) || in_array('password reset', $changes, true)) {
            Database::run('DELETE FROM api_tokens WHERE user_id = ?', [$id]);
        }
        Audit::log($req->user['id'], 'user_updated', $target['username'] . ': ' . implode(', ', $changes));
        Response::json(['message' => 'User updated.']);
    }

    public function auditLogs(Request $req): void
    {
        $rows = Database::all(
            'SELECT a.id, a.action, a.details, a.ip_address, a.created_at, u.username
               FROM audit_logs a LEFT JOIN users u ON u.id = a.user_id
              ORDER BY a.id DESC LIMIT 100'
        );
        Response::json($rows);
    }

    private function assertStrongPassword(string $pw): void
    {
        if (!preg_match('/[A-Za-z]/', $pw) || !preg_match('/[0-9]/', $pw)) {
            throw new HttpException(422, 'Password must contain at least one letter and one number.', ['password' => ['Password must contain at least one letter and one number.']]);
        }
    }
}
