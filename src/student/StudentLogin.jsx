import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ExaminoLogo from "../components/ExaminoLogo";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function StudentLogin() {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("01810992332");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim() || !password) {
      setError("Please enter your mobile number or email and password.");
      return;
    }

    setLoading(true);
    try {
      // Normalize identifier: if user enters phone, create/match email format
      let emailToSend = identifier.trim();
      if (!emailToSend.includes("@")) {
        emailToSend = `${emailToSend.replace(/[^0-9]/g, "")}@student.examino.edu.bd`;
      }

      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToSend, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // If login failed, also try plain identifier in case account was created with raw email
        const fallbackRes = await fetch(`${API}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: identifier.trim(), password }),
        });
        const fallbackData = await fallbackRes.json();

        if (!fallbackRes.ok || !fallbackData.success) {
          setError(data.message || fallbackData.message || "Invalid credentials.");
          setLoading(false);
          return;
        }

        handleSuccessfulLogin(fallbackData);
        return;
      }

      handleSuccessfulLogin(data);
    } catch (err) {
      console.error("Login Error:", err);
      setError("Unable to reach Examino backend. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessfulLogin = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    const role = (data.user.globalRole === "super_admin" ? "super_admin" : (data.user.role || "")).toLowerCase();

    if (role === "super_admin") {
      navigate("/admin");
    } else if (role === "org_admin" || role === "tutor") {
      navigate("/teacher");
    } else {
      // Students land directly in the new approved Student Dashboard!
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#F8FAFC]">
      
      {/* ── LEFT BRAND PANEL (NAVY #101B35) ── */}
      <div className="w-full md:w-[45%] lg:w-[42%] bg-[#101B35] text-white p-8 md:p-12 lg:p-16 flex flex-col justify-between">
        
        {/* Top: Logo */}
        <div>
          <ExaminoLogo light size="lg" to="/login" />

          {/* Live Exam Announcement Box (matches PDF Page 2) */}
          <div className="mt-14 lg:mt-20">
            <span className="text-[11px] font-bold tracking-widest text-[#94A3B8] uppercase">
              Tonight
            </span>

            <div className="mt-3 bg-[#1A294C] border border-[#2B3E68] rounded-xl p-5 shadow-lg">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                <span className="text-xs font-semibold text-[#10B981]">
                  Live 8:00–9:00 PM
                </span>
              </div>

              <h3 className="mt-2 text-lg font-bold text-white tracking-tight">
                HSC 2027 ICT — Model Test 01
              </h3>
              <p className="text-xs text-[#94A3B8] mt-1">
                অধ্যায় ২: কমিউনিকেশন সিস্টেম · 25 MCQ · 25 minutes
              </p>
            </div>

            <p className="text-xs text-[#94A3B8] mt-4 leading-relaxed">
              Log in a few minutes early — instructions open 15 minutes before the start.
            </p>
          </div>
        </div>

        {/* Bottom Help Text */}
        <div className="pt-8 border-t border-[#1E2D4A] mt-10 md:mt-0">
          <p className="text-xs text-[#94A3B8]">
            Need help? Call <span className="text-white font-medium">09610-XXXXXX</span> · 10 AM–10 PM
          </p>
        </div>
      </div>

      {/* ── RIGHT LOGIN FORM PANEL ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16">
        <div className="w-full max-w-md">
          
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-[#64748B] mt-2">
              Log in with your mobile number or email.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] text-xs font-medium rounded-lg flex items-start gap-2.5">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Mobile / Email Input */}
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                Mobile number or email
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="01810992332 or student@examino.edu.bd"
                className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#0F172A]">
                  Password
                </label>
                <Link
                  to="#"
                  onClick={(e) => { e.preventDefault(); alert("Password Reset: Please contact your coaching center administrator or institutional tutor to reset your account password."); }}
                  className="text-xs font-semibold text-[#2563EB] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors pr-14"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#2563EB] hover:underline focus:outline-none"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Keep me logged in checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
              />
              <label htmlFor="remember" className="text-xs text-[#0F172A] select-none cursor-pointer">
                Keep me logged in on this device
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Logging in...</span>
                </>
              ) : (
                "Log in"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E2E8F0]"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#F8FAFC] px-3 text-[#94A3B8]">or</span>
            </div>
          </div>

          {/* Secondary Button: SMS Code */}
          <button
            type="button"
            onClick={() => alert("SMS OTP Login: Gateway integration (e.g. BulkSMSBD/Twilio) is scheduled for Phase 2. Please log in using your registered password.")}
            className="w-full py-2.5 bg-white border border-[#CBD5E1] hover:bg-[#F1F5F9] text-[#0F172A] font-semibold text-xs rounded-lg transition-colors"
          >
            Log in with a one-time SMS code
          </button>

          {/* Bottom Switch to Register */}
          <div className="mt-8 text-center text-xs text-[#64748B]">
            New to Examino?{" "}
            <Link to="/register" className="text-[#2563EB] font-semibold hover:underline">
              Create a student account
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-[#E2E8F0] text-center">
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              Teacher or coaching centre? Use the same login — you'll land in your own dashboard.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
