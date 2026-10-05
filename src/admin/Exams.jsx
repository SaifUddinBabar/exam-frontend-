import React, { useEffect, useState } from "react";

function Exams() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [organizationFilter, setOrganizationFilter] = useState("All");
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const isMobile = screenWidth <= 640;
  const isTablet = screenWidth > 640 && screenWidth <= 1000;

  const exams = [
    {
      id: 1,
      title: "HSC Physics Model Test",
      organization: "Alpha Coaching",
      subject: "Physics",
      questions: 50,
      duration: 45,
      attempts: 842,
      status: "Active",
      created: "Oct 02, 2026",
    },
    {
      id: 2,
      title: "Mathematics Final Exam",
      organization: "Bright Academy",
      subject: "Mathematics",
      questions: 40,
      duration: 60,
      attempts: 624,
      status: "Active",
      created: "Oct 01, 2026",
    },
    {
      id: 3,
      title: "Chemistry Practice Test",
      organization: "Mastermind Coaching",
      subject: "Chemistry",
      questions: 30,
      duration: 30,
      attempts: 318,
      status: "Draft",
      created: "Sep 29, 2026",
    },
    {
      id: 4,
      title: "ICT Board Preparation",
      organization: "Future Education",
      subject: "ICT",
      questions: 35,
      duration: 35,
      attempts: 492,
      status: "Active",
      created: "Sep 27, 2026",
    },
    {
      id: 5,
      title: "Biology Chapter Test",
      organization: "Scholars Point",
      subject: "Biology",
      questions: 25,
      duration: 25,
      attempts: 214,
      status: "Completed",
      created: "Sep 24, 2026",
    },
    {
      id: 6,
      title: "English Grammar Test",
      organization: "Alpha Coaching",
      subject: "English",
      questions: 40,
      duration: 40,
      attempts: 731,
      status: "Active",
      created: "Sep 22, 2026",
    },
  ];

  const organizations = [
    "All",
    ...new Set(exams.map((exam) => exam.organization)),
  ];

  const filteredExams = exams.filter((exam) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      exam.title.toLowerCase().includes(searchText) ||
      exam.subject.toLowerCase().includes(searchText) ||
      exam.organization.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "All" || exam.status === statusFilter;

    const matchesOrganization =
      organizationFilter === "All" ||
      exam.organization === organizationFilter;

    return matchesSearch && matchesStatus && matchesOrganization;
  });

  return (
    <div
      style={{
        ...styles.container,
        padding: isMobile ? "2px" : "0",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          ...styles.header,
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
          marginBottom: isMobile ? "18px" : "25px",
        }}
      >
        <div>
          <h2
            style={{
              ...styles.title,
              fontSize: isMobile ? "21px" : "24px",
            }}
          >
            Exams
          </h2>

          <p
            style={{
              ...styles.subtitle,
              fontSize: isMobile ? "12px" : "13px",
            }}
          >
            Monitor and manage all exams across the platform.
          </p>
        </div>

        <button
          style={{
            ...styles.addButton,
            width: isMobile ? "100%" : "auto",
          }}
        >
          + Create Exam
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div
        style={{
          ...styles.summaryGrid,
          gridTemplateColumns: isMobile
            ? "repeat(2, minmax(0, 1fr))"
            : isTablet
            ? "repeat(2, minmax(0, 1fr))"
            : "repeat(4, minmax(0, 1fr))",
          gap: isMobile ? "10px" : "18px",
          marginBottom: isMobile ? "16px" : "22px",
        }}
      >
        {/* Total Exams */}
        <div
          style={{
            ...styles.summaryCard,
            padding: isMobile ? "13px" : "18px",
            gap: isMobile ? "9px" : "13px",
          }}
        >
          <div
            style={{
              ...styles.summaryIcon,
              width: isMobile ? "36px" : "42px",
              height: isMobile ? "36px" : "42px",
              fontSize: isMobile ? "15px" : "17px",
              flexShrink: 0,
              background: "#eef2ff",
            }}
          >
            📝
          </div>

          <div>
            <p style={styles.summaryLabel}>Total Exams</p>

            <h3
              style={{
                ...styles.summaryValue,
                fontSize: isMobile ? "18px" : "22px",
              }}
            >
              1,482
            </h3>
          </div>
        </div>

        {/* Active Exams */}
        <div
          style={{
            ...styles.summaryCard,
            padding: isMobile ? "13px" : "18px",
            gap: isMobile ? "9px" : "13px",
          }}
        >
          <div
            style={{
              ...styles.summaryIcon,
              width: isMobile ? "36px" : "42px",
              height: isMobile ? "36px" : "42px",
              fontSize: isMobile ? "15px" : "17px",
              flexShrink: 0,
              background: "#ecfdf5",
            }}
          >
            ▶
          </div>

          <div>
            <p style={styles.summaryLabel}>Active Exams</p>

            <h3
              style={{
                ...styles.summaryValue,
                fontSize: isMobile ? "18px" : "22px",
              }}
            >
              1,126
            </h3>
          </div>
        </div>

        {/* Attempts */}
        <div
          style={{
            ...styles.summaryCard,
            padding: isMobile ? "13px" : "18px",
            gap: isMobile ? "9px" : "13px",
          }}
        >
          <div
            style={{
              ...styles.summaryIcon,
              width: isMobile ? "36px" : "42px",
              height: isMobile ? "36px" : "42px",
              fontSize: isMobile ? "15px" : "17px",
              flexShrink: 0,
              background: "#fff7ed",
            }}
          >
            📊
          </div>

          <div>
            <p style={styles.summaryLabel}>Total Attempts</p>

            <h3
              style={{
                ...styles.summaryValue,
                fontSize: isMobile ? "18px" : "22px",
              }}
            >
              48,294
            </h3>
          </div>
        </div>

        {/* Duration */}
        <div
          style={{
            ...styles.summaryCard,
            padding: isMobile ? "13px" : "18px",
            gap: isMobile ? "9px" : "13px",
          }}
        >
          <div
            style={{
              ...styles.summaryIcon,
              width: isMobile ? "36px" : "42px",
              height: isMobile ? "36px" : "42px",
              fontSize: isMobile ? "15px" : "17px",
              flexShrink: 0,
              background: "#fdf2f8",
            }}
          >
            ⏱
          </div>

          <div>
            <p style={styles.summaryLabel}>Avg. Duration</p>

            <h3
              style={{
                ...styles.summaryValue,
                fontSize: isMobile ? "18px" : "22px",
              }}
            >
              42 min
            </h3>
          </div>
        </div>
      </div>

      {/* TABLE PANEL */}
      <div
        style={{
          ...styles.panel,
          padding: isMobile ? "12px" : "20px",
          borderRadius: isMobile ? "12px" : "14px",
        }}
      >
        {/* FILTERS */}
        <div
          style={{
            ...styles.filterBar,
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "stretch" : "center",
            gap: isMobile ? "9px" : "12px",
            marginBottom: isMobile ? "14px" : "20px",
          }}
        >
          {/* Search */}
          <div
            style={{
              ...styles.searchBox,
              minWidth: isMobile ? "0" : "280px",
              width: isMobile ? "100%" : "auto",
              height: isMobile ? "40px" : "42px",
            }}
          >
            <span style={styles.searchIcon}>🔍</span>

            <input
              type="text"
              placeholder="Search exams, subjects or organizations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                ...styles.searchInput,
                fontSize: isMobile ? "11px" : "12px",
              }}
            />
          </div>

          {/* Organization */}
          <select
            value={organizationFilter}
            onChange={(e) => setOrganizationFilter(e.target.value)}
            style={{
              ...styles.select,
              width: isMobile ? "100%" : "auto",
              minWidth: isMobile ? "0" : "150px",
              height: isMobile ? "40px" : "42px",
            }}
          >
            {organizations.map((organization) => (
              <option key={organization} value={organization}>
                {organization === "All"
                  ? "All Organizations"
                  : organization}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              ...styles.select,
              width: isMobile ? "100%" : "auto",
              minWidth: isMobile ? "0" : "150px",
              height: isMobile ? "40px" : "42px",
            }}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* TABLE */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Exam</th>
                <th style={styles.th}>Organization</th>
                <th style={styles.th}>Questions</th>
                <th style={styles.th}>Duration</th>
                <th style={styles.th}>Attempts</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Created</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredExams.map((exam) => (
                <tr key={exam.id}>
                  {/* Exam */}
                  <td style={styles.td}>
                    <div style={styles.examCell}>
                      <div style={styles.examIcon}>📝</div>

                      <div>
                        <p style={styles.examTitle}>{exam.title}</p>

                        <p style={styles.examSubject}>
                          {exam.subject}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Organization */}
                  <td style={styles.td}>
                    <span style={styles.organization}>
                      {exam.organization}
                    </span>
                  </td>

                  {/* Questions */}
                  <td style={styles.td}>
                    <span style={styles.numberBadge}>
                      {exam.questions}
                    </span>
                  </td>

                  {/* Duration */}
                  <td style={styles.td}>{exam.duration} min</td>

                  {/* Attempts */}
                  <td style={styles.td}>
                    <span style={styles.attempts}>
                      {exam.attempts.toLocaleString()}
                    </span>
                  </td>

                  {/* Status */}
                  <td style={styles.td}>
                    <span
                      style={
                        exam.status === "Active"
                          ? styles.activeBadge
                          : exam.status === "Draft"
                          ? styles.draftBadge
                          : styles.completedBadge
                      }
                    >
                      <span style={styles.statusDot}>●</span>
                      {exam.status}
                    </span>
                  </td>

                  {/* Created */}
                  <td style={styles.td}>{exam.created}</td>

                  {/* Actions */}
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button
                        style={styles.actionButton}
                        title="View"
                      >
                        👁
                      </button>

                      <button
                        style={styles.actionButton}
                        title="Edit"
                      >
                        ✏️
                      </button>

                      <button
                        style={{
                          ...styles.actionButton,
                          color: "#ef4444",
                        }}
                        title="Delete"
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty State */}
          {filteredExams.length === 0 && (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🔍</div>

              <h3 style={{ margin: "0 0 6px" }}>
                No exams found
              </h3>

              <p style={{ margin: 0 }}>
                Try changing your search or filters.
              </p>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        <div
          style={{
            ...styles.pagination,
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "center" : "center",
            justifyContent: isMobile
              ? "center"
              : "space-between",
          }}
        >
          <p style={styles.paginationText}>
            Showing {filteredExams.length} of 1,482 exams
          </p>

          <div style={styles.pageButtons}>
            <button style={styles.pageButton}>‹</button>

            <button
              style={{
                ...styles.pageButton,
                ...styles.activePage,
              }}
            >
              1
            </button>

            <button style={styles.pageButton}>2</button>
            <button style={styles.pageButton}>3</button>
            <button style={styles.pageButton}>4</button>

            <button style={styles.pageButton}>›</button>
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
    width: "100%",
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    flexWrap: "wrap",
  },

  title: {
    margin: 0,
    fontWeight: "700",
    color: "#111827",
    lineHeight: "1.25",
  },

  subtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
    lineHeight: "1.5",
  },

  addButton: {
    border: "none",
    background:
      "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff",
    padding: "12px 18px",
    borderRadius: "9px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow:
      "0 6px 16px rgba(99,102,241,0.22)",
    minHeight: "42px",
  },

  summaryGrid: {
    display: "grid",
    width: "100%",
  },

  summaryCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    boxShadow:
      "0 2px 8px rgba(15,23,42,0.03)",
    minWidth: 0,
    boxSizing: "border-box",
  },

  summaryIcon: {
    borderRadius: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  summaryLabel: {
    margin: 0,
    fontSize: "10px",
    color: "#6b7280",
    whiteSpace: "nowrap",
  },

  summaryValue: {
    margin: "4px 0 0",
    color: "#111827",
    fontWeight: "700",
  },

  panel: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    boxShadow:
      "0 2px 8px rgba(15,23,42,0.03)",
    boxSizing: "border-box",
    width: "100%",
  },

  filterBar: {
    display: "flex",
    flexWrap: "wrap",
  },

  searchBox: {
    flex: 1,
    border: "1px solid #e5e7eb",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    padding: "0 12px",
    background: "#fff",
    boxSizing: "border-box",
  },

  searchIcon: {
    fontSize: "13px",
    marginRight: "8px",
    flexShrink: 0,
  },

  searchInput: {
    width: "100%",
    border: "none",
    outline: "none",
    color: "#374151",
    background: "transparent",
    minWidth: 0,
  },

  select: {
    border: "1px solid #e5e7eb",
    borderRadius: "9px",
    padding: "0 12px",
    background: "#fff",
    color: "#4b5563",
    fontSize: "11px",
    outline: "none",
    cursor: "pointer",
    boxSizing: "border-box",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
    borderRadius: "8px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1050px",
  },

  th: {
    textAlign: "left",
    padding: "12px 10px",
    fontSize: "10px",
    color: "#9ca3af",
    fontWeight: "600",
    borderBottom: "1px solid #eef0f3",
    whiteSpace: "nowrap",
    background: "#fafafa",
  },

  td: {
    padding: "14px 10px",
    fontSize: "11px",
    color: "#4b5563",
    borderBottom: "1px solid #f3f4f6",
    whiteSpace: "nowrap",
  },

  examCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: "220px",
  },

  examIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
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
  },

  examSubject: {
    margin: "4px 0 0",
    fontSize: "9px",
    color: "#9ca3af",
  },

  organization: {
    fontSize: "11px",
    color: "#374151",
    fontWeight: "500",
  },

  numberBadge: {
    background: "#f3f4f6",
    color: "#374151",
    padding: "5px 9px",
    borderRadius: "6px",
    fontSize: "9px",
    fontWeight: "600",
  },

  attempts: {
    fontWeight: "600",
    color: "#374151",
  },

  activeBadge: {
    display: "inline-flex",
    alignItems: "center",
    background: "#ecfdf5",
    color: "#059669",
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "9px",
    fontWeight: "600",
  },

  draftBadge: {
    display: "inline-flex",
    alignItems: "center",
    background: "#fff7ed",
    color: "#ea580c",
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "9px",
    fontWeight: "600",
  },

  completedBadge: {
    display: "inline-flex",
    alignItems: "center",
    background: "#f3f4f6",
    color: "#6b7280",
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "9px",
    fontWeight: "600",
  },

  statusDot: {
    fontSize: "7px",
    marginRight: "5px",
  },

  actions: {
    display: "flex",
    gap: "5px",
  },

  actionButton: {
    width: "30px",
    height: "30px",
    border: "1px solid #e5e7eb",
    background: "#fff",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "12px",
    flexShrink: 0,
  },

  emptyState: {
    textAlign: "center",
    padding: "50px 20px",
    color: "#6b7280",
  },

  emptyIcon: {
    fontSize: "30px",
    marginBottom: "10px",
  },

  pagination: {
    marginTop: "18px",
    paddingTop: "16px",
    borderTop: "1px solid #f0f1f3",
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
  },

  paginationText: {
    margin: 0,
    fontSize: "10px",
    color: "#9ca3af",
  },

  pageButtons: {
    display: "flex",
    gap: "5px",
  },

  pageButton: {
    width: "30px",
    height: "30px",
    border: "1px solid #e5e7eb",
    background: "#fff",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "11px",
    color: "#6b7280",
  },

  activePage: {
    background: "#6366f1",
    color: "#fff",
    borderColor: "#6366f1",
  },
};

export default Exams;