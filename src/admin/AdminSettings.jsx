import React, { useState } from "react";

function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");

  const [platformName, setPlatformName] = useState("Exam Builder");
  const [supportEmail, setSupportEmail] = useState("support@exambuilder.com");
  const [timezone, setTimezone] = useState("Asia/Dhaka");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [newOrganizationApproval, setNewOrganizationApproval] =
    useState(true);

  const styles = {
    page: {
      padding: "30px",
      background: "#f8fafc",
      minHeight: "100vh",
      color: "#0f172a",
    },

    header: {
      marginBottom: "28px",
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

    layout: {
      display: "grid",
      gridTemplateColumns: "220px minmax(0, 1fr)",
      gap: "22px",
      alignItems: "start",
    },

    sidebar: {
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "14px",
      padding: "8px",
      boxShadow: "0 4px 15px rgba(15,23,42,0.04)",
    },

    tab: {
      width: "100%",
      padding: "12px 13px",
      border: "none",
      borderRadius: "9px",
      background: "transparent",
      color: "#64748b",
      textAlign: "left",
      fontSize: "13px",
      fontWeight: 650,
      cursor: "pointer",
      marginBottom: "3px",
    },

    activeTab: {
      background: "#eef2ff",
      color: "#4f46e5",
      fontWeight: 750,
    },

    content: {
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "14px",
      boxShadow: "0 4px 15px rgba(15,23,42,0.04)",
      overflow: "hidden",
    },

    sectionHeader: {
      padding: "22px 24px",
      borderBottom: "1px solid #e2e8f0",
    },

    sectionTitle: {
      margin: 0,
      fontSize: "18px",
      fontWeight: 800,
    },

    sectionDescription: {
      margin: "6px 0 0",
      color: "#64748b",
      fontSize: "12px",
    },

    sectionBody: {
      padding: "24px",
    },

    formGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "20px",
    },

    fullWidth: {
      gridColumn: "1 / -1",
    },

    formGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "7px",
    },

    label: {
      fontSize: "12px",
      fontWeight: 750,
      color: "#334155",
    },

    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: "11px 12px",
      border: "1px solid #cbd5e1",
      borderRadius: "8px",
      outline: "none",
      fontSize: "13px",
      color: "#334155",
      background: "white",
    },

    helpText: {
      color: "#94a3b8",
      fontSize: "11px",
    },

    footer: {
      padding: "17px 24px",
      borderTop: "1px solid #e2e8f0",
      display: "flex",
      justifyContent: "flex-end",
      gap: "10px",
    },

    cancelButton: {
      padding: "10px 17px",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      background: "white",
      color: "#475569",
      cursor: "pointer",
      fontWeight: 650,
    },

    saveButton: {
      padding: "10px 18px",
      borderRadius: "8px",
      border: "none",
      background: "#4f46e5",
      color: "white",
      cursor: "pointer",
      fontWeight: 700,
    },

    settingRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "20px",
      padding: "18px 0",
      borderBottom: "1px solid #f1f5f9",
    },

    settingTitle: {
      fontSize: "13px",
      fontWeight: 750,
      color: "#0f172a",
    },

    settingDescription: {
      marginTop: "5px",
      color: "#64748b",
      fontSize: "11px",
      lineHeight: 1.5,
      maxWidth: "600px",
    },

    toggle: {
      width: "46px",
      height: "25px",
      borderRadius: "999px",
      border: "none",
      padding: "3px",
      cursor: "pointer",
      flexShrink: 0,
      transition: "0.2s",
    },

    toggleCircle: {
      width: "19px",
      height: "19px",
      borderRadius: "50%",
      background: "white",
      transition: "0.2s",
    },

    dangerBox: {
      marginTop: "25px",
      padding: "18px",
      borderRadius: "10px",
      background: "#fef2f2",
      border: "1px solid #fecaca",
    },

    dangerTitle: {
      margin: 0,
      color: "#991b1b",
      fontSize: "14px",
      fontWeight: 800,
    },

    dangerText: {
      margin: "6px 0 13px",
      color: "#b91c1c",
      fontSize: "11px",
    },

    dangerButton: {
      padding: "9px 14px",
      borderRadius: "7px",
      border: "1px solid #fca5a5",
      background: "white",
      color: "#dc2626",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: 700,
    },

    securityCard: {
      padding: "17px",
      border: "1px solid #e2e8f0",
      borderRadius: "10px",
      marginBottom: "13px",
    },

    securityTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },

    securityName: {
      fontSize: "13px",
      fontWeight: 750,
    },

    securityBadge: {
      padding: "5px 9px",
      borderRadius: "999px",
      background: "#ecfdf5",
      color: "#047857",
      fontSize: "10px",
      fontWeight: 800,
    },

    securityText: {
      margin: "7px 0 0",
      color: "#64748b",
      fontSize: "11px",
      lineHeight: 1.5,
    },

    activityItem: {
      display: "flex",
      alignItems: "center",
      gap: "13px",
      padding: "15px 0",
      borderBottom: "1px solid #f1f5f9",
    },

    activityIcon: {
      width: "38px",
      height: "38px",
      borderRadius: "10px",
      background: "#eef2ff",
      color: "#4f46e5",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "16px",
      flexShrink: 0,
    },

    activityTitle: {
      fontSize: "12px",
      fontWeight: 700,
    },

    activityTime: {
      marginTop: "4px",
      color: "#94a3b8",
      fontSize: "10px",
    },
  };

  const tabs = [
    { id: "general", icon: "⚙", label: "General" },
    { id: "notifications", icon: "🔔", label: "Notifications" },
    { id: "security", icon: "🔐", label: "Security" },
    { id: "platform", icon: "🖥", label: "Platform" },
    { id: "activity", icon: "◷", label: "Activity Log" },
  ];

  const Toggle = ({ enabled, onClick }) => (
    <button
      onClick={onClick}
      style={{
        ...styles.toggle,
        background: enabled ? "#4f46e5" : "#cbd5e1",
      }}
    >
      <div
        style={{
          ...styles.toggleCircle,
          transform: enabled ? "translateX(21px)" : "translateX(0)",
        }}
      />
    </button>
  );

  const renderGeneral = () => (
    <>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>General Settings</h2>

        <p style={styles.sectionDescription}>
          Configure the basic information and default preferences of your
          platform.
        </p>
      </div>

      <div style={styles.sectionBody}>
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Platform Name</label>

            <input
              style={styles.input}
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
            />

            <span style={styles.helpText}>
              The name displayed across the platform.
            </span>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Support Email</label>

            <input
              style={styles.input}
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
            />

            <span style={styles.helpText}>
              Used for platform support requests.
            </span>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Timezone</label>

            <select
              style={styles.input}
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            >
              <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
              <option value="UTC">UTC</option>
              <option value="Asia/Kolkata">Asia/Kolkata</option>
              <option value="Asia/Dubai">Asia/Dubai</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Default Language</label>

            <select style={styles.input}>
              <option>English</option>
              <option>Bangla</option>
            </select>
          </div>

          <div
            style={{
              ...styles.formGroup,
              ...styles.fullWidth,
            }}
          >
            <label style={styles.label}>Platform Description</label>

            <textarea
              rows="4"
              style={{
                ...styles.input,
                resize: "vertical",
              }}
              defaultValue="A complete online examination and coaching management platform for modern educational organizations."
            />
          </div>
        </div>
      </div>

      <div style={styles.footer}>
        <button style={styles.cancelButton}>Discard</button>

        <button style={styles.saveButton}>Save Changes</button>
      </div>
    </>
  );

  const renderNotifications = () => (
    <>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Notification Settings</h2>

        <p style={styles.sectionDescription}>
          Control which events generate notifications for administrators.
        </p>
      </div>

      <div style={styles.sectionBody}>
        <div style={styles.settingRow}>
          <div>
            <div style={styles.settingTitle}>Email Notifications</div>

            <div style={styles.settingDescription}>
              Receive important platform alerts and system notifications by
              email.
            </div>
          </div>

          <Toggle
            enabled={emailNotifications}
            onClick={() =>
              setEmailNotifications(!emailNotifications)
            }
          />
        </div>

        <div style={styles.settingRow}>
          <div>
            <div style={styles.settingTitle}>
              New Organization Approval
            </div>

            <div style={styles.settingDescription}>
              Notify Super Admin when a new organization registers and requires
              approval.
            </div>
          </div>

          <Toggle
            enabled={newOrganizationApproval}
            onClick={() =>
              setNewOrganizationApproval(!newOrganizationApproval)
            }
          />
        </div>

        <div style={styles.settingRow}>
          <div>
            <div style={styles.settingTitle}>Payment Alerts</div>

            <div style={styles.settingDescription}>
              Receive notifications for failed payments, overdue invoices and
              subscription changes.
            </div>
          </div>

          <Toggle enabled={true} onClick={() => {}} />
        </div>

        <div style={styles.settingRow}>
          <div>
            <div style={styles.settingTitle}>Exam Activity Alerts</div>

            <div style={styles.settingDescription}>
              Get notified when unusual exam activity or system errors are
              detected.
            </div>
          </div>

          <Toggle enabled={false} onClick={() => {}} />
        </div>
      </div>

      <div style={styles.footer}>
        <button style={styles.cancelButton}>Discard</button>

        <button style={styles.saveButton}>Save Changes</button>
      </div>
    </>
  );

  const renderSecurity = () => (
    <>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Security Settings</h2>

        <p style={styles.sectionDescription}>
          Protect your platform and manage administrator security policies.
        </p>
      </div>

      <div style={styles.sectionBody}>
        <div style={styles.securityCard}>
          <div style={styles.securityTop}>
            <div style={styles.securityName}>
              Two-Factor Authentication
            </div>

            <span style={styles.securityBadge}>Enabled</span>
          </div>

          <p style={styles.securityText}>
            Require administrators to verify their identity using a second
            authentication method.
          </p>
        </div>

        <div style={styles.securityCard}>
          <div style={styles.securityTop}>
            <div style={styles.securityName}>
              Password Policy
            </div>

            <span style={styles.securityBadge}>Strong</span>
          </div>

          <p style={styles.securityText}>
            Minimum 8 characters with uppercase, lowercase, number and special
            character requirements.
          </p>
        </div>

        <div style={styles.securityCard}>
          <div style={styles.securityTop}>
            <div style={styles.securityName}>
              Session Timeout
            </div>

            <span style={styles.securityBadge}>30 Minutes</span>
          </div>

          <p style={styles.securityText}>
            Administrators are automatically logged out after 30 minutes of
            inactivity.
          </p>
        </div>

        <div style={styles.securityCard}>
          <div style={styles.securityTop}>
            <div style={styles.securityName}>
              Login Attempt Protection
            </div>

            <span style={styles.securityBadge}>Active</span>
          </div>

          <p style={styles.securityText}>
            Accounts are temporarily locked after multiple unsuccessful login
            attempts.
          </p>
        </div>

        <div style={styles.dangerBox}>
          <h3 style={styles.dangerTitle}>Reset Security Sessions</h3>

          <p style={styles.dangerText}>
            This will sign out all administrator sessions across the platform.
          </p>

          <button style={styles.dangerButton}>
            Sign Out All Sessions
          </button>
        </div>
      </div>
    </>
  );

  const renderPlatform = () => (
    <>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Platform Settings</h2>

        <p style={styles.sectionDescription}>
          Manage global platform behavior and system-wide controls.
        </p>
      </div>

      <div style={styles.sectionBody}>
        <div style={styles.settingRow}>
          <div>
            <div style={styles.settingTitle}>Maintenance Mode</div>

            <div style={styles.settingDescription}>
              Temporarily disable access for organizations while system
              maintenance is being performed.
            </div>
          </div>

          <Toggle
            enabled={maintenanceMode}
            onClick={() => setMaintenanceMode(!maintenanceMode)}
          />
        </div>

        <div style={styles.settingRow}>
          <div>
            <div style={styles.settingTitle}>Allow New Registrations</div>

            <div style={styles.settingDescription}>
              Allow new coaching centers and organizations to register on the
              platform.
            </div>
          </div>

          <Toggle enabled={true} onClick={() => {}} />
        </div>

        <div style={styles.settingRow}>
          <div>
            <div style={styles.settingTitle}>Automatic Data Backup</div>

            <div style={styles.settingDescription}>
              Automatically create regular backups of important platform data.
            </div>
          </div>

          <Toggle enabled={true} onClick={() => {}} />
        </div>

        <div style={styles.settingRow}>
          <div>
            <div style={styles.settingTitle}>Exam Result Publishing</div>

            <div style={styles.settingDescription}>
              Allow organizations to publish examination results immediately
              after an exam is completed.
            </div>
          </div>

          <Toggle enabled={true} onClick={() => {}} />
        </div>
      </div>

      <div style={styles.footer}>
        <button style={styles.cancelButton}>Discard</button>

        <button style={styles.saveButton}>Save Changes</button>
      </div>
    </>
  );

  const renderActivity = () => {
    const activities = [
      {
        icon: "🔐",
        title: "Super Admin logged in",
        time: "Today at 6:42 PM",
      },
      {
        icon: "🏢",
        title: "New organization approved",
        time: "Today at 5:18 PM",
      },
      {
        icon: "💳",
        title: "Premium subscription activated",
        time: "Today at 3:45 PM",
      },
      {
        icon: "📝",
        title: "342 questions imported",
        time: "Today at 1:22 PM",
      },
      {
        icon: "⚙",
        title: "Platform settings updated",
        time: "Yesterday at 8:31 PM",
      },
      {
        icon: "👤",
        title: "Organization administrator created",
        time: "Yesterday at 6:17 PM",
      },
    ];

    return (
      <>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Activity Log</h2>

          <p style={styles.sectionDescription}>
            Review important administrative actions performed on the platform.
          </p>
        </div>

        <div style={styles.sectionBody}>
          {activities.map((activity, index) => (
            <div
              style={{
                ...styles.activityItem,
                borderBottom:
                  index === activities.length - 1
                    ? "none"
                    : styles.activityItem.borderBottom,
              }}
              key={index}
            >
              <div style={styles.activityIcon}>{activity.icon}</div>

              <div>
                <div style={styles.activityTitle}>
                  {activity.title}
                </div>

                <div style={styles.activityTime}>
                  {activity.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  const renderContent = () => {
    if (activeTab === "notifications") {
      return renderNotifications();
    }

    if (activeTab === "security") {
      return renderSecurity();
    }

    if (activeTab === "platform") {
      return renderPlatform();
    }

    if (activeTab === "activity") {
      return renderActivity();
    }

    return renderGeneral();
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>Settings</h1>

        <p style={styles.subtitle}>
          Configure your platform preferences, security and system behavior.
        </p>
      </div>

      {/* CONTENT */}
      <div style={styles.layout}>
        {/* SIDEBAR */}
        <div style={styles.sidebar}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.tab,
                ...(activeTab === tab.id
                  ? styles.activeTab
                  : {}),
              }}
            >
              <span style={{ marginRight: "9px" }}>
                {tab.icon}
              </span>

              {tab.label}
            </button>
          ))}
        </div>

        {/* MAIN */}
        <div style={styles.content}>{renderContent()}</div>
      </div>
    </div>
  );
}

export default AdminSettings;