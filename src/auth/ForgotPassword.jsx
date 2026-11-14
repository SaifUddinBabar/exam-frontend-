import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ExaminoLogo from "../components/ExaminoLogo";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ForgotPassword() {
  const navigate = useNavigate();

  // Step 1: 'phone' -> Step 2: 'otp_and_password' -> Step 3: 'success'
  const [step, setStep] = useState("phone");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [resendCooldown, setResendCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [testOtpHint, setTestOtpHint] = useState("");

  // Cooldown countdown
  useEffect(() => {
    let timer;
    if (step === "otp_and_password" && resendCooldown > 0) {
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
  }, [step, resendCooldown]);

  const cleanPhone = (val) => val.replace(/[^0-9]/g, "");

  // Step 1: Send Reset OTP
  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    setError("");

    const cleaned = cleanPhone(phone);
    if (!cleaned || cleaned.length < 11) {
      setError("Please enter a valid 11-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleaned, purpose: "password_reset" }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Failed to dispatch password reset code.");
        setLoading(false);
        return;
      }

      if (data.testOtp) {
        setTestOtpHint(data.testOtp);
        setOtp(data.testOtp);
      }

      setResendCooldown(data.resendCooldown || 60);
      setCanResend(false);
      setStep("otp_and_password");
    } catch (err) {
      console.error("Reset OTP Error:", err);
      setError("Network error while requesting password reset.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    setLoading(true);
    setError("");
    try {
      const cleaned = cleanPhone(phone);
      const res = await fetch(`${API}/api/auth/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleaned, purpose: "password_reset" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResendCooldown(data.resendCooldown || 60);
        setCanResend(false);
        if (data.testOtp) {
          setTestOtpHint(data.testOtp);
          setOtp(data.testOtp);
        }
      } else {
        setError(data.message || "Failed to resend code.");
      }
    } catch {
      setError("Network error while resending code.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Verify OTP & Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp || otp.trim().length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const cleaned = cleanPhone(phone);
      const res = await fetch(`${API}/api/auth/password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleaned,
          otp: otp.trim(),
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Password reset failed. Please check the OTP code.");
        setLoading(false);
        return;
      }

      setSuccessMsg("Password reset successfully! Redirecting to login...");
      setStep("success");
      setTimeout(() => {
        navigate("/login", { state: { message: "Password updated successfully. Please log in with your new password." } });
      }, 1500);
    } catch (err) {
      console.error("Reset Error:", err);
      setError("Network error while resetting password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#F8FAFC]">
      {/* ── LEFT BRAND PANEL ── */}
      <div className="w-full md:w-[45%] lg:w-[42%] bg-[#101B35] text-white p-8 md:p-12 lg:p-16 flex flex-col justify-between">
        <div>
          <ExaminoLogo light size="lg" to="/login" />

          <div className="mt-14 lg:mt-20">
            <span className="text-[11px] font-bold tracking-widest text-[#94A3B8] uppercase">
              Account Recovery
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3 leading-snug tracking-tight">
              Reset your Examino password securely.
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-4 leading-relaxed font-normal max-w-md">
              We protect your account using encrypted SMS OTP verification. Enter your registered mobile number to receive a one-time verification code and create a new password.
            </p>
          </div>
        </div>

        <div className="mt-12 text-xs text-[#64748B] flex items-center justify-between">
          <span>&copy; {new Date().getFullYear()} Examino Ltd.</span>
          <span className="font-medium">Secure OTP Recovery</span>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] hover:underline mb-4">
              &larr; Back to sign in
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              {step === "phone" ? "Forgot your password?" : "Create new password"}
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-2">
              {step === "phone"
                ? "Enter the mobile number associated with your account."
                : `Enter the code sent to ${phone} and set your new password.`}
            </p>
          </div>

          {/* Test Mode Banner */}
          {testOtpHint && (
            <div className="mb-4 p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl text-xs font-semibold text-[#1D4ED8] text-center">
              Test Mode OTP: <span className="font-mono text-sm tracking-widest">{testOtpHint}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-xs font-semibold text-[#DC2626] flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-5 p-3.5 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl text-xs font-semibold text-[#059669] flex items-center gap-2">
              <span>✓ {successMsg}</span>
            </div>
          )}

          {/* STEP 1: Phone input */}
          {step === "phone" && (
            <form onSubmit={handleSendResetOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                  Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#64748B]">
                    +88
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="01XXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? "Sending code..." : "Send Verification Code \u2192"}
              </button>
            </form>
          )}

          {/* STEP 2: OTP & New Password */}
          {step === "otp_and_password" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="------"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                  className="w-full text-center text-xl font-mono tracking-[0.5em] py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#2563EB] font-bold"
                />
                <div className="mt-1.5 text-right text-xs">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="text-[#2563EB] font-bold hover:underline"
                    >
                      Resend OTP code
                    </button>
                  ) : (
                    <span className="text-[#94A3B8]">
                      Resend available in <span className="font-bold text-[#0F172A]">{resendCooldown}s</span>
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="flex items-center text-xs pt-1">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? "Updating password..." : "Confirm Password Reset \u2192"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
