import {
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";

// =========================
// EXAMINO STUDENT PORTAL (APPROVED DESIGN SYSTEM)
// =========================
import StudentLogin from "./student/StudentLogin";
import StudentRegister from "./student/StudentRegister";
import StudentDashboard from "./student/StudentDashboard";
import StudentExams from "./student/StudentExams";
import ExamDetails from "./student/ExamDetails";
import ExamInstructions from "./student/ExamInstructions";
import LiveExamPage from "./student/LiveExamPage";
import ExamSubmitted from "./student/ExamSubmitted";
import ExamResult from "./student/ExamResult";
import AnswerReview from "./student/AnswerReview";
import StudentPerformance from "./student/StudentPerformance";
import StudentHistory from "./student/StudentHistory";
import StudentProfile from "./student/StudentProfile";

// =========================
// SUPER ADMIN & COACHING (PRESERVED)
// =========================
import AdminApp from "./admin/AdminApp";
import AdminDashboard from "./admin/AdminDashboard";
import AdminSettings from "./admin/AdminSettings";
import Billing from "./admin/Billing";
import Exams from "./admin/Exams";
import OrganizationAdmins from "./admin/OrganizationAdmins";
import Organizations from "./admin/Organizations";
import QuestionBank from "./admin/QuestionBank";
import Students from "./admin/Students";
import Builder from "./admin/Builder";
import OrganizationApp from "./organization/OrganizationApp";

// =====================================
// PROTECTED ROUTE GUARD
// =====================================
function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (user.globalRole === "super_admin" ? "super_admin" : (user.role || "")).toLowerCase();
    const hasRole = allowedRoles.some(
      (r) => r.toLowerCase() === userRole || user.globalRole === "super_admin"
    );
    if (!hasRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

// Redirect wrapper for legacy ranking links
function RankingRedirect() {
  const { code } = useParams();
  return <Navigate to={`/exams/${code}/result`} replace />;
}

function RootRedirect() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) {
    return <StudentLogin />;
  }

  const role = (user.globalRole === "super_admin" ? "super_admin" : (user.role || "")).toLowerCase();
  if (role === "super_admin") return <Navigate to="/admin" replace />;
  if (role === "org_admin" || role === "tutor") return <Navigate to="/organization" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* =====================================
          AUTHENTICATION (PDF Pages 1 & 2)
      ===================================== */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<StudentLogin />} />
      <Route path="/register" element={<StudentRegister />} />

      {/* =====================================
          STUDENT PORTAL (APPROVED DESIGN SYSTEM)
      ===================================== */}
      <Route path="/dashboard" element={<StudentDashboard />} />
      <Route path="/exams" element={<StudentExams />} />
      <Route path="/exams/:code/details" element={<ExamDetails />} />
      <Route path="/exams/:code/instructions" element={<ExamInstructions />} />
      <Route path="/exam/:code" element={<LiveExamPage />} />
      <Route path="/exams/:code/submitted" element={<ExamSubmitted />} />
      <Route path="/exams/:code/result" element={<ExamResult />} />
      <Route path="/exams/:code/review" element={<AnswerReview />} />
      <Route path="/results" element={<StudentPerformance />} />
      <Route path="/history" element={<StudentHistory />} />
      <Route path="/profile" element={<StudentProfile />} />

      {/* =====================================
          BACKWARD COMPATIBILITY REDIRECTS
      ===================================== */}
      <Route path="/ranking/:code" element={<RankingRedirect />} />
      <Route path="/ranking-page/:code" element={<RankingRedirect />} />

      {/* =====================================
          COACHING CENTER PORTAL (PRESERVED)
      ===================================== */}
      <Route
        path="/organization/*"
        element={
          <ProtectedRoute allowedRoles={["org_admin", "tutor", "super_admin"]}>
            <OrganizationApp />
          </ProtectedRoute>
        }
      />

      {/* =====================================
          EXAM BUILDER (PRESERVED)
      ===================================== */}
      <Route
        path="/builder"
        element={
          <ProtectedRoute allowedRoles={["tutor", "org_admin", "super_admin"]}>
            <Builder />
          </ProtectedRoute>
        }
      />

      {/* =====================================
          SUPER ADMIN PORTAL (PRESERVED)
      ===================================== */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <AdminApp />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/builder"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <Builder />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/organizations"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <Organizations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/organization-admins"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <OrganizationAdmins />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <Students />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/exams"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <Exams />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/question-bank"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <QuestionBank />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/billing"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <Billing />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <AdminSettings />
          </ProtectedRoute>
        }
      />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
