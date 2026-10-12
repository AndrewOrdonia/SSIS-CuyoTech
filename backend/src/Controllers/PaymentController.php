<?php
declare(strict_types=1);

namespace App\Controllers;

use App\{Audit, Database, HttpException, Request, Response, Students, Validator};

final class PaymentController
{
    /** Charges (with remaining balance) for one student. */
    public function studentCharges(Request $req): void
    {
        $student = Students::requireExisting($req->params['id']);
        $rows = Database::all(
            'SELECT c.id, c.description, c.amount,
                    c.amount - COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.charge_id = c.id), 0) AS balance
               FROM charges c WHERE c.student_id = ? ORDER BY c.id',
            [$student['id']]
        );
        Response::json([
            'student' => [
                'id' => (int) $student['id'],
                'student_no' => $student['student_no'],
                'name' => $student['name'],
                'program' => $student['program'],
            ],
            'balance' => Students::balance((int) $student['id']),
            'charges' => array_map(fn($r) => [
                'id' => (int) $r['id'],
                'description' => $r['description'],
                'amount' => (float) $r['amount'],
                'balance' => round((float) $r['balance'], 2),
            ], $rows),
        ]);
    }

    public function create(Request $req): void
    {
        $data = Validator::validate($req->body, [
            'charge_id' => 'required|int|min:1',
            'amount' => 'required|numeric|min:0.01',
            'method' => 'required|in:cash,gcash,card,bank',
        ]);
        $amount = round($data['amount'], 2);

        $pdo = Database::pdo();
        $pdo->beginTransaction();
        try {
            // lock the charge row so two cashiers cannot over-collect at the same time
            $charge = Database::one('SELECT id, amount FROM charges WHERE id = ? FOR UPDATE', [$data['charge_id']]);
            if (!$charge) {
                throw new HttpException(404, 'Charge not found.');
            }
            $paid = (float) Database::value('SELECT COALESCE(SUM(amount),0) FROM payments WHERE charge_id = ?', [$charge['id']]);
            $balance = round((float) $charge['amount'] - $paid, 2);
            if ($balance <= 0) {
                throw new HttpException(422, 'This charge is already fully paid.');
            }
            if ($amount > $balance) {
                throw new HttpException(422, 'Amount exceeds the remaining balance of P' . number_format($balance, 2) . '.', ['amount' => ['Amount exceeds the remaining balance.']]);
            }

            $id = Database::insert(
                'INSERT INTO payments (reference_no, charge_id, cashier_id, amount, method) VALUES (?, ?, ?, ?, ?)',
                ['TMP' . bin2hex(random_bytes(8)), $charge['id'], $req->user['id'], $amount, $data['method']]
            );
            $reference = sprintf('PAY-%s-%04d', date('Y'), $id);
            Database::run('UPDATE payments SET reference_no = ? WHERE id = ?', [$reference, $id]);
            $pdo->commit();
        } catch (\Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }

        Audit::log($req->user['id'], 'payment_recorded', "$reference P" . number_format($amount, 2));
        Response::json([
            'id' => $id,
            'reference_no' => $reference,
            'amount' => $amount,
            'remaining_balance' => round($balance - $amount, 2),
            'receipt_url' => '/payments/' . $id,
        ], 201);
    }

    public function index(Request $req): void
    {
        $params = [];
        $where = '';
        $search = trim((string) ($req->query['search'] ?? ''));
        if ($search !== '') {
            $where = ' WHERE (p.reference_no LIKE ? OR u.name LIKE ? OR s.student_no LIKE ?)';
            $like = '%' . $search . '%';
            $params = [$like, $like, $like];
        }
        $rows = Database::all(self::baseSelect() . $where . ' ORDER BY p.id DESC LIMIT 100', $params);
        Response::json(array_map(fn($r) => self::format($r), $rows));
    }

    public function show(Request $req): void
    {
        $row = Database::one(self::baseSelect() . ' WHERE p.id = ?', [$req->params['id']]);
        if (!$row) {
            throw new HttpException(404, 'Receipt not found.');
        }
        Response::json(self::format($row));
    }

    private static function baseSelect(): string
    {
        return 'SELECT p.id, p.reference_no, p.amount, p.method, p.paid_at, c.description,
                       u.name AS student_name, s.student_no, cu.name AS cashier_name
                  FROM payments p
                  JOIN charges c ON c.id = p.charge_id
                  JOIN students s ON s.id = c.student_id
                  JOIN users u ON u.id = s.user_id
                  JOIN users cu ON cu.id = p.cashier_id';
    }

    private static function format(array $r): array
    {
        return [
            'id' => (int) $r['id'],
            'reference_no' => $r['reference_no'],
            'student_name' => $r['student_name'],
            'student_no' => $r['student_no'],
            'description' => $r['description'],
            'amount' => (float) $r['amount'],
            'method' => $r['method'],
            'cashier' => $r['cashier_name'],
            'paid_at' => $r['paid_at'],
        ];
    }
}
