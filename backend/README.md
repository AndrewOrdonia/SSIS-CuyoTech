# SSIS Back End (PHP + MySQL)

Plain PHP 8.1+ REST API - no Composer needed. Entry point: `public/index.php`.

## Run
```bash
php database/install.php                          # one-time: schema + demo data (WARNING: recreates all SSIS tables)
php -S localhost:8000 -t public public/index.php   # API at http://localhost:8000/api
```

Requirements: PHP 8.1+ with `pdo_mysql` (enabled by default in Laragon) and a running MySQL/MariaDB.

## Configuration (`.env`, optional)
See `.env.example`: DB credentials, `TOKEN_TTL_HOURS`, `TUITION_PER_UNIT` (default 500 per unit),
`CORS_ORIGINS` (add your front-end URL if it is not `http://localhost:5173`), `APP_DEBUG`.

## Using Laragon's Apache instead of `php -S`
1. Copy the project to `C:\laragon\www\SSIS-main`.
2. Set `VITE_API_URL=http://localhost/SSIS-main/backend/public/api` in `frontend/.env`.
3. `public/.htaccess` already routes everything to `index.php`.

## Database (3NF)
`departments, programs, users, students, courses, terms, course_offerings, enrollments, document_types,
document_requests, charges, payments, clearances, api_tokens, audit_logs` - see `database/schema.sql`.
Derived values (balances, document fee, paid status) are computed, not stored.

## Troubleshooting
- `Cannot connect to MySQL` -> start MySQL in Laragon.
- Login shows "Cannot reach the server" -> the `php -S` terminal is not running.
- HTTP 500 with a `hint` -> the database is not installed; run `php database/install.php`.
- Errors are logged to `storage/logs/error.log`.
