<?php
declare(strict_types=1);

namespace App\Controllers;

use App\{Audit, Database, HttpException, Request, Response, Students, Validator};

final class DocumentController
{
    private const MAX_OPEN_REQUESTS = 5;

    public function types(Request $req): void
    {
        $rows = Database::all('SELECT id, name, fee FROM document_types ORDER BY id');
        Response::json(array_map(fn($r) => [
            'id' => (int) $r['id'],
            'name' => $r['name'],
            'fee' => (float) $r['fee'],
        ], $rows));
    }

    /** Student submits a request; a charge for the fee is created automatically. */
    public function request(Request $req): void
    {
        $data = Validator::validate($req->body, [
            'type_id' => 'required|int|min:1',
            'purpose' => 'required|string|min:3|max:255',
            'copies' => 'required|int|min:1|max:5',
        ]);
        $sid = Students::idForUser($req->user['id']);

        $type = Database::one('SELECT id, name, fee FROM document_types WHERE id = ?', [$data['type_id']]);
        if (!$type) {
            throw new HttpException(422, 'The selected document type is invalid.', ['type_id' => ['The selected document type is invalid.']]);
        }

        $open = (int) Database::value(
            "SELECT COUNT(*) FROM document_requests WHERE student_id = ? AND status IN ('pending','processing')",
            [$sid]
        );
        if ($open >= self::MAX_OPEN_REQUESTS) {
            throw new HttpException(422, 'You already have the maximum number of open requests. Please wait for them to be processed.');
        }

        $total = round((float) $type['fee'] * $data['copies'], 2);
        $pdo = Database::pdo();
        $pdo->beginTransaction();
        try {
            $requestId = Database::insert(
                'INSERT INTO document_requests (student_id, document_type_id, purpose, copies) VALUES (?, ?, ?, ?)',
                [$sid, $type['id'], $data['purpose'], $data['copies']]
            );
            Database::run(
                'INSERT INTO charges (student_id, document_request_id, description, amount) VALUES (?, ?, ?, ?)',
                [$sid, $requestId, 'Document fee - ' . $type['name'] . ' x' . $data['copies'], $total]
            );
            $pdo->commit();
        } catch (\Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }

        Audit::log($req->user['id'], 'document_requested', $type['name'] . ' x' . $data['copies']);
        Response::json([
            'id' => $requestId,
            'type' => ['name' => $type['name']],
            'copies' => $data['copies'],
            'fee' => $total,
            'paid' => false,
            'status' => 'pending',
        ], 201);
    }

    public function myRequests(Request $req): void
    {
        $sid = Students::idForUser($req->user['id']);
        $rows = Database::all(
            'SELECT r.id, dt.name AS type_name, r.copies, r.status, r.purpose, r.created_at,
                    c.amount AS fee,
                    c.amount - COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.charge_id = c.id), 0) AS balance
               FROM document_requests r
               JOIN document_types dt ON dt.id = r.document_type_id
               JOIN charges c ON c.document_request_id = r.id
              WHERE r.student_id = ?
              ORDER BY r.id DESC',
            [$sid]
        );
        Response::json(array_map(fn($r) => [
            'id' => (int) $r['id'],
            'type' => ['name' => $r['type_name']],
            'copies' => (int) $r['copies'],
            'fee' => (float) $r['fee'],
            'paid' => round((float) $r['balance'], 2) <= 0,
            'status' => $r['status'],
            'purpose' => $r['purpose'],
            'created_at' => $r['created_at'],
        ], $rows));
    }

    /** Registrar: every request, optionally filtered by status / search. */
    public function allRequests(Request $req): void
    {
        $where = [];
        $params = [];
        $status = $req->query['status'] ?? '';
        if (in_array($status, ['pending', 'processing', 'approved', 'rejected'], true)) {
            $where[] = 'r.status = ?';
            $params[] = $status;
        }
        $search = trim((string) ($req->query['search'] ?? ''));
        if ($search !== '') {
            $where[] = '(u.name LIKE ? OR s.student_no LIKE ?)';
            $params[] = '%' . $search . '%';
            $params[] = '%' . $search . '%';
        }

        $rows = Database::all(
            'SELECT r.id, r.copies, r.status, r.purpose, r.created_at,
                    dt.name AS type_name, u.name AS student_name, s.student_no,
                    c.amount AS fee,
                    c.amount - COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.charge_id = c.id), 0) AS balance
               FROM document_requests r
               JOIN students s ON s.id = r.student_id
               JOIN users u ON u.id = s.user_id
               JOIN document_types dt ON dt.id = r.document_type_id
               JOIN charges c ON c.document_request_id = r.id'
            . ($where ? ' WHERE ' . implode(' AND ', $where) : '') .
            ' ORDER BY FIELD(r.status, \'pending\', \'processing\', \'approved\', \'rejected\'), r.id DESC LIMIT 200',
            $params
        );
        Response::json(array_map(fn($r) => [
            'id' => (int) $r['id'],
            'student_name' => $r['student_name'],
            'student_no' => $r['student_no'],
            'type' => ['name' => $r['type_name']],
            'purpose' => $r['purpose'],
            'copies' => (int) $r['copies'],
            'fee' => (float) $r['fee'],
            'paid' => round((float) $r['balance'], 2) <= 0,
            'status' => $r['status'],
            'created_at' => $r['created_at'],
        ], $rows));
    }

    /** Registrar moves a request forward. Approval requires the fee to be fully paid. */
    public function updateStatus(Request $req): void
    {
        $data = Validator::validate($req->body, ['status' => 'required|in:processing,approved,rejected']);
        $id = $req->params['id'];

        $row = Database::one(
            'SELECT r.id, r.status, c.id AS charge_id FROM document_requests r
               JOIN charges c ON c.document_request_id = r.id WHERE r.id = ?',
            [$id]
        );
        if (!$row) {
            throw new HttpException(404, 'Request not found.');
        }
        if (in_array($row['status'], ['approved', 'rejected'], true)) {
            throw new HttpException(422, 'This request has already been finalised.');
        }
        if ($data['status'] === 'approved' && Students::chargeBalance((int) $row['charge_id']) > 0) {
            throw new HttpException(422, 'The document fee must be paid at the cashier before this request can be approved.');
        }

        Database::run(
            'UPDATE document_requests SET status = ?, processed_by = ? WHERE id = ?',
            [$data['status'], $req->user['id'], $id]
        );
        Audit::log($req->user['id'], 'document_status', "Request #$id -> " . $data['status']);
        Response::json(['id' => $id, 'status' => $data['status']]);
    }
}
