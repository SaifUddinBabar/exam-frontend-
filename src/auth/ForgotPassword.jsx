import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import ExaminoLogo from "../components/ExaminoLogo";
import { sendFirebaseOtp, clearRecaptcha } from "../firebase/firebase";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Language Mode: 'bangla' | 'english'
  const [lang, setLang] = useState(() => localStorage.getItem("examino_language_mode") || "bangla");

  useEffect(() => {
    const handleLangChange = (e) => {
      setLang(e.detail?.mode || localStorage.getItem("examino_language_mode") || "bangla");
    };
    window.addEventListener("languageModeChanged", handleLangChange);
    return () => window.removeEventListener("languageModeChanged", handleLangChange);
  }, []);

  const toggleLang = () => {
    const next = lang === "bangla" ? "english" : "bangla";
    setLang(next);
    localStorage.setItem("examino_language_mode", next);
    window.dispatchEvent(new CustomEvent("languageModeChanged", { detail: { mode: next } }));
  };

  // Reset Mode: 'email' | 'phone_otp'
  const [resetMode, setResetMode] = useState("email");

  // Email Reset State
  const [email, setEmail] = useState("");
  const [emailStep, setEmailStep] = useState("request"); // 'request' | 'new_password'
  const [resetToken, setResetToken] = useState("");
  const [emailNewPassword, setEmailNewPassword] = useState("");
  const [emailConfirmPassword, setEmailConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check URL query parameters for direct reset link (e.g. from email)
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    const emailFromUrl = searchParams.get("email");
    if (tokenFromUrl) {
      setResetToken(tokenFromUrl);
      setEmailStep("new_password");
      setResetMode("email");
      if (emailFromUrl) setEmail(emailFromUrl);
    }
  }, [searchParams]);

  // Phone OTP Reset State
  const [phoneStep, setPhoneStep] = useState("phone"); // 'phone' | 'otp_and_password'
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [phoneNewPassword, setPhoneNewPassword] = useState("");
  const [phoneConfirmPassword, setPhoneConfirmPassword] = useState("");
  const [showPhonePassword, setShowPhonePassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [testOtpHint, setTestOtpHint] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  // Common UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Cooldown countdown for Phone OTP
  useEffect(() => {
    let timer;
    if (resetMode === "phone_otp" && phoneStep === "otp_and_password" && resendCooldown > 0) {
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
  }, [resetMode, phoneStep, resendCooldown]);

  const cleanPhone = (val) => val.replace(/[^0-9]/g, "");

  // ════════ EMAIL PASSWORD RESET FLOW ════════
  const handleRequestEmailReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email.trim() || !email.includes("@")) {
      setError(lang === "bangla" ? "অনুগ্রহ করে সঠিক ইমেইল ঠিকানা দিন।" : "Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/password/forgot-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || (lang === "bangla" ? "পাসওয়ার্ড রিসেট অনুরোধ ব্যর্থ হয়েছে।" : "Failed to process password reset request."));
        setLoading(false);
        return;
      }

      setSuccessMsg(
        lang === "bangla"
          ? "যদি এই ইমেইলটি নিবন্ধিত থাকে, তবে পাসওয়ার্ড পরিবর্তনের লিংক আপনার ইমেইলে পাঠানো হয়েছে। অনুগ্রহ করে ইনবক্স চেক করুন।"
          : "If an account with this email exists, password reset instructions have been dispatched to your inbox."
      );
    } catch (err) {
      console.error("Forgot Password Email Error:", err);
      setError(lang === "bangla" ? "নেটওয়ার্ক সমস্যার কারণে অনুরোধ পাঠানো যায়নি।" : "Network error while requesting password reset.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmEmailReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!emailNewPassword || emailNewPassword.length < 6) {
      setError(lang === "bangla" ? "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।" : "Password must be at least 6 characters.");
      return;
    }

    if (emailNewPassword !== emailConfirmPassword) {
      setError(lang === "bangla" ? "উভয় পাসওয়ার্ড হুবহু মিলতে হবে।" : "Passwords do not match.");
      return;
    }

    if (!resetToken) {
      setError(lang === "bangla" ? "রিসেট টোকেন অনুপস্থিত। পুনরায় রিসেট লিংকে ক্লিক করুন।" : "Missing reset token. Please check your reset link.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/password/reset-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resetToken,
          newPassword: emailNewPassword,
          confirmPassword: emailConfirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || (lang === "bangla" ? "পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।" : "Failed to update password."));
        setLoading(false);
        return;
      }

      setSuccessMsg(lang === "bangla" ? "পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! লগইন পেজে নিয়ে যাওয়া হচ্ছে..." : "Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login", {
          state: { message: lang === "bangla" ? "পাসওয়ার্ড সফলভাবে আপডেট হয়েছে। নতুন পাসওয়ার্ড দিয়ে লগইন করুন।" : "Password updated successfully. Please sign in with your new password." },
        });
      }, 1500);
    } catch (err) {
      console.error("Reset Password Email Error:", err);
      setError("Network error while updating password.");
    } finally {
      setLoading(false);
    }
  };

  // ════════ PHONE SMS OTP FLOW ════════
  const handleSendPhoneResetOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const cleaned = cleanPhone(phone);
    if (!cleaned || cleaned.length < 11) {
      setError(lang === "bangla" ? "সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন।" : "Please enter a valid 11-digit mobile number.");
      return;
    }

    setLoading(true);
    clearRecaptcha("reset-recaptcha-container");

    try {
      try {
        const confirmation = await sendFirebaseOtp(cleaned, "reset-recaptcha-container");
        setConfirmationResult(confirmation);
        setTestOtpHint("");
        setResendCooldown(60);
        setCanResend(false);
        setPhoneStep("otp_and_password");
        setLoading(false);
        return;
      } catch (fbErr) {
        console.warn("Firebase Reset OTP error, trying backend fallback:", fbErr);
        const res = await fetch(`${API}/api/auth/otp/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: cleaned, purpose: "password_reset" }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.message || fbErr.message || "Failed to dispatch password reset code.");
          setLoading(false);
          return;
        }

        setConfirmationResult(null);
        if (data.testOtp) {
          setTestOtpHint(data.testOtp);
          setOtp(data.testOtp);
        }

        setResendCooldown(data.resendCooldown || 60);
        setCanResend(false);
        setPhoneStep("otp_and_password");
      }
    } catch (err) {
      console.error("Reset OTP Error:", err);
      setError("Network error while requesting password reset.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendPhoneOtp = async () => {
    if (!canResend) return;
    setLoading(true);
    setError("");
    const cleaned = cleanPhone(phone);

    try {
      try {
        clearRecaptcha("reset-recaptcha-container");
        const confirmation = await sendFirebaseOtp(cleaned, "reset-recaptcha-container");
        setConfirmationResult(confirmation);
        setResendCooldown(60);
        setCanResend(false);
        setLoading(false);
        return;
      } catch (fbErr) {
        console.warn("Firebase resend error, trying backend fallback:", fbErr);
        const res = await fetch(`${API}/api/auth/otp/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: cleaned, purpose: "password_reset" }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setConfirmationResult(null);
          setResendCooldown(data.resendCooldown || 60);
          setCanResend(false);
          if (data.testOtp) {
            setTestOtpHint(data.testOtp);
            setOtp(data.testOtp);
          }
        } else {
          setError(data.message || fbErr.message || "Failed to resend code.");
        }
      }
    } catch {
      setError("Network error while resending code.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPhoneReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!otp || otp.trim().length !== 6) {
      setError(lang === "bangla" ? "৬ ডিজিটের ওটিপি কোড লিখুন।" : "Please enter the 6-digit verification code.");
      return;
    }

    if (!phoneNewPassword || phoneNewPassword.length < 6) {
      setError(lang === "bangla" ? "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।" : "New password must be at least 6 characters.");
      return;
    }

    if (phoneNewPassword !== phoneConfirmPassword) {
      setError(lang === "bangla" ? "উভয় পাসওয়ার্ড হুবহু মিলতে হবে।" : "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const cleaned = cleanPhone(phone);
      let firebaseToken = null;

      if (confirmationResult) {
        try {
          const userCredential = await confirmationResult.confirm(otp.trim());
          firebaseToken = await userCredential.user.getIdToken();
        } catch (fbConfirmErr) {
          console.error("Firebase OTP confirm error:", fbConfirmErr);
          setError(lang === "bangla" ? "ভুল বা মেয়াদোত্তীর্ণ ওটিপি কোড।" : "Incorrect or expired verification code.");
          setLoading(false);
          return;
        }
      }

      const res = await fetch(`${API}/api/auth/password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleaned,
          otp: otp.trim(),
          firebaseToken,
          newPassword: phoneNewPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Password reset failed. Please check the OTP code.");
        setLoading(false);
        return;
      }

      setSuccessMsg(lang === "bangla" ? "পাসওয়ার্ড সফলভাবে আপডেট হয়েছে! লগইন পেজে নিয়ে যাওয়া হচ্ছে..." : "Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login", {
          state: { message: lang === "bangla" ? "পাসওয়ার্ড আপডেট সম্পন্ন হয়েছে। লগইন করুন।" : "Password updated successfully. Please log in with your new password." },
        });
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
          <div className="flex items-center justify-between">
            <ExaminoLogo light size="lg" to="/login" />
            <button
              type="button"
              onClick={toggleLang}
              className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 border border-white/10"
              title="Change Language"
            >
              <span>{lang === "bangla" ? "🇧🇩 বাংলা" : "🇬🇧 English"}</span>
              <span className="text-[10px] text-slate-300">⇄</span>
            </button>
          </div>

          <div className="mt-14 lg:mt-20">
            <span className="text-[11px] font-bold tracking-widest text-[#94A3B8] uppercase">
              {lang === "bangla" ? "অ্যাকাউন্ট নিরাপত্তা ও পুনরুদ্ধার" : "Account Security & Recovery"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3 leading-snug tracking-tight">
              {lang === "bangla" ? "আপনার এক্সামিনো পাসওয়ার্ড রিসেট করুন।" : "Reset your Examino account password."}
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-4 leading-relaxed font-normal max-w-md">
              {lang === "bangla"
                ? "আপনার নিবন্ধিত ইমেইল ঠিকানা অথবা মোবাইল ওটিপি যাচাইকরণের মাধ্যমে নিরাপদে পাসওয়ার্ড পুনরুদ্ধার করুন।"
                : "Recover access securely through your registered email address or SMS verification code."}
            </p>
          </div>
        </div>

        <div className="mt-12 text-xs text-[#64748B] flex items-center justify-between">
          <span>&copy; {new Date().getFullYear()} Examino Ltd.</span>
          <span className="font-medium">{lang === "bangla" ? "ঢাকা, বাংলাদেশ" : "Dhaka, Bangladesh"}</span>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-semibold mb-3">
                <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                <span>{lang === "bangla" ? "পাসওয়ার্ড পুনরুদ্ধার" : "Password Recovery"}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {lang === "bangla" ? "পাসওয়ার্ড ভুলে গেছেন?" : "Forgot your password?"}
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1.5">
                {lang === "bangla" ? "পাসওয়ার্ড রিসেটের উপযুক্ত মাধ্যম নির্বাচন করুন।" : "Choose your recovery method below."}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleLang}
              className="md:hidden px-2 py-1 rounded border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-xs"
            >
              {lang === "bangla" ? "English" : "বাংলা"}
            </button>
          </div>

          {/* Reset Mode Tabs */}
          <div className="flex bg-[#F1F5F9] p-1 rounded-xl mb-6 border border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => {
                setResetMode("email");
                setError("");
                setSuccessMsg("");
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                resetMode === "email"
                  ? "bg-white text-[#0F172A] shadow-xs"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              {lang === "bangla" ? "ইমেইলের মাধ্যমে" : "Reset via Email"}
            </button>
            <button
              type="button"
              onClick={() => {
                setResetMode("phone_otp");
                setError("");
                setSuccessMsg("");
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                resetMode === "phone_otp"
                  ? "bg-white text-[#2563EB] shadow-xs"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <span>{lang === "bangla" ? "মোবাইল ওটিপি" : "Reset via Phone OTP"}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-[#EFF6FF] text-[#2563EB]">
                OTP
              </span>
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-xs font-semibold text-[#DC2626] flex items-start gap-2">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-5 p-3.5 bg-[#F0FDF4] border border-[#86EFAC] rounded-xl text-xs font-semibold text-[#16A34A] flex items-start gap-2">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{successMsg}</span>
            </div>
          )}

          {/* ════════ RESET VIA EMAIL ════════ */}
          {resetMode === "email" && (
            <div>
              {emailStep === "request" ? (
                <form onSubmit={handleRequestEmailReset} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                      {lang === "bangla" ? "নিবন্ধিত ইমেইল ঠিকানা" : "Registered Email Address"}
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all font-medium"
                    />
                    <p className="text-[11px] text-[#64748B] mt-1.5">
                      {lang === "bangla"
                        ? "আমরা এই ঠিকানায় পাসওয়ার্ড রিসেট করার একটি নিরাপদ লিংক পাঠাব।"
                        : "We will send a secure link to this email address to reset your password."}
                    </p>
                  </div>

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
                        <span>{lang === "bangla" ? "ইমেইল পাঠানো হচ্ছে..." : "Sending Instructions..."}</span>
                      </>
                    ) : (
                      <span>{lang === "bangla" ? "রিসেট লিংক পাঠান →" : "Send Reset Link →"}</span>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleConfirmEmailReset} className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                      {lang === "bangla" ? "নতুন পাসওয়ার্ড" : "New Password"}
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        placeholder={lang === "bangla" ? "কমপক্ষে ৬ অক্ষর" : "Min 6 characters"}
                        value={emailNewPassword}
                        onChange={(e) => setEmailNewPassword(e.target.value)}
                        className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] focus:outline-none p-1"
                        title={showNewPassword ? "Hide" : "Show"}
                      >
                        {showNewPassword ? (
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

                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                      {lang === "bangla" ? "নতুন পাসওয়ার্ড নিশ্চিতকরণ" : "Confirm New Password"}
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        placeholder={lang === "bangla" ? "পুনরায় লিখুন" : "Re-enter new password"}
                        value={emailConfirmPassword}
                        onChange={(e) => setEmailConfirmPassword(e.target.value)}
                        className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] focus:outline-none p-1"
                        title={showConfirmPassword ? "Hide" : "Show"}
                      >
                        {showConfirmPassword ? (
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
                        <span>{lang === "bangla" ? "আপডেট করা হচ্ছে..." : "Updating Password..."}</span>
                      </>
                    ) : (
                      <span>{lang === "bangla" ? "পাসওয়ার্ড আপডেট সম্পন্ন করুন →" : "Update Password →"}</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ════════ RESET VIA PHONE SMS OTP ════════ */}
          {resetMode === "phone_otp" && (
            <div>
              <div id="reset-recaptcha-container" className="flex justify-center my-2"></div>

              {phoneStep === "phone" ? (
                <form onSubmit={handleSendPhoneResetOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                      {lang === "bangla" ? "নিবন্ধিত মোবাইল নম্বর" : "Registered Mobile Number"}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-xs font-bold text-[#64748B]">
                        +88
                      </div>
                      <input
                        type="tel"
                        required
                        maxLength={11}
                        placeholder="017XXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-12 pr-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all font-medium tracking-wider"
                      />
                    </div>
                  </div>

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
                        <span>{lang === "bangla" ? "এসএমএস কোড পাঠানো হচ্ছে..." : "Dispatching SMS Code..."}</span>
                      </>
                    ) : (
                      <span>{lang === "bangla" ? "রিকভারি কোড পাঠান →" : "Send Recovery Code →"}</span>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleConfirmPhoneReset} className="space-y-4 animate-fadeIn">
                  {testOtpHint && (
                    <div className="p-2.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg text-xs font-semibold text-[#1D4ED8] text-center">
                      Test Mode OTP: <span className="font-mono text-sm tracking-widest">{testOtpHint}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                      {lang === "bangla" ? "৬ ডিজিটের এসএমএস কোড" : "6-Digit SMS Code"}
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      autoFocus
                      placeholder="• • • • • •"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-full text-center tracking-[0.5em] text-xl font-bold py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-[#0F172A] placeholder-[#CBD5E1] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                      {lang === "bangla" ? "নতুন পাসওয়ার্ড" : "New Password"}
                    </label>
                    <div className="relative">
                      <input
                        type={showPhonePassword ? "text" : "password"}
                        required
                        placeholder={lang === "bangla" ? "কমপক্ষে ৬ অক্ষর" : "Min 6 characters"}
                        value={phoneNewPassword}
                        onChange={(e) => setPhoneNewPassword(e.target.value)}
                        className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPhonePassword(!showPhonePassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] focus:outline-none p-1"
                        title={showPhonePassword ? "Hide" : "Show"}
                      >
                        {showPhonePassword ? (
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

                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                      {lang === "bangla" ? "নতুন পাসওয়ার্ড নিশ্চিতকরণ" : "Confirm New Password"}
                    </label>
                    <input
                      type="password"
                      required
                      placeholder={lang === "bangla" ? "পুনরায় লিখুন" : "Re-enter new password"}
                      value={phoneConfirmPassword}
                      onChange={(e) => setPhoneConfirmPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all font-medium"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleResendPhoneOtp}
                        className="font-bold text-[#2563EB] hover:underline"
                      >
                        {lang === "bangla" ? "কোড পাননি? পুনরায় পাঠান" : "Resend code"}
                      </button>
                    ) : (
                      <span className="text-[#94A3B8]">
                        {lang === "bangla" ? "পুনরায় কোড পাঠাতে অপেক্ষা করুন: " : "Resend in "}
                        <span className="font-bold text-[#0F172A]">{resendCooldown}s</span>
                      </span>
                    )}
                  </div>

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
                        <span>{lang === "bangla" ? "আপডেট হচ্ছে..." : "Updating Password..."}</span>
                      </>
                    ) : (
                      <span>{lang === "bangla" ? "পাসওয়ার্ড রিসেট সম্পন্ন করুন →" : "Reset Password →"}</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Back to Login */}
          <div className="mt-8 pt-6 border-t border-[#E2E8F0] text-center">
            <p className="text-xs text-[#64748B]">
              {lang === "bangla" ? "পাসওয়ার্ড মনে পড়েছে?" : "Remembered your credentials?"}{" "}
              <Link to="/login" className="font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:underline">
                {lang === "bangla" ? "সাইন ইন করুন" : "Sign in"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
