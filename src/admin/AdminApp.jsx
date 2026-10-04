import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminDashboard from "./AdminDashboard";
import Organizations from "./Organizations";
import OrganizationAdmins from "./OrganizationAdmins";
import Students from "./Students";
import Exams from "./Exams";
import QuestionBank from "./QuestionBank";
import Billing from "./Billing";
import AdminSettings from "./AdminSettings";

function AdminApp() {
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  // =========================
  // MENU ITEMS
  // =========================
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "📊",
    },
    {
      id: "organizations",
      label: "Organizations",
      icon: "🏢",
    },
    {
      id: "admins",
      label: "Organization Admins",
      icon: "👨‍💼",
    },
    {
      id: "students",
      label: "Students",
      icon: "🎓",
    },
    {
      id: "exams",
      label: "Exams",
      icon: "📝",
    },
    {
      id: "questions",
      label: "Question Bank",
      icon: "📚",
    },
    {
      id: "billing",
      label: "Billing",
      icon: "💳",
    },
    {
      id: "settings",
      label: "Settings",
      icon: "⚙️",
    },
  ];

  // =========================
  // PAGE RENDER
  // =========================
  const renderPage = () => {
    switch (activePage) {
      case "organizations":
        return <Organizations />;

      case "admins":
        return <OrganizationAdmins />;

      case "students":
        return <Students />;

      case "exams":
        return <Exams />;

      case "questions":
        return <QuestionBank />;

      case "billing":
        return <Billing />;

      case "settings":
        return <AdminSettings />;

      case "dashboard":
      default:
        return <AdminDashboard />;
    }
  };

  // =========================
  // STYLES
  // =========================
  const styles = {
    app: {
      display: "flex",
      minHeight: "100vh",
      background: "#f8fafc",
      fontFamily:
        "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },

    sidebar: {
      width: collapsed ? "82px" : "280px",
      background:
        "linear-gradient(180deg, #111827 0%, #0f172a 100%)",
      color: "white",
      display: "flex",
      flexDirection: "column",
      transition: "width 0.25s ease",
      position: "fixed",
      top: 0,
      left: 0,
      bottom: 0,
      zIndex: 100,
      boxShadow: "8px 0 30px rgba(15,23,42,0.12)",
      overflow: "hidden",
    },

    brand: {
      height: "92px",
      padding: collapsed ? "0 18px" : "0 30px",
      display: "flex",
      alignItems: "center",
      gap: "16px",
      borderBottom: "1px solid rgba(255,255,255,0.07)",
      flexShrink: 0,
    },

    logo: {
      width: "62px",
      height: "62px",
      minWidth: "62px",
      borderRadius: "17px",
      background:
        "linear-gradient(135deg, #6366f1, #8b5cf6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "20px",
      fontWeight: 900,
      boxShadow: "0 10px 30px rgba(99,102,241,0.35)",
    },

    brandText: {
      minWidth: 0,
    },

    brandName: {
      fontSize: "25px",
      fontWeight: 850,
      lineHeight: 1,
      whiteSpace: "nowrap",
      letterSpacing: "-0.5px",
    },

    brandRole: {
      marginTop: "9px",
      color: "#94a3b8",
      fontSize: "13px",
      whiteSpace: "nowrap",
    },

    menuArea: {
      flex: 1,
      padding: "32px 14px 20px",
      overflowY: "auto",
    },

    sectionTitle: {
      padding: "0 25px 14px",
      color: "#64748b",
      fontSize: "11px",
      fontWeight: 850,
      letterSpacing: "1.2px",
      textTransform: "uppercase",
      whiteSpace: "nowrap",
    },

    menuItem: {
      width: "100%",
      height: "72px",
      border: "none",
      borderRadius: "15px",
      background: "transparent",
      color: "#94a3b8",
      display: "flex",
      alignItems: "center",
      gap: "25px",
      padding: "0 25px",
      marginBottom: "4px",
      cursor: "pointer",
      textAlign: "left",
      fontSize: "16px",
      fontWeight: 600,
      transition: "all 0.2s ease",
    },

    activeItem: {
      background:
        "linear-gradient(135deg, rgba(99,102,241,0.23), rgba(124,58,237,0.20))",
      color: "white",
      boxShadow: "inset 4px 0 0 #818cf8",
    },

    icon: {
      width: "32px",
      minWidth: "32px",
      textAlign: "center",
      fontSize: "22px",
    },

    itemText: {
      whiteSpace: "nowrap",
    },

    toolsSection: {
      marginTop: "22px",
      paddingTop: "20px",
      borderTop: "1px solid rgba(255,255,255,0.07)",
    },

    builderButton: {
      width: "100%",
      height: "62px",
      border: "1px solid rgba(129,140,248,0.25)",
      borderRadius: "13px",
      background:
        "linear-gradient(135deg, rgba(99,102,241,0.14), rgba(139,92,246,0.12))",
      color: "#c7d2fe",
      display: "flex",
      alignItems: "center",
      gap: "22px",
      padding: "0 22px",
      cursor: "pointer",
      fontSize: "15px",
      fontWeight: 700,
      textAlign: "left",
      whiteSpace: "nowrap",
    },

    collapseArea: {
      padding: "15px",
      borderTop: "1px solid rgba(255,255,255,0.07)",
    },

    collapseButton: {
      width: "100%",
      height: "42px",
      border: "none",
      borderRadius: "9px",
      background: "rgba(255,255,255,0.05)",
      color: "#94a3b8",
      cursor: "pointer",
      fontSize: "16px",
    },

    main: {
      flex: 1,
      marginLeft: collapsed ? "82px" : "280px",
      minWidth: 0,
      transition: "margin-left 0.25s ease",
      minHeight: "100vh",
    },

    topbar: {
      height: "72px",
      background: "white",
      borderBottom: "1px solid #e2e8f0",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      padding: "0 30px",
      gap: "20px",
    },

    notification: {
      width: "38px",
      height: "38px",
      borderRadius: "9px",
      border: "1px solid #e2e8f0",
      background: "white",
      cursor: "pointer",
      fontSize: "17px",
      position: "relative",
    },

    notificationDot: {
      position: "absolute",
      top: "7px",
      right: "7px",
      width: "7px",
      height: "7px",
      borderRadius: "50%",
      background: "#ef4444",
      border: "2px solid white",
    },

    profile: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      cursor: "pointer",
    },

    avatar: {
      width: "38px",
      height: "38px",
      borderRadius: "10px",
      background:
        "linear-gradient(135deg, #6366f1, #8b5cf6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontWeight: 800,
      fontSize: "13px",
    },

    profileText: {
      display: "flex",
      flexDirection: "column",
    },

    profileName: {
      fontSize: "12px",
      fontWeight: 750,
      color: "#0f172a",
    },

    profileRole: {
      marginTop: "3px",
      color: "#94a3b8",
      fontSize: "10px",
    },

    content: {
      minHeight: "calc(100vh - 72px)",
    },
  };

  return (
    <div style={styles.app}>
      {/* =====================================
          SIDEBAR
      ===================================== */}
      <aside style={styles.sidebar}>
        {/* BRAND */}
        <div style={styles.brand}>
          <div style={styles.logo}>EB</div>

          {!collapsed && (
            <div style={styles.brandText}>
              <div style={styles.brandName}>ExamBuilder</div>

              <div style={styles.brandRole}>Super Admin</div>
            </div>
          )}
        </div>

        {/* MENU */}
        <div style={styles.menuArea}>
          <div style={styles.sectionTitle}>
            Main Menu
          </div>

          {menuItems.map((item) => {
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                style={{
                  ...styles.menuItem,
                  ...(isActive ? styles.activeItem : {}),
                  justifyContent: collapsed
                    ? "center"
                    : "flex-start",
                  gap: collapsed ? 0 : "25px",
                  padding: collapsed ? 0 : "0 25px",
                }}
                title={collapsed ? item.label : ""}
              >
                <span style={styles.icon}>
                  {item.icon}
                </span>

                {!collapsed && (
                  <span style={styles.itemText}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}

          {/* =====================================
              TOOLS
          ===================================== */}
          <div style={styles.toolsSection}>
            {!collapsed && (
              <div style={styles.sectionTitle}>
                Tools
              </div>
            )}

            <button
              onClick={() => navigate("/builder")}
              style={{
                ...styles.builderButton,
                justifyContent: collapsed
                  ? "center"
                  : "flex-start",
                gap: collapsed ? 0 : "22px",
                padding: collapsed ? 0 : "0 22px",
              }}
              title={collapsed ? "Exam Builder" : ""}
            >
              <span style={styles.icon}>📝</span>

              {!collapsed && (
                <span>Exam Builder</span>
              )}
            </button>
          </div>
        </div>

        {/* COLLAPSE */}
        <div style={styles.collapseArea}>
          <button
            style={styles.collapseButton}
            onClick={() => setCollapsed(!collapsed)}
            title="Toggle Sidebar"
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>
      </aside>

      {/* =====================================
          MAIN AREA
      ===================================== */}
      <main style={styles.main}>
        {/* TOPBAR */}
        <div style={styles.topbar}>
          <button style={styles.notification}>
            🔔
            <span style={styles.notificationDot}></span>
          </button>

          <div style={styles.profile}>
            <div style={styles.avatar}>SA</div>

            <div style={styles.profileText}>
              <div style={styles.profileName}>
                Super Admin
              </div>

              <div style={styles.profileRole}>
                Platform Administrator
              </div>
            </div>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div style={styles.content}>
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default AdminApp;