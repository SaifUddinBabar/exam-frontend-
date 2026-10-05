import React, { useEffect, useState } from "react";
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  /* =====================================
      SCREEN SIZE
  ===================================== */

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);

      // Desktop হলে mobile menu বন্ধ
      if (window.innerWidth > 768) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const isMobile = screenWidth <= 768;
  const isTablet = screenWidth > 768 && screenWidth <= 1100;

  /* =====================================
      MENU ITEMS
  ===================================== */

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

  /* =====================================
      PAGE RENDER
  ===================================== */

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

  /* =====================================
      PAGE CHANGE
  ===================================== */

  const handlePageChange = (page) => {
    setActivePage(page);

    // Mobile হলে menu automatically close
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  /* =====================================
      STYLES
  ===================================== */

  const styles = {
    app: {
      display: "flex",
      width: "100%",
      minHeight: "100vh",
      background: "#f8fafc",
      fontFamily:
        "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      overflowX: "hidden",
      boxSizing: "border-box",
    },

    /* =====================================
        MOBILE OVERLAY
    ===================================== */

    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(15,23,42,0.55)",
      zIndex: 150,
      display: mobileOpen && isMobile ? "block" : "none",
    },

    /* =====================================
        SIDEBAR
    ===================================== */

    sidebar: {
      width: isMobile
        ? "280px"
        : collapsed
        ? "82px"
        : isTablet
        ? "240px"
        : "280px",

      background:
        "linear-gradient(180deg, #111827 0%, #0f172a 100%)",

      color: "white",

      display: "flex",
      flexDirection: "column",

      position: "fixed",

      top: 0,
      left: isMobile
        ? mobileOpen
          ? 0
          : "-300px"
        : 0,

      bottom: 0,

      zIndex: 200,

      boxShadow: mobileOpen && isMobile
        ? "8px 0 30px rgba(15,23,42,0.30)"
        : "8px 0 30px rgba(15,23,42,0.12)",

      overflow: "hidden",

      transition:
        "left 0.25s ease, width 0.25s ease",

      boxSizing: "border-box",
    },

    /* =====================================
        BRAND
    ===================================== */

    brand: {
      height: "82px",

      padding: collapsed && !isMobile
        ? "0 18px"
        : "0 24px",

      display: "flex",
      alignItems: "center",

      gap: "14px",

      borderBottom:
        "1px solid rgba(255,255,255,0.07)",

      flexShrink: 0,

      boxSizing: "border-box",
    },

    logo: {
      width: "50px",
      height: "50px",
      minWidth: "50px",

      borderRadius: "14px",

      background:
        "linear-gradient(135deg, #6366f1, #8b5cf6)",

      display: "flex",
      alignItems: "center",
      justifyContent: "center",

      fontSize: "18px",
      fontWeight: 900,

      boxShadow:
        "0 10px 30px rgba(99,102,241,0.35)",
    },

    brandText: {
      minWidth: 0,
      overflow: "hidden",
    },

    brandName: {
      fontSize: "21px",
      fontWeight: 850,
      lineHeight: 1,
      whiteSpace: "nowrap",
      letterSpacing: "-0.5px",
    },

    brandRole: {
      marginTop: "7px",
      color: "#94a3b8",
      fontSize: "11px",
      whiteSpace: "nowrap",
    },

    /* =====================================
        MENU
    ===================================== */

    menuArea: {
      flex: 1,

      padding: "24px 12px 18px",

      overflowY: "auto",
      overflowX: "hidden",

      boxSizing: "border-box",
    },

    sectionTitle: {
      padding: "0 18px 12px",

      color: "#64748b",

      fontSize: "10px",
      fontWeight: 850,

      letterSpacing: "1.2px",
      textTransform: "uppercase",

      whiteSpace: "nowrap",
    },

    menuItem: {
      width: "100%",
      height: "54px",

      border: "none",
      borderRadius: "12px",

      background: "transparent",
      color: "#94a3b8",

      display: "flex",
      alignItems: "center",

      gap: collapsed && !isMobile ? 0 : "16px",

      padding:
        collapsed && !isMobile
          ? 0
          : "0 18px",

      marginBottom: "5px",

      cursor: "pointer",
      textAlign: "left",

      fontSize: "14px",
      fontWeight: 600,

      transition: "all 0.2s ease",

      boxSizing: "border-box",
    },

    activeItem: {
      background:
        "linear-gradient(135deg, rgba(99,102,241,0.23), rgba(124,58,237,0.20))",

      color: "white",

      boxShadow:
        "inset 4px 0 0 #818cf8",
    },

    icon: {
      width: "30px",
      minWidth: "30px",

      textAlign: "center",

      fontSize: "20px",
    },

    itemText: {
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },

    /* =====================================
        TOOLS
    ===================================== */

    toolsSection: {
      marginTop: "18px",

      paddingTop: "18px",

      borderTop:
        "1px solid rgba(255,255,255,0.07)",
    },

    builderButton: {
      width: "100%",
      height: "54px",

      border:
        "1px solid rgba(129,140,248,0.25)",

      borderRadius: "12px",

      background:
        "linear-gradient(135deg, rgba(99,102,241,0.14), rgba(139,92,246,0.12))",

      color: "#c7d2fe",

      display: "flex",
      alignItems: "center",

      gap: collapsed && !isMobile ? 0 : "16px",

      padding:
        collapsed && !isMobile
          ? 0
          : "0 18px",

      cursor: "pointer",

      fontSize: "14px",
      fontWeight: 700,

      textAlign: "left",
      whiteSpace: "nowrap",

      boxSizing: "border-box",
    },

    /* =====================================
        COLLAPSE
    ===================================== */

    collapseArea: {
      padding: "12px",

      borderTop:
        "1px solid rgba(255,255,255,0.07)",

      flexShrink: 0,
    },

    collapseButton: {
      width: "100%",
      height: "40px",

      border: "none",
      borderRadius: "9px",

      background:
        "rgba(255,255,255,0.05)",

      color: "#94a3b8",

      cursor: "pointer",

      fontSize: "16px",
    },

    /* =====================================
        MAIN
    ===================================== */

    main: {
      flex: 1,

      width: isMobile
        ? "100%"
        : `calc(100% - ${
            collapsed
              ? "82px"
              : isTablet
              ? "240px"
              : "280px"
          })`,

      marginLeft: isMobile
        ? "0"
        : collapsed
        ? "82px"
        : isTablet
        ? "240px"
        : "280px",

      minWidth: 0,

      minHeight: "100vh",

      transition:
        "margin-left 0.25s ease, width 0.25s ease",

      boxSizing: "border-box",

      overflowX: "hidden",
    },

    /* =====================================
        TOPBAR
    ===================================== */

    topbar: {
      height: isMobile ? "62px" : "72px",

      background: "white",

      borderBottom:
        "1px solid #e2e8f0",

      display: "flex",

      alignItems: "center",

      justifyContent: "space-between",

      padding: isMobile
        ? "0 14px"
        : "0 30px",

      gap: "12px",

      boxSizing: "border-box",

      position: "sticky",
      top: 0,

      zIndex: 50,
    },

    mobileMenuButton: {
      width: "40px",
      height: "40px",

      border: "1px solid #e2e8f0",

      borderRadius: "9px",

      background: "#fff",

      color: "#334155",

      cursor: "pointer",

      display: isMobile
        ? "flex"
        : "none",

      alignItems: "center",
      justifyContent: "center",

      fontSize: "20px",
    },

    topbarRight: {
      display: "flex",

      alignItems: "center",

      gap: isMobile ? "8px" : "20px",

      marginLeft: "auto",
    },

    notification: {
      width: "38px",
      height: "38px",

      borderRadius: "9px",

      border:
        "1px solid #e2e8f0",

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
      display: isMobile
        ? "none"
        : "flex",

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

    /* =====================================
        CONTENT
    ===================================== */

    content: {
      width: "100%",

      minHeight:
        "calc(100vh - 72px)",

      padding: isMobile
        ? "16px"
        : isTablet
        ? "20px"
        : "28px",

      boxSizing: "border-box",

      overflowX: "hidden",
    },

    /* =====================================
        MOBILE CLOSE BUTTON
    ===================================== */

    mobileCloseButton: {
      display: isMobile
        ? "flex"
        : "none",

      position: "absolute",

      top: "20px",
      right: "16px",

      width: "32px",
      height: "32px",

      border: "none",
      borderRadius: "8px",

      background:
        "rgba(255,255,255,0.08)",

      color: "#cbd5e1",

      cursor: "pointer",

      alignItems: "center",
      justifyContent: "center",

      fontSize: "18px",
    },
  };

  return (
    <div style={styles.app}>
      {/* =====================================
          MOBILE OVERLAY
      ===================================== */}

      <div
        style={styles.overlay}
        onClick={() => setMobileOpen(false)}
      />

      {/* =====================================
          SIDEBAR
      ===================================== */}

      <aside style={styles.sidebar}>
        {/* BRAND */}

        <div style={styles.brand}>
          <div style={styles.logo}>EB</div>

          {(!collapsed || isMobile) && (
            <div style={styles.brandText}>
              <div style={styles.brandName}>
                ExamBuilder
              </div>

              <div style={styles.brandRole}>
                Super Admin
              </div>
            </div>
          )}

          {/* Mobile close */}

          {isMobile && (
            <button
              style={styles.mobileCloseButton}
              onClick={() => setMobileOpen(false)}
            >
              ×
            </button>
          )}
        </div>

        {/* MENU */}

        <div style={styles.menuArea}>
          <div style={styles.sectionTitle}>
            Main Menu
          </div>

          {menuItems.map((item) => {
            const isActive =
              activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() =>
                  handlePageChange(item.id)
                }
                style={{
                  ...styles.menuItem,

                  ...(isActive
                    ? styles.activeItem
                    : {}),

                  justifyContent:
                    collapsed && !isMobile
                      ? "center"
                      : "flex-start",

                  gap:
                    collapsed && !isMobile
                      ? 0
                      : "16px",

                  padding:
                    collapsed && !isMobile
                      ? 0
                      : "0 18px",
                }}
                title={
                  collapsed && !isMobile
                    ? item.label
                    : ""
                }
              >
                <span style={styles.icon}>
                  {item.icon}
                </span>

                {(!collapsed || isMobile) && (
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
            {(!collapsed || isMobile) && (
              <div style={styles.sectionTitle}>
                Tools
              </div>
            )}

            <button
              onClick={() => {
                setMobileOpen(false);
                navigate("/builder");
              }}
              style={{
                ...styles.builderButton,

                justifyContent:
                  collapsed && !isMobile
                    ? "center"
                    : "flex-start",

                gap:
                  collapsed && !isMobile
                    ? 0
                    : "16px",

                padding:
                  collapsed && !isMobile
                    ? 0
                    : "0 18px",
              }}
              title={
                collapsed && !isMobile
                  ? "Exam Builder"
                  : ""
              }
            >
              <span style={styles.icon}>
                📝
              </span>

              {(!collapsed || isMobile) && (
                <span>
                  Exam Builder
                </span>
              )}
            </button>
          </div>
        </div>

        {/* COLLAPSE */}

        {!isMobile && (
          <div style={styles.collapseArea}>
            <button
              style={styles.collapseButton}
              onClick={() =>
                setCollapsed(!collapsed)
              }
              title="Toggle Sidebar"
            >
              {collapsed ? "→" : "←"}
            </button>
          </div>
        )}
      </aside>

      {/* =====================================
          MAIN AREA
      ===================================== */}

      <main style={styles.main}>
        {/* TOPBAR */}

        <div style={styles.topbar}>
          {/* MOBILE MENU */}

          <button
            style={styles.mobileMenuButton}
            onClick={() =>
              setMobileOpen(true)
            }
          >
            ☰
          </button>

          <div style={styles.topbarRight}>
            <button style={styles.notification}>
              🔔

              <span
                style={styles.notificationDot}
              />
            </button>

            <div style={styles.profile}>
              <div style={styles.avatar}>
                SA
              </div>

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