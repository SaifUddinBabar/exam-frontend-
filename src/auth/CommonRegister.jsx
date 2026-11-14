import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ExaminoLogo from "../components/ExaminoLogo";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function CommonRegister() {
  const navigate = useNavigate();

  // Active Role Tab: 'student' | 'teacher' | 'organization'
  const [activeTab, setActiveTab] = useState("student");

  // Common Fields
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Student Specific Fields
  const [level, setLevel] = useState("HSC 2027");
  const [group, setGroup] = useState("Science");

  // Teacher Specific Fields
  const [teacherEmail, setTeacherEmail] = useState("");
  const [designation, setDesignation] = useState("ICT Lecturer / Faculty");
  const [institution, setInstitution] = useState("");

  // Organization Specific Fields
  const [orgName, setOrgName] = useState("");
  const [location, setLocation] = useState("Dhaka");

  // State & Loading
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [testOtpHint, setTestOtpHint] = useState("");

  // Cooldown countdown
  useEffect(() => {
    let timer;
    if (showOtpModal && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showOtpModal, resendCooldown]);

  // Clean Mobile helper
  const cleanPhone = (val) => val.replace(/[^0-9]/g, "");

  // Initiate Registration -> Send OTP
  const handleInitiateRegistration = async (e) => {
    e.preventDefault();
    setError("");

    if (activeTab === "organization" && !orgName.trim()) {
      setError("Please enter your organization or coaching center name.");
      return;
    }

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    const cleaned = cleanPhone(mobile);
    if (!cleaned || cleaned.length < 11) {
      setError("Please enter a valid 11-digit mobile number (e.g. 017XXXXXXXX).");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter carefully.");
      return;
    }

    if (!agreeTerms) {
      setError("Please accept the Terms of Service and Privacy Policy to continue.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleaned, purpose: "registration" }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Failed to send verification code. Please check your mobile number.");
        setLoading(false);
        return;
      }

      if (data.testOtp) {
        setTestOtpHint(data.testOtp);
        setOtpValue(data.testOtp);
      }

      setResendCooldown(data.resendCooldown || 60);
      setCanResend(false);
      setOtpError("");
      setShowOtpModal(true);
    } catch (err) {
      console.error("OTP Send Error:", err);
      setError("Network error while contacting authentication server.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    setOtpLoading(true);
    setOtpError("");
    try {
      const cleaned = cleanPhone(mobile);
      const res = await fetch(`${API}/api/auth/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleaned, purpose: "registration" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResendCooldown(data.resendCooldown || 60);
        setCanResend(false);
        if (data.testOtp) {
          setTestOtpHint(data.testOtp);
          setOtpValue(data.testOtp);
        }
      } else {
        setOtpError(data.message || "Failed to resend code.");
      }
    } catch {
      setOtpError("Network error. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP & Complete Registration
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setOtpError("");

    if (!otpValue || otpValue.trim().length !== 6) {
      setOtpError("Please enter the complete 6-digit code.");
      return;
    }

    const cleaned = cleanPhone(mobile);
    setOtpLoading(true);

    try {
      // 1. Verify OTP
      const verifyRes = await fetch(`${API}/api/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleaned,
          otp: otpValue.trim(),
          purpose: "registration",
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        setOtpError(verifyData.message || "Incorrect verification code. Please check and try again.");
        setOtpLoading(false);
        return;
      }

      const verificationToken = verifyData.verificationToken;

      // 2. Dispatch Role-Specific Registration
      let endpoint = `${API}/api/auth/register/student`;
      let payload = {
        name: name.trim(),
        phone: cleaned,
        password,
        verificationToken,
        level,
        group,
      };

      if (activeTab === "teacher") {
        endpoint = `${API}/api/auth/register/teacher`;
        payload = {
          name: name.trim(),
          phone: cleaned,
          email: teacherEmail.trim(),
          password,
          verificationToken,
          designation: designation.trim(),
          institution: institution.trim(),
        };
      } else if (activeTab === "organization") {
        endpoint = `${API}/api/auth/register/organization`;
        payload = {
          orgName: orgName.trim(),
          ownerName: name.trim(),
          phone: cleaned,
          password,
          verificationToken,
          location: location.trim(),
        };
      }

      const regRes = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const regData = await regRes.json();
      if (!regRes.ok || !regData.success) {
        setOtpError(regData.message || "Registration failed. Please try again.");
        setOtpLoading(false);
        return;
      }

      // Store authentic credentials
      localStorage.setItem("token", regData.token);
      localStorage.setItem("user", JSON.stringify(regData.user));

      setShowOtpModal(false);

      // Redirect directly to the authentic role dashboard
      if (regData.redirectUrl) {
        navigate(regData.redirectUrl, { replace: true });
      } else if (activeTab === "teacher") {
        navigate("/teacher", { replace: true });
      } else if (activeTab === "organization") {
        navigate("/organization", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("Registration Completion Error:", err);
      setOtpError("Network error while completing registration.");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#F8FAFC]">
      {/* ── LEFT BRAND PANEL (NAVY #101B35) ── */}
      <div className="w-full md:w-[45%] lg:w-[42%] bg-[#101B35] text-white p-8 md:p-12 lg:p-16 flex flex-col justify-between">
        <div>
          <ExaminoLogo light size="lg" to="/login" />

          <div className="mt-12 lg:mt-16">
            <span className="text-[11px] font-bold tracking-widest text-[#94A3B8] uppercase">
              Join Examino
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3 leading-snug tracking-tight">
              Start your academic and teaching journey today.
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-4 leading-relaxed font-normal max-w-md">
              Create an authentic account tailored to your educational needs. Students get full practice drill access, teachers get A4 paper builder tools, and coaching academies get multi-teacher workspaces.
            </p>

            {/* Feature Highlights */}
            <div className="mt-8 space-y-3 pt-6 border-t border-white/10 text-xs">
              <div className="flex items-center gap-3 text-slate-300">
                <span className="w-5 h-5 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center font-bold text-xs">✓</span>
                <span>Authentic NCTB & Board Exam question bank with 2,750+ questions</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <span className="w-5 h-5 rounded-full bg-[#2563EB]/20 text-[#60A5FA] flex items-center justify-center font-bold text-xs">✓</span>
                <span>Instant SMS OTP mobile verification for security & privacy</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <span className="w-5 h-5 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center font-bold text-xs">✓</span>
                <span>Dual language support: 🇧🇩 বাংলা মাধ্যম ও 🇬🇧 English Medium</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-xs text-[#64748B] flex items-center justify-between">
          <span>&copy; {new Date().getFullYear()} Examino Ltd.</span>
          <span className="font-medium">Dhaka, Bangladesh</span>
        </div>
      </div>

      {/* ── RIGHT REGISTRATION FORM PANEL ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-lg my-auto py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Create your account
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1.5">
              Select your role and verify your mobile number to get started.
            </p>
          </div>

          {/* Account Role Selector Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-[#F1F5F9] rounded-xl mb-6 border border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => {
                setActiveTab("student");
                setError("");
              }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                activeTab === "student"
                  ? "bg-white text-[#2563EB] shadow-xs ring-1 ring-[#2563EB]/20"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <span className="text-sm">👨‍🎓</span>
              <span>Student</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("teacher");
                setError("");
              }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                activeTab === "teacher"
                  ? "bg-white text-[#101B35] shadow-xs ring-1 ring-[#101B35]/20"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <span className="text-sm">👨‍🏫</span>
              <span>Teacher</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("organization");
                setError("");
              }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                activeTab === "organization"
                  ? "bg-white text-[#7C3AED] shadow-xs ring-1 ring-[#7C3AED]/20"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <span className="text-sm">🏫</span>
              <span>Coaching</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-xs font-semibold text-[#DC2626] flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleInitiateRegistration} className="space-y-4">
            {/* Organization Name (If Coaching) */}
            {activeTab === "organization" && (
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                  Coaching / Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nobodoy Academic Care, Mirpur"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#7C3AED] transition-all font-medium"
                />
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                {activeTab === "organization" ? "Director / Owner Name" : "Full Name"} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={activeTab === "teacher" ? "e.g. Prof. Shamsul Huda" : "e.g. Rahim Chowdhury"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] transition-all font-medium"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                Bangladeshi Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#64748B]">
                  +88
                </span>
                <input
                  type="tel"
                  required
                  placeholder="01XXXXXXXXX"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] transition-all font-medium tracking-wide"
                />
              </div>
              <p className="text-[11px] text-[#64748B] mt-1">
                A 6-digit OTP will be sent to this number for instant verification.
              </p>
            </div>

            {/* Student Specific: Level & Group */}
            {activeTab === "student" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                    Academic Level
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="HSC 2027">HSC 2027 (11th)</option>
                    <option value="HSC 2026">HSC 2026 (12th)</option>
                    <option value="SSC 2026">SSC 2026 (10th)</option>
                    <option value="SSC 2027">SSC 2027 (9th)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                    Discipline Group
                  </label>
                  <select
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="Science">Science (বিজ্ঞান)</option>
                    <option value="Commerce">Business (ব্যবসায়)</option>
                    <option value="Humanities">Humanities (মানবিক)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Teacher Specific: Email & Institution */}
            {activeTab === "teacher" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="teacher@institution.edu"
                    value={teacherEmail}
                    onChange={(e) => setTeacherEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#101B35]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                    Institution / College
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dhaka Residential Model"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#101B35]"
                  />
                </div>
              </div>
            )}

            {/* Organization Specific: Branch Location */}
            {activeTab === "organization" && (
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                  Campus / Branch Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mirpur-10, Dhaka"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>
            )}

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>
            </div>

            {/* Show Password Toggle */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-1.5 cursor-pointer text-[#64748B]">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-[#2563EB]"
                />
                <span>Show password characters</span>
              </label>
            </div>

            {/* Terms of Service */}
            <div className="pt-2">
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-[#2563EB] focus:ring-[#2563EB] border-[#CBD5E1]"
                />
                <span className="text-xs text-[#64748B] leading-relaxed">
                  I agree to Examino's{" "}
                  <span className="text-[#2563EB] font-semibold hover:underline">Terms of Service</span> and{" "}
                  <span className="text-[#2563EB] font-semibold hover:underline">Privacy Policy</span>.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 px-4 rounded-lg text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === "organization"
                  ? "bg-[#7C3AED] hover:bg-[#6D28D9]"
                  : activeTab === "teacher"
                  ? "bg-[#101B35] hover:bg-[#1E293B]"
                  : "bg-[#2563EB] hover:bg-[#1D4ED8]"
              } ${loading ? "opacity-75 cursor-wait" : ""}`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Preparing verification code...</span>
                </>
              ) : (
                <span>Verify Mobile & Register &rarr;</span>
              )}
            </button>
          </form>

          {/* Login Redirect */}
          <div className="mt-8 pt-6 border-t border-[#E2E8F0] text-center">
            <p className="text-xs text-[#64748B]">
              Already have an Examino account?{" "}
              <Link to="/login" className="font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ── 6-DIGIT OTP VERIFICATION MODAL ── */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#E2E8F0] animate-scaleUp">
            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto mb-3 text-xl">
                📱
              </div>
              <h3 className="text-xl font-extrabold text-[#0F172A]">
                Verify Your Mobile Number
              </h3>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                We sent a 6-digit verification code to{" "}
                <span className="font-bold text-[#0F172A]">{mobile}</span>. Enter it below to activate your account.
              </p>
            </div>

            {/* Test Mode Hint Banner */}
            {testOtpHint && (
              <div className="mb-4 p-2.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg text-xs font-semibold text-[#1D4ED8] text-center">
                Test Mode OTP: <span className="font-mono text-sm tracking-widest">{testOtpHint}</span>
              </div>
            )}

            {/* OTP Error Banner */}
            {otpError && (
              <div className="mb-4 p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg text-xs font-semibold text-[#DC2626] text-center">
                {otpError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleVerifyAndRegister} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-center text-[#64748B] uppercase tracking-wider mb-2">
                  Enter 6-Digit Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="------"
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/[^0-9]/g, ""))}
                  className="w-full text-center text-2xl font-mono tracking-[0.5em] py-3 bg-[#F8FAFC] border-2 border-[#CBD5E1] focus:border-[#2563EB] focus:bg-white rounded-xl text-[#0F172A] outline-none transition-all font-bold"
                />
              </div>

              {/* Resend Cooldown */}
              <div className="text-center text-xs">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={otpLoading}
                    className="font-bold text-[#2563EB] hover:underline cursor-pointer"
                  >
                    Didn't receive the SMS? Resend code
                  </button>
                ) : (
                  <span className="text-[#94A3B8]">
                    Resend code in <span className="font-bold text-[#0F172A]">{resendCooldown}s</span>
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={otpLoading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  {otpLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Confirm & Activate &rarr;</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
