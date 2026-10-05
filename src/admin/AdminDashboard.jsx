import React, { useEffect, useState } from "react";

function AdminDashboard() {
  const [screen, setScreen] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreen({
        width: window.innerWidth,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const isMobile = screen.width <= 600;
  const isTablet = screen.width > 600 && screen.width <= 1000;
  const isSmallMobile = screen.width <= 400;

  return (
    <div
      style={{
        ...styles.container,
        padding: isMobile ? "0" : "0",
      }}
    >
      {/* =========================
          WELCOME SECTION
      ========================= */}

      <div
        style={{
          ...styles.welcomeSection,

          flexDirection: isMobile ? "column" : "row",

          alignItems: isMobile ? "flex-start" : "center",

          gap: isMobile ? "14px" : "20px",

          marginBottom: isMobile ? "20px" : "28px",

          width: "100%",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h2
            style={{
              ...styles.welcomeTitle,

              fontSize: isSmallMobile
                ? "19px"
                : isMobile
                ? "21px"
                : "24px",

              lineHeight: "1.3",
            }}
          >
            Welcome back, Super Admin 👋
          </h2>

          <p
            style={{
              ...styles.welcomeText,

              fontSize: isMobile ? "12px" : "13px",

              lineHeight: "1.5",
            }}
          >
            Here's what's happening across your platform today.
          </p>
        </div>

        <button
          style={{
            ...styles.primaryButton,

            width: isMobile ? "100%" : "auto",

            padding: isMobile ? "11px 15px" : "12px 18px",
          }}
        >
          + Add Organization
        </button>
      </div>

      {/* =========================
          STATISTICS CARDS
      ========================= */}

      <div
        style={{
          ...styles.statsGrid,

          gridTemplateColumns: isMobile
            ? "1fr"
            : isTablet
            ? "repeat(2, minmax(0, 1fr))"
            : "repeat(4, minmax(0, 1fr))",

          gap: isMobile ? "12px" : "18px",

          marginBottom: isMobile ? "16px" : "22px",
        }}
      >
        {/* Organizations */}

        <div
          style={{
            ...styles.statCard,

            padding: isMobile ? "16px" : "20px",
          }}
        >
          <div style={styles.statTop}>
            <div
              style={{
                ...styles.statIcon,

                width: isMobile ? "40px" : "42px",
                height: isMobile ? "40px" : "42px",

                background: "#eef2ff",
                color: "#4f46e5",
              }}
            >
              🏢
            </div>

            <span style={styles.growth}>+12.5%</span>
          </div>

          <p style={styles.statLabel}>Total Organizations</p>

          <h3
            style={{
              ...styles.statValue,

              fontSize: isMobile ? "23px" : "25px",
            }}
          >
            128
          </h3>

          <p style={styles.statDescription}>
            Compared to last month
          </p>
        </div>

        {/* Students */}

        <div
          style={{
            ...styles.statCard,

            padding: isMobile ? "16px" : "20px",
          }}
        >
          <div style={styles.statTop}>
            <div
              style={{
                ...styles.statIcon,

                width: isMobile ? "40px" : "42px",
                height: isMobile ? "40px" : "42px",

                background: "#ecfdf5",
                color: "#059669",
              }}
            >
              🎓
            </div>

            <span style={styles.growth}>+18.2%</span>
          </div>

          <p style={styles.statLabel}>Total Students</p>

          <h3
            style={{
              ...styles.statValue,

              fontSize: isMobile ? "23px" : "25px",
            }}
          >
            12,846
          </h3>

          <p style={styles.statDescription}>
            Compared to last month
          </p>
        </div>

        {/* Exams */}

        <div
          style={{
            ...styles.statCard,

            padding: isMobile ? "16px" : "20px",
          }}
        >
          <div style={styles.statTop}>
            <div
              style={{
                ...styles.statIcon,

                width: isMobile ? "40px" : "42px",
                height: isMobile ? "40px" : "42px",

                background: "#fff7ed",
                color: "#ea580c",
              }}
            >
              📝
            </div>

            <span style={styles.growth}>+9.4%</span>
          </div>

          <p style={styles.statLabel}>Total Exams</p>

          <h3
            style={{
              ...styles.statValue,

              fontSize: isMobile ? "23px" : "25px",
            }}
          >
            1,482
          </h3>

          <p style={styles.statDescription}>
            Compared to last month
          </p>
        </div>

        {/* Questions */}

        <div
          style={{
            ...styles.statCard,

            padding: isMobile ? "16px" : "20px",
          }}
        >
          <div style={styles.statTop}>
            <div
              style={{
                ...styles.statIcon,

                width: isMobile ? "40px" : "42px",
                height: isMobile ? "40px" : "42px",

                background: "#fdf2f8",
                color: "#db2777",
              }}
            >
              📚
            </div>

            <span style={styles.growth}>+21.7%</span>
          </div>

          <p style={styles.statLabel}>Question Bank</p>

          <h3
            style={{
              ...styles.statValue,

              fontSize: isMobile ? "23px" : "25px",
            }}
          >
            24,560
          </h3>

          <p style={styles.statDescription}>
            Compared to last month
          </p>
        </div>
      </div>

      {/* =========================
          SECOND ROW
      ========================= */}

      <div
        style={{
          ...styles.contentGrid,

          gridTemplateColumns: isMobile
            ? "1fr"
            : isTablet
            ? "1fr"
            : "minmax(0, 1.7fr) minmax(300px, 1fr)",

          gap: isMobile ? "14px" : "20px",

          marginBottom: isMobile ? "16px" : "22px",
        }}
      >
        {/* Recent Organizations */}

        <div
          style={{
            ...styles.panel,

            padding: isMobile ? "14px" : "22px",

            marginBottom: isMobile ? "14px" : "22px",
          }}
        >
          <div
            style={{
              ...styles.panelHeader,

              alignItems: isMobile ? "flex-start" : "center",

              marginBottom: isMobile ? "14px" : "20px",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <h3 style={styles.panelTitle}>
                Recent Organizations
              </h3>

              <p style={styles.panelSubtitle}>
                Latest organizations added
              </p>
            </div>

            <button style={styles.viewButton}>
              View All
            </button>
          </div>

          <div style={styles.tableWrapper}>
            <table
              style={{
                ...styles.table,

                minWidth: isMobile ? "500px" : "520px",
              }}
            >
              <thead>
                <tr>
                  <th style={styles.th}>Organization</th>
                  <th style={styles.th}>Students</th>
                  <th style={styles.th}>Plan</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td style={styles.td}>
                    <div style={styles.orgCell}>
                      <div style={styles.orgAvatar}>A</div>

                      <div>
                        <strong>Alpha Coaching</strong>

                        <small style={styles.orgSmall}>
                          Dhaka
                        </small>
                      </div>
                    </div>
                  </td>

                  <td style={styles.td}>1,240</td>

                  <td style={styles.td}>
                    <span style={styles.planBadge}>
                      Premium
                    </span>
                  </td>

                  <td style={styles.td}>
                    <span style={styles.activeBadge}>
                      Active
                    </span>
                  </td>
                </tr>

                <tr>
                  <td style={styles.td}>
                    <div style={styles.orgCell}>
                      <div
                        style={{
                          ...styles.orgAvatar,

                          background: "#ecfdf5",
                          color: "#059669",
                        }}
                      >
                        B
                      </div>

                      <div>
                        <strong>Bright Academy</strong>

                        <small style={styles.orgSmall}>
                          Chittagong
                        </small>
                      </div>
                    </div>
                  </td>

                  <td style={styles.td}>856</td>

                  <td style={styles.td}>
                    <span style={styles.basicBadge}>
                      Basic
                    </span>
                  </td>

                  <td style={styles.td}>
                    <span style={styles.activeBadge}>
                      Active
                    </span>
                  </td>
                </tr>

                <tr>
                  <td style={styles.td}>
                    <div style={styles.orgCell}>
                      <div
                        style={{
                          ...styles.orgAvatar,

                          background: "#fff7ed",
                          color: "#ea580c",
                        }}
                      >
                        M
                      </div>

                      <div>
                        <strong>
                          Mastermind Coaching
                        </strong>

                        <small style={styles.orgSmall}>
                          Cumilla
                        </small>
                      </div>
                    </div>
                  </td>

                  <td style={styles.td}>642</td>

                  <td style={styles.td}>
                    <span style={styles.planBadge}>
                      Premium
                    </span>
                  </td>

                  <td style={styles.td}>
                    <span style={styles.pendingBadge}>
                      Pending
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Platform Overview */}

        <div
          style={{
            ...styles.panel,

            padding: isMobile ? "14px" : "22px",

            marginBottom: isMobile ? "14px" : "22px",
          }}
        >
          <div style={styles.panelHeader}>
            <div>
              <h3 style={styles.panelTitle}>
                Platform Overview
              </h3>

              <p style={styles.panelSubtitle}>
                Current platform statistics
              </p>
            </div>
          </div>

          <div style={styles.overviewList}>
            <div style={styles.overviewItem}>
              <div style={styles.overviewIcon}>
                👨‍💼
              </div>

              <div style={styles.overviewInfo}>
                <span>Organization Admins</span>

                <strong>186</strong>
              </div>
            </div>

            <div style={styles.overviewItem}>
              <div style={styles.overviewIcon}>
                📋
              </div>

              <div style={styles.overviewInfo}>
                <span>Exam Attempts</span>

                <strong>48,294</strong>
              </div>
            </div>

            <div style={styles.overviewItem}>
              <div style={styles.overviewIcon}>
                💰
              </div>

              <div style={styles.overviewInfo}>
                <span>Monthly Revenue</span>

                <strong>৳ 4,86,500</strong>
              </div>
            </div>

            <div style={styles.overviewItem}>
              <div style={styles.overviewIcon}>
                ⭐
              </div>

              <div style={styles.overviewInfo}>
                <span>Active Subscriptions</span>

                <strong>112</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          RECENT EXAMS
      ========================= */}

      <div
        style={{
          ...styles.panel,

          padding: isMobile ? "14px" : "22px",

          marginBottom: isMobile ? "14px" : "22px",
        }}
      >
        <div style={styles.panelHeader}>
          <div style={{ minWidth: 0 }}>
            <h3 style={styles.panelTitle}>
              Recent Exams
            </h3>

            <p style={styles.panelSubtitle}>
              Latest exams created across organizations
            </p>
          </div>

          <button style={styles.viewButton}>
            View All
          </button>
        </div>

        <div
          style={{
            ...styles.examGrid,

            gridTemplateColumns: isMobile
              ? "1fr"
              : isTablet
              ? "repeat(2, minmax(0, 1fr))"
              : "repeat(3, minmax(0, 1fr))",

            gap: isMobile ? "10px" : "14px",
          }}
        >
          {/* Exam 1 */}

          <div
            style={{
              ...styles.examCard,

              padding: isMobile ? "13px" : "16px",

              gap: isMobile ? "9px" : "12px",

              alignItems: "flex-start",
            }}
          >
            <div style={styles.examIcon}>
              📝
            </div>

            <div
              style={{
                flex: 1,

                minWidth: 0,
              }}
            >
              <h4 style={styles.examTitle}>
                HSC Physics Model Test
              </h4>

              <p style={styles.examOrg}>
                Alpha Coaching
              </p>

              <div style={styles.examMeta}>
                <span>50 Questions</span>

                <span>45 Minutes</span>
              </div>
            </div>

            <span style={styles.activeBadge}>
              Active
            </span>
          </div>

          {/* Exam 2 */}

          <div
            style={{
              ...styles.examCard,

              padding: isMobile ? "13px" : "16px",

              gap: isMobile ? "9px" : "12px",
            }}
          >
            <div
              style={{
                ...styles.examIcon,

                background: "#ecfdf5",
              }}
            >
              📐
            </div>

            <div
              style={{
                flex: 1,

                minWidth: 0,
              }}
            >
              <h4 style={styles.examTitle}>
                Mathematics Final Exam
              </h4>

              <p style={styles.examOrg}>
                Bright Academy
              </p>

              <div style={styles.examMeta}>
                <span>40 Questions</span>

                <span>60 Minutes</span>
              </div>
            </div>

            <span style={styles.activeBadge}>
              Active
            </span>
          </div>

          {/* Exam 3 */}

          <div
            style={{
              ...styles.examCard,

              padding: isMobile ? "13px" : "16px",

              gap: isMobile ? "9px" : "12px",
            }}
          >
            <div
              style={{
                ...styles.examIcon,

                background: "#fff7ed",
              }}
            >
              🧪
            </div>

            <div
              style={{
                flex: 1,

                minWidth: 0,
              }}
            >
              <h4 style={styles.examTitle}>
                Chemistry Practice Test
              </h4>

              <p style={styles.examOrg}>
                Mastermind Coaching
              </p>

              <div style={styles.examMeta}>
                <span>30 Questions</span>

                <span>30 Minutes</span>
              </div>
            </div>

            <span style={styles.pendingBadge}>
              Draft
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    boxSizing: "border-box",
  },

  welcomeSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
    gap: "20px",
    flexWrap: "wrap",
  },

  welcomeTitle: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "700",
    color: "#111827",
  },

  welcomeText: {
    margin: "7px 0 0",
    fontSize: "13px",
    color: "#6b7280",
  },

  primaryButton: {
    border: "none",
    background:
      "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff",
    padding: "12px 18px",
    borderRadius: "9px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow:
      "0 6px 16px rgba(99,102,241,0.22)",
    whiteSpace: "nowrap",
    boxSizing: "border-box",
  },

  statsGrid: {
    display: "grid",
    gap: "18px",
    width: "100%",
    minWidth: 0,
  },

  statCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "20px",
    boxShadow:
      "0 2px 8px rgba(15,23,42,0.03)",
    minWidth: 0,
    width: "100%",
    boxSizing: "border-box",
  },

  statTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
    gap: "10px",
  },

  statIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    flexShrink: 0,
  },

  growth: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#059669",
    background: "#ecfdf5",
    padding: "5px 8px",
    borderRadius: "20px",
    whiteSpace: "nowrap",
  },

  statLabel: {
    margin: 0,
    fontSize: "12px",
    color: "#6b7280",
  },

  statValue: {
    margin: "5px 0 4px",
    fontSize: "25px",
    fontWeight: "700",
    color: "#111827",
    overflowWrap: "anywhere",
  },

  statDescription: {
    margin: 0,
    fontSize: "10px",
    color: "#9ca3af",
  },

  contentGrid: {
    display: "grid",
    gap: "20px",
    width: "100%",
    minWidth: 0,
  },

  panel: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "22px",
    marginBottom: "22px",
    boxShadow:
      "0 2px 8px rgba(15,23,42,0.03)",
    minWidth: 0,
    width: "100%",
    boxSizing: "border-box",
  },

  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
    gap: "15px",
    flexWrap: "wrap",
  },

  panelTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "700",
    color: "#111827",
  },

  panelSubtitle: {
    margin: "4px 0 0",
    fontSize: "11px",
    color: "#9ca3af",
    lineHeight: "1.5",
  },

  viewButton: {
    border: "none",
    background: "transparent",
    color: "#6366f1",
    fontSize: "11px",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
    padding: "4px 0",
  },

  tableWrapper: {
    overflowX: "auto",
    overflowY: "hidden",
    width: "100%",
    WebkitOverflowScrolling: "touch",
    boxSizing: "border-box",
  },

  table: {
    width: "100%",
    minWidth: "520px",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "11px 10px",
    fontSize: "10px",
    color: "#9ca3af",
    fontWeight: "600",
    borderBottom: "1px solid #f0f1f3",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "13px 10px",
    fontSize: "11px",
    color: "#4b5563",
    borderBottom: "1px solid #f3f4f6",
    whiteSpace: "nowrap",
  },

  orgCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: "180px",
  },

  orgAvatar: {
    width: "34px",
    height: "34px",
    borderRadius: "9px",
    background: "#eef2ff",
    color: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "700",
    flexShrink: 0,
  },

  orgSmall: {
    display: "block",
    marginTop: "3px",
    color: "#9ca3af",
    fontSize: "10px",
  },

  planBadge: {
    background: "#eef2ff",
    color: "#4f46e5",
    padding: "5px 8px",
    borderRadius: "20px",
    fontSize: "9px",
    fontWeight: "600",
  },

  basicBadge: {
    background: "#f3f4f6",
    color: "#6b7280",
    padding: "5px 8px",
    borderRadius: "20px",
    fontSize: "9px",
    fontWeight: "600",
  },

  activeBadge: {
    background: "#ecfdf5",
    color: "#059669",
    padding: "5px 8px",
    borderRadius: "20px",
    fontSize: "9px",
    fontWeight: "600",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },

  pendingBadge: {
    background: "#fff7ed",
    color: "#ea580c",
    padding: "5px 8px",
    borderRadius: "20px",
    fontSize: "9px",
    fontWeight: "600",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },

  overviewList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    width: "100%",
  },

  overviewItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    borderRadius: "10px",
    background: "#f9fafb",
    minWidth: 0,
    width: "100%",
    boxSizing: "border-box",
  },

  overviewIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "9px",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "15px",
    border: "1px solid #eef0f3",
    flexShrink: 0,
  },

  overviewInfo: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    fontSize: "11px",
    color: "#6b7280",
  },

  examGrid: {
    display: "grid",
    width: "100%",
    minWidth: 0,
  },

  examCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "16px",
    border: "1px solid #eef0f3",
    borderRadius: "12px",
    background: "#fafbfc",
    minWidth: 0,
    width: "100%",
    boxSizing: "border-box",
  },

  examIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "9px",
    background: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    flexShrink: 0,
  },

  examTitle: {
    margin: 0,
    fontSize: "12px",
    fontWeight: "600",
    color: "#111827",
    overflowWrap: "anywhere",
    lineHeight: "1.4",
  },

  examOrg: {
    margin: "4px 0 8px",
    fontSize: "10px",
    color: "#9ca3af",
  },

  examMeta: {
    display: "flex",
    gap: "10px",
    fontSize: "9px",
    color: "#6b7280",
    flexWrap: "wrap",
    lineHeight: "1.4",
  },
};

export default AdminDashboard;