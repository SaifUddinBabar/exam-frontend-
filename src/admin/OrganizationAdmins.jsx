import React, { useEffect, useState } from "react";

function OrganizationAdmins() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [organizationFilter, setOrganizationFilter] = useState("All");
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

  const admins = [
    {
      id: 1,
      name: "Rahim Ahmed",
      email: "rahim@alphacoaching.com",
      organization: "Alpha Coaching",
      role: "Owner",
      students: 1240,
      status: "Active",
      lastLogin: "Today, 10:42 AM",
    },
    {
      id: 2,
      name: "Karim Hasan",
      email: "karim@brightacademy.com",
      organization: "Bright Academy",
      role: "Admin",
      students: 856,
      status: "Active",
      lastLogin: "Today, 09:18 AM",
    },
    {
      id: 3,
      name: "Nusrat Jahan",
      email: "nusrat@mastermind.com",
      organization: "Mastermind Coaching",
      role: "Admin",
      students: 642,
      status: "Pending",
      lastLogin: "Never",
    },
    {
      id: 4,
      name: "Tanvir Hossain",
      email: "tanvir@futureedu.com",
      organization: "Future Education",
      role: "Owner",
      students: 523,
      status: "Active",
      lastLogin: "Yesterday, 06:30 PM",
    },
    {
      id: 5,
      name: "Sadia Rahman",
      email: "sadia@nextgen.com",
      organization: "NextGen Academy",
      role: "Admin",
      students: 934,
      status: "Inactive",
      lastLogin: "Sep 28, 2026",
    },
    {
      id: 6,
      name: "Imran Kabir",
      email: "imran@scholarspoint.com",
      organization: "Scholars Point",
      role: "Admin",
      students: 718,
      status: "Active",
      lastLogin: "Today, 08:51 AM",
    },
  ];

  const organizations = [
    "All",
    ...new Set(admins.map((admin) => admin.organization)),
  ];

  const filteredAdmins = admins.filter((admin) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      admin.name.toLowerCase().includes(searchText) ||
      admin.email.toLowerCase().includes(searchText) ||
      admin.organization.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "All" || admin.status === statusFilter;

    const matchesOrganization =
      organizationFilter === "All" ||
      admin.organization === organizationFilter;

    return matchesSearch && matchesStatus && matchesOrganization;
  });

  const getStatusStyle = (status) => {
    if (status === "Active") return styles.activeBadge;
    if (status === "Pending") return styles.pendingBadge;
    return styles.inactiveBadge;
  };

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
            Organization Admins
          </h2>

          <p
            style={{
              ...styles.subtitle,
              fontSize: isMobile ? "12px" : "13px",
            }}
          >
            Manage administrators and owners of all organizations.
          </p>
        </div>

        <button
          style={{
            ...styles.addButton,
            width: isMobile ? "100%" : "auto",
          }}
          onClick={() => setShowModal(true)}
        >
          + Add Admin
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
        <SummaryCard
          icon="👨‍💼"
          label="Total Admins"
          value="186"
          background="#eef2ff"
          isMobile={isMobile}
        />

        <SummaryCard
          icon="✓"
          label="Active Admins"
          value="171"
          background="#ecfdf5"
          isMobile={isMobile}
        />

        <SummaryCard
          icon="⏳"
          label="Pending"
          value="8"
          background="#fff7ed"
          isMobile={isMobile}
        />

        <SummaryCard
          icon="⛔"
          label="Inactive"
          value="7"
          background="#fef2f2"
          isMobile={isMobile}
        />
      </div>

      {/* TABLE PANEL */}
      <div
        style={{
          ...styles.panel,
          padding: isMobile ? "12px" : "20px",
          borderRadius: isMobile ? "12px" : "14px",
        }}
      >
        {/* FILTER BAR */}
        <div
          style={{
            ...styles.filterBar,
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "stretch" : "center",
            gap: isMobile ? "9px" : "12px",
            marginBottom: isMobile ? "14px" : "20px",
          }}
        >
          <div
            style={{
              ...styles.searchBox,
              width: isMobile ? "100%" : "auto",
              minWidth: isMobile ? "0" : "250px",
              height: isMobile ? "40px" : "42px",
            }}
          >
            <span style={styles.searchIcon}>🔍</span>

            <input
              type="text"
              placeholder="Search admin, email or organization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                ...styles.searchInput,
                fontSize: isMobile ? "11px" : "12px",
              }}
            />
          </div>

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
            <option value="Pending">Pending</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* TABLE */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Administrator</th>
                <th style={styles.th}>Organization</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Students</th>
                <th style={styles.th}>Last Login</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredAdmins.map((admin) => (
                <tr key={admin.id}>
                  <td style={styles.td}>
                    <div style={styles.adminCell}>
                      <div style={styles.avatar}>
                        {admin.name
                          .split(" ")
                          .map((word) => word[0])
                          .join("")
                          .slice(0, 2)}
                      </div>

                      <div>
                        <p style={styles.adminName}>{admin.name}</p>
                        <p style={styles.adminEmail}>{admin.email}</p>
                      </div>
                    </div>
                  </td>

                  <td style={styles.td}>
                    <span style={styles.organizationName}>
                      {admin.organization}
                    </span>
                  </td>

                  <td style={styles.td}>
                    <span
                      style={
                        admin.role === "Owner"
                          ? styles.ownerBadge
                          : styles.adminBadge
                      }
                    >
                      {admin.role}
                    </span>
                  </td>

                  <td style={styles.td}>
                    <span style={styles.studentCount}>
                      {admin.students.toLocaleString()}
                    </span>
                  </td>

                  <td style={styles.td}>{admin.lastLogin}</td>

                  <td style={styles.td}>
                    <span style={getStatusStyle(admin.status)}>
                      <span style={styles.statusDot}>●</span>
                      {admin.status}
                    </span>
                  </td>

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

          {filteredAdmins.length === 0 && (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🔍</div>

              <h3 style={{ margin: "0 0 6px" }}>
                No administrators found
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
            justifyContent: isMobile ? "center" : "space-between",
            alignItems: "center",
          }}
        >
          <p style={styles.paginationText}>
            Showing {filteredAdmins.length} of 186 administrators
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

      {/* ADD ADMIN MODAL */}
      {showModal && (
        <div
          style={{
            ...styles.overlay,
            padding: isMobile ? "12px" : "20px",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              ...styles.modal,
              maxHeight: isMobile ? "92vh" : "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <div>
                <h3
                  style={{
                    ...styles.modalTitle,
                    fontSize: isMobile ? "16px" : "17px",
                  }}
                >
                  Add Organization Admin
                </h3>

                <p style={styles.modalSubtitle}>
                  Create an administrator for an organization.
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
              <label style={styles.label}>Full Name</label>

              <input
                type="text"
                placeholder="Enter full name"
                style={styles.input}
              />

              <label style={styles.label}>Email Address</label>

              <input
                type="email"
                placeholder="admin@example.com"
                style={styles.input}
              />

              <label style={styles.label}>Organization</label>

              <select style={styles.input}>
                {organizations
                  .filter((organization) => organization !== "All")
                  .map((organization) => (
                    <option key={organization} value={organization}>
                      {organization}
                    </option>
                  ))}
              </select>

              <label style={styles.label}>Role</label>

              <select style={styles.input}>
                <option>Admin</option>
                <option>Owner</option>
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
                  Create Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  background,
  isMobile,
}) {
  return (
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
          background,
        }}
      >
        {icon}
      </div>

      <div style={{ minWidth: 0 }}>
        <p style={styles.summaryLabel}>{label}</p>

        <h3
          style={{
            ...styles.summaryValue,
            fontSize: isMobile ? "18px" : "22px",
          }}
        >
          {value}
        </h3>
      </div>
    </div>
  );
}

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
    flexShrink: 0,
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
    background: "#fafafa",
  },

  td: {
    padding: "14px 10px",
    fontSize: "11px",
    color: "#4b5563",
    borderBottom: "1px solid #f3f4f6",
    whiteSpace: "nowrap",
  },

  adminCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: "240px",
  },

  avatar: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background:
      "linear-gradient(135deg, #eef2ff, #e0e7ff)",
    color: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "700",
    flexShrink: 0,
  },

  adminName: {
    margin: 0,
    fontSize: "12px",
    fontWeight: "600",
    color: "#111827",
  },

  adminEmail: {
    margin: "4px 0 0",
    fontSize: "9px",
    color: "#9ca3af",
  },

  organizationName: {
    fontSize: "11px",
    fontWeight: "500",
    color: "#374151",
  },

  studentCount: {
    fontWeight: "600",
    color: "#374151",
  },

  ownerBadge: {
    background: "#eef2ff",
    color: "#4f46e5",
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "9px",
    fontWeight: "600",
  },

  adminBadge: {
    background: "#f3f4f6",
    color: "#6b7280",
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "9px",
    fontWeight: "600",
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

  pendingBadge: {
    display: "inline-flex",
    alignItems: "center",
    background: "#fff7ed",
    color: "#ea580c",
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "9px",
    fontWeight: "600",
  },

  inactiveBadge: {
    display: "inline-flex",
    alignItems: "center",
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

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
    boxSizing: "border-box",
  },

  modal: {
    width: "100%",
    maxWidth: "480px",
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
    overflow: "hidden",
    boxSizing: "border-box",
  },

  modalHeader: {
    padding: "20px",
    borderBottom: "1px solid #eef0f3",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
  },

  modalTitle: {
    margin: 0,
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
    minHeight: "40px",
  },

  saveButton: {
    border: "none",
    background:
      "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: "600",
    cursor: "pointer",
    minHeight: "40px",
  },
};

export default OrganizationAdmins;