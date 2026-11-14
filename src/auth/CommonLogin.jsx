import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ExaminoLogo from "../components/ExaminoLogo";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function CommonLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(location.state?.message || "");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim()) {
      setError("Please enter your registered mobile number or email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Invalid credentials. Please verify your mobile/email and password.");
        setLoading(false);
        return;
      }

      // Store authentic token and user profile
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.memberships) {
        localStorage.setItem("examino_memberships", JSON.stringify(data.memberships));
      }

      // Determine redirect URL from server identity
      const role = (data.user.globalRole === "super_admin" ? "super_admin" : (data.user.role || "")).toLowerCase();

      if (location.state?.from) {
        navigate(location.state.from, { replace: true });
      } else if (role === "super_admin") {
        navigate("/admin", { replace: true });
      } else if (role === "org_admin") {
        navigate("/organization", { replace: true });
      } else if (role === "tutor" || role === "teacher") {
        navigate("/teacher", { replace: true });
      } else {
        // Students land in the Student Portal
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("Unable to reach Examino backend. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#F8FAFC]">
      {/* ── LEFT BRAND PANEL (NAVY #101B35) ── */}
      <div className="w-full md:w-[45%] lg:w-[42%] bg-[#101B35] text-white p-8 md:p-12 lg:p-16 flex flex-col justify-between">
        <div>
          <ExaminoLogo light size="lg" to="/login" />

          <div className="mt-14 lg:mt-20">
            <span className="text-[11px] font-bold tracking-widest text-[#94A3B8] uppercase">
              Unified Platform Access
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3 leading-snug tracking-tight">
              One account for students, teachers, and coaching centers.
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-4 leading-relaxed font-normal max-w-md">
              Access authentic NCTB and board exams, interactive practice drill, A4 question paper builder, and institute performance analytics.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3 pt-6 border-t border-white/10 text-xs">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-base block mb-1">👨‍🎓</span>
                <span className="font-bold block text-white">Student</span>
                <span className="text-[10px] text-[#94A3B8]">Exams & Practice</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-base block mb-1">👨‍🏫</span>
                <span className="font-bold block text-white">Teacher</span>
                <span className="text-[10px] text-[#94A3B8]">Paper & Analytics</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-base block mb-1">🏫</span>
                <span className="font-bold block text-white">Coaching</span>
                <span className="text-[10px] text-[#94A3B8]">Workspaces</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-xs text-[#64748B] flex items-center justify-between">
          <span>&copy; {new Date().getFullYear()} Examino Ltd.</span>
          <span className="font-medium">EdTech for Bangladesh</span>
        </div>
      </div>

      {/* ── RIGHT LOGIN FORM PANEL ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16">
        <div className="w-full max-w-md">
          {/* Form Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
              <span>Secure Authentication</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Sign in to Examino
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-2">
              Enter your mobile number or email to access your workspace.
            </p>
          </div>

          {/* Error Notification */}
          {error && (
            <div className="mb-6 p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-xs font-semibold text-[#DC2626] flex items-start gap-2.5 animate-fadeIn">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Mobile / Email Input */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                Mobile Number or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. 017XXXXXXXX or user@example.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Input with Visibility Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] focus:outline-none p-1"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB] border-[#CBD5E1]"
                />
                <span className="text-xs text-[#64748B] font-medium">Remember my session</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 px-4 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 ${
                loading ? "opacity-75 cursor-wait" : ""
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign in to Dashboard &rarr;</span>
              )}
            </button>
          </form>

          {/* Registration Redirect */}
          <div className="mt-8 pt-6 border-t border-[#E2E8F0] text-center">
            <p className="text-xs text-[#64748B]">
              New to Examino?{" "}
              <Link
                to="/register"
                className="font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
