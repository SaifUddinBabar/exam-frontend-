import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function OrganizationApp() {
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState("Dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);

      if (window.innerWidth > 768) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = screenWidth <= 768;
  const isTablet = screenWidth > 768 && screenWidth <= 1100;

  const menuItems = [
    { label: "Dashboard", icon: "⌂" },
    { label: "Students", icon: "👨‍🎓" },
    { label: "Teachers", icon: "👨‍🏫" },
    { label: "Exams", icon: "📝" },
    { label: "Question Bank", icon: "📚" },
    { label: "Analytics", icon: "📊" },
    { label: "Subscription", icon: "💳" },
    { label: "Settings", icon: "⚙️" },
  ];

  const handlePageChange = (page) => {
    setActivePage(page);

    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleCreateExam = () => {
    navigate("/builder");

    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const sidebarWidth = isMobile
    ? 280
    : isTablet
    ? 240
    : collapsed
    ? 82
    : 280;

  const sidebarLeft = isMobile ? (mobileOpen ? 0 : -300) : 0;

  const styles = {
    app: {
      minHeight: "100vh",
      background: "#f5f7fb",
      fontFamily:
        "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      color: "#172033",
    },

    sidebar: {
      position: "fixed",
      top: 0,
      left: sidebarLeft,
      width: `${sidebarWidth}px`,
      height: "100vh",
      background: "#111827",
      color: "#fff",
      zIndex: 1000,
      transition: "all 0.25s ease",
      display: "flex",
      flexDirection: "column",
      boxShadow: isMobile
        ? "8px 0 30px rgba(0,0,0,0.18)"
        : "none",
      overflow: "hidden",
    },

    logoArea: {
      height: "76px",
      display: "flex",
      alignItems: "center",
      justifyContent:
        collapsed && !isMobile ? "center" : "space-between",
      padding: collapsed && !isMobile ? "0 12px" : "0 20px",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      flexShrink: 0,
    },

    logoWrapper: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      minWidth: 0,
    },

    logo: {
      width: "40px",
      height: "40px",
      borderRadius: "11px",
      background: "linear-gradient(135deg, #2563eb, #7c3aed)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "20px",
      fontWeight: 800,
      flexShrink: 0,
    },

    logoText: {
      fontSize: "17px",
      fontWeight: 750,
      whiteSpace: "nowrap",
    },

    logoSubText: {
      fontSize: "11px",
      color: "#9ca3af",
      marginTop: "2px",
      whiteSpace: "nowrap",
    },

    closeButton: {
      width: "34px",
      height: "34px",
      border: "none",
      borderRadius: "8px",
      background: "rgba(255,255,255,0.08)",
      color: "#fff",
      cursor: "pointer",
      fontSize: "18px",
    },

    profile: {
      padding: "18px 16px",
      margin: "12px",
      borderRadius: "12px",
      background: "rgba(255,255,255,0.06)",
      display: "flex",
      alignItems: "center",
      gap: "11px",
    },

    avatar: {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      background: "#2563eb",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 700,
      flexShrink: 0,
    },

    profileName: {
      fontSize: "13px",
      fontWeight: 650,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },

    profileRole: {
      fontSize: "11px",
      color: "#9ca3af",
      marginTop: "3px",
    },

    nav: {
      flex: 1,
      padding: "4px 12px",
      overflowY: "auto",
    },

    navLabel: {
      fontSize: "10px",
      color: "#6b7280",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      padding: "12px 10px 8px",
    },

    navItem: {
      width: "100%",
      border: "none",
      background: "transparent",
      color: "#9ca3af",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "11px 12px",
      marginBottom: "4px",
      borderRadius: "9px",
      cursor: "pointer",
      textAlign: "left",
      fontSize: "13px",
      fontWeight: 550,
      transition: "all 0.2s ease",
    },

    activeNavItem: {
      background: "#2563eb",
      color: "#fff",
      boxShadow: "0 5px 14px rgba(37,99,235,0.25)",
    },

    navIcon: {
      width: "23px",
      textAlign: "center",
      fontSize: "17px",
      flexShrink: 0,
    },

    sidebarBottom: {
      padding: "12px",
      borderTop: "1px solid rgba(255,255,255,0.08)",
    },

    logoutButton: {
      width: "100%",
      border: "none",
      background: "rgba(239,68,68,0.08)",
      color: "#fca5a5",
      borderRadius: "9px",
      padding: "11px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent:
        collapsed && !isMobile ? "center" : "flex-start",
      gap: "10px",
      fontSize: "13px",
    },

    main: {
      marginLeft: isMobile ? 0 : `${sidebarWidth}px`,
      minHeight: "100vh",
      transition: "margin-left 0.25s ease",
    },

    topbar: {
      height: isMobile ? "66px" : "76px",
      background: "#fff",
      borderBottom: "1px solid #e5e7eb",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: isMobile ? "0 16px" : "0 28px",
      position: "sticky",
      top: 0,
      zIndex: 500,
    },

    topLeft: {
      display: "flex",
      alignItems: "center",
      gap: "14px",
      minWidth: 0,
    },

    hamburger: {
      width: "38px",
      height: "38px",
      border: "1px solid #e5e7eb",
      background: "#fff",
      borderRadius: "9px",
      cursor: "pointer",
      fontSize: "19px",
    },

    collapseButton: {
      width: "38px",
      height: "38px",
      border: "1px solid #e5e7eb",
      background: "#fff",
      borderRadius: "9px",
      cursor: "pointer",
      fontSize: "18px",
    },

    pageTitle: {
      fontSize: isMobile ? "17px" : "20px",
      fontWeight: 750,
      whiteSpace: "nowrap",
    },

    breadcrumb: {
      fontSize: "12px",
      color: "#9ca3af",
      marginTop: "2px",
    },

    topRight: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },

    notification: {
      width: "38px",
      height: "38px",
      border: "1px solid #e5e7eb",
      background: "#fff",
      borderRadius: "9px",
      cursor: "pointer",
      fontSize: "17px",
      position: "relative",
    },

    dot: {
      position: "absolute",
      top: "7px",
      right: "7px",
      width: "7px",
      height: "7px",
      borderRadius: "50%",
      background: "#ef4444",
      border: "2px solid #fff",
    },

    organizationBadge: {
      display: isMobile ? "none" : "flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 12px",
      borderRadius: "9px",
      background: "#eff6ff",
      color: "#1d4ed8",
      fontSize: "12px",
      fontWeight: 650,
    },

    content: {
      padding: isMobile
        ? "18px 14px"
        : isTablet
        ? "22px 20px"
        : "28px",
    },

    overlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.45)",
      zIndex: 900,
    },

    welcomeCard: {
      background: "linear-gradient(135deg, #1d4ed8, #4f46e5)",
      borderRadius: "16px",
      padding: isMobile ? "22px" : "28px",
      color: "#fff",
      marginBottom: "22px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "20px",
      overflow: "hidden",
      position: "relative",
    },

    welcomeTitle: {
      fontSize: isMobile ? "21px" : "26px",
      fontWeight: 750,
      margin: 0,
    },

    welcomeText: {
      fontSize: "13px",
      color: "rgba(255,255,255,0.82)",
      marginTop: "7px",
    },

    planBadge: {
      display: "inline-block",
      marginTop: "14px",
      padding: "6px 11px",
      borderRadius: "20px",
      background: "rgba(255,255,255,0.16)",
      fontSize: "11px",
      fontWeight: 650,
    },

    createButton: {
      border: "none",
      background: "#fff",
      color: "#1d4ed8",
      padding: "11px 17px",
      borderRadius: "9px",
      fontWeight: 700,
      cursor: "pointer",
      whiteSpace: "nowrap",
      fontSize: "13px",
    },

    statsGrid: {
      display: "grid",
      gridTemplateColumns: isMobile
        ? "repeat(2, minmax(0, 1fr))"
        : isTablet
        ? "repeat(2, minmax(0, 1fr))"
        : "repeat(4, minmax(0, 1fr))",
      gap: "14px",
      marginBottom: "22px",
    },

    statCard: {
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: "13px",
      padding: isMobile ? "15px" : "18px",
      boxShadow: "0 2px 8px rgba(15,23,42,0.03)",
    },

    statIcon: {
      width: "38px",
      height: "38px",
      borderRadius: "10px",
      background: "#eff6ff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "18px",
      marginBottom: "12px",
    },

    statValue: {
      fontSize: isMobile ? "21px" : "25px",
      fontWeight: 750,
    },

    statLabel: {
      color: "#6b7280",
      fontSize: "12px",
      marginTop: "3px",
    },

    grid: {
      display: "grid",
      gridTemplateColumns: isMobile
        ? "1fr"
        : "minmax(0, 1.55fr) minmax(280px, 0.85fr)",
      gap: "18px",
    },

    panel: {
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: "14px",
      overflow: "hidden",
    },

    panelHeader: {
      padding: "17px 18px",
      borderBottom: "1px solid #eef0f4",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },

    panelTitle: {
      fontSize: "15px",
      fontWeight: 700,
    },

    viewAll: {
      border: "none",
      background: "transparent",
      color: "#2563eb",
      fontSize: "12px",
      fontWeight: 650,
      cursor: "pointer",
    },

    examRow: {
      padding: "14px 18px",
      borderBottom: "1px solid #f0f1f4",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
    },

    examTitle: {
      fontSize: "13px",
      fontWeight: 650,
    },

    examMeta: {
      fontSize: "11px",
      color: "#9ca3af",
      marginTop: "4px",
    },

    status: {
      padding: "5px 9px",
      borderRadius: "20px",
      fontSize: "10px",
      fontWeight: 700,
      background: "#dcfce7",
      color: "#15803d",
      whiteSpace: "nowrap",
    },

    quickGrid: {
      padding: "18px",
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: "10px",
    },

    quickButton: {
      border: "1px solid #e5e7eb",
      background: "#fff",
      borderRadius: "10px",
      padding: "15px 10px",
      cursor: "pointer",
      textAlign: "left",
      transition: "0.2s",
    },

    quickIcon: {
      fontSize: "20px",
      marginBottom: "8px",
    },

    quickTitle: {
      fontSize: "12px",
      fontWeight: 650,
    },

    activityPanel: {
      marginTop: "18px",
    },

    activityRow: {
      padding: "13px 18px",
      display: "flex",
      gap: "11px",
      borderBottom: "1px solid #f0f1f4",
    },

    activityDot: {
      width: "9px",
      height: "9px",
      borderRadius: "50%",
      background: "#2563eb",
      marginTop: "5px",
      flexShrink: 0,
    },

    activityText: {
      fontSize: "12px",
      lineHeight: 1.5,
    },

    activityTime: {
      color: "#9ca3af",
      fontSize: "10px",
      marginTop: "3px",
    },
  };

  const stats = [
    {
      icon: "👨‍🎓",
      value: "1,240",
      label: "Total Students",
    },
    {
      icon: "👨‍🏫",
      value: "24",
      label: "Teachers",
    },
    {
      icon: "📝",
      value: "186",
      label: "Total Exams",
    },
    {
      icon: "📚",
      value: "8,420",
      label: "Question Bank",
    },
    {
      icon: "📊",
      value: "18,492",
      label: "Exam Attempts",
    },
    {
      icon: "⭐",
      value: "78.6%",
      label: "Average Score",
    },
  ];

  const recentExams = [
    {
      title: "Physics Model Test",
      subject: "Physics",
      participants: 342,
      status: "Active",
    },
    {
      title: "Mathematics Final Exam",
      subject: "Mathematics",
      participants: 286,
      status: "Active",
    },
    {
      title: "ICT Board Preparation",
      subject: "ICT",
      participants: 214,
      status: "Active",
    },
    {
      title: "Chemistry Chapter Test",
      subject: "Chemistry",
      participants: 178,
      status: "Completed",
    },
  ];

  const activities = [
    {
      text: 'You created "Physics Model Test".',
      time: "12 minutes ago",
    },
    {
      text: '120 students completed "Mathematics Final Exam".',
      time: "1 hour ago",
    },
    {
      text: "A new teacher was added to your coaching.",
      time: "3 hours ago",
    },
    {
      text: "ICT Board Preparation result was published.",
      time: "Yesterday",
    },
  ];

  const quickActions = [
    {
      icon: "📝",
      title: "Create Exam",
      action: handleCreateExam,
    },
    {
      icon: "👨‍🎓",
      title: "Add Student",
      action: () => handlePageChange("Students"),
    },
    {
      icon: "👨‍🏫",
      title: "Add Teacher",
      action: () => handlePageChange("Teachers"),
    },
    {
      icon: "📚",
      title: "Question Bank",
      action: () => handlePageChange("Question Bank"),
    },
  ];

  return (
    <div style={styles.app}>
      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          style={styles.overlay}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.logoArea}>
          <div style={styles.logoWrapper}>
            <div style={styles.logo}>A</div>

            {(!collapsed || isMobile) && (
              <div>
                <div style={styles.logoText}>AcademyPro</div>
                <div style={styles.logoSubText}>
                  Coaching Management
                </div>
              </div>
            )}
          </div>

          {isMobile && (
            <button
              style={styles.closeButton}
              onClick={() => setMobileOpen(false)}
            >
              ×
            </button>
          )}
        </div>

        {(!collapsed || isMobile) && (
          <div style={styles.profile}>
            <div style={styles.avatar}>RA</div>

            <div style={{ minWidth: 0 }}>
              <div style={styles.profileName}>
                Rahim Ahmed
              </div>

              <div style={styles.profileRole}>
                Coaching Owner
              </div>
            </div>
          </div>
        )}

        <nav style={styles.nav}>
          <div style={styles.navLabel}>Workspace</div>

          {menuItems.map((item) => {
            const isActive = activePage === item.label;

            return (
              <button
                key={item.label}
                onClick={() => handlePageChange(item.label)}
                style={{
                  ...styles.navItem,
                  ...(isActive ? styles.activeNavItem : {}),
                  justifyContent:
                    collapsed && !isMobile
                      ? "center"
                      : "flex-start",
                }}
                title={
                  collapsed && !isMobile
                    ? item.label
                    : undefined
                }
              >
                <span style={styles.navIcon}>{item.icon}</span>

                {(!collapsed || isMobile) && (
                  <span>{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div style={styles.sidebarBottom}>
          <button
            style={styles.logoutButton}
            onClick={() => console.log("Logout")}
          >
            <span>↪</span>

            {(!collapsed || isMobile) && (
              <span>Logout</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        {/* Topbar */}
        <header style={styles.topbar}>
          <div style={styles.topLeft}>
            {isMobile ? (
              <button
                style={styles.hamburger}
                onClick={() => setMobileOpen(true)}
              >
                ☰
              </button>
            ) : (
              <button
                style={styles.collapseButton}
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed ? "→" : "←"}
              </button>
            )}

            <div>
              <div style={styles.pageTitle}>
                {activePage}
              </div>

              <div style={styles.breadcrumb}>
                Alpha Coaching / {activePage}
              </div>
            </div>
          </div>

          <div style={styles.topRight}>
            <div style={styles.organizationBadge}>
              🏫 Alpha Coaching
            </div>

            <button style={styles.notification}>
              🔔
              <span style={styles.dot}></span>
            </button>
          </div>
        </header>

        {/* Content */}
        <section style={styles.content}>
          {activePage === "Dashboard" ? (
            <>
              {/* Welcome */}
              <div style={styles.welcomeCard}>
                <div>
                  <h1 style={styles.welcomeTitle}>
                    Welcome back, Rahim! 👋
                  </h1>

                  <div style={styles.welcomeText}>
                    Here's what's happening at Alpha Coaching
                    today.
                  </div>

                  <div style={styles.planBadge}>
                    Premium Plan • Active
                  </div>
                </div>

                {!isMobile && (
                  <button
                    style={styles.createButton}
                    onClick={handleCreateExam}
                  >
                    + Create New Exam
                  </button>
                )}
              </div>

              {/* Stats */}
              <div style={styles.statsGrid}>
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    style={styles.statCard}
                  >
                    <div style={styles.statIcon}>
                      {stat.icon}
                    </div>

                    <div style={styles.statValue}>
                      {stat.value}
                    </div>

                    <div style={styles.statLabel}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Main dashboard */}
              <div style={styles.grid}>
                {/* Recent exams */}
                <div style={styles.panel}>
                  <div style={styles.panelHeader}>
                    <div style={styles.panelTitle}>
                      Recent Exams
                    </div>

                    <button
                      style={styles.viewAll}
                      onClick={() =>
                        handlePageChange("Exams")
                      }
                    >
                      View All
                    </button>
                  </div>

                  {recentExams.map((exam) => (
                    <div
                      key={exam.title}
                      style={styles.examRow}
                    >
                      <div>
                        <div style={styles.examTitle}>
                          {exam.title}
                        </div>

                        <div style={styles.examMeta}>
                          {exam.subject} •{" "}
                          {exam.participants} participants
                        </div>
                      </div>

                      <div
                        style={{
                          ...styles.status,
                          ...(exam.status === "Completed"
                            ? {
                                background: "#f3f4f6",
                                color: "#6b7280",
                              }
                            : {}),
                        }}
                      >
                        {exam.status}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick actions */}
                <div style={styles.panel}>
                  <div style={styles.panelHeader}>
                    <div style={styles.panelTitle}>
                      Quick Actions
                    </div>
                  </div>

                  <div style={styles.quickGrid}>
                    {quickActions.map((item) => (
                      <button
                        key={item.title}
                        style={styles.quickButton}
                        onClick={item.action}
                      >
                        <div style={styles.quickIcon}>
                          {item.icon}
                        </div>

                        <div style={styles.quickTitle}>
                          {item.title}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Activity */}
              <div
                style={{
                  ...styles.panel,
                  ...styles.activityPanel,
                }}
              >
                <div style={styles.panelHeader}>
                  <div style={styles.panelTitle}>
                    Recent Activity
                  </div>

                  <button style={styles.viewAll}>
                    View All
                  </button>
                </div>

                {activities.map((activity, index) => (
                  <div
                    key={index}
                    style={styles.activityRow}
                  >
                    <div style={styles.activityDot}></div>

                    <div>
                      <div style={styles.activityText}>
                        {activity.text}
                      </div>

                      <div style={styles.activityTime}>
                        {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Temporary placeholder for other pages */
            <div
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "14px",
                padding: isMobile ? "30px 20px" : "50px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "42px",
                  marginBottom: "12px",
                }}
              >
                🚧
              </div>

              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 750,
                  marginBottom: "8px",
                }}
              >
                {activePage}
              </div>

              <div
                style={{
                  color: "#6b7280",
                  fontSize: "13px",
                }}
              >
                This section will be added next.
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}