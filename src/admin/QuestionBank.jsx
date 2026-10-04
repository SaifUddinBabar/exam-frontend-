import React, { useMemo, useState } from "react";

const questions = [
  {
    id: 1,
    question:
      "Which protocol is primarily responsible for reliable data transmission?",
    subject: "ICT",
    chapter: "Communication Systems",
    topic: "TCP/IP",
    type: "MCQ",
    difficulty: "Medium",
    organization: "Alpha Coaching",
    usage: 128,
    status: "Active",
    created: "Oct 02, 2026",
  },
  {
    id: 2,
    question:
      "Which layer of the OSI model is responsible for routing?",
    subject: "ICT",
    chapter: "Networking",
    topic: "OSI Model",
    type: "MCQ",
    difficulty: "Easy",
    organization: "Bright Academy",
    usage: 94,
    status: "Active",
    created: "Oct 01, 2026",
  },
  {
    id: 3,
    question:
      "What is the time complexity of binary search in the worst case?",
    subject: "Computer Science",
    chapter: "Data Structures",
    topic: "Searching",
    type: "MCQ",
    difficulty: "Medium",
    organization: "Mastermind Coaching",
    usage: 76,
    status: "Active",
    created: "Sep 29, 2026",
  },
  {
    id: 4,
    question:
      "Which data structure follows the FIFO principle?",
    subject: "Computer Science",
    chapter: "Data Structures",
    topic: "Queue",
    type: "MCQ",
    difficulty: "Easy",
    organization: "Future Education",
    usage: 61,
    status: "Active",
    created: "Sep 27, 2026",
  },
  {
    id: 5,
    question:
      "Which algorithm is commonly used for finding the shortest path?",
    subject: "Computer Science",
    chapter: "Algorithms",
    topic: "Graph",
    type: "MCQ",
    difficulty: "Hard",
    organization: "Scholars Point",
    usage: 42,
    status: "Review",
    created: "Sep 24, 2026",
  },
  {
    id: 6,
    question:
      "Which HTML tag is used to create an unordered list?",
    subject: "ICT",
    chapter: "HTML",
    topic: "Lists",
    type: "MCQ",
    difficulty: "Easy",
    organization: "Alpha Coaching",
    usage: 156,
    status: "Active",
    created: "Sep 22, 2026",
  },
  {
    id: 7,
    question:
      "Which mathematical model is commonly used to represent arrival processes?",
    subject: "Mathematics",
    chapter: "Probability",
    topic: "Poisson Process",
    type: "MCQ",
    difficulty: "Hard",
    organization: "Bright Academy",
    usage: 38,
    status: "Review",
    created: "Sep 20, 2026",
  },
];

function QuestionBank() {
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);

  const filteredQuestions = useMemo(() => {
    return questions.filter((item) => {
      const matchesSearch =
        item.question.toLowerCase().includes(search.toLowerCase()) ||
        item.subject.toLowerCase().includes(search.toLowerCase()) ||
        item.chapter.toLowerCase().includes(search.toLowerCase()) ||
        item.topic.toLowerCase().includes(search.toLowerCase());

      const matchesSubject =
        subjectFilter === "All" || item.subject === subjectFilter;

      const matchesDifficulty =
        difficultyFilter === "All" ||
        item.difficulty === difficultyFilter;

      const matchesType = typeFilter === "All" || item.type === typeFilter;

      return (
        matchesSearch &&
        matchesSubject &&
        matchesDifficulty &&
        matchesType
      );
    });
  }, [search, subjectFilter, difficultyFilter, typeFilter]);

  const stats = [
    {
      label: "Total Questions",
      value: "24,560",
      change: "+21.7%",
      icon: "📚",
      iconBg: "#eef2ff",
      iconColor: "#4f46e5",
    },
    {
      label: "Active Questions",
      value: "23,184",
      change: "+18.4%",
      icon: "✓",
      iconBg: "#ecfdf5",
      iconColor: "#059669",
    },
    {
      label: "Subjects",
      value: "18",
      change: "+3",
      icon: "📖",
      iconBg: "#fff7ed",
      iconColor: "#ea580c",
    },
    {
      label: "Used in Exams",
      value: "18,742",
      change: "+14.8%",
      icon: "📝",
      iconBg: "#fdf2f8",
      iconColor: "#db2777",
    },
  ];

  const styles = {
    page: {
      padding: "30px",
      background: "#f8fafc",
      minHeight: "100vh",
      color: "#0f172a",
    },

    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "28px",
      gap: "20px",
    },

    title: {
      margin: 0,
      fontSize: "28px",
      fontWeight: 800,
      letterSpacing: "-0.6px",
    },

    subtitle: {
      margin: "7px 0 0",
      color: "#64748b",
      fontSize: "14px",
    },

    primaryButton: {
      border: "none",
      borderRadius: "10px",
      padding: "12px 18px",
      background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
      color: "white",
      fontSize: "14px",
      fontWeight: 700,
      cursor: "pointer",
      boxShadow: "0 8px 20px rgba(79,70,229,0.20)",
    },

    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
      gap: "18px",
      marginBottom: "26px",
    },

    statCard: {
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "14px",
      padding: "20px",
      boxShadow: "0 4px 15px rgba(15,23,42,0.04)",
    },

    statTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },

    statIcon: {
      width: "42px",
      height: "42px",
      borderRadius: "11px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "19px",
      fontWeight: 800,
    },

    statLabel: {
      marginTop: "15px",
      color: "#64748b",
      fontSize: "13px",
      fontWeight: 600,
    },

    statValue: {
      marginTop: "5px",
      fontSize: "25px",
      fontWeight: 800,
    },

    statChange: {
      marginTop: "7px",
      color: "#059669",
      fontSize: "12px",
      fontWeight: 700,
    },

    toolbar: {
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "14px",
      padding: "18px",
      marginBottom: "18px",
      display: "flex",
      gap: "12px",
      flexWrap: "wrap",
      alignItems: "center",
      boxShadow: "0 4px 15px rgba(15,23,42,0.03)",
    },

    searchWrapper: {
      flex: 1,
      minWidth: "260px",
      position: "relative",
    },

    searchInput: {
      width: "100%",
      boxSizing: "border-box",
      padding: "12px 14px 12px 40px",
      border: "1px solid #e2e8f0",
      borderRadius: "9px",
      outline: "none",
      fontSize: "13px",
      background: "#f8fafc",
    },

    searchIcon: {
      position: "absolute",
      left: "14px",
      top: "11px",
      fontSize: "16px",
      color: "#94a3b8",
    },

    select: {
      padding: "12px 14px",
      border: "1px solid #e2e8f0",
      borderRadius: "9px",
      background: "#f8fafc",
      color: "#334155",
      fontSize: "13px",
      outline: "none",
      minWidth: "145px",
    },

    tableCard: {
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "14px",
      overflow: "hidden",
      boxShadow: "0 4px 15px rgba(15,23,42,0.04)",
    },

    tableHeader: {
      padding: "19px 20px",
      borderBottom: "1px solid #e2e8f0",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },

    tableTitle: {
      margin: 0,
      fontSize: "16px",
      fontWeight: 750,
    },

    resultCount: {
      color: "#64748b",
      fontSize: "12px",
    },

    tableWrapper: {
      overflowX: "auto",
    },

    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: "1050px",
    },

    th: {
      padding: "13px 18px",
      background: "#f8fafc",
      color: "#64748b",
      textAlign: "left",
      fontSize: "11px",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      fontWeight: 800,
      borderBottom: "1px solid #e2e8f0",
    },

    td: {
      padding: "16px 18px",
      borderBottom: "1px solid #f1f5f9",
      fontSize: "13px",
      color: "#334155",
      verticalAlign: "middle",
    },

    questionText: {
      maxWidth: "330px",
      color: "#0f172a",
      fontWeight: 650,
      lineHeight: 1.45,
    },

    secondary: {
      marginTop: "4px",
      color: "#94a3b8",
      fontSize: "11px",
    },

    badge: {
      display: "inline-flex",
      alignItems: "center",
      padding: "5px 9px",
      borderRadius: "999px",
      fontSize: "11px",
      fontWeight: 750,
    },

    actionGroup: {
      display: "flex",
      gap: "7px",
    },

    actionButton: {
      border: "1px solid #e2e8f0",
      background: "white",
      borderRadius: "7px",
      width: "32px",
      height: "32px",
      cursor: "pointer",
      fontSize: "13px",
    },

    pagination: {
      padding: "16px 20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      color: "#64748b",
      fontSize: "12px",
    },

    pageButtons: {
      display: "flex",
      gap: "6px",
    },

    pageButton: {
      width: "32px",
      height: "32px",
      borderRadius: "7px",
      border: "1px solid #e2e8f0",
      background: "white",
      cursor: "pointer",
      fontSize: "12px",
    },

    activePage: {
      background: "#4f46e5",
      color: "white",
      borderColor: "#4f46e5",
    },

    overlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(15,23,42,0.55)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "20px",
    },

    modal: {
      width: "100%",
      maxWidth: "620px",
      background: "white",
      borderRadius: "16px",
      boxShadow: "0 25px 70px rgba(15,23,42,0.25)",
      overflow: "hidden",
    },

    modalHeader: {
      padding: "22px 24px",
      borderBottom: "1px solid #e2e8f0",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },

    modalTitle: {
      margin: 0,
      fontSize: "19px",
      fontWeight: 800,
    },

    closeButton: {
      border: "none",
      background: "#f1f5f9",
      width: "34px",
      height: "34px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "17px",
    },

    modalBody: {
      padding: "24px",
    },

    formGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "16px",
    },

    formGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "7px",
    },

    fullWidth: {
      gridColumn: "1 / -1",
    },

    label: {
      fontSize: "12px",
      fontWeight: 700,
      color: "#334155",
    },

    input: {
      padding: "11px 12px",
      border: "1px solid #cbd5e1",
      borderRadius: "8px",
      outline: "none",
      fontSize: "13px",
    },

    modalFooter: {
      padding: "18px 24px",
      borderTop: "1px solid #e2e8f0",
      display: "flex",
      justifyContent: "flex-end",
      gap: "10px",
    },

    cancelButton: {
      padding: "10px 16px",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      background: "white",
      cursor: "pointer",
      fontWeight: 650,
    },

    saveButton: {
      padding: "10px 17px",
      borderRadius: "8px",
      border: "none",
      background: "#4f46e5",
      color: "white",
      cursor: "pointer",
      fontWeight: 700,
    },
  };

  const difficultyStyle = (difficulty) => {
    if (difficulty === "Easy") {
      return {
        background: "#ecfdf5",
        color: "#047857",
      };
    }

    if (difficulty === "Hard") {
      return {
        background: "#fef2f2",
        color: "#dc2626",
      };
    }

    return {
      background: "#fff7ed",
      color: "#c2410c",
    };
  };

  const statusStyle = (status) => {
    if (status === "Active") {
      return {
        background: "#ecfdf5",
        color: "#047857",
      };
    }

    return {
      background: "#fff7ed",
      color: "#c2410c",
    };
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Question Bank</h1>
          <p style={styles.subtitle}>
            Manage, organize and monitor questions across the entire platform.
          </p>
        </div>

        <button
          style={styles.primaryButton}
          onClick={() => setShowModal(true)}
        >
          + Add Question
        </button>
      </div>

      {/* STATS */}
      <div style={styles.statsGrid}>
        {stats.map((stat) => (
          <div style={styles.statCard} key={stat.label}>
            <div style={styles.statTop}>
              <div
                style={{
                  ...styles.statIcon,
                  background: stat.iconBg,
                  color: stat.iconColor,
                }}
              >
                {stat.icon}
              </div>
            </div>

            <div style={styles.statLabel}>{stat.label}</div>
            <div style={styles.statValue}>{stat.value}</div>
            <div style={styles.statChange}>{stat.change} this month</div>
          </div>
        ))}
      </div>

      {/* FILTER TOOLBAR */}
      <div style={styles.toolbar}>
        <div style={styles.searchWrapper}>
          <span style={styles.searchIcon}>⌕</span>

          <input
            type="text"
            placeholder="Search questions, subjects, chapters or topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          style={styles.select}
        >
          <option value="All">All Subjects</option>
          <option value="ICT">ICT</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Mathematics">Mathematics</option>
        </select>

        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          style={styles.select}
        >
          <option value="All">All Difficulty</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={styles.select}
        >
          <option value="All">All Types</option>
          <option value="MCQ">MCQ</option>
          <option value="CQ">CQ</option>
        </select>
      </div>

      {/* TABLE */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h3 style={styles.tableTitle}>Question Library</h3>

          <span style={styles.resultCount}>
            Showing {filteredQuestions.length} of 24,560 questions
          </span>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Question</th>
                <th style={styles.th}>Subject</th>
                <th style={styles.th}>Chapter / Topic</th>
                <th style={styles.th}>Difficulty</th>
                <th style={styles.th}>Usage</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Created</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredQuestions.map((item) => (
                <tr key={item.id}>
                  <td style={styles.td}>
                    <div style={styles.questionText}>{item.question}</div>
                    <div style={styles.secondary}>
                      ID: QB-{String(item.id).padStart(5, "0")} • {item.type}
                    </div>
                  </td>

                  <td style={styles.td}>
                    <strong>{item.subject}</strong>
                  </td>

                  <td style={styles.td}>
                    <div>{item.chapter}</div>
                    <div style={styles.secondary}>{item.topic}</div>
                  </td>

                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        ...difficultyStyle(item.difficulty),
                      }}
                    >
                      {item.difficulty}
                    </span>
                  </td>

                  <td style={styles.td}>
                    <strong>{item.usage}</strong>
                    <div style={styles.secondary}>exam uses</div>
                  </td>

                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        ...statusStyle(item.status),
                      }}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td style={styles.td}>{item.created}</td>

                  <td style={styles.td}>
                    <div style={styles.actionGroup}>
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
                        style={styles.actionButton}
                        title="Delete"
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredQuestions.length === 0 && (
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      ...styles.td,
                      textAlign: "center",
                      padding: "50px",
                      color: "#64748b",
                    }}
                  >
                    No questions found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div style={styles.pagination}>
          <span>Showing 1–7 of 24,560 questions</span>

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
            <button style={styles.pageButton}>5</button>

            <button style={styles.pageButton}>›</button>
          </div>
        </div>
      </div>

      {/* ADD QUESTION MODAL */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Add New Question</h2>

              <button
                style={styles.closeButton}
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Subject</label>

                  <select style={styles.input}>
                    <option>Select subject</option>
                    <option>ICT</option>
                    <option>Computer Science</option>
                    <option>Mathematics</option>
                    <option>Physics</option>
                    <option>Chemistry</option>
                    <option>Biology</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Question Type</label>

                  <select style={styles.input}>
                    <option>MCQ</option>
                    <option>CQ</option>
                    <option>True / False</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Chapter</label>

                  <input
                    style={styles.input}
                    placeholder="Enter chapter"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Topic</label>

                  <input
                    style={styles.input}
                    placeholder="Enter topic"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Difficulty</label>

                  <select style={styles.input}>
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Organization</label>

                  <select style={styles.input}>
                    <option>Global Question Bank</option>
                    <option>Alpha Coaching</option>
                    <option>Bright Academy</option>
                    <option>Mastermind Coaching</option>
                  </select>
                </div>

                <div
                  style={{
                    ...styles.formGroup,
                    ...styles.fullWidth,
                  }}
                >
                  <label style={styles.label}>Question</label>

                  <textarea
                    rows="4"
                    style={{
                      ...styles.input,
                      resize: "vertical",
                    }}
                    placeholder="Write your question here..."
                  />
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                style={styles.cancelButton}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                style={styles.saveButton}
                onClick={() => setShowModal(false)}
              >
                Save Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionBank;