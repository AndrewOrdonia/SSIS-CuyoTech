<?php
declare(strict_types=1);

use App\Controllers\{AdminController, AuthController, ClearanceController, DocumentController,
    LookupController, PaymentController, RegistrarController, StudentController};

/** @var App\Router $router */

// ---- Auth -------------------------------------------------------------
$router->add('POST', '/login',  [AuthController::class, 'login']);
$router->add('POST', '/logout', [AuthController::class, 'logout'], ['*']);
$router->add('GET',  '/me',     [AuthController::class, 'me'],     ['*']);

// ---- Student portal ----------------------------------------------------
$router->add('GET', '/student/profile',   [StudentController::class, 'profile'],   ['student']);
$router->add('GET', '/student/grades',    [StudentController::class, 'grades'],    ['student']);
$router->add('GET', '/student/subjects',  [StudentController::class, 'subjects'],  ['student']);
$router->add('GET', '/student/dashboard', [StudentController::class, 'dashboard'], ['student']);

// ---- Documents ---------------------------------------------------------
$router->add('GET',  '/documents/types',       [DocumentController::class, 'types'],      ['student', 'registrar', 'admin']);
$router->add('POST', '/documents/request',     [DocumentController::class, 'request'],    ['student']);
$router->add('GET',  '/documents/my-requests', [DocumentController::class, 'myRequests'], ['student']);
$router->add('GET',  '/registrar/documents',        [DocumentController::class, 'allRequests'],   ['registrar']);
$router->add('PUT',  '/registrar/documents/{id}',   [DocumentController::class, 'updateStatus'],  ['registrar']);

// ---- Shared staff lookups ----------------------------------------------
$router->add('GET', '/students', [LookupController::class, 'students'], ['registrar', 'cashier', 'department', 'admin']);
$router->add('GET', '/courses',  [LookupController::class, 'courses'],  ['registrar', 'admin']);

// ---- Registrar ---------------------------------------------------------
$router->add('GET',    '/registrar/students/{id}/enrollments', [RegistrarController::class, 'studentEnrollments'], ['registrar']);
$router->add('POST',   '/enrollment',                          [RegistrarController::class, 'enroll'],             ['registrar']);
$router->add('DELETE', '/enrollment/{id}',                     [RegistrarController::class, 'removeEnrollment'],   ['registrar']);
$router->add('POST',   '/grades',                              [RegistrarController::class, 'encodeGrade'],        ['registrar']);

// ---- Cashier -----------------------------------------------------------
$router->add('GET',  '/cashier/students/{id}/charges', [PaymentController::class, 'studentCharges'], ['cashier']);
$router->add('POST', '/payments',                      [PaymentController::class, 'create'],         ['cashier']);
$router->add('GET',  '/payments',                      [PaymentController::class, 'index'],          ['cashier', 'admin']);
$router->add('GET',  '/payments/{id}',                 [PaymentController::class, 'show'],           ['cashier', 'admin']);

// ---- Department clearance ----------------------------------------------
$router->add('GET', '/clearance',                [ClearanceController::class, 'index'],  ['department']);
$router->add('GET', '/clearance/{student_id}',   [ClearanceController::class, 'show'],   ['student', 'department', 'registrar', 'admin']);
$router->add('PUT', '/clearance/{student_id}',   [ClearanceController::class, 'update'], ['department']);

// ---- Admin -------------------------------------------------------------
$router->add('GET',  '/admin/users',       [AdminController::class, 'users'],     ['admin']);
$router->add('POST', '/admin/users',       [AdminController::class, 'create'],    ['admin']);
$router->add('PUT',  '/admin/users/{id}',  [AdminController::class, 'update'],    ['admin']);
$router->add('GET',  '/admin/meta',        [AdminController::class, 'meta'],      ['admin']);
$router->add('GET',  '/admin/audit-logs',  [AdminController::class, 'auditLogs'], ['admin']);
