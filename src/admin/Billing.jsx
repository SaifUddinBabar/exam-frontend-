import React, { useState } from "react";

const plans = [
  {
    name: "Basic",
    price: "$29",
    period: "/month",
    organizations: "1 Organization",
    students: "Up to 500 Students",
    exams: "100 Exams",
    questions: "5,000 Questions",
    admins: "2 Admins",
    status: "Popular",
  },
  {
    name: "Premium",
    price: "$79",
    period: "/month",
    organizations: "5 Organizations",
    students: "Up to 5,000 Students",
    exams: "Unlimited Exams",
    questions: "50,000 Questions",
    admins: "10 Admins",
    status: "Recommended",
  },
  {
    name: "Enterprise",
    price: "$199",
    period: "/month",
    organizations: "Unlimited Organizations",
    students: "Unlimited Students",
    exams: "Unlimited Exams",
    questions: "Unlimited Questions",
    admins: "Unlimited Admins",
    status: "Custom",
  },
];

const subscriptions = [
  {
    id: "SUB-10284",
    organization: "Alpha Coaching",
    plan: "Premium",
    amount: "$79",
    billing: "Monthly",
    nextBilling: "Nov 02, 2026",
    status: "Active",
  },
  {
    id: "SUB-10283",
    organization: "Bright Academy",
    plan: "Basic",
    amount: "$29",
    billing: "Monthly",
    nextBilling: "Nov 01, 2026",
    status: "Active",
  },
  {
    id: "SUB-10282",
    organization: "Mastermind Coaching",
    plan: "Premium",
    amount: "$79",
    billing: "Monthly",
    nextBilling: "Oct 29, 2026",
    status: "Active",
  },
  {
    id: "SUB-10281",
    organization: "Future Education",
    plan: "Basic",
    amount: "$29",
    billing: "Monthly",
    nextBilling: "Oct 27, 2026",
    status: "Past Due",
  },
  {
    id: "SUB-10280",
    organization: "Scholars Point",
    plan: "Enterprise",
    amount: "$199",
    billing: "Monthly",
    nextBilling: "Oct 24, 2026",
    status: "Active",
  },
  {
    id: "SUB-10279",
    organization: "NextGen Academy",
    plan: "Premium",
    amount: "$79",
    billing: "Yearly",
    nextBilling: "Oct 22, 2027",
    status: "Active",
  },
];

function Billing() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [planFilter, setPlanFilter] = useState("All");

  const filteredSubscriptions = subscriptions.filter((item) => {
    const matchesSearch =
      item.organization.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter;

    const matchesPlan =
      planFilter === "All" || item.plan === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

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

    headerButton: {
      padding: "11px 17px",
      borderRadius: "9px",
      border: "1px solid #e2e8f0",
      background: "white",
      color: "#334155",
      fontSize: "13px",
      fontWeight: 700,
      cursor: "pointer",
    },

    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
      gap: "18px",
      marginBottom: "30px",
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
      justifyContent: "center",
      alignItems: "center",
      fontSize: "19px",
    },

    statLabel: {
      marginTop: "14px",
      fontSize: "13px",
      color: "#64748b",
      fontWeight: 600,
    },

    statValue: {
      marginTop: "5px",
      fontSize: "25px",
      fontWeight: 800,
    },

    statChange: {
      marginTop: "7px",
      fontSize: "12px",
      color: "#059669",
      fontWeight: 700,
    },

    sectionTitle: {
      margin: "0 0 15px",
      fontSize: "18px",
      fontWeight: 800,
    },

    plansGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: "20px",
      marginBottom: "32px",
    },

    planCard: {
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "15px",
      padding: "23px",
      position: "relative",
      boxShadow: "0 4px 15px rgba(15,23,42,0.04)",
    },

    recommendedCard: {
      border: "2px solid #6366f1",
      boxShadow: "0 12px 30px rgba(79,70,229,0.10)",
    },

    planBadge: {
      position: "absolute",
      top: "17px",
      right: "17px",
      padding: "5px 9px",
      borderRadius: "999px",
      background: "#eef2ff",
      color: "#4f46e5",
      fontSize: "10px",
      fontWeight: 800,
    },

    planName: {
      margin: 0,
      fontSize: "18px",
      fontWeight: 800,
    },

    planDescription: {
      margin: "7px 0 18px",
      color: "#64748b",
      fontSize: "12px",
    },

    price: {
      fontSize: "34px",
      fontWeight: 850,
      letterSpacing: "-1px",
    },

    period: {
      color: "#64748b",
      fontSize: "13px",
      fontWeight: 500,
    },

    divider: {
      height: "1px",
      background: "#e2e8f0",
      margin: "20px 0",
    },

    feature: {
      display: "flex",
      alignItems: "center",
      gap: "9px",
      marginBottom: "12px",
      color: "#475569",
      fontSize: "13px",
    },

    check: {
      width: "20px",
      height: "20px",
      borderRadius: "50%",
      background: "#ecfdf5",
      color: "#059669",
      display: "inline-flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "11px",
      fontWeight: 800,
      flexShrink: 0,
    },

    planButton: {
      width: "100%",
      marginTop: "10px",
      padding: "11px",
      borderRadius: "8px",
      border: "1px solid #cbd5e1",
      background: "white",
      color: "#334155",
      fontSize: "13px",
      fontWeight: 700,
      cursor: "pointer",
    },

    premiumButton: {
      background: "#4f46e5",
      borderColor: "#4f46e5",
      color: "white",
    },

    tableCard: {
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "14px",
      overflow: "hidden",
      boxShadow: "0 4px 15px rgba(15,23,42,0.04)",
    },

    toolbar: {
      padding: "18px",
      borderBottom: "1px solid #e2e8f0",
      display: "flex",
      gap: "12px",
      alignItems: "center",
      flexWrap: "wrap",
    },

    searchWrapper: {
      flex: 1,
      minWidth: "260px",
      position: "relative",
    },

    searchIcon: {
      position: "absolute",
      left: "13px",
      top: "10px",
      color: "#94a3b8",
    },

    searchInput: {
      width: "100%",
      boxSizing: "border-box",
      padding: "11px 12px 11px 38px",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      background: "#f8fafc",
      outline: "none",
      fontSize: "13px",
    },

    select: {
      padding: "11px 13px",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      background: "#f8fafc",
      color: "#334155",
      fontSize: "13px",
      outline: "none",
      minWidth: "135px",
    },

    tableWrapper: {
      overflowX: "auto",
    },

    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: "900px",
    },

    th: {
      padding: "13px 18px",
      background: "#f8fafc",
      color: "#64748b",
      fontSize: "11px",
      fontWeight: 800,
      textTransform: "uppercase",
      textAlign: "left",
      letterSpacing: "0.4px",
      borderBottom: "1px solid #e2e8f0",
    },

    td: {
      padding: "16px 18px",
      fontSize: "13px",
      color: "#334155",
      borderBottom: "1px solid #f1f5f9",
    },

    orgName: {
      fontWeight: 750,
      color: "#0f172a",
    },

    subText: {
      marginTop: "4px",
      fontSize: "11px",
      color: "#94a3b8",
    },

    badge: {
      display: "inline-flex",
      padding: "5px 9px",
      borderRadius: "999px",
      fontSize: "11px",
      fontWeight: 750,
    },

    action: {
      border: "1px solid #e2e8f0",
      background: "white",
      width: "32px",
      height: "32px",
      borderRadius: "7px",
      cursor: "pointer",
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
    },

    activePage: {
      background: "#4f46e5",
      color: "white",
      borderColor: "#4f46e5",
    },
  };

  const statusStyle = (status) => {
    if (status === "Active") {
      return {
        background: "#ecfdf5",
        color: "#047857",
      };
    }

    return {
      background: "#fef2f2",
      color: "#dc2626",
    };
  };

  const planStyle = (plan) => {
    if (plan === "Premium") {
      return {
        background: "#eef2ff",
        color: "#4f46e5",
      };
    }

    if (plan === "Enterprise") {
      return {
        background: "#fdf2f8",
        color: "#be185d",
      };
    }

    return {
      background: "#f1f5f9",
      color: "#475569",
    };
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Billing & Subscription</h1>

          <p style={styles.subtitle}>
            Manage platform plans, subscriptions and recurring revenue.
          </p>
        </div>

        <button style={styles.headerButton}>
          ⚙ Billing Settings
        </button>
      </div>

      {/* STATS */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statTop}>
            <div
              style={{
                ...styles.statIcon,
                background: "#ecfdf5",
                color: "#059669",
              }}
            >
              $
            </div>
          </div>

          <div style={styles.statLabel}>Monthly Recurring Revenue</div>
          <div style={styles.statValue}>$48,620</div>
          <div style={styles.statChange}>+16.8% this month</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statTop}>
            <div
              style={{
                ...styles.statIcon,
                background: "#eef2ff",
                color: "#4f46e5",
              }}
            >
              ◉
            </div>
          </div>

          <div style={styles.statLabel}>Active Subscriptions</div>
          <div style={styles.statValue}>842</div>
          <div style={styles.statChange}>+9.4% this month</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statTop}>
            <div
              style={{
                ...styles.statIcon,
                background: "#fff7ed",
                color: "#ea580c",
              }}
            >
              ↑
            </div>
          </div>

          <div style={styles.statLabel}>Annual Revenue</div>
          <div style={styles.statValue}>$583K</div>
          <div style={styles.statChange}>+22.1% this year</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statTop}>
            <div
              style={{
                ...styles.statIcon,
                background: "#fef2f2",
                color: "#dc2626",
              }}
            >
              !
            </div>
          </div>

          <div style={styles.statLabel}>Past Due</div>
          <div style={styles.statValue}>17</div>
          <div
            style={{
              ...styles.statChange,
              color: "#dc2626",
            }}
          >
            Requires attention
          </div>
        </div>
      </div>

      {/* PLANS */}
      <h2 style={styles.sectionTitle}>Subscription Plans</h2>

      <div style={styles.plansGrid}>
        {plans.map((plan) => (
          <div
            key={plan.name}
            style={{
              ...styles.planCard,
              ...(plan.name === "Premium"
                ? styles.recommendedCard
                : {}),
            }}
          >
            <span style={styles.planBadge}>{plan.status}</span>

            <h3 style={styles.planName}>{plan.name}</h3>

            <p style={styles.planDescription}>
              {plan.name === "Basic"
                ? "For small coaching centers"
                : plan.name === "Premium"
                ? "For growing education businesses"
                : "For large organizations and networks"}
            </p>

            <div>
              <span style={styles.price}>{plan.price}</span>
              <span style={styles.period}>{plan.period}</span>
            </div>

            <div style={styles.divider} />

            <div style={styles.feature}>
              <span style={styles.check}>✓</span>
              {plan.organizations}
            </div>

            <div style={styles.feature}>
              <span style={styles.check}>✓</span>
              {plan.students}
            </div>

            <div style={styles.feature}>
              <span style={styles.check}>✓</span>
              {plan.exams}
            </div>

            <div style={styles.feature}>
              <span style={styles.check}>✓</span>
              {plan.questions}
            </div>

            <div style={styles.feature}>
              <span style={styles.check}>✓</span>
              {plan.admins}
            </div>

            <button
              style={{
                ...styles.planButton,
                ...(plan.name === "Premium"
                  ? styles.premiumButton
                  : {}),
              }}
            >
              {plan.name === "Enterprise"
                ? "Contact Sales"
                : "Manage Plan"}
            </button>
          </div>
        ))}
      </div>

      {/* SUBSCRIPTIONS */}
      <h2 style={styles.sectionTitle}>Recent Subscriptions</h2>

      <div style={styles.tableCard}>
        <div style={styles.toolbar}>
          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>⌕</span>

            <input
              style={styles.searchInput}
              placeholder="Search organization or subscription ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            style={styles.select}
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
          >
            <option value="All">All Plans</option>
            <option value="Basic">Basic</option>
            <option value="Premium">Premium</option>
            <option value="Enterprise">Enterprise</option>
          </select>

          <select
            style={styles.select}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Past Due">Past Due</option>
          </select>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Subscription</th>
                <th style={styles.th}>Organization</th>
                <th style={styles.th}>Plan</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Billing</th>
                <th style={styles.th}>Next Billing</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredSubscriptions.map((item) => (
                <tr key={item.id}>
                  <td style={styles.td}>
                    <div style={styles.orgName}>{item.id}</div>
                    <div style={styles.subText}>Subscription</div>
                  </td>

                  <td style={styles.td}>
                    <div style={styles.orgName}>
                      {item.organization}
                    </div>
                  </td>

                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        ...planStyle(item.plan),
                      }}
                    >
                      {item.plan}
                    </span>
                  </td>

                  <td style={styles.td}>
                    <strong>{item.amount}</strong>
                  </td>

                  <td style={styles.td}>{item.billing}</td>

                  <td style={styles.td}>{item.nextBilling}</td>

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

                  <td style={styles.td}>
                    <button style={styles.action}>⋯</button>
                  </td>
                </tr>
              ))}

              {filteredSubscriptions.length === 0 && (
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      ...styles.td,
                      textAlign: "center",
                      padding: "45px",
                      color: "#64748b",
                    }}
                  >
                    No subscriptions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={styles.pagination}>
          <span>Showing 1–6 of 842 subscriptions</span>

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
    </div>
  );
}

export default Billing;