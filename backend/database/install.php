<?php
/**
 * One-time installer:  php backend/database/install.php
 * Creates the `ssis` database, all tables, and loads the demo data
 * (demo account password: "pass", stored as a bcrypt hash).
 * WARNING: it drops and recreates every SSIS table.
 */
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('Run this script from the command line: php database/install.php');
}

require __DIR__ . '/../src/Config.php';
App\Config::load(__DIR__ . '/../.env');


$host = App\Config::get('DB_HOST', '127.0.0.1');
$port = App\Config::get('DB_PORT', '3306');
$user = App\Config::get('DB_USER', 'root');
$pass = App\Config::get('DB_PASS', '');
$dbName = App\Config::get('DB_NAME', 'ssis');

if (!preg_match('/^[a-zA-Z0-9_]+$/', $dbName)) {
    exit("Invalid database name.\n");
}

try {
    $pdo = new PDO("mysql:host=$host;port=$port;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);

    $pdo->exec(
        "CREATE DATABASE IF NOT EXISTS `$dbName` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
    );

    $pdo->exec("USE `$dbName`");
} catch (PDOException $e) {
    fwrite(STDERR, "Cannot connect to MySQL: " . $e->getMessage() . "\n");
    exit(1);
}

function run_sql_file(PDO $pdo, string $path, array $replace = []): void
{
    $sql = file_get_contents($path);
    foreach ($replace as $from => $to) {
        $sql = str_replace($from, $to, $sql);
    }
    // drop full-line comments, then split on ";" at end of line
    $lines = array_filter(explode("\n", str_replace("\r", '', $sql)), fn($l) => !preg_match('/^\s*--/', $l));
    $statements = preg_split('/;\s*\n/', implode("\n", $lines) . "\n");
    foreach ($statements as $stmt) {
        $stmt = trim($stmt);
        if ($stmt !== '') {
            $pdo->exec($stmt);
        }
    }
}

echo "Creating schema...\n";
run_sql_file($pdo, __DIR__ . '/schema.sql');

echo "Loading demo data...\n";
run_sql_file($pdo, __DIR__ . '/seed.sql', ['{{PASSWORD_HASH}}' => password_hash('pass', PASSWORD_BCRYPT)]);

echo "\nDone. Demo accounts (password: pass):\n";
echo "  student1 | registrar1 | cashier1 | department1 | admin\n";
echo "  (extra students: student2, student3)\n";
