<?php
declare(strict_types=1);

namespace App;

/** Shared helpers for student / billing lookups. */
final class Students
{
    /** The students.id belonging to a logged-in student user (404 if none). */
    public static function idForUser(int $userId): int
    {
        $id = Database::value('SELECT id FROM students WHERE user_id = ?', [$userId]);
        if ($id === null) {
            throw new HttpException(404, 'Student record not found.');
        }
        return (int) $id;
    }

    public static function requireExisting(int $studentId): array
    {
        $row = Database::one(
            'SELECT s.id, s.student_no, s.year_level, u.name, p.code AS program
               FROM students s JOIN users u ON u.id = s.user_id JOIN programs p ON p.id = s.program_id
              WHERE s.id = ?',
            [$studentId]
        );
        if (!$row) {
            throw new HttpException(404, 'Student not found.');
        }
        return $row;
    }

    /** Total still owed by a student (charges - payments). */
    public static function balance(int $studentId): float
    {
        $v = Database::value(
            'SELECT COALESCE(SUM(c.amount), 0) - COALESCE(
                (SELECT SUM(p.amount) FROM payments p JOIN charges c2 ON c2.id = p.charge_id WHERE c2.student_id = ?), 0)
               FROM charges c WHERE c.student_id = ?',
            [$studentId, $studentId]
        );
        return round((float) $v, 2);
    }

    /** Remaining balance of one charge. */
    public static function chargeBalance(int $chargeId): float
    {
        $v = Database::value(
            'SELECT c.amount - COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.charge_id = c.id), 0)
               FROM charges c WHERE c.id = ?',
            [$chargeId]
        );
        return round((float) $v, 2);
    }
}
