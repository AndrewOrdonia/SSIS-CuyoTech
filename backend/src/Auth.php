<?php
declare(strict_types=1);

namespace App;

/** Bearer-token authentication. Only a SHA-256 hash of each token is stored. */
final class Auth
{
    public static function issueToken(int $userId): string
    {
        $hours = (int) Config::get('TOKEN_TTL_HOURS', '8');
        Database::run('DELETE FROM api_tokens WHERE expires_at < NOW()');

        $plain = bin2hex(random_bytes(32));
        $id = Database::insert(
            'INSERT INTO api_tokens (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? HOUR))',
            [$userId, hash('sha256', $plain), $hours]
        );
        return $id . '|' . $plain;
    }

    public static function userFromToken(?string $token): ?array
    {
        if ($token === null || !str_contains($token, '|')) {
            return null;
        }
        [$id, $plain] = explode('|', $token, 2);
        if (!ctype_digit($id) || $plain === '') {
            return null;
        }
        $row = Database::one(
            'SELECT t.token_hash, u.id, u.name, u.username, u.role, u.department_id, u.is_active
               FROM api_tokens t JOIN users u ON u.id = t.user_id
              WHERE t.id = ? AND t.expires_at > NOW()',
            [(int) $id]
        );
        if (!$row || !hash_equals($row['token_hash'], hash('sha256', $plain)) || !(int) $row['is_active']) {
            return null;
        }
        unset($row['token_hash']);
        $row['id'] = (int) $row['id'];
        $row['department_id'] = $row['department_id'] !== null ? (int) $row['department_id'] : null;
        return $row;
    }

    public static function revoke(?string $token): void
    {
        if ($token !== null && str_contains($token, '|')) {
            [$id] = explode('|', $token, 2);
            if (ctype_digit($id)) {
                Database::run('DELETE FROM api_tokens WHERE id = ?', [(int) $id]);
            }
        }
    }
}
