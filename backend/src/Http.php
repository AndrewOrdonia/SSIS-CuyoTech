<?php
declare(strict_types=1);

namespace App;

/** Thrown anywhere to stop the request with a JSON error. */
final class HttpException extends \RuntimeException
{
    public function __construct(public int $status, string $message, public array $errors = [])
    {
        parent::__construct($message);
    }
}

final class Request
{
    public string $method;
    public string $path;
    public array $query;
    public array $body = [];
    public array $params = [];
    public ?array $user = null;

    public function __construct()
    {
        $this->method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
        $this->query = $_GET;

        $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
        // Works under `php -S` (/api/...) and Apache subfolders (/SSIS-main/backend/public/api/...)
        $pos = strpos($uri, '/api/');
        if ($pos !== false) {
            $uri = substr($uri, $pos + 4);
        } elseif (str_ends_with($uri, '/api')) {
            $uri = '/';
        }
        $this->path = '/' . trim($uri, '/');

        $raw = file_get_contents('php://input');
        if ($raw !== false && $raw !== '') {
            $decoded = json_decode($raw, true);
            if (!is_array($decoded)) {
                throw new HttpException(400, 'Malformed JSON body.');
            }
            $this->body = $decoded;
        }
    }

    public function input(string $key, $default = null)
    {
        return $this->body[$key] ?? $default;
    }

    public function bearerToken(): ?string
    {
        $h = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
        if ($h === '' && function_exists('getallheaders')) {
            foreach (getallheaders() as $k => $v) {
                if (strtolower($k) === 'authorization') {
                    $h = $v;
                }
            }
        }
        if (preg_match('/^Bearer\s+(\S+)$/i', $h, $m)) {
            return $m[1];
        }
        return null;
    }

    public function ip(): string
    {
        return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }
}

final class Response
{
    public static function json($data, int $status = 200): never
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRESERVE_ZERO_FRACTION);
        exit;
    }
}
