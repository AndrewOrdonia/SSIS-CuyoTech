<?php
declare(strict_types=1);

namespace App\Controllers;

use App\{Audit, Auth, Config, Database, HttpException, Request, Response, Validator};

final class AuthController
{
    private const MAX_ATTEMPTS = 5;
    private const LOCK_MINUTES = 15;

    public function login(Request $req): void
    {
        $data = Validator::validate($req->body, [
            'username' => 'required|string|max:50',
            'password' => 'required|string|max:200',
        ]);

        $user = Database::one('SELECT * FROM users WHERE username = ?', [$data['username']]);

        if (!$user) {
            password_hash($data['password'], PASSWORD_BCRYPT); // equalise timing: no username enumeration
            $this->fail('Invalid username or password.');
        }

        // Account lock-out (brute-force protection)
        $lockedMinutes = Database::value(
            'SELECT CEIL(TIMESTAMPDIFF(SECOND, NOW(), locked_until) / 60) FROM users WHERE id = ? AND locked_until > NOW()',
            [$user['id']]
        );
        if ($lockedMinutes !== null) {
            Audit::log((int) $user['id'], 'login_blocked', 'Account temporarily locked');
            $this->fail("Too many failed attempts. Try again in {$lockedMinutes} minute(s).");
        }

        if (!password_verify($data['password'], $user['password_hash'])) {
            $attempts = (int) $user['failed_attempts'] + 1;
            if ($attempts >= self::MAX_ATTEMPTS) {
                Database::run(
                    'UPDATE users SET failed_attempts = 0, locked_until = DATE_ADD(NOW(), INTERVAL ? MINUTE) WHERE id = ?',
                    [self::LOCK_MINUTES, $user['id']]
                );
                Audit::log((int) $user['id'], 'account_locked', 'Too many failed logins');
            } else {
                Database::run('UPDATE users SET failed_attempts = ? WHERE id = ?', [$attempts, $user['id']]);
            }
            Audit::log((int) $user['id'], 'login_failed', null);
            $this->fail('Invalid username or password.');
        }

        if (!(int) $user['is_active']) {
            Audit::log((int) $user['id'], 'login_inactive', null);
            $this->fail('This account has been deactivated. Please contact the administrator.');
        }

        Database::run(
            'UPDATE users SET failed_attempts = 0, locked_until = NULL, last_login_at = NOW() WHERE id = ?',
            [$user['id']]
        );
        $token = Auth::issueToken((int) $user['id']);
        Audit::log((int) $user['id'], 'login', null);

        Response::json([
            'user' => [
                'id' => (int) $user['id'],
                'name' => $user['name'],
                'username' => $user['username'],
                'role' => $user['role'],
            ],
            'token' => $token,
        ]);
    }

    public function logout(Request $req): void
    {
        Auth::revoke($req->bearerToken());
        Audit::log($req->user['id'], 'logout', null);
        Response::json(['message' => 'Logged out']);
    }

    public function me(Request $req): void
    {
        Response::json([
            'id' => $req->user['id'],
            'name' => $req->user['name'],
            'username' => $req->user['username'],
            'role' => $req->user['role'],
        ]);
    }

    private function fail(string $message): never
    {
        throw new HttpException(422, $message, ['username' => [$message]]);
    }
}
