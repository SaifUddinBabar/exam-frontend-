import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ExaminoLogo from "../components/ExaminoLogo";
import Icon from "../teacher/components/Icon";
import { sendFirebaseOtp, clearRecaptcha, signInWithGoogle } from "../firebase/firebase";
import { triggerHaptic } from "../utils/haptics";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function CommonLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  // Teacher Access Mode Toggle
  const [isTeacherMode, setIsTeacherMode] = useState(() => {
    return new URLSearchParams(location.search).get("teacher") === "true";
  });
  const [teacherPasscode, setTeacherPasscode] = useState("");
  const [showTeacherPasscode, setShowTeacherPasscode] = useState(false);

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
    triggerHaptic("light");
    const next = lang === "bangla" ? "english" : "bangla";
    setLang(next);
    localStorage.setItem("examino_language_mode", next);
    window.dispatchEvent(new CustomEvent("languageModeChanged", { detail: { mode: next } }));
  };

  // Login Mode: 'email' | 'phone_otp'
  const [loginMode, setLoginMode] = useState("email");

  // Email/Password Login State
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Field Touched / Validation States
  const [identifierTouched, setIdentifierTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Phone OTP Login State
  const [phoneForOtp, setPhoneForOtp] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [cooldown, setCooldown] = useState(60);

  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(location.state?.message || "");

  const handleSuccessfulAuth = (data) => {
    triggerHaptic("success");
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    if (data.memberships) {
      localStorage.setItem("examino_memberships", JSON.stringify(data.memberships));
    }

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
      navigate("/dashboard", { replace: true });
    }
  };

  // 1. Google Sign-In (Firebase GoogleAuthProvider popup)
  const handleGoogleSignIn = async () => {
    triggerHaptic("medium");
    setError("");

    if (isTeacherMode && !teacherPasscode.trim()) {
      setError(lang === "bangla" ? "দয়া করে প্রথমে আপনার গোপন শিক্ষক পাসকোড লিখুন।" : "Please enter your secret Teacher Passcode first.");
      return;
    }

    setGoogleLoading(true);

    try {
      const { idToken } = await signInWithGoogle();

      // If in Teacher mode, verify using Teacher verification endpoint
      if (isTeacherMode) {
        const res = await fetch(`${API}/api/auth/teacher-verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idToken,
            teacherPasscode: teacherPasscode.trim(),
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.message || (lang === "bangla" ? "শিক্ষক আইডি যাচাইকরণ ব্যর্থ হয়েছে।" : "Teacher verification failed."));
          setGoogleLoading(false);
          return;
        }

        handleSuccessfulAuth(data);
        return;
      }

      // Default Student Google Login
      const res = await fetch(`${API}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, desiredRole: "student" }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || (lang === "bangla" ? "গুগল সাইন-ইন সম্পন্ন করা সম্ভব হয়নি।" : "Failed to authenticate with Google."));
        setGoogleLoading(false);
        return;
      }

      handleSuccessfulAuth(data);
    } catch (err) {
      console.error("Google Sign-In Error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError(lang === "bangla" ? "গুগল সাইন-ইন পপআপ বন্ধ করা হয়েছিল। অনুগ্রহ করে গুগল উইন্ডো থেকে আপনার অ্যাকাউন্ট সিলেক্ট করুন।" : "Google sign-in popup was closed. Please select your Google account to proceed.");
      } else if (err.code === "auth/unauthorized-domain") {
        setError(lang === "bangla" ? "এই ডোমেইনটি ফায়ারবেসে অনুমোদিত নয়।" : "This domain is not authorized in Firebase Console.");
      } else {
        setError(err.message || (lang === "bangla" ? "গুগল সাইন-ইন ব্যর্থ হয়েছে।" : "Failed to sign in with Google."));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // Direct Teacher Login with Passcode alone
  const handleTeacherPasscodeDirectLogin = async (e) => {
    if (e) e.preventDefault();
    if (!teacherPasscode.trim()) {
      setError(lang === "bangla" ? "দয়া করে গোপন শিক্ষক পাসকোড লিখুন।" : "Please enter your secret Teacher Passcode.");
      return;
    }
    triggerHaptic("heavy");
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/api/auth/teacher-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherPasscode: teacherPasscode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || (lang === "bangla" ? "ভুল শিক্ষক পাসকোড।" : "Invalid Teacher Passcode."));
        setLoading(false);
        return;
      }

      handleSuccessfulAuth(data);
    } catch (err) {
      console.error("Teacher Passcode Login Error:", err);
      setError(lang === "bangla" ? "সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি।" : "Could not connect to server.");
      setLoading(false);
    }
  };

  // 2. Email & Password Login
  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();
    triggerHaptic("medium");
    setError("");
    setIdentifierTouched(true);
    setPasswordTouched(true);

    if (!identifier.trim()) {
      setError(lang === "bangla" ? "অনুগ্রহ করে আপনার নিবন্ধিত ইমেইল বা মোবাইল নম্বর দিন।" : "Please enter your registered email address or mobile number.");
      return;
    }

    if (!password) {
      setError(lang === "bangla" ? "অনুগ্রহ করে পাসওয়ার্ড দিন।" : "Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      // If Teacher mode -> use teacher-verify endpoint
      if (isTeacherMode) {
        const res = await fetch(`${API}/api/auth/teacher-verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: identifier.trim(),
            password,
            teacherPasscode: teacherPasscode.trim(),
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.message || (lang === "bangla" ? "ভুল শিক্ষক তথ্য অথবা পাসওয়ার্ড।" : "Invalid teacher credentials or passcode."));
          setLoading(false);
          return;
        }

        handleSuccessfulAuth(data);
        return;
      }

      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || (lang === "bangla" ? "ভুল মোবাইল/ইমেইল অথবা পাসওয়ার্ড।" : "Invalid credentials. Please verify your email/mobile and password."));
        setLoading(false);
        return;
      }

      handleSuccessfulAuth(data);
    } catch (err) {
      console.error("Login Error:", err);
      setError(lang === "bangla" ? "সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি।" : "Unable to reach Examino backend. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Send Phone OTP via Firebase
  const handleSendLoginOtp = async (e) => {
    e.preventDefault();
    setError("");

    const cleaned = phoneForOtp.replace(/[^0-9]/g, "");
    if (!cleaned || cleaned.length < 11) {
      setError(lang === "bangla" ? "সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।" : "Please enter a valid 11-digit Bangladeshi mobile number.");
      return;
    }

    setLoading(true);
    clearRecaptcha("login-recaptcha-container");

    try {
      const confirmation = await sendFirebaseOtp(cleaned, "login-recaptcha-container");
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setCooldown(60);
    } catch (err) {
      console.error("Firebase Login OTP Error:", err);
      setError(err.message || (lang === "bangla" ? "এসএমএস কোড পাঠানো সম্ভব হয়নি।" : "Failed to dispatch verification code via Firebase SMS."));
    } finally {
      setLoading(false);
    }
  };

  // 4. Verify Phone OTP & Complete Firebase Login
  const handleVerifyOtpLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!otpCode || otpCode.trim().length !== 6) {
      setError(lang === "bangla" ? "সঠিক ৬ ডিজিটের কোডটি লিখুন।" : "Please enter the complete 6-digit SMS code.");
      return;
    }

    if (!confirmationResult) {
      setError(lang === "bangla" ? "সেশনের মেয়াদ শেষ। পুনরায় ওটিপি পাঠান।" : "Session expired. Please request a new OTP.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await confirmationResult.confirm(otpCode.trim());
      const idToken = await userCredential.user.getIdToken();

      const res = await fetch(`${API}/api/auth/firebase-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.notRegistered) {
          setError(lang === "bangla" ? "এই নম্বরে কোনো এক্সামিনো অ্যাকাউন্ট নেই। অনুগ্রহ করে রেজিস্ট্রেশন করুন।" : "No Examino account found with this number. Please register first.");
        } else {
          setError(data.message || (lang === "bangla" ? "লগইন সম্পন্ন করা সম্ভব হয়নি।" : "Failed to authenticate with Firebase."));
        }
        setLoading(false);
        return;
      }

      handleSuccessfulAuth(data);
    } catch (err) {
      console.error("OTP Verification Error:", err);
      setError(lang === "bangla" ? "ভুল বা মেয়াদোত্তীর্ণ ওটিপি কোড। পুনরায় চেষ্টা করুন।" : "Incorrect or expired verification code. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#F8FAFC]">
      {/* ── LEFT BRAND PANEL (NAVY #101B35) ── */}
      <div className="w-full md:w-[45%] lg:w-[42%] bg-[#101B35] text-white p-8 md:p-12 lg:p-16 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <ExaminoLogo light size="lg" to="/login" />
            {/* Language Switcher Badge on Brand Panel */}
            <button
              type="button"
              onClick={toggleLang}
              className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 border border-white/10"
              title="Change Language"
            >
              <span>{lang === "bangla" ? "বাংলা" : "English"}</span>
              <span className="text-[10px] text-slate-300">⇄</span>
            </button>
          </div>

          <div className="mt-14 lg:mt-20">
            <span className="text-[11px] font-bold tracking-widest text-[#94A3B8] uppercase">
              {lang === "bangla" ? "সম্মিলিত শিক্ষামূলক প্ল্যাটফর্ম" : "Unified Platform Access"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3 leading-snug tracking-tight">
              {lang === "bangla"
                ? "শিক্ষার্থী, শিক্ষক ও কোচিং সেন্টারের জন্য একটি সমন্বিত প্ল্যাটফর্ম।"
                : "One account for students, teachers, and coaching centers."}
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-4 leading-relaxed font-normal max-w-md">
              {lang === "bangla"
                ? "প্রমাণিক এনসিটিবি ও বোর্ড পরীক্ষার প্রশ্নব্যাংক, অনুশীলন সেশন, শিক্ষক প্রশ্নপত্র তৈরি এবং ফলাফল বিশ্লেষণ।"
                : "Access authentic NCTB and board exams, interactive practice drill, A4 question paper builder, and institute performance analytics."}
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3 pt-6 border-t border-white/10 text-xs">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <Icon name="book" size={18} className="block mb-1 text-examino-blue" />
                <span className="font-bold block text-white">{lang === "bangla" ? "শিক্ষার্থী" : "Student"}</span>
                <span className="text-[10px] text-[#94A3B8]">{lang === "bangla" ? "পরীক্ষা ও প্র্যাকটিস" : "Exams & Practice"}</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <Icon name="clipboard" size={18} className="block mb-1 text-examino-blue" />
                <span className="font-bold block text-white">{lang === "bangla" ? "শিক্ষক" : "Teacher"}</span>
                <span className="text-[10px] text-[#94A3B8]">{lang === "bangla" ? "প্রশ্নপত্র ও রেজাল্ট" : "Paper & Analytics"}</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <Icon name="globe" size={18} className="block mb-1 text-examino-blue" />
                <span className="font-bold block text-white">{lang === "bangla" ? "কোচিং" : "Coaching"}</span>
                <span className="text-[10px] text-[#94A3B8]">{lang === "bangla" ? "ম্যানেজমেন্ট" : "Workspaces"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-xs text-[#64748B] flex items-center justify-between">
          <span>&copy; {new Date().getFullYear()} Examino Ltd.</span>
          <span className="font-medium">{lang === "bangla" ? "বাংলাদেশ এডটেক" : "EdTech for Bangladesh"}</span>
        </div>
      </div>

      {/* ── RIGHT LOGIN FORM PANEL ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16">
        <div className="w-full max-w-md">
          {/* Form Header with Language Toggle */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              {isTeacherMode ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-3 border border-amber-200">
                  <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                  <span><Icon name="clipboard" size={15} className="inline-block align-[-3px]" /> {lang === "bangla" ? "শিক্ষক ও এডমিন কন্ট্রোল" : "Teacher & Admin Control"}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-semibold mb-3">
                  <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
                  <span><Icon name="book" size={15} className="inline-block align-[-3px]" /> {lang === "bangla" ? "শিক্ষার্থী পোর্টাল লগইন" : "Student Portal Sign In"}</span>
                </div>
              )}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {isTeacherMode
                  ? (lang === "bangla" ? "শিক্ষক প্যানেলে প্রবেশ" : "Teacher Portal Login")
                  : (lang === "bangla" ? "এক্সামিনোতে সাইন ইন" : "Sign in to Examino")}
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1.5">
                {isTeacherMode
                  ? (lang === "bangla"
                      ? "গোপন শিক্ষক পাসকোড দিয়ে গুগল বা ইমেইল মারফত সম্পূর্ণ এডমিন কন্ট্রোল নিন।"
                      : "Access complete exam & question controls with your secret Teacher Passcode.")
                  : (lang === "bangla"
                      ? "আপনার সুবিধাজনক মাধ্যমে ড্যাশবোর্ডে প্রবেশ করুন।"
                      : "Choose your preferred sign-in method to access your dashboard.")}
              </p>
            </div>
            {/* Secondary Language Switcher button for mobile */}
            <button
              type="button"
              onClick={toggleLang}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50"
            >
              {lang === "bangla" ? "English" : "বাংলা"}
            </button>
          </div>

          {/* Teacher Passcode Input Box (When Teacher Mode is Active) */}
          {isTeacherMode && (
            <div className="mb-5 p-4 bg-amber-50/90 border border-amber-300 rounded-xl shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-extrabold text-amber-900 tracking-wide flex items-center gap-1.5">
                  <Icon name="lock" size={14} />
                  <span>{lang === "bangla" ? "গোপন শিক্ষক পাসকোড *" : "Secret Teacher Passcode *"}</span>
                </label>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-md">
                  {lang === "bangla" ? "সিক্রেট কি" : "Secret Key"}
                </span>
              </div>
              <div className="relative mb-2.5">
                <input
                  type={showTeacherPasscode ? "text" : "password"}
                  required
                  value={teacherPasscode}
                  onChange={(e) => setTeacherPasscode(e.target.value)}
                  placeholder={lang === "bangla" ? "গোপন পাসকোড টাইপ করুন..." : "Enter secret passcode..."}
                  className="w-full px-3.5 py-2.5 pr-10 bg-white border border-amber-300 rounded-lg text-sm font-mono font-bold tracking-widest text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowTeacherPasscode(!showTeacherPasscode)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-700 hover:text-amber-900 focus:outline-none p-1"
                  tabIndex="-1"
                  title={showTeacherPasscode ? "Hide Passcode" : "Show Passcode"}
                >
                  {showTeacherPasscode ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Direct Fast Unlock Button with Passcode */}
              <button
                type="button"
                onClick={handleTeacherPasscodeDirectLogin}
                disabled={loading || !teacherPasscode.trim()}
                className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Icon name="lock" size={16} />
                    <span>{lang === "bangla" ? "পাসকোড দিয়ে সরাসরি প্রবেশ" : "Direct Unlock with Passcode"}</span>
                    <Icon name="arrowRight" size={16} />
                  </>
                )}
              </button>
              <p className="text-[11px] text-amber-800 mt-2 text-center">
                {lang === "bangla"
                  ? "শুধুমাত্র পাসকোড টাইপ করে সরাসরি ঢুকতে পারেন অথবা নিচে গুগল/ইমেইল সিলেক্ট করুন।"
                  : "Enter passcode directly above or combine with Google / Email login below."}
              </p>
            </div>
          )}

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

          {/* ════════ METHOD 1: PROMINENT GOOGLE SIGN-IN BUTTON ════════ */}
          <div className="mb-5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className={`w-full py-2.5 px-4 rounded-xl border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#0F172A] text-sm font-semibold shadow-xs hover:shadow transition-all flex items-center justify-center gap-3 relative ${
                googleLoading ? "opacity-75 cursor-wait" : ""
              }`}
            >
              {googleLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
                  <span>{lang === "bangla" ? "গুগলে যুক্ত হচ্ছে..." : "Connecting with Google..."}</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>
                    {isTeacherMode
                      ? (lang === "bangla" ? "গুগল দিয়ে শিক্ষক প্রবেশ" : "Continue with Google (Teacher)")
                      : (lang === "bangla" ? "গুগল দিয়ে প্রবেশ করুন" : "Continue with Google")}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* ════════ OR DIVIDER ════════ */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E2E8F0]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#F8FAFC] px-3 text-[#94A3B8] font-bold tracking-wider">
                {lang === "bangla" ? "অথবা সাইন ইন করুন" : "Or sign in with"}
              </span>
            </div>
          </div>

          {/* ════════ METHOD 2 & 3 TABS ════════ */}
          <div className="flex bg-[#F1F5F9] p-1 rounded-xl mb-5 border border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => {
                setLoginMode("email");
                setError("");
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                loginMode === "email"
                  ? "bg-white text-[#0F172A] shadow-xs"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              {lang === "bangla" ? "ইমেইল ও পাসওয়ার্ড" : "Email & Password"}
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode("phone_otp");
                setError("");
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                loginMode === "phone_otp"
                  ? "bg-white text-[#2563EB] shadow-xs"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <span>{lang === "bangla" ? "মোবাইল এসএমএস" : "Phone SMS OTP"}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-[#EFF6FF] text-[#2563EB]">
                OTP
              </span>
            </button>
          </div>

          {/* ════════ TAB CONTENT ════════ */}
          {loginMode === "email" ? (
            /* METHOD 2: Email & Password */
            <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                  {lang === "bangla" ? "ইমেইল বা মোবাইল নম্বর" : "Email Address or Mobile"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder={lang === "bangla" ? "user@example.com অথবা 017XXXXXXXX" : "user@example.com or 017XXXXXXXX"}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    onBlur={() => setIdentifierTouched(true)}
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none transition-all font-medium ${
                      identifierTouched && !identifier.trim()
                        ? "border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20"
                        : "border-[#CBD5E1] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                    }`}
                  />
                </div>
                {identifierTouched && !identifier.trim() && (
                  <p className="text-[11px] text-[#EF4444] mt-1">
                    {lang === "bangla" ? "ইমেইল বা মোবাইল নম্বর দিন।" : "Please enter your email or mobile."}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                    {lang === "bangla" ? "পাসওয়ার্ড" : "Password"}
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] hover:underline"
                  >
                    {lang === "bangla" ? "পাসওয়ার্ড ভুলে গেছেন?" : "Forgot password?"}
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder={lang === "bangla" ? "আপনার পাসওয়ার্ড লিখুন" : "Enter your password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setPasswordTouched(true)}
                    className={`w-full pl-3.5 pr-10 py-2.5 bg-white border rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none transition-all font-medium ${
                      passwordTouched && !password
                        ? "border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20"
                        : "border-[#CBD5E1] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                    }`}
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

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB] border-[#CBD5E1]"
                  />
                  <span className="text-xs text-[#64748B] font-medium">
                    {lang === "bangla" ? "লগইন তথ্য মনে রাখুন" : "Remember my session"}
                  </span>
                </label>
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
                    <span>{lang === "bangla" ? "যাচাই করা হচ্ছে..." : "Signing in..."}</span>
                  </>
                ) : (
                  <span>{lang === "bangla" ? "ড্যাশবোর্ডে প্রবেশ করুন →" : "Sign in to Dashboard →"}</span>
                )}
              </button>
            </form>
          ) : (
            /* METHOD 3: Phone SMS OTP */
            <div className="space-y-4">
              <div id="login-recaptcha-container" className="flex justify-center my-2"></div>

              {!otpSent ? (
                <form onSubmit={handleSendLoginOtp} className="space-y-4">
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
                        value={phoneForOtp}
                        onChange={(e) => setPhoneForOtp(e.target.value)}
                        className="w-full pl-12 pr-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all font-medium tracking-wider"
                      />
                    </div>
                    <p className="text-[11px] text-[#64748B] mt-1.5">
                      {lang === "bangla"
                        ? "আপনার মোবাইল নম্বরে একটি ৬ ডিজিটের এসএমএস ওটিপি কোড পাঠানো হবে।"
                        : "We will dispatch a 6-digit verification code to this phone number via SMS."}
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
                        <span>{lang === "bangla" ? "এসএমএস পাঠানো হচ্ছে..." : "Dispatching SMS Code..."}</span>
                      </>
                    ) : (
                      <span>{lang === "bangla" ? "ভেরিফিকেশন কোড পাঠান →" : "Send Verification Code →"}</span>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtpLogin} className="space-y-4 animate-fadeIn">
                  <div className="p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl text-xs text-[#1E40AF] flex items-center justify-between">
                    <span>
                      {lang === "bangla" ? "কোড পাঠানো হয়েছে: " : "Code dispatched to: "}
                      <b>{phoneForOtp}</b>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtpCode("");
                        clearRecaptcha("login-recaptcha-container");
                      }}
                      className="text-[#2563EB] font-bold underline text-[11px]"
                    >
                      {lang === "bangla" ? "নম্বর পরিবর্তন" : "Change Number"}
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5 text-center">
                      {lang === "bangla" ? "৬ ডিজিটের এসএমএস কোড লিখুন" : "Enter 6-Digit SMS Code"}
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      autoFocus
                      placeholder="• • • • • •"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-full text-center tracking-[0.5em] text-xl font-bold py-3 bg-white border border-[#CBD5E1] rounded-xl text-[#0F172A] placeholder-[#CBD5E1] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
                    />
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
                        <span>{lang === "bangla" ? "যাচাই করা হচ্ছে..." : "Verifying & Signing In..."}</span>
                      </>
                    ) : (
                      <span>{lang === "bangla" ? "যাচাই করুন ও ড্যাশবোর্ডে প্রবেশ করুন →" : "Verify & Enter Dashboard →"}</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Registration Redirect */}
          <div className="mt-8 pt-6 border-t border-[#E2E8F0] text-center">
            <p className="text-xs text-[#64748B]">
              {lang === "bangla" ? "এক্সামিনোতে নতুন?" : "New to Examino?"}{" "}
              <Link
                to="/register"
                className="font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:underline"
              >
                {lang === "bangla" ? "নতুন অ্যাকাউন্ট খুলুন" : "Create an account"}
              </Link>
            </p>
          </div>

          {/* Teacher Dedicated Access Switcher */}
          <div className="mt-4 pt-4 border-t border-dashed border-[#CBD5E1] text-center">
            {!isTeacherMode ? (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic("medium");
                  setIsTeacherMode(true);
                  setError("");
                }}
                className="btn-smooth inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 shadow-2xs hover:border-[#94A3B8]"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <Icon name="clipboard" size={18} className=" text-examino-blue" />
                <span>{lang === "bangla" ? "শিক্ষক ও এডমিন প্রবেশ (গোপন পাসকোড)" : "Teacher / Admin Access (Passcode)"}</span>
                <Icon name="arrowRight" size={14} className="text-slate-400" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic("medium");
                  setIsTeacherMode(false);
                  setError("");
                }}
                className="btn-smooth inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 shadow-2xs"
              >
                <Icon name="book" size={18} className=" text-examino-blue" />
                <span>{lang === "bangla" ? "সাধারণ শিক্ষার্থী লগইনে ফিরে যান" : "Back to Student Login"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
