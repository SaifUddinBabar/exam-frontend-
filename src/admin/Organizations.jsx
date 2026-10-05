import React, { useEffect, useState } from "react";

function Organizations() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [planFilter, setPlanFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = screenWidth <= 640;
  const isTablet = screenWidth > 640 && screenWidth <= 1000;

  const organizations = [
    {
      id: 1,
      name: "Alpha Coaching",
      location: "Dhaka",
      email: "admin@alphacoaching.com",
      students: 1240,
      admins: 5,
      plan: "Premium",
      status: "Active",
      joined: "Sep 28, 2026",
    },
    {
      id: 2,
      name: "Bright Academy",
      location: "Chittagong",
      email: "admin@brightacademy.com",
      students: 856,
      admins: 3,
      plan: "Basic",
      status: "Active",
      joined: "Sep 24, 2026",
    },
    {
      id: 3,
      name: "Mastermind Coaching",
      location: "Cumilla",
      email: "admin@mastermind.com",
      students: 642,
      admins: 4,
      plan: "Premium",
      status: "Pending",
      joined: "Sep 21, 2026",
    },
    {
      id: 4,
      name: "Future Education",
      location: "Rajshahi",
      email: "admin@futureedu.com",
      students: 523,
      admins: 2,
      plan: "Basic",
      status: "Active",
      joined: "Sep 18, 2026",
    },
    {
      id: 5,
      name: "NextGen Academy",
      location: "Sylhet",
      email: "admin@nextgen.com",
      students: 934,
      admins: 4,
      plan: "Premium",
      status: "Inactive",
      joined: "Sep 15, 2026",
    },
    {
      id: 6,
      name: "Scholars Point",
      location: "Dhaka",
      email: "admin@scholarspoint.com",
      students: 718,
      admins: 3,
      plan: "Basic",
      status: "Active",
      joined: "Sep 12, 2026",
    },
  ];

  const filteredOrganizations = organizations.filter((org) => {
    const query = search.toLowerCase();

    const matchesSearch =
      org.name.toLowerCase().includes(query) ||
      org.location.toLowerCase().includes(query) ||
      org.email.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "All" || org.status === statusFilter;

    const matchesPlan = planFilter === "All" || org.plan === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const summaryCards = [
    {
      label: "Total Organizations",
      value: "128",
      icon: "🏢",
      bg: "#eef2ff",
    },
    {
      label: "Active",
      value: "112",
      icon: "✓",
      bg: "#ecfdf5",
    },
    {
      label: "Pending",
      value: "9",
      icon: "⏳",
      bg: "#fff7ed",
    },
    {
      label: "Inactive",
      value: "7",
      icon: "⛔",
      bg: "#fef2f2",
    },
  ];

  return (
    <div
      style={{
        ...styles.container,
        padding: isMobile ? "16px 12px" : isTablet ? "22px 16px" : "30px",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          ...styles.header,
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
          gap: isMobile ? "14px" : "20px",
        }}
      >
        <div>
          <h2
            style={{
              ...styles.title,
              fontSize: isMobile ? "21px" : "24px",
            }}
          >
            Organizations
          </h2>

          <p style={styles.subtitle}>
            Manage all coaching centers and educational organizations.
          </p>
        </div>

        <button
          style={{
            ...styles.addButton,
            width: isMobile ? "100%" : "auto",
          }}
          onClick={() => setShowModal(true)}
        >
          + Add Organization
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
        }}
      >
        {summaryCards.map((card) => (
          <div
            key={card.label}
            style={{
              ...styles.summaryCard,
              padding: isMobile ? "13px 11px" : "18px",
              gap: isMobile ? "9px" : "13px",
            }}
          >
            <div
              style={{
                ...styles.summaryIcon,
                width: isMobile ? "36px" : "42px",
                height: isMobile ? "36px" : "42px",
                fontSize: isMobile ? "15px" : "17px",
                background: card.bg,
                flexShrink: 0,
              }}
            >
              {card.icon}
            </div>

            <div style={{ minWidth: 0 }}>
              <p style={styles.summaryLabel}>{card.label}</p>

              <h3
                style={{
                  ...styles.summaryValue,
                  fontSize: isMobile ? "19px" : "22px",
                }}
              >
                {card.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* TABLE PANEL */}
      <div
        style={{
          ...styles.panel,
          padding: isMobile ? "12px" : "20px",
        }}
      >
        {/* FILTERS */}
        <div
          style={{
            ...styles.filterBar,
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "stretch" : "center",
          }}
        >
          <div
            style={{
              ...styles.searchBox,
              width: isMobile ? "100%" : "auto",
              minWidth: isMobile ? "0" : "240px",
            }}
          >
            <span style={styles.searchIcon}>🔍</span>

            <input
              type="text"
              placeholder="Search organizations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              ...styles.select,
              width: isMobile ? "100%" : "auto",
            }}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            style={{
              ...styles.select,
              width: isMobile ? "100%" : "auto",
            }}
          >
            <option value="All">All Plans</option>
            <option value="Premium">Premium</option>
            <option value="Basic">Basic</option>
          </select>
        </div>

        {/* TABLE */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Organization</th>
                <th style={styles.th}>Contact</th>
                <th style={styles.th}>Students</th>
                <th style={styles.th}>Admins</th>
                <th style={styles.th}>Plan</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Joined</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrganizations.map((org) => (
                <tr key={org.id}>
                  {/* Organization */}
                  <td style={styles.td}>
                    <div style={styles.orgCell}>
                      <div style={styles.orgAvatar}>
                        {org.name.charAt(0)}
                      </div>

                      <div>
                        <p style={styles.orgName}>{org.name}</p>

                        <p style={styles.orgLocation}>
                          📍 {org.location}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td style={styles.td}>
                    <span style={styles.email}>{org.email}</span>
                  </td>

                  {/* Students */}
                  <td style={styles.td}>
                    <span style={styles.number}>
                      {org.students.toLocaleString()}
                    </span>
                  </td>

                  {/* Admins */}
                  <td style={styles.td}>{org.admins}</td>

                  {/* Plan */}
                  <td style={styles.td}>
                    <span
                      style={
                        org.plan === "Premium"
                          ? styles.premiumBadge
                          : styles.basicBadge
                      }
                    >
                      {org.plan}
                    </span>
                  </td>

                  {/* Status */}
                  <td style={styles.td}>
                    <span
                      style={
                        org.status === "Active"
                          ? styles.activeBadge
                          : org.status === "Pending"
                          ? styles.pendingBadge
                          : styles.inactiveBadge
                      }
                    >
                      <span style={styles.statusDot}>●</span>
                      {org.status}
                    </span>
                  </td>

                  {/* Joined */}
                  <td style={styles.td}>{org.joined}</td>

                  {/* Actions */}
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button
                        style={styles.actionButton}
                        title="View"
                        onClick={() => {}}
                      >
                        👁
                      </button>

                      <button
                        style={styles.actionButton}
                        title="Edit"
                        onClick={() => {}}
                      >
                        ✏️
                      </button>

                      <button
                        style={{
                          ...styles.actionButton,
                          color: "#ef4444",
                        }}
                        title="Delete"
                        onClick={() => {}}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* EMPTY STATE */}
          {filteredOrganizations.length === 0 && (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🔍</div>

              <h3 style={{ margin: "0 0 7px" }}>
                No organizations found
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
          }}
        >
          <p style={styles.paginationText}>
            Showing {filteredOrganizations.length} of 128 organizations
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

      {/* ADD ORGANIZATION MODAL */}
      {showModal && (
        <div
          style={styles.overlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div
            style={{
              ...styles.modal,
              maxWidth: isMobile ? "calc(100vw - 24px)" : "480px",
            }}
          >
            <div
              style={{
                ...styles.modalHeader,
                padding: isMobile ? "16px" : "20px",
              }}
            >
              <div>
                <h3 style={styles.modalTitle}>Add Organization</h3>

                <p style={styles.modalSubtitle}>
                  Create a new organization account.
                </p>
              </div>

              <button
                style={styles.closeButton}
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <div
              style={{
                ...styles.form,
                padding: isMobile ? "16px" : "20px",
              }}
            >
              <label style={styles.label}>Organization Name</label>

              <input
                type="text"
                placeholder="Enter organization name"
                style={styles.input}
              />

              <label style={styles.label}>Email Address</label>

              <input
                type="email"
                placeholder="admin@example.com"
                style={styles.input}
              />

              <label style={styles.label}>Location</label>

              <input
                type="text"
                placeholder="Dhaka"
                style={styles.input}
              />

              <label style={styles.label}>Subscription Plan</label>

              <select style={styles.input}>
                <option>Basic</option>
                <option>Premium</option>
              </select>

              <div
                style={{
                  ...styles.modalActions,
                  flexDirection: isMobile ? "column-reverse" : "row",
                }}
              >
                <button
                  style={{
                    ...styles.cancelButton,
                    width: isMobile ? "100%" : "auto",
                  }}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  style={{
                    ...styles.saveButton,
                    width: isMobile ? "100%" : "auto",
                  }}
                >
                  Create Organization
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =====================================================
   RESPONSIVE INLINE STYLES
===================================================== */

const styles = {
  container: {
    width: "100%",
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "25px",
    flexWrap: "wrap",
  },

  title: {
    margin: 0,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 1.2,
  },

  subtitle: {
    margin: "6px 0 0",
    fontSize: "13px",
    color: "#6b7280",
    lineHeight: 1.5,
  },

  addButton: {
    border: "none",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff",
    padding: "12px 18px",
    borderRadius: "9px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 6px 16px rgba(99,102,241,0.22)",
    whiteSpace: "nowrap",
  },

  summaryGrid: {
    display: "grid",
    marginBottom: "22px",
  },

  summaryCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    boxShadow: "0 2px 8px rgba(15,23,42,0.03)",
    minWidth: 0,
  },

  summaryIcon: {
    borderRadius: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  summaryLabel: {
    margin: 0,
    fontSize: "11px",
    color: "#6b7280",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  summaryValue: {
    margin: "4px 0 0",
    color: "#111827",
  },

  panel: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    boxShadow: "0 2px 8px rgba(15,23,42,0.03)",
  },

  filterBar: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },

  searchBox: {
    flex: 1,
    height: "42px",
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
  },

  searchInput: {
    width: "100%",
    border: "none",
    outline: "none",
    fontSize: "12px",
    color: "#374151",
    background: "transparent",
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
    boxSizing: "border-box",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "950px",
  },

  th: {
    textAlign: "left",
    padding: "12px 10px",
    fontSize: "10px",
    color: "#9ca3af",
    fontWeight: "600",
    borderBottom: "1px solid #eef0f3",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "14px 10px",
    fontSize: "11px",
    color: "#4b5563",
    borderBottom: "1px solid #f3f4f6",
    whiteSpace: "nowrap",
  },

  orgCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  orgAvatar: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: "#eef2ff",
    color: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "700",
    flexShrink: 0,
  },

  orgName: {
    margin: 0,
    fontSize: "12px",
    fontWeight: "600",
    color: "#111827",
  },

  orgLocation: {
    margin: "4px 0 0",
    fontSize: "9px",
    color: "#9ca3af",
  },

  email: {
    color: "#6b7280",
  },

  number: {
    fontWeight: "600",
    color: "#374151",
  },

  premiumBadge: {
    background: "#eef2ff",
    color: "#4f46e5",
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "9px",
    fontWeight: "600",
  },

  basicBadge: {
    background: "#f3f4f6",
    color: "#6b7280",
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "9px",
    fontWeight: "600",
  },

  activeBadge: {
    background: "#ecfdf5",
    color: "#059669",
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "9px",
    fontWeight: "600",
  },

  pendingBadge: {
    background: "#fff7ed",
    color: "#ea580c",
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "9px",
    fontWeight: "600",
  },

  inactiveBadge: {
    background: "#fef2f2",
    color: "#dc2626",
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

  pagination: {
    marginTop: "18px",
    paddingTop: "16px",
    borderTop: "1px solid #f0f1f3",
    display: "flex",
    justifyContent: "space-between",
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

  emptyState: {
    textAlign: "center",
    padding: "50px 20px",
    color: "#6b7280",
  },

  emptyIcon: {
    fontSize: "30px",
    marginBottom: "10px",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
    padding: "12px",
    boxSizing: "border-box",
  },

  modal: {
    width: "100%",
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
    overflow: "hidden",
    maxHeight: "calc(100vh - 24px)",
    overflowY: "auto",
  },

  modalHeader: {
    borderBottom: "1px solid #eef0f3",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
  },

  modalTitle: {
    margin: 0,
    fontSize: "17px",
    color: "#111827",
  },

  modalSubtitle: {
    margin: "5px 0 0",
    fontSize: "11px",
    color: "#9ca3af",
  },

  closeButton: {
    width: "30px",
    height: "30px",
    border: "none",
    background: "#f3f4f6",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "20px",
    color: "#6b7280",
    flexShrink: 0,
  },

  form: {
    boxSizing: "border-box",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    marginTop: "15px",
    fontSize: "11px",
    fontWeight: "600",
    color: "#374151",
  },

  input: {
    width: "100%",
    height: "42px",
    boxSizing: "border-box",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "0 12px",
    fontSize: "12px",
    outline: "none",
    color: "#374151",
    background: "#fff",
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "24px",
  },

  cancelButton: {
    border: "1px solid #e5e7eb",
    background: "#fff",
    color: "#4b5563",
    padding: "10px 15px",
    borderRadius: "8px",
    fontSize: "11px",
    cursor: "pointer",
  },

  saveButton: {
    border: "none",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default Organizations;