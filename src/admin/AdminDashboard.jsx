import React from "react";

function AdminDashboard() {
  return (
    <div style={styles.container}>

      {/* =========================
          WELCOME SECTION
      ========================= */}

      <div style={styles.welcomeSection}>

        <div>
          <h2 style={styles.welcomeTitle}>
            Welcome back, Super Admin 👋
          </h2>

          <p style={styles.welcomeText}>
            Here's what's happening across your platform today.
          </p>
        </div>

        <button style={styles.primaryButton}>
          + Add Organization
        </button>

      </div>


      {/* =========================
          STATISTICS CARDS
      ========================= */}

      <div style={styles.statsGrid}>

        {/* Organizations */}

        <div style={styles.statCard}>

          <div style={styles.statTop}>
            <div
              style={{
                ...styles.statIcon,
                background: "#eef2ff",
                color: "#4f46e5"
              }}
            >
              🏢
            </div>

            <span style={styles.growth}>
              +12.5%
            </span>
          </div>

          <p style={styles.statLabel}>
            Total Organizations
          </p>

          <h3 style={styles.statValue}>
            128
          </h3>

          <p style={styles.statDescription}>
            Compared to last month
          </p>

        </div>


        {/* Students */}

        <div style={styles.statCard}>

          <div style={styles.statTop}>
            <div
              style={{
                ...styles.statIcon,
                background: "#ecfdf5",
                color: "#059669"
              }}
            >
              🎓
            </div>

            <span style={styles.growth}>
              +18.2%
            </span>
          </div>

          <p style={styles.statLabel}>
            Total Students
          </p>

          <h3 style={styles.statValue}>
            12,846
          </h3>

          <p style={styles.statDescription}>
            Compared to last month
          </p>

        </div>


        {/* Exams */}

        <div style={styles.statCard}>

          <div style={styles.statTop}>
            <div
              style={{
                ...styles.statIcon,
                background: "#fff7ed",
                color: "#ea580c"
              }}
            >
              📝
            </div>

            <span style={styles.growth}>
              +9.4%
            </span>
          </div>

          <p style={styles.statLabel}>
            Total Exams
          </p>

          <h3 style={styles.statValue}>
            1,482
          </h3>

          <p style={styles.statDescription}>
            Compared to last month
          </p>

        </div>


        {/* Questions */}

        <div style={styles.statCard}>

          <div style={styles.statTop}>
            <div
              style={{
                ...styles.statIcon,
                background: "#fdf2f8",
                color: "#db2777"
              }}
            >
              📚
            </div>

            <span style={styles.growth}>
              +21.7%
            </span>
          </div>

          <p style={styles.statLabel}>
            Question Bank
          </p>

          <h3 style={styles.statValue}>
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

      <div style={styles.contentGrid}>


        {/* Recent Organizations */}

        <div style={styles.panel}>

          <div style={styles.panelHeader}>

            <div>
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

            <table style={styles.table}>

              <thead>

                <tr>
                  <th style={styles.th}>
                    Organization
                  </th>

                  <th style={styles.th}>
                    Students
                  </th>

                  <th style={styles.th}>
                    Plan
                  </th>

                  <th style={styles.th}>
                    Status
                  </th>
                </tr>

              </thead>


              <tbody>

                <tr>

                  <td style={styles.td}>
                    <div style={styles.orgCell}>

                      <div style={styles.orgAvatar}>
                        A
                      </div>

                      <div>
                        <strong>
                          Alpha Coaching
                        </strong>

                        <small>
                          Dhaka
                        </small>
                      </div>

                    </div>
                  </td>

                  <td style={styles.td}>
                    1,240
                  </td>

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
                          color: "#059669"
                        }}
                      >
                        B
                      </div>

                      <div>
                        <strong>
                          Bright Academy
                        </strong>

                        <small>
                          Chittagong
                        </small>
                      </div>

                    </div>
                  </td>

                  <td style={styles.td}>
                    856
                  </td>

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
                          color: "#ea580c"
                        }}
                      >
                        M
                      </div>

                      <div>
                        <strong>
                          Mastermind Coaching
                        </strong>

                        <small>
                          Cumilla
                        </small>
                      </div>

                    </div>
                  </td>

                  <td style={styles.td}>
                    642
                  </td>

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

        <div style={styles.panel}>

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
                <span>
                  Organization Admins
                </span>

                <strong>
                  186
                </strong>
              </div>

            </div>


            <div style={styles.overviewItem}>

              <div style={styles.overviewIcon}>
                📋
              </div>

              <div style={styles.overviewInfo}>
                <span>
                  Exam Attempts
                </span>

                <strong>
                  48,294
                </strong>
              </div>

            </div>


            <div style={styles.overviewItem}>

              <div style={styles.overviewIcon}>
                💰
              </div>

              <div style={styles.overviewInfo}>
                <span>
                  Monthly Revenue
                </span>

                <strong>
                  ৳ 4,86,500
                </strong>
              </div>

            </div>


            <div style={styles.overviewItem}>

              <div style={styles.overviewIcon}>
                ⭐
              </div>

              <div style={styles.overviewInfo}>
                <span>
                  Active Subscriptions
                </span>

                <strong>
                  112
                </strong>
              </div>

            </div>

          </div>

        </div>

      </div>


      {/* =========================
          RECENT EXAMS
      ========================= */}

      <div style={styles.panel}>

        <div style={styles.panelHeader}>

          <div>
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


        <div style={styles.examGrid}>

          <div style={styles.examCard}>

            <div style={styles.examIcon}>
              📝
            </div>

            <div style={{ flex: 1 }}>

              <h4 style={styles.examTitle}>
                HSC Physics Model Test
              </h4>

              <p style={styles.examOrg}>
                Alpha Coaching
              </p>

              <div style={styles.examMeta}>
                <span>
                  50 Questions
                </span>

                <span>
                  45 Minutes
                </span>
              </div>

            </div>

            <span style={styles.activeBadge}>
              Active
            </span>

          </div>


          <div style={styles.examCard}>

            <div
              style={{
                ...styles.examIcon,
                background: "#ecfdf5"
              }}
            >
              📐
            </div>

            <div style={{ flex: 1 }}>

              <h4 style={styles.examTitle}>
                Mathematics Final Exam
              </h4>

              <p style={styles.examOrg}>
                Bright Academy
              </p>

              <div style={styles.examMeta}>
                <span>
                  40 Questions
                </span>

                <span>
                  60 Minutes
                </span>
              </div>

            </div>

            <span style={styles.activeBadge}>
              Active
            </span>

          </div>


          <div style={styles.examCard}>

            <div
              style={{
                ...styles.examIcon,
                background: "#fff7ed"
              }}
            >
              🧪
            </div>

            <div style={{ flex: 1 }}>

              <h4 style={styles.examTitle}>
                Chemistry Practice Test
              </h4>

              <p style={styles.examOrg}>
                Mastermind Coaching
              </p>

              <div style={styles.examMeta}>
                <span>
                  30 Questions
                </span>

                <span>
                  30 Minutes
                </span>
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


/* =====================================================
   STYLES
===================================================== */

const styles = {

  container: {
    width: "100%"
  },


  /* Welcome */

  welcomeSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
    gap: "20px",
    flexWrap: "wrap"
  },


  welcomeTitle: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "700",
    color: "#111827"
  },


  welcomeText: {
    margin: "7px 0 0",
    fontSize: "13px",
    color: "#6b7280"
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
      "0 6px 16px rgba(99,102,241,0.22)"
  },


  /* Statistics */

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "18px",
    marginBottom: "22px"
  },


  statCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "20px",
    boxShadow:
      "0 2px 8px rgba(15,23,42,0.03)"
  },


  statTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px"
  },


  statIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px"
  },


  growth: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#059669",
    background: "#ecfdf5",
    padding: "5px 8px",
    borderRadius: "20px"
  },


  statLabel: {
    margin: 0,
    fontSize: "12px",
    color: "#6b7280"
  },


  statValue: {
    margin: "5px 0 4px",
    fontSize: "25px",
    fontWeight: "700",
    color: "#111827"
  },


  statDescription: {
    margin: 0,
    fontSize: "10px",
    color: "#9ca3af"
  },


  /* Content Grid */

  contentGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1.7fr) minmax(300px, 1fr)",
    gap: "20px",
    marginBottom: "22px"
  },


  /* Panel */

  panel: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "22px",
    marginBottom: "22px",
    boxShadow:
      "0 2px 8px rgba(15,23,42,0.03)"
  },


  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
    gap: "15px"
  },


  panelTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "700",
    color: "#111827"
  },


  panelSubtitle: {
    margin: "4px 0 0",
    fontSize: "11px",
    color: "#9ca3af"
  },


  viewButton: {
    border: "none",
    background: "transparent",
    color: "#6366f1",
    fontSize: "11px",
    fontWeight: "600",
    cursor: "pointer"
  },


  /* Table */

  tableWrapper: {
    overflowX: "auto"
  },


  table: {
    width: "100%",
    borderCollapse: "collapse"
  },


  th: {
    textAlign: "left",
    padding: "11px 10px",
    fontSize: "10px",
    color: "#9ca3af",
    fontWeight: "600",
    borderBottom:
      "1px solid #f0f1f3",
    whiteSpace: "nowrap"
  },


  td: {
    padding: "13px 10px",
    fontSize: "11px",
    color: "#4b5563",
    borderBottom:
      "1px solid #f3f4f6",
    whiteSpace: "nowrap"
  },


  orgCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
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
    fontWeight: "700"
  },


  orgCellSmall: {
    display: "block"
  },


  /* Badges */

  planBadge: {
    background: "#eef2ff",
    color: "#4f46e5",
    padding: "5px 8px",
    borderRadius: "20px",
    fontSize: "9px",
    fontWeight: "600"
  },


  basicBadge: {
    background: "#f3f4f6",
    color: "#6b7280",
    padding: "5px 8px",
    borderRadius: "20px",
    fontSize: "9px",
    fontWeight: "600"
  },


  activeBadge: {
    background: "#ecfdf5",
    color: "#059669",
    padding: "5px 8px",
    borderRadius: "20px",
    fontSize: "9px",
    fontWeight: "600"
  },


  pendingBadge: {
    background: "#fff7ed",
    color: "#ea580c",
    padding: "5px 8px",
    borderRadius: "20px",
    fontSize: "9px",
    fontWeight: "600"
  },


  /* Overview */

  overviewList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },


  overviewItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    borderRadius: "10px",
    background: "#f9fafb"
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
    border: "1px solid #eef0f3"
  },


  overviewInfo: {
    flex: 1,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    fontSize: "11px",
    color: "#6b7280"
  },


  /* Exams */

  examGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "14px"
  },


  examCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "16px",
    border: "1px solid #eef0f3",
    borderRadius: "12px",
    background: "#fafbfc"
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
    flexShrink: 0
  },


  examTitle: {
    margin: 0,
    fontSize: "12px",
    fontWeight: "600",
    color: "#111827"
  },


  examOrg: {
    margin: "4px 0 8px",
    fontSize: "10px",
    color: "#9ca3af"
  },


  examMeta: {
    display: "flex",
    gap: "10px",
    fontSize: "9px",
    color: "#6b7280"
  }

};

export default AdminDashboard;