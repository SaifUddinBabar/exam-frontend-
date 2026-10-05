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
          element={<OrganizationApp />}
        />


        {/* =====================================
            EXAM BUILDER
        ===================================== */}
        <Route
          path="/builder"
          element={<Builder />}
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
          element={<AdminApp />}
        />

        {/* Admin Builder */}
        <Route
          path="/admin/builder"
          element={<Builder />}
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />

        {/* Organizations */}
        <Route
          path="/admin/organizations"
          element={<Organizations />}
        />

        {/* Organization Admins */}
        <Route
          path="/admin/organization-admins"
          element={<OrganizationAdmins />}
        />

        {/* Students */}
        <Route
          path="/admin/students"
          element={<Students />}
        />

        {/* Exams */}
        <Route
          path="/admin/exams"
          element={<Exams />}
        />

        {/* Question Bank */}
        <Route
          path="/admin/question-bank"
          element={<QuestionBank />}
        />

        {/* Billing */}
        <Route
          path="/admin/billing"
          element={<Billing />}
        />

        {/* Settings */}
        <Route
          path="/admin/settings"
          element={<AdminSettings />}
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