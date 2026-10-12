-- Demo / reference data. {{PASSWORD_HASH}} is replaced by install.php with a bcrypt hash of "pass".

INSERT INTO departments (id, code, name) VALUES
(1, 'LIB', 'Library'),
(2, 'GUID', 'Guidance Office'),
(3, 'SAO', 'Student Affairs Office'),
(4, 'CCS', 'College of Computing Studies');

INSERT INTO programs (id, code, name) VALUES
(1, 'BSIT', 'BS Information Technology'),
(2, 'BSCS', 'BS Computer Science'),
(3, 'BSIS', 'BS Information Systems');

INSERT INTO users (id, department_id, username, password_hash, name, role) VALUES
(1, NULL, 'student1',    '{{PASSWORD_HASH}}', 'Juan Dela Cruz',  'student'),
(2, NULL, 'registrar1',  '{{PASSWORD_HASH}}', 'Maria Santos',    'registrar'),
(3, NULL, 'cashier1',    '{{PASSWORD_HASH}}', 'Pedro Reyes',     'cashier'),
(4, 1,    'department1', '{{PASSWORD_HASH}}', 'Ana Lopez',       'department'),
(5, NULL, 'admin',       '{{PASSWORD_HASH}}', 'Admin User',      'admin'),
(6, NULL, 'student2',    '{{PASSWORD_HASH}}', 'Liza Mendoza',    'student'),
(7, NULL, 'student3',    '{{PASSWORD_HASH}}', 'Mark Villanueva', 'student');

INSERT INTO students (id, user_id, program_id, student_no, year_level) VALUES
(1, 1, 1, '2026-00123', 3),
(2, 6, 2, '2026-00124', 2),
(3, 7, 1, '2026-00125', 1);

INSERT INTO courses (id, code, title, units) VALUES
(1, 'CS101',   'Intro to Computing',     3),
(2, 'CS102',   'Data Structures',        3),
(3, 'MATH101', 'College Algebra',        3),
(4, 'ENG101',  'English Communication',  3),
(5, 'IT201',   'Web Systems',            3),
(6, 'IT202',   'Database Systems',       3),
(7, 'PE101',   'Physical Education 1',   2),
(8, 'NSTP101', 'National Service Training Program 1', 3);

INSERT INTO terms (id, name, is_current) VALUES
(1, '1st Semester 2025-2026', 0),
(2, '1st Semester 2026-2027', 1);

INSERT INTO course_offerings (id, course_id, term_id, schedule) VALUES
(1, 1, 1, 'MWF 9:00-10:00'),
(2, 3, 1, 'TTh 8:00-9:30'),
(3, 4, 1, 'MWF 13:00-14:00'),
(4, 1, 2, 'MWF 9:00-10:00'),
(5, 2, 2, 'TTh 10:30-12:00'),
(6, 3, 2, 'TTh 8:00-9:30'),
(7, 4, 2, 'MWF 13:00-14:00'),
(8, 5, 2, 'MWF 10:00-11:00'),
(9, 6, 2, 'TTh 13:00-14:30'),
(10, 7, 2, 'Sat 8:00-10:00'),
(11, 8, 2, 'Sat 10:00-12:00');

INSERT INTO enrollments (id, student_id, offering_id, grade, graded_by, graded_at, enrolled_by) VALUES
(1, 1, 1, 1.50, 2, NOW(), 2),
(2, 1, 2, 2.00, 2, NOW(), 2),
(3, 1, 3, 1.75, 2, NOW(), 2),
(4, 1, 5, NULL, NULL, NULL, 2),
(5, 1, 9, NULL, NULL, NULL, 2),
(6, 1, 8, NULL, NULL, NULL, 2),
(7, 2, 4, NULL, NULL, NULL, 2),
(8, 2, 5, NULL, NULL, NULL, 2);

INSERT INTO document_types (id, name, fee) VALUES
(1, 'Transcript of Records (TOR)', 150.00),
(2, 'Certificate of Registration (COR)', 50.00),
(3, 'Certificate of Good Moral', 75.00),
(4, 'Certification of Enrollment', 60.00);

INSERT INTO document_requests (id, student_id, document_type_id, purpose, copies, status) VALUES
(1, 1, 1, 'Employment application', 2, 'pending');

INSERT INTO charges (id, student_id, enrollment_id, document_request_id, description, amount) VALUES
(1, 1, 4, NULL, 'Tuition - CS102 Data Structures', 1500.00),
(2, 1, 5, NULL, 'Tuition - IT202 Database Systems', 1500.00),
(3, 1, 6, NULL, 'Tuition - IT201 Web Systems', 1500.00),
(4, 2, 7, NULL, 'Tuition - CS101 Intro to Computing', 1500.00),
(5, 2, 8, NULL, 'Tuition - CS102 Data Structures', 1500.00),
(6, 1, NULL, 1, 'Document fee - Transcript of Records (TOR) x2', 300.00);

INSERT INTO payments (id, reference_no, charge_id, cashier_id, amount, method) VALUES
(1, 'PAY-2026-0001', 1, 3, 1500.00, 'cash'),
(2, 'PAY-2026-0002', 2, 3, 500.00, 'gcash');

INSERT INTO clearances (student_id, department_id, status, remarks, processed_by, processed_at) VALUES
(1, 1, 'approved', 'No outstanding books', 4, NOW());
