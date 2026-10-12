# SSIS API Contract

Base URL: `http://localhost:8000/api` - JSON in, JSON out.
Protected routes need `Authorization: Bearer <token>` (token returned by `/login`).
Errors: `{ "message": "...", "errors": { "field": ["..."] } }` (`errors` only for 422).

| Code | Meaning |
|------|---------|
| 200 / 201 | OK / Created |
| 401 | Unauthenticated - redirect to login |
| 403 | Forbidden - wrong role |
| 404 | Not found |
| 422 | Validation error |
| 500 | Server error |

## Auth
| Method | Path | Role | Notes |
|--------|------|------|-------|
| POST | /login | public | `{username, password}` -> `{user:{id,name,username,role}, token}`. 5 failed attempts lock the account for 15 min. |
| POST | /logout | any | Revokes the token |
| GET | /me | any | Current user |

## Student (role: student)
| Method | Path | Response |
|--------|------|----------|
| GET | /student/dashboard | `{stats:{enrolled_subjects,pending_documents,outstanding_balance,clearance}, activity:[...]}` |
| GET | /student/profile | `{name, username, student_no, program, program_name, year_level}` |
| GET | /student/grades | `[{id, course:{code,title,units}, grade}]` |
| GET | /student/subjects | `[{id, code, title, units, schedule}]` (current term) |

## Documents
| Method | Path | Role | Notes |
|--------|------|------|-------|
| GET | /documents/types | student, registrar, admin | `[{id,name,fee}]` |
| POST | /documents/request | student | `{type_id, purpose, copies(1-5)}` -> 201 `{id,type:{name},copies,fee,paid,status}`; creates a fee charge |
| GET | /documents/my-requests | student | Same shape as above (+ `purpose`, `created_at`) |
| GET | /registrar/documents?status=&search= | registrar | All requests |
| PUT | /registrar/documents/{id} | registrar | `{status: processing\|approved\|rejected}`; `approved` requires the fee to be fully paid |

## Registrar (role: registrar)
| Method | Path | Notes |
|--------|------|-------|
| GET | /students?search= | registrar, cashier, department, admin - `[{id,student_no,name,program,year_level}]` |
| GET | /courses | Courses offered in the current term (`id` = course id) |
| GET | /registrar/students/{id}/enrollments | `{student, enrollments:[{id,term,is_current,schedule,grade,course:{id,code,title,units}}]}` |
| POST | /enrollment | `{student_id, course_ids:[...]}` -> 201; creates one tuition charge per subject |
| DELETE | /enrollment/{id} | Removes an ungraded, unpaid current-term subject |
| POST | /grades | `{student_id, course_id, grade}`; grade in 1.00-3.00 (0.25 steps) or 5.00 |

## Cashier (role: cashier)
| Method | Path | Notes |
|--------|------|-------|
| GET | /cashier/students/{id}/charges | `{student, balance, charges:[{id,description,amount,balance}]}` |
| POST | /payments | `{charge_id, amount, method: cash\|gcash\|card\|bank}` -> 201 `{id, reference_no, amount, remaining_balance, receipt_url}`; overpayment rejected |
| GET | /payments?search= | cashier, admin - receipt list |
| GET | /payments/{id} | cashier, admin - single receipt |

## Department (role: department)
| Method | Path | Notes |
|--------|------|-------|
| GET | /clearance?search= | `{department, students:[{id,student_no,name,program,status,remarks}]}` for the user's own department |
| PUT | /clearance/{studentId} | `{status: pending\|approved\|rejected, remarks}`; remarks required when rejecting |
| GET | /clearance/{studentId} | student (own only), department, registrar, admin - `[{department,status,remarks}]` |

## Admin (role: admin)
| Method | Path | Notes |
|--------|------|-------|
| GET | /admin/users | `[{id,name,username,role,is_active,department,student_no}]` |
| POST | /admin/users | `{name, username, role, password}` + students: `student_no (YYYY-NNNNN), program_id, year_level`; department: `department_id` |
| PUT | /admin/users/{id} | any of `{name, is_active, password}` |
| GET | /admin/meta | roles, programs, departments (for forms) |
| GET | /admin/audit-logs | Latest 100 audit entries |
