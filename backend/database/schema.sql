-- ============================================================
-- CuyoTech University SSIS - Database schema (3NF)
-- MySQL 8 / MariaDB 10.4+ (Laragon default)
-- ============================================================

-- CuyoTech University SSIS - Database schema (3NF)
-- MySQL 8 / MariaDB 10.4+ (Laragon default)
SET FOREIGN_KEY_CHECKS = 0;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS api_tokens;
DROP TABLE IF EXISTS clearances;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS charges;
DROP TABLE IF EXISTS document_requests;
DROP TABLE IF EXISTS document_types;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS course_offerings;
DROP TABLE IF EXISTS terms;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS programs;
DROP TABLE IF EXISTS departments;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE departments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE programs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL
) ENGINE=InnoDB;

-- All system accounts (student, registrar, cashier, department, admin)
CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  department_id INT UNSIGNED NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(120) NOT NULL,
  role ENUM('student','registrar','cashier','department','admin') NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  failed_attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  locked_until DATETIME NULL,
  last_login_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_department FOREIGN KEY (department_id) REFERENCES departments(id)
) ENGINE=InnoDB;

CREATE TABLE students (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL UNIQUE,
  program_id INT UNSIGNED NOT NULL,
  student_no VARCHAR(20) NOT NULL UNIQUE,
  year_level TINYINT UNSIGNED NOT NULL DEFAULT 1,
  CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_students_program FOREIGN KEY (program_id) REFERENCES programs(id)
) ENGINE=InnoDB;

CREATE TABLE courses (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  title VARCHAR(150) NOT NULL,
  units TINYINT UNSIGNED NOT NULL
) ENGINE=InnoDB;

CREATE TABLE terms (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) NOT NULL UNIQUE,
  is_current TINYINT(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE course_offerings (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id INT UNSIGNED NOT NULL,
  term_id INT UNSIGNED NOT NULL,
  schedule VARCHAR(60) NULL,
  UNIQUE KEY uq_offering (course_id, term_id),
  CONSTRAINT fk_off_course FOREIGN KEY (course_id) REFERENCES courses(id),
  CONSTRAINT fk_off_term FOREIGN KEY (term_id) REFERENCES terms(id)
) ENGINE=InnoDB;

-- A student's enrolled subject; the grade is encoded here by the registrar
CREATE TABLE enrollments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id INT UNSIGNED NOT NULL,
  offering_id INT UNSIGNED NOT NULL,
  grade DECIMAL(3,2) NULL,
  graded_by INT UNSIGNED NULL,
  graded_at DATETIME NULL,
  enrolled_by INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_enrollment (student_id, offering_id),
  CONSTRAINT fk_enr_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_enr_offering FOREIGN KEY (offering_id) REFERENCES course_offerings(id),
  CONSTRAINT fk_enr_graded_by FOREIGN KEY (graded_by) REFERENCES users(id),
  CONSTRAINT fk_enr_enrolled_by FOREIGN KEY (enrolled_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE document_types (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  fee DECIMAL(10,2) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE document_requests (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id INT UNSIGNED NOT NULL,
  document_type_id INT UNSIGNED NOT NULL,
  purpose VARCHAR(255) NOT NULL,
  copies TINYINT UNSIGNED NOT NULL DEFAULT 1,
  status ENUM('pending','processing','approved','rejected') NOT NULL DEFAULT 'pending',
  processed_by INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_req_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_req_type FOREIGN KEY (document_type_id) REFERENCES document_types(id),
  CONSTRAINT fk_req_processed_by FOREIGN KEY (processed_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- Amounts a student owes (tuition per enrolled subject, or a document request fee)
CREATE TABLE charges (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id INT UNSIGNED NOT NULL,
  enrollment_id INT UNSIGNED NULL UNIQUE,
  document_request_id INT UNSIGNED NULL UNIQUE,
  description VARCHAR(200) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_chg_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_chg_enrollment FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
  CONSTRAINT fk_chg_request FOREIGN KEY (document_request_id) REFERENCES document_requests(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE payments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reference_no VARCHAR(30) NOT NULL UNIQUE,
  charge_id INT UNSIGNED NOT NULL,
  cashier_id INT UNSIGNED NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method ENUM('cash','gcash','card','bank') NOT NULL DEFAULT 'cash',
  paid_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pay_charge FOREIGN KEY (charge_id) REFERENCES charges(id),
  CONSTRAINT fk_pay_cashier FOREIGN KEY (cashier_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE clearances (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id INT UNSIGNED NOT NULL,
  department_id INT UNSIGNED NOT NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  remarks VARCHAR(255) NULL,
  processed_by INT UNSIGNED NULL,
  processed_at DATETIME NULL,
  UNIQUE KEY uq_clearance (student_id, department_id),
  CONSTRAINT fk_clr_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_clr_department FOREIGN KEY (department_id) REFERENCES departments(id),
  CONSTRAINT fk_clr_processed_by FOREIGN KEY (processed_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE api_tokens (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tok_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE audit_logs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  action VARCHAR(60) NOT NULL,
  details VARCHAR(255) NULL,
  ip_address VARCHAR(45) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_audit_user (user_id),
  KEY idx_audit_action (action)
) ENGINE=InnoDB;
