<?php
declare(strict_types=1);

/**
 * SSIS API front controller.
 *   php -S localhost:8000 -t public public/index.php      (from the backend folder)
 */

use App\{Config, HttpException, Request, Response, Router};

define('BASE_PATH', dirname(__DIR__));

spl_autoload_register(function (string $class): void {
    if (str_starts_with($class, 'App\\')) {
        $file = BASE_PATH . '/src/' . str_replace('\\', '/', substr($class, 4)) . '.php';
        if (is_file($file)) {
            require $file;
        }
    }
});
require_once BASE_PATH . '/src/Http.php'; // Request, Response, HttpException live in one file

Config::load(BASE_PATH . '/.env');
$debug = Config::bool('APP_DEBUG', true);
ini_set('display_errors', '0');
error_reporting(E_ALL);
date_default_timezone_set(Config::get('APP_TIMEZONE', 'Asia/Manila'));

// ---- Security + CORS headers -------------------------------------------
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: no-referrer');
header('Cache-Control: no-store');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = array_map('trim', explode(',', Config::get('CORS_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173')));
if ($origin !== '' && in_array($origin, $allowed, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, Accept');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
}
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ---- Dispatch ------------------------------------------------------------
try {
    $request = new Request();
    $router = new Router();
    require BASE_PATH . '/src/routes.php';
    $router->dispatch($request);
} catch (HttpException $e) {
    $payload = ['message' => $e->getMessage()];
    if ($e->errors) {
        $payload['errors'] = $e->errors;
    }
    Response::json($payload, $e->status);
} catch (Throwable $e) {
    $logDir = BASE_PATH . '/storage/logs';
    if (!is_dir($logDir)) {
        @mkdir($logDir, 0775, true);
    }
    @file_put_contents(
        $logDir . '/error.log',
        sprintf("[%s] %s: %s in %s:%d\n", date('c'), get_class($e), $e->getMessage(), $e->getFile(), $e->getLine()),
        FILE_APPEND
    );
    $payload = ['message' => 'Server error. Please try again later.'];
    if ($debug) {
        $payload['debug'] = $e->getMessage();
        if ($e instanceof PDOException) {
            $payload['hint'] = 'Check that MySQL is running in Laragon and that you ran: php database/install.php';
        }
    }
    Response::json($payload, 500);
}
