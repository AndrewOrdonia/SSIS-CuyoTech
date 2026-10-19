import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import BalanceHistory from "./pages/student/BalanceHistory";

import StudentDashboard from "./pages/student/Dashboard";
import StudentProfile from "./pages/student/Profile";
import StudentGrades from "./pages/student/Grades";
import StudentSubjects from "./pages/student/Subjects";
import DocumentRequest from "./pages/student/DocumentRequest";

import Enrollment from "./pages/registrar/Enrollment";
import GradesEncoding from "./pages/registrar/GradesEncoding";
import RegistrarDocuments from "./pages/registrar/DocumentRequests";
import Payments from "./pages/cashier/Payments";
import Receipts from "./pages/cashier/Receipts";
import Clearance from "./pages/department/Clearance";
import UserManagement from "./pages/admin/UserManagement";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route element={<ProtectedRoute role="student" />}>
        <Route element={<DashboardLayout />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/grades" element={<StudentGrades />} />
          <Route path="/student/subjects" element={<StudentSubjects />} />
          <Route path="/student/documents" element={<DocumentRequest />} />
          <Route path="/student/balance" element={<BalanceHistory />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="registrar" />}>
        <Route element={<DashboardLayout />}>
          <Route path="/registrar/enrollment" element={<Enrollment />} />
          <Route path="/registrar/grades" element={<GradesEncoding />} />
          <Route path="/registrar/documents" element={<RegistrarDocuments />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="cashier" />}>
        <Route element={<DashboardLayout />}>
          <Route path="/cashier/payments" element={<Payments />} />
          <Route path="/cashier/receipts" element={<Receipts />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="department" />}>
        <Route element={<DashboardLayout />}>
          <Route path="/department/clearance" element={<Clearance />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="admin" />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/users" element={<UserManagement />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}