import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Dummy users
  const dummyUsers = [
    {
      email: "superadmin@example.com",
      password: "123456",
      role: "SUPER_ADMIN",
      name: "Super Admin",
    },
    {
      email: "rahim@alphacoaching.com",
      password: "123456",
      role: "ORG_ADMIN",
      name: "Rahim Ahmed",
      organization: "Alpha Coaching",
    },
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    const user = dummyUsers.find(
      (item) =>
        item.email.toLowerCase() === email.trim().toLowerCase() &&
        item.password === password
    );

    if (!user) {
      setError("Invalid email or password.");
      return;
    }

    // Save dummy login information
    localStorage.setItem("user", JSON.stringify(user));

    // Redirect based on role
    if (user.role === "SUPER_ADMIN") {
      navigate("/admin");
      return;
    }

    if (user.role === "ORG_ADMIN") {
      navigate("/organization");
      return;
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background:
        "linear-gradient(135deg, #eff6ff 0%, #f8fafc 50%, #eef2ff 100%)",
      padding: "20px",
      fontFamily:
        "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },

    card: {
      width: "100%",
      maxWidth: "430px",
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: "18px",
      padding: "32px",
      boxShadow: "0 15px 45px rgba(15, 23, 42, 0.10)",
    },

    logoBox: {
      width: "54px",
      height: "54px",
      borderRadius: "15px",
      background: "linear-gradient(135deg, #2563eb, #7c3aed)",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "24px",
      fontWeight: 800,
      margin: "0 auto 15px",
    },

    title: {
      textAlign: "center",
      fontSize: "25px",
      fontWeight: 750,
      color: "#111827",
      margin: 0,
    },

    subtitle: {
      textAlign: "center",
      color: "#6b7280",
      fontSize: "13px",
      marginTop: "7px",
      marginBottom: "28px",
    },

    label: {
      display: "block",
      fontSize: "12px",
      fontWeight: 650,
      color: "#374151",
      marginBottom: "7px",
    },

    input: {
      width: "100%",
      boxSizing: "border-box",
      height: "46px",
      border: "1px solid #d1d5db",
      borderRadius: "9px",
      padding: "0 13px",
      fontSize: "13px",
      outline: "none",
      marginBottom: "17px",
      background: "#fff",
    },

    passwordWrapper: {
      position: "relative",
      marginBottom: "17px",
    },

    passwordInput: {
      width: "100%",
      boxSizing: "border-box",
      height: "46px",
      border: "1px solid #d1d5db",
      borderRadius: "9px",
      padding: "0 48px 0 13px",
      fontSize: "13px",
      outline: "none",
    },

    showButton: {
      position: "absolute",
      right: "8px",
      top: "6px",
      height: "34px",
      border: "none",
      background: "transparent",
      color: "#6b7280",
      cursor: "pointer",
      fontSize: "16px",
    },

    error: {
      background: "#fef2f2",
      border: "1px solid #fecaca",
      color: "#dc2626",
      borderRadius: "8px",
      padding: "10px 12px",
      fontSize: "12px",
      marginBottom: "16px",
    },

    loginButton: {
      width: "100%",
      height: "46px",
      border: "none",
      borderRadius: "9px",
      background: "linear-gradient(135deg, #2563eb, #4f46e5)",
      color: "#fff",
      fontSize: "13px",
      fontWeight: 700,
      cursor: "pointer",
      marginTop: "4px",
    },

    demoBox: {
      marginTop: "22px",
      padding: "14px",
      borderRadius: "10px",
      background: "#f8fafc",
      border: "1px solid #e5e7eb",
    },

    demoTitle: {
      fontSize: "11px",
      fontWeight: 750,
      color: "#374151",
      marginBottom: "9px",
    },

    demoText: {
      fontSize: "11px",
      color: "#6b7280",
      lineHeight: 1.7,
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoBox}>A</div>

        <h1 style={styles.title}>Welcome Back</h1>

        <p style={styles.subtitle}>
          Sign in to your AcademyPro account
        </p>

        <form onSubmit={handleLogin}>
          <label style={styles.label}>Email Address</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />

          <label style={styles.label}>Password</label>

          <div style={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.passwordInput}
              required
            />

            <button
              type="button"
              style={styles.showButton}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={styles.loginButton}>
            Sign In
          </button>
        </form>

        {/* Dummy login information */}
        <div style={styles.demoBox}>
          <div style={styles.demoTitle}>
            🧪 Demo Login Accounts
          </div>

          <div style={styles.demoText}>
            <strong>Super Admin</strong>
            <br />
            Email: superadmin@example.com
            <br />
            Password: 123456
            <br />
            <br />

            <strong>Coaching Owner</strong>
            <br />
            Email: rahim@alphacoaching.com
            <br />
            Password: 123456
          </div>
        </div>
      </div>
    </div>
  );
}