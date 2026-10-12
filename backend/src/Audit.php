<?php
declare(strict_types=1);

namespace App;

/** Writes security-relevant events to audit_logs (accountability / ethics requirement). */
final class Audit
{
    public static function log(?int $userId, string $action, ?string $details = null): void
    {
        try {
            Database::run(
                'INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
                [$userId, $action, $details !== null ? mb_substr($details, 0, 255) : null, $_SERVER['REMOTE_ADDR'] ?? null]
            );
        } catch (\Throwable $e) {
            // auditing must never break the request
        }
    }
}
