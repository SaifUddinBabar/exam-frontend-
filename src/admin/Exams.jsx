import React, { useState } from "react";

function Exams() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [organizationFilter, setOrganizationFilter] = useState("All");

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
      created: "Oct 02, 2026"
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
      created: "Oct 01, 2026"
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
      created: "Sep 29, 2026"
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
      created: "Sep 27, 2026"
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
      created: "Sep 24, 2026"
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
      created: "Sep 22, 2026"
    }
  ];

  const organizations = [
    "All",
    ...new Set(
      exams.map((exam) => exam.organization)
    )
  ];

  const filteredExams = exams.filter((exam) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      exam.title.toLowerCase().includes(searchText) ||
      exam.subject.toLowerCase().includes(searchText) ||
      exam.organization.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "All" ||
      exam.status === statusFilter;

    const matchesOrganization =
      organizationFilter === "All" ||
      exam.organization === organizationFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesOrganization
    );
  });

  return (
    <div style={styles.container}>

      {/* =========================
          HEADER
      ========================= */}

      <div style={styles.header}>

        <div>
          <h2 style={styles.title}>
            Exams
          </h2>

          <p style={styles.subtitle}>
            Monitor and manage all exams across the platform.
          </p>
        </div>

        <button style={styles.addButton}>
          + Create Exam
        </button>

      </div>


      {/* =========================
          SUMMARY CARDS
      ========================= */}

      <div style={styles.summaryGrid}>

        <div style={styles.summaryCard}>

          <div
            style={{
              ...styles.summaryIcon,
              background: "#eef2ff"
            }}
          >
            📝
          </div>

          <div>
            <p style={styles.summaryLabel}>
              Total Exams
            </p>

            <h3 style={styles.summaryValue}>
              1,482
            </h3>
          </div>

        </div>


        <div style={styles.summaryCard}>

          <div
            style={{
              ...styles.summaryIcon,
              background: "#ecfdf5"
            }}
          >
            ▶
          </div>

          <div>
            <p style={styles.summaryLabel}>
              Active Exams
            </p>

            <h3 style={styles.summaryValue}>
              1,126
            </h3>
          </div>

        </div>


        <div style={styles.summaryCard}>

          <div
            style={{
              ...styles.summaryIcon,
              background: "#fff7ed"
            }}
          >
            📊
          </div>

          <div>
            <p style={styles.summaryLabel}>
              Total Attempts
            </p>

            <h3 style={styles.summaryValue}>
              48,294
            </h3>
          </div>

        </div>


        <div style={styles.summaryCard}>

          <div
            style={{
              ...styles.summaryIcon,
              background: "#fdf2f8"
            }}
          >
            ⏱
          </div>

          <div>
            <p style={styles.summaryLabel}>
              Avg. Duration
            </p>

            <h3 style={styles.summaryValue}>
              42 min
            </h3>
          </div>

        </div>

      </div>


      {/* =========================
          TABLE PANEL
      ========================= */}

      <div style={styles.panel}>

        {/* Filters */}

        <div style={styles.filterBar}>

          <div style={styles.searchBox}>

            <span style={styles.searchIcon}>
              🔍
            </span>

            <input
              type="text"
              placeholder="Search exams, subjects or organizations..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              style={styles.searchInput}
            />

          </div>


          <select
            value={organizationFilter}
            onChange={(e) =>
              setOrganizationFilter(e.target.value)
            }
            style={styles.select}
          >

            {organizations.map((organization) => (
              <option
                key={organization}
                value={organization}
              >
                {organization === "All"
                  ? "All Organizations"
                  : organization}
              </option>
            ))}

          </select>


          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            style={styles.select}
          >

            <option value="All">
              All Status
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Draft">
              Draft
            </option>

            <option value="Completed">
              Completed
            </option>

          </select>

        </div>


        {/* Table */}

        <div style={styles.tableWrapper}>

          <table style={styles.table}>

            <thead>

              <tr>

                <th style={styles.th}>
                  Exam
                </th>

                <th style={styles.th}>
                  Organization
                </th>

                <th style={styles.th}>
                  Questions
                </th>

                <th style={styles.th}>
                  Duration
                </th>

                <th style={styles.th}>
                  Attempts
                </th>

                <th style={styles.th}>
                  Status
                </th>

                <th style={styles.th}>
                  Created
                </th>

                <th style={styles.th}>
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredExams.map((exam) => (

                <tr key={exam.id}>

                  {/* Exam */}

                  <td style={styles.td}>

                    <div style={styles.examCell}>

                      <div style={styles.examIcon}>
                        📝
                      </div>

                      <div>

                        <p style={styles.examTitle}>
                          {exam.title}
                        </p>

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

                  <td style={styles.td}>
                    {exam.duration} min
                  </td>


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
                      <span style={styles.statusDot}>
                        ●
                      </span>

                      {exam.status}
                    </span>

                  </td>


                  {/* Created */}

                  <td style={styles.td}>
                    {exam.created}
                  </td>


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
                          color: "#ef4444"
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


          {filteredExams.length === 0 && (

            <div style={styles.emptyState}>

              <div style={styles.emptyIcon}>
                🔍
              </div>

              <h3>
                No exams found
              </h3>

              <p>
                Try changing your search or filters.
              </p>

            </div>

          )}

        </div>


        {/* Pagination */}

        <div style={styles.pagination}>

          <p style={styles.paginationText}>
            Showing {filteredExams.length} of 1,482 exams
          </p>

          <div style={styles.pageButtons}>

            <button style={styles.pageButton}>
              ‹
            </button>

            <button
              style={{
                ...styles.pageButton,
                ...styles.activePage
              }}
            >
              1
            </button>

            <button style={styles.pageButton}>
              2
            </button>

            <button style={styles.pageButton}>
              3
            </button>

            <button style={styles.pageButton}>
              4
            </button>

            <button style={styles.pageButton}>
              ›
            </button>

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

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "25px",
    flexWrap: "wrap"
  },

  title: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "700",
    color: "#111827"
  },

  subtitle: {
    margin: "6px 0 0",
    fontSize: "13px",
    color: "#6b7280"
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
      "0 6px 16px rgba(99,102,241,0.22)"
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "18px",
    marginBottom: "22px"
  },

  summaryCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "18px",
    display: "flex",
    alignItems: "center",
    gap: "13px",
    boxShadow:
      "0 2px 8px rgba(15,23,42,0.03)"
  },

  summaryIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "17px"
  },

  summaryLabel: {
    margin: 0,
    fontSize: "11px",
    color: "#6b7280"
  },

  summaryValue: {
    margin: "4px 0 0",
    fontSize: "22px",
    color: "#111827"
  },

  panel: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "20px",
    boxShadow:
      "0 2px 8px rgba(15,23,42,0.03)"
  },

  filterBar: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
    flexWrap: "wrap"
  },

  searchBox: {
    flex: 1,
    minWidth: "280px",
    height: "42px",
    border: "1px solid #e5e7eb",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    padding: "0 12px",
    background: "#fff"
  },

  searchIcon: {
    fontSize: "13px",
    marginRight: "8px"
  },

  searchInput: {
    width: "100%",
    border: "none",
    outline: "none",
    fontSize: "12px",
    color: "#374151"
  },

  select: {
    height: "42px",
    border: "1px solid #e5e7eb",
    borderRadius: "9px",
    padding: "0 12px",
    background: "#fff",
    color: "#4b5563",
    fontSize: "11px",
    outline: "none",
    cursor: "pointer",
    minWidth: "150px"
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1050px"
  },

  th: {
    textAlign: "left",
    padding: "12px 10px",
    fontSize: "10px",
    color: "#9ca3af",
    fontWeight: "600",
    borderBottom:
      "1px solid #eef0f3",
    whiteSpace: "nowrap"
  },

  td: {
    padding: "14px 10px",
    fontSize: "11px",
    color: "#4b5563",
    borderBottom:
      "1px solid #f3f4f6",
    whiteSpace: "nowrap"
  },

  examCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },

  examIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px"
  },

  examTitle: {
    margin: 0,
    fontSize: "12px",
    fontWeight: "600",
    color: "#111827"
  },

  examSubject: {
    margin: "4px 0 0",
    fontSize: "9px",
    color: "#9ca3af"
  },

  organization: {
    fontSize: "11px",
    color: "#374151",
    fontWeight: "500"
  },

  numberBadge: {
    background: "#f3f4f6",
    color: "#374151",
    padding: "5px 9px",
    borderRadius: "6px",
    fontSize: "9px",
    fontWeight: "600"
  },

  attempts: {
    fontWeight: "600",
    color: "#374151"
  },

  activeBadge: {
    background: "#ecfdf5",
    color: "#059669",
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "9px",
    fontWeight: "600"
  },

  draftBadge: {
    background: "#fff7ed",
    color: "#ea580c",
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "9px",
    fontWeight: "600"
  },

  completedBadge: {
    background: "#f3f4f6",
    color: "#6b7280",
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "9px",
    fontWeight: "600"
  },

  statusDot: {
    fontSize: "7px",
    marginRight: "5px"
  },

  actions: {
    display: "flex",
    gap: "5px"
  },

  actionButton: {
    width: "30px",
    height: "30px",
    border: "1px solid #e5e7eb",
    background: "#fff",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "12px"
  },

  emptyState: {
    textAlign: "center",
    padding: "50px 20px",
    color: "#6b7280"
  },

  emptyIcon: {
    fontSize: "30px",
    marginBottom: "10px"
  },

  pagination: {
    marginTop: "18px",
    paddingTop: "16px",
    borderTop: "1px solid #f0f1f3",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap"
  },

  paginationText: {
    margin: 0,
    fontSize: "10px",
    color: "#9ca3af"
  },

  pageButtons: {
    display: "flex",
    gap: "5px"
  },

  pageButton: {
    width: "30px",
    height: "30px",
    border: "1px solid #e5e7eb",
    background: "#fff",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "11px",
    color: "#6b7280"
  },

  activePage: {
    background: "#6366f1",
    color: "#fff",
    borderColor: "#6366f1"
  }

};

export default Exams;