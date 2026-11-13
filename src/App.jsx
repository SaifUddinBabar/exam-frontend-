import {
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
} from "react-router-dom";

// =========================
// MAIN APP COMPONENTS
// =========================
import ExamPage from "./ExamPage";
import Ranking from "./RankingPage";
import RankingPage from "./RankingPage";

// =========================
// LOGIN
// =========================
import Login from "./Login/Login";

// =========================
// SUPER ADMIN
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

// =========================
// BUILDER
// =========================
import Builder from "./admin/Builder";

// =========================
// COACHING OWNER
// =========================
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
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}


function App() {
  const location = useLocation();

  // =====================================
  // EXAM PAGE
  // =====================================
  const isExamPage =
    location.pathname.startsWith("/exam");

  // =====================================
  // HIDE NORMAL NAVBAR
  // =====================================
  const isAdminPage =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/organization") ||
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/builder";

  return (
    <div>

      {/* =====================================
          NORMAL NAVBAR
      ===================================== */}
      {!isExamPage && !isAdminPage && (
        <nav
          style={{
            padding: "10px",
            background: "#111",
          }}
        >
          <Link
            to="/"
            style={{
              color: "white",
              textDecoration: "none",
            }}
          >
            🏠 Home
          </Link>
        </nav>
      )}

      {/* =====================================
          ALL ROUTES
      ===================================== */}
      <Routes>

        {/* =====================================
            LOGIN
        ===================================== */}
        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/login"
          element={<Login />}
        />


        {/* =====================================
            COACHING OWNER
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
            EXAM BUILDER
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
            EXAM
        ===================================== */}
        <Route
          path="/exam/:code"
          element={<ExamPage />}
        />


        {/* =====================================
            RANKING
        ===================================== */}
        <Route
          path="/ranking/:code"
          element={<Ranking />}
        />


        {/* =====================================
            RANKING PAGE
        ===================================== */}
        <Route
          path="/ranking-page/:code"
          element={<RankingPage />}
        />


        {/* =====================================
            SUPER ADMIN
        ===================================== */}

        {/* Admin Main */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <AdminApp />
            </ProtectedRoute>
          }
        />

        {/* Admin Builder */}
        <Route
          path="/admin/builder"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <Builder />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Organizations */}
        <Route
          path="/admin/organizations"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <Organizations />
            </ProtectedRoute>
          }
        />

        {/* Organization Admins */}
        <Route
          path="/admin/organization-admins"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <OrganizationAdmins />
            </ProtectedRoute>
          }
        />

        {/* Students */}
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <Students />
            </ProtectedRoute>
          }
        />

        {/* Exams */}
        <Route
          path="/admin/exams"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <Exams />
            </ProtectedRoute>
          }
        />

        {/* Question Bank */}
        <Route
          path="/admin/question-bank"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <QuestionBank />
            </ProtectedRoute>
          }
        />

        {/* Billing */}
        <Route
          path="/admin/billing"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <Billing />
            </ProtectedRoute>
          }
        />

        {/* Settings */}
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <AdminSettings />
            </ProtectedRoute>
          }
        />


        {/* =====================================
            UNKNOWN ADMIN URL
        ===================================== */}
        <Route
          path="/admin/*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />


        {/* =====================================
            UNKNOWN URL
        ===================================== */}
        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </div>
  );
}

export default App;