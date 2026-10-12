# CuyoTech University - Student Services Information System (SSIS)

Final Project - 1st Semester 2026-2027

## Architecture

| Layer     | Tech                                          |
|-----------|-----------------------------------------------|
| Front End | React 19 + Vite + Tailwind CSS v4             |
| Back End  | PHP 8.1+ (plain PHP REST API, PDO)            |
| Database  | MySQL / MariaDB (Laragon), 3NF, 15 tables     |
| Auth      | Bearer tokens (hashed in DB), role-based access |

```
SSIS-main/
├── frontend/   React SPA
├── backend/    PHP REST API  (public/index.php is the entry point)
│   ├── database/   schema.sql, seed.sql, install.php
│   └── src/        Router, Auth, Validator, Controllers/
└── docs/       API contract and wireframes
```

## Quick Start (Laragon + VS Code)

### 1. Start MySQL
Open **Laragon -> Start All** (MySQL must be running).

### 2. Back End
Open a terminal where `php` works (Laragon -> *Menu -> Terminal*, or the VS Code terminal if PHP is in your PATH):

```bash
cd backend
php database/install.php                      # creates database "ssis", tables and demo data (run once)
php -S localhost:8000 -t public public/index.php   # starts the API at http://localhost:8000/api
```

Leave this terminal open. Default database settings (host 127.0.0.1, user `root`, empty password) match Laragon.
Change them in `backend/.env` if yours differ (see `backend/.env.example`).

### 3. Front End
In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** and sign in.
(`frontend/.env` already points to `http://localhost:8000/api` and has `VITE_USE_MOCK=false`.)

## Demo Credentials (password for all: `pass`)

| Role       | Username     |
|------------|--------------|
| Student    | student1 (also student2, student3) |
| Registrar  | registrar1   |
| Cashier    | cashier1     |
| Department | department1 (Library) |
| Admin      | admin        |

> The demo password `pass` is for testing only. Accounts created in the Admin module must use a password of
> 8+ characters containing letters and numbers.

## Modules

| Module | What works |
|--------|-----------|
| Student Portal | Dashboard (live stats + activity), profile, grades, current subjects, document requests |
| Registrar | Enroll / remove subjects, encode grades, process document requests (TOR, COR, certifications) |
| Cashier | Record payments against tuition / document charges, receipt archive, printable receipts |
| Department | Approve / reject clearance for your own department |
| Admin | Create accounts (all roles), activate / deactivate, reset passwords |

### Typical demo flow
1. **student1** -> Document Request -> request a TOR (a fee charge is created automatically).
2. **cashier1** -> Payments -> select the student -> pay the TOR fee -> print receipt.
3. **registrar1** -> Document Requests -> *Process* -> *Approve* (approval is blocked until the fee is paid).
4. **department1** -> Clearance -> approve the student; **student1**'s dashboard updates.
5. **registrar1** -> Enrollment / Grades Encoding; **student1** sees subjects and grades.
6. **admin** -> create a new user.

## Security features (for the Testing and Ethics sections)

- Passwords hashed with bcrypt (`password_hash`); tokens stored only as SHA-256 hashes and expire after 8 h
- Prepared statements everywhere (SQL-injection defence) and server-side input validation
- Role-based access control on every route (401 unauthenticated / 403 wrong role); students can only read their own data
- Login lock-out after 5 failed attempts (15 minutes); identical error message for wrong user / wrong password
- Deactivated accounts and password resets immediately invalidate existing sessions
- Audit log (`audit_logs` table) for logins, payments, grade changes, clearance and admin actions
- CORS allow-list, `nosniff` / `X-Frame-Options` headers, generic 500 errors (details only logged to `backend/storage/logs/error.log`)

## Documentation
- [API Contract](./docs/API.md)
- [Back End notes](./backend/README.md)
