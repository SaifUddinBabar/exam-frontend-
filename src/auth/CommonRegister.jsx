import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ExaminoLogo from "../components/ExaminoLogo";
import { sendFirebaseOtp, clearRecaptcha, signInWithGoogle } from "../firebase/firebase";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function CommonRegister() {
  const navigate = useNavigate();

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

  // Active Role Tab: 'student' | 'teacher' | 'organization'
  const [activeTab, setActiveTab] = useState("student");

  // Registration Mode: 'email' | 'phone_otp'
  const [regMode, setRegMode] = useState("email");

  // Common Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Field validation touched states
  const [touched, setTouched] = useState({});

  // Student Specific Fields
  const [level, setLevel] = useState("HSC 2027");
  const [group, setGroup] = useState("Science");
  const [studentRoll, setStudentRoll] = useState("");

  // Teacher Specific Fields
  const [teacherEmail, setTeacherEmail] = useState("");
  const [designation, setDesignation] = useState("ICT Lecturer / Faculty");
  const [institution, setInstitution] = useState("");

  // Organization Specific Fields
  const [orgName, setOrgName] = useState("");
  const [location, setLocation] = useState("Dhaka");

  // Coaching Google Onboarding Modal State
  const [showCoachingOnboarding, setShowCoachingOnboarding] = useState(false);
  const [coachingGoogleToken, setCoachingGoogleToken] = useState(null);

  // State & Loading
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  // OTP Modal State (For Phone SMS OTP flow)
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [testOtpHint, setTestOtpHint] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

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

  const cleanPhone = (val) => val.replace(/[^0-9]/g, "");

  const handleSuccessfulAuth = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    if (data.memberships) {
      localStorage.setItem("examino_memberships", JSON.stringify(data.memberships));
    }

    const role = (data.user.globalRole === "super_admin" ? "super_admin" : (data.user.role || "")).toLowerCase();

    if (data.redirectUrl) {
      navigate(data.redirectUrl, { replace: true });
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

  // 1. Google Sign-Up / In Handler
  const handleGoogleSignUp = async () => {
    setError("");

    // If Coaching admin tab -> ensure Coaching Name is collected via step 2 onboarding modal
    if (activeTab === "organization" && !orgName.trim()) {
      setShowCoachingOnboarding(true);
      return;
    }

    setGoogleLoading(true);
    try {
      const { idToken } = await signInWithGoogle();
      const desiredRole = activeTab === "teacher" ? "tutor" : (activeTab === "organization" ? "org_admin" : "student");

      const res = await fetch(`${API}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          desiredRole,
          orgName: orgName.trim(),
          location: location.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.needsOrgOnboarding) {
          setCoachingGoogleToken(idToken);
          setShowCoachingOnboarding(true);
          setGoogleLoading(false);
          return;
        }
        setError(data.message || (lang === "bangla" ? "গুগল সাইন-আপ সম্পন্ন করা সম্ভব হয়নি।" : "Failed to register with Google."));
        setGoogleLoading(false);
        return;
      }

      handleSuccessfulAuth(data);
    } catch (err) {
      console.error("Google Sign-Up Error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError(lang === "bangla" ? "গুগল সাইন-আপ পপআপ বন্ধ করা হয়েছিল। অনুগ্রহ করে গুগল উইন্ডো থেকে আপনার অ্যাকাউন্ট সিলেক্ট করুন।" : "Google signup popup was closed. Please select your Google account to proceed.");
      } else {
        setError(err.message || (lang === "bangla" ? "গুগল দিয়ে নিবন্ধন ব্যর্থ হয়েছে।" : "Failed to sign up with Google."));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // 1b. Complete Coaching Google Onboarding
  const handleCompleteCoachingGoogle = async (e) => {
    e.preventDefault();
    if (!orgName.trim()) {
      setError(lang === "bangla" ? "কোচিং বা প্রতিষ্ঠানের নাম লিখুন।" : "Please enter your coaching center name.");
      return;
    }

    setShowCoachingOnboarding(false);
    setGoogleLoading(true);

    try {
      let idToken = coachingGoogleToken;
      if (!idToken) {
        const result = await signInWithGoogle();
        idToken = result.idToken;
      }

      const res = await fetch(`${API}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          desiredRole: "org_admin",
          orgName: orgName.trim(),
          location: location.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Failed to create coaching workspace.");
        setGoogleLoading(false);
        return;
      }

      handleSuccessfulAuth(data);
    } catch (err) {
      console.error("Coaching Onboarding Error:", err);
      setError(err.message || "Failed to register coaching workspace.");
    } finally {
      setGoogleLoading(false);
    }
  };

  // 2. Email & Password Registration
  const handleEmailRegistration = async (e) => {
    e.preventDefault();
    setError("");

    if (activeTab === "organization" && !orgName.trim()) {
      setError(lang === "bangla" ? "কোচিং বা প্রতিষ্ঠানের নাম লিখুন।" : "Please enter your organization or coaching center name.");
      return;
    }

    if (!name.trim()) {
      setError(lang === "bangla" ? "আপনার পূর্ণ নাম লিখুন।" : "Please enter your full name.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setError(lang === "bangla" ? "সঠিক ইমেইল ঠিকানা দিন।" : "Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 6) {
      setError(lang === "bangla" ? "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।" : "Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError(lang === "bangla" ? "উভয় পাসওয়ার্ড হুবহু মিলতে হবে।" : "Passwords do not match. Please re-enter carefully.");
      return;
    }

    if (!agreeTerms) {
      setError(lang === "bangla" ? "শর্তাবলী ও প্রাইভেসিতে সম্মতি দিন।" : "Please accept the Terms of Service and Privacy Policy to continue.");
      return;
    }

    setLoading(true);
    try {
      const role = activeTab === "teacher" ? "tutor" : (activeTab === "organization" ? "org_admin" : "student");
      const res = await fetch(`${API}/api/auth/register/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          confirmPassword,
          role,
          level,
          group,
          roll: studentRoll.trim(),
          institution: institution.trim(),
          designation: designation.trim(),
          orgName: orgName.trim(),
          location: location.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || (lang === "bangla" ? "ইমেইল রেজিস্ট্রেশন ব্যর্থ হয়েছে।" : "Email registration failed. Please try again."));
        setLoading(false);
        return;
      }

      handleSuccessfulAuth(data);
    } catch (err) {
      console.error("Email Registration Error:", err);
      setError(lang === "bangla" ? "নেটওয়ার্ক সমস্যার কারণে নিবন্ধন সম্পন্ন করা যায়নি।" : "Network error while registering account.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Initiate Phone OTP Registration
  const handleInitiatePhoneRegistration = async (e) => {
    e.preventDefault();
    setError("");

    if (activeTab === "organization" && !orgName.trim()) {
      setError(lang === "bangla" ? "কোচিং বা প্রতিষ্ঠানের নাম লিখুন।" : "Please enter your organization or coaching center name.");
      return;
    }

    if (!name.trim()) {
      setError(lang === "bangla" ? "আপনার পূর্ণ নাম লিখুন।" : "Please enter your full name.");
      return;
    }

    const cleaned = cleanPhone(mobile);
    if (!cleaned || cleaned.length < 11) {
      setError(lang === "bangla" ? "সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (০১৭XXXXXXXX)।" : "Please enter a valid 11-digit mobile number (e.g. 017XXXXXXXX).");
      return;
    }

    if (!password || password.length < 6) {
      setError(lang === "bangla" ? "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।" : "Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError(lang === "bangla" ? "উভয় পাসওয়ার্ড হুবহু মিলতে হবে।" : "Passwords do not match. Please re-enter carefully.");
      return;
    }

    if (!agreeTerms) {
      setError(lang === "bangla" ? "শর্তাবলী ও প্রাইভেসিতে সম্মতি দিন।" : "Please accept the Terms of Service and Privacy Policy to continue.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      try {
        const confirmation = await sendFirebaseOtp(cleaned, "recaptcha-container");
        setConfirmationResult(confirmation);
        setTestOtpHint("");
        setResendCooldown(60);
        setCanResend(false);
        setOtpError("");
        setShowOtpModal(true);
        setLoading(false);
        return;
      } catch (fbErr) {
        console.warn("Firebase Phone Auth error, attempting server fallback:", fbErr);
        const res = await fetch(`${API}/api/auth/otp/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: cleaned, purpose: "registration" }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.message || fbErr.message || "Failed to send verification code.");
          setLoading(false);
          return;
        }

        setConfirmationResult(null);
        if (data.testOtp) {
          setTestOtpHint(data.testOtp);
          setOtpValue(data.testOtp);
        }

        setResendCooldown(data.resendCooldown || 60);
        setCanResend(false);
        setOtpError("");
        setShowOtpModal(true);
      }
    } catch (err) {
      console.error("OTP Send Error:", err);
      setError("Network error while contacting authentication server.");
    } finally {
      setLoading(false);
    }
  };

  // Resend Phone OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    setOtpLoading(true);
    setOtpError("");
    const cleaned = cleanPhone(mobile);

    try {
      try {
        clearRecaptcha("recaptcha-container");
        const confirmation = await sendFirebaseOtp(cleaned, "recaptcha-container");
        setConfirmationResult(confirmation);
        setResendCooldown(60);
        setCanResend(false);
        setOtpLoading(false);
        return;
      } catch (fbErr) {
        console.warn("Firebase resend error, attempting server fallback:", fbErr);
        const res = await fetch(`${API}/api/auth/otp/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: cleaned, purpose: "registration" }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setConfirmationResult(null);
          setResendCooldown(data.resendCooldown || 60);
          setCanResend(false);
          if (data.testOtp) {
            setTestOtpHint(data.testOtp);
            setOtpValue(data.testOtp);
          }
        } else {
          setOtpError(data.message || fbErr.message || "Failed to resend code.");
        }
      }
    } catch {
      setOtpError("Network error. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify Phone OTP & Complete Registration
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setOtpError("");

    if (!otpValue || otpValue.trim().length !== 6) {
      setOtpError(lang === "bangla" ? "সম্পূর্ণ ৬ ডিজিটের কোডটি লিখুন।" : "Please enter the complete 6-digit code.");
      return;
    }

    const cleaned = cleanPhone(mobile);
    setOtpLoading(true);

    try {
      let firebaseToken = null;
      let verificationToken = null;

      if (confirmationResult) {
        try {
          const userCredential = await confirmationResult.confirm(otpValue.trim());
          firebaseToken = await userCredential.user.getIdToken();
        } catch (fbConfirmErr) {
          console.error("Firebase OTP confirmation error:", fbConfirmErr);
          setOtpError(lang === "bangla" ? "ভুল বা মেয়াদোত্তীর্ণ ওটিপি কোড।" : "Incorrect or expired verification code.");
          setOtpLoading(false);
          return;
        }
      } else {
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
          setOtpError(verifyData.message || "Incorrect verification code.");
          setOtpLoading(false);
          return;
        }

        verificationToken = verifyData.verificationToken;
      }

      let endpoint = `${API}/api/auth/register/student`;
      let payload = {
        name: name.trim(),
        phone: cleaned,
        password,
        verificationToken,
        firebaseToken,
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
          firebaseToken,
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
          firebaseToken,
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

      setShowOtpModal(false);
      handleSuccessfulAuth(regData);
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

          <div className="mt-12 lg:mt-16">
            <span className="text-[11px] font-bold tracking-widest text-[#94A3B8] uppercase">
              {lang === "bangla" ? "এক্সামিনোতে যুক্ত হোন" : "Join Examino"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3 leading-snug tracking-tight">
              {lang === "bangla"
                ? "আজই শুরু করুন আপনার পড়াশোনা ও পাঠদানের ডিজিটাল যাত্রা।"
                : "Start your academic and teaching journey today."}
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-4 leading-relaxed font-normal max-w-md">
              {lang === "bangla"
                ? "শিক্ষার্থীদের জন্য প্রস্তুতি প্ল্যাটফর্ম, শিক্ষকদের জন্য এ-ফোর প্রশ্নপত্র মেকার এবং কোচিং সেন্টারের জন্য সমন্বিত ম্যানেজমেন্ট টুলস।"
                : "Create an authentic account tailored to your educational needs. Students get full practice drill access, teachers get A4 paper builder tools, and coaching academies get multi-teacher workspaces."}
            </p>

            {/* Feature Highlights */}
            <div className="mt-8 space-y-3 pt-6 border-t border-white/10 text-xs">
              <div className="flex items-center gap-3 text-slate-300">
                <span className="w-5 h-5 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center font-bold text-xs">✓</span>
                <span>{lang === "bangla" ? "এনসিটিবি ও বোর্ড পরীক্ষার প্রামাণিক প্রশ্নব্যাংক" : "Authentic NCTB & Board Exam question bank with 2,750+ questions"}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <span className="w-5 h-5 rounded-full bg-[#2563EB]/20 text-[#60A5FA] flex items-center justify-center font-bold text-xs">✓</span>
                <span>{lang === "bangla" ? "৩টি সহজ সাইন-ইন পদ্ধতি: গুগল, ইমেইল এবং মোবাইল" : "3 flexible login options: Google Sign-In, Email, and Phone OTP"}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <span className="w-5 h-5 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center font-bold text-xs">✓</span>
                <span>{lang === "bangla" ? "দ্বৈত ভাষা সাপোর্ট: 🇧🇩 বাংলা মাধ্যম ও 🇬🇧 English Medium" : "Dual language support: 🇧🇩 বাংলা মাধ্যম ও 🇬🇧 English Medium"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-xs text-[#64748B] flex items-center justify-between">
          <span>&copy; {new Date().getFullYear()} Examino Ltd.</span>
          <span className="font-medium">{lang === "bangla" ? "ঢাকা, বাংলাদেশ" : "Dhaka, Bangladesh"}</span>
        </div>
      </div>

      {/* ── RIGHT REGISTRATION FORM PANEL ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-lg my-auto py-6">
          {/* Header */}
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {lang === "bangla" ? "নতুন অ্যাকাউন্ট তৈরি করুন" : "Create your account"}
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1.5">
                {lang === "bangla"
                  ? "আপনার পদবি নির্বাচন করুন এবং সাইন-আপ সম্পন্ন করুন।"
                  : "Select your role and choose your sign-up method to get started."}
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

          {/* Student Dedicated Registration Badge */}
          <div className="flex items-center justify-between p-3.5 bg-[#EFF6FF] rounded-xl mb-5 border border-[#BFDBFE]">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">👨‍🎓</span>
              <div>
                <p className="text-xs font-bold text-[#1E40AF]">
                  {lang === "bangla" ? "শিক্ষার্থী একাউন্ট নিবন্ধন" : "Student Account Registration"}
                </p>
                <p className="text-[11px] text-[#3B82F6]">
                  {lang === "bangla" ? "সকল পরীক্ষা, প্র্যাকটিস ও মেধা তালিকায় অংশ নিন" : "Participate in exams, leaderboards & analytics"}
                </p>
              </div>
            </div>
            <Link
              to="/login?teacher=true"
              className="text-[11px] font-bold text-[#1E40AF] hover:underline whitespace-nowrap bg-white px-2.5 py-1.5 rounded-lg border border-[#DBEAFE] shadow-2xs"
            >
              {lang === "bangla" ? "শিক্ষক প্রবেশ ➔" : "Teacher Access ➔"}
            </Link>
          </div>

          {/* ════════ PROMINENT GOOGLE SIGN-UP BUTTON ════════ */}
          <div className="mb-5">
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={googleLoading || loading}
              className={`w-full py-2.5 px-4 rounded-xl border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#0F172A] text-sm font-semibold shadow-xs hover:shadow transition-all flex items-center justify-center gap-3 ${
                googleLoading ? "opacity-75 cursor-wait" : ""
              }`}
            >
              {googleLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
                  <span>{lang === "bangla" ? "গুগলে যুক্ত হচ্ছে..." : "Signing up with Google..."}</span>
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
                    {lang === "bangla"
                      ? `গুগল দিয়ে ${activeTab === "teacher" ? "শিক্ষক হিসেবে" : (activeTab === "organization" ? "কোচিং হিসেবে" : "শিক্ষার্থী হিসেবে")} সাইন-আপ`
                      : `Sign up with Google as ${activeTab === "teacher" ? "Teacher" : (activeTab === "organization" ? "Coaching" : "Student")}`}
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
                {lang === "bangla" ? "অথবা নিবন্ধন করুন" : "Or register with"}
              </span>
            </div>
          </div>

          {/* Registration Method Switcher Tabs */}
          <div className="flex bg-[#F1F5F9] p-1 rounded-xl mb-5 border border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => {
                setRegMode("email");
                setError("");
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                regMode === "email"
                  ? "bg-white text-[#0F172A] shadow-xs"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              {lang === "bangla" ? "ইমেইল ও পাসওয়ার্ড" : "Email & Password"}
            </button>
            <button
              type="button"
              onClick={() => {
                setRegMode("phone_otp");
                setError("");
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                regMode === "phone_otp"
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

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-xs font-semibold text-[#DC2626] flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* ════════ REGISTRATION FORM ════════ */}
          <form
            onSubmit={regMode === "email" ? handleEmailRegistration : handleInitiatePhoneRegistration}
            className="space-y-4"
          >
            {/* Organization Name (If Coaching) */}
            {activeTab === "organization" && (
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                  {lang === "bangla" ? "কোচিং / প্রতিষ্ঠানের নাম" : "Coaching / Organization Name"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === "bangla" ? "যেমন: নবোদয় একাডেমি কেয়ার, মিরপুর" : "e.g. Nobodoy Academic Care, Mirpur"}
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#7C3AED] transition-all font-medium"
                />
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                {activeTab === "organization"
                  ? (lang === "bangla" ? "পরিচালক / মালিকের নাম" : "Director / Owner Name")
                  : (lang === "bangla" ? "পূর্ণ নাম" : "Full Name")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={activeTab === "teacher" ? (lang === "bangla" ? "যেমন: অধ্যাপক শামসুল হুদা" : "e.g. Prof. Shamsul Huda") : (lang === "bangla" ? "যেমন: রহিম চৌধুরী" : "e.g. Rahim Chowdhury")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] transition-all font-medium"
              />
            </div>

            {/* If Email Mode -> Email Address Input */}
            {regMode === "email" ? (
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                  {lang === "bangla" ? "ইমেইল ঠিকানা" : "Email Address"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched({ ...touched, email: true })}
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none transition-all font-medium ${
                    touched.email && (!email.trim() || !email.includes("@"))
                      ? "border-[#EF4444]"
                      : "border-[#CBD5E1] focus:border-[#2563EB]"
                  }`}
                />
              </div>
            ) : (
              /* If Phone Mode -> Mobile Number Input */
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                  {lang === "bangla" ? "১১ ডিজিটের মোবাইল নম্বর" : "Bangladeshi Mobile Number"} <span className="text-red-500">*</span>
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
                  {lang === "bangla" ? "এই নম্বরে তাৎক্ষণিক ৬ ডিজিটের ওটিপি পাঠানো হবে।" : "A 6-digit OTP will be sent to this number for instant verification."}
                </p>
              </div>
            )}

            {/* Student Specific: Level, Group & Roll */}
            {activeTab === "student" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                      {lang === "bangla" ? "শ্রেণি / সেশন" : "Academic Level"}
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
                      {lang === "bangla" ? "বিভাগ / গ্রুপ" : "Discipline Group"}
                    </label>
                    <select
                      value={group}
                      onChange={(e) => setGroup(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                    >
                      <option value="Science">{lang === "bangla" ? "বিজ্ঞান বিভাগ" : "Science"}</option>
                      <option value="Commerce">{lang === "bangla" ? "ব্যবসায় শিক্ষা" : "Business"}</option>
                      <option value="Humanities">{lang === "bangla" ? "মানবিক বিভাগ" : "Humanities"}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                    {lang === "bangla" ? "ক্লাস / এইচএসসি রোল (Student Roll Number)" : "Class / HSC Roll Number"}
                  </label>
                  <input
                    type="text"
                    placeholder={lang === "bangla" ? "যেমন: 1017 বা 4402" : "e.g. 1017 or 4402"}
                    value={studentRoll}
                    onChange={(e) => setStudentRoll(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] font-mono font-bold focus:outline-none focus:border-[#2563EB] transition-all"
                  />
                  <p className="text-[11px] text-[#64748B] mt-1">
                    {lang === "bangla"
                      ? "শিক্ষক পরীক্ষার মেধা তালিকা ও ফলাফলে এই রোলটি দেখতে পাবেন।"
                      : "Your teacher and leaderboard will identify your submissions by this Roll."}
                  </p>
                </div>
              </div>
            )}

            {/* Teacher Specific: Designation & Institution */}
            {activeTab === "teacher" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                    {lang === "bangla" ? "পদবি" : "Designation"}
                  </label>
                  <input
                    type="text"
                    placeholder={lang === "bangla" ? "যেমন: প্রভাষক / শিক্ষক" : "e.g. Senior Lecturer"}
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#101B35]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                    {lang === "bangla" ? "প্রতিষ্ঠান / কলেজ" : "Institution / College"}
                  </label>
                  <input
                    type="text"
                    placeholder={lang === "bangla" ? "যেমন: ঢাকা কলেজ" : "e.g. Dhaka College"}
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
                  {lang === "bangla" ? "শাখা / ক্যাম্পাস লোকেশন" : "Campus / Branch Location"}
                </label>
                <input
                  type="text"
                  placeholder={lang === "bangla" ? "যেমন: মিরপুর-১০, ঢাকা" : "e.g. Mirpur-10, Dhaka"}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>
            )}

            {/* Password & Confirm Password with Sleek Inline Eye Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                  {lang === "bangla" ? "পাসওয়ার্ড" : "Password"} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder={lang === "bangla" ? "কমপক্ষে ৬ অক্ষর" : "Min 6 characters"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched({ ...touched, password: true })}
                    className={`w-full pl-3.5 pr-10 py-2.5 bg-white border rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none transition-all font-medium ${
                      touched.password && password.length < 6
                        ? "border-[#EF4444]"
                        : "border-[#CBD5E1] focus:border-[#2563EB]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] focus:outline-none p-1"
                    title={showPassword ? "Hide" : "Show"}
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

              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                  {lang === "bangla" ? "পাসওয়ার্ড নিশ্চিতকরণ" : "Confirm Password"} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder={lang === "bangla" ? "পুনরায় লিখুন" : "Re-enter password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                    className={`w-full pl-3.5 pr-10 py-2.5 bg-white border rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none transition-all font-medium ${
                      touched.confirmPassword && password !== confirmPassword
                        ? "border-[#EF4444]"
                        : "border-[#CBD5E1] focus:border-[#2563EB]"
                    }`}
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
                  {lang === "bangla" ? "আমি এক্সামিনোর " : "I agree to Examino's "}
                  <span className="text-[#2563EB] font-semibold hover:underline">
                    {lang === "bangla" ? "ব্যবহারের শর্তাবলী" : "Terms of Service"}
                  </span>{" "}
                  {lang === "bangla" ? "ও " : "and "}
                  <span className="text-[#2563EB] font-semibold hover:underline">
                    {lang === "bangla" ? "প্রাইভেসি পলিসিতে" : "Privacy Policy"}
                  </span>{" "}
                  {lang === "bangla" ? "সম্মত আছি।" : "."}
                </span>
              </label>
            </div>

            {/* Firebase reCAPTCHA mount container (for phone auth) */}
            {regMode === "phone_otp" && (
              <div id="recaptcha-container" className="my-2 flex justify-center"></div>
            )}

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
                  <span>{lang === "bangla" ? "অ্যাকাউন্ট তৈরি হচ্ছে..." : "Creating account..."}</span>
                </>
              ) : (
                <span>
                  {regMode === "email"
                    ? (lang === "bangla" ? "অ্যাকাউন্ট খুলুন →" : "Create Account →")
                    : (lang === "bangla" ? "মোবাইল যাচাই ও নিবন্ধন করুন →" : "Verify Mobile & Register →")}
                </span>
              )}
            </button>
          </form>

          {/* Login Redirect */}
          <div className="mt-8 pt-6 border-t border-[#E2E8F0] text-center">
            <p className="text-xs text-[#64748B]">
              {lang === "bangla" ? "ইতিমধ্যে অ্যাকাউন্ট আছে?" : "Already have an Examino account?"}{" "}
              <Link to="/login" className="font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:underline">
                {lang === "bangla" ? "এখানে লগইন করুন" : "Sign in here"}
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ── 2-STEP ONBOARDING MODAL FOR COACHING GOOGLE SIGN-UP ── */}
      {showCoachingOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#E2E8F0] animate-scaleUp">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-[#FAF5FF] text-[#7C3AED] flex items-center justify-center mx-auto mb-3 text-2xl">
                🏫
              </div>
              <h3 className="text-xl font-extrabold text-[#0F172A]">
                {lang === "bangla" ? "কোচিং সেন্টারের তথ্য" : "Coaching Center Workspace"}
              </h3>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                {lang === "bangla"
                  ? "গুগল সাইন-আপ সম্পন্ন করতে আপনার প্রতিষ্ঠানের নাম এবং ক্যাম্পাস লোকেশন প্রদান করুন।"
                  : "Please provide your organization name to complete coaching administrator registration."}
              </p>
            </div>

            <form onSubmit={handleCompleteCoachingGoogle} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                  {lang === "bangla" ? "কোচিং / প্রতিষ্ঠানের নাম" : "Organization / Coaching Name"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder={lang === "bangla" ? "যেমন: নবোদয় একাডেমি কেয়ার" : "e.g. Nobodoy Academic Care"}
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] focus:outline-none focus:border-[#7C3AED] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                  {lang === "bangla" ? "শাখা / ক্যাম্পাস লোকেশন" : "Branch / Campus Location"}
                </label>
                <input
                  type="text"
                  placeholder={lang === "bangla" ? "যেমন: মিরপুর-১০, ঢাকা" : "e.g. Mirpur-10, Dhaka"}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] focus:outline-none focus:border-[#7C3AED] font-medium"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCoachingOnboarding(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#64748B] hover:bg-[#F8FAFC]"
                >
                  {lang === "bangla" ? "বাতিল" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={googleLoading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5"
                >
                  {googleLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{lang === "bangla" ? "তৈরি হচ্ছে..." : "Connecting..."}</span>
                    </>
                  ) : (
                    <span>{lang === "bangla" ? "নিবন্ধন সম্পন্ন করুন →" : "Continue with Google →"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 6-DIGIT OTP VERIFICATION MODAL (For Phone Auth) ── */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#E2E8F0] animate-scaleUp">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto mb-3 text-xl">
                📱
              </div>
              <h3 className="text-xl font-extrabold text-[#0F172A]">
                {lang === "bangla" ? "মোবাইল নম্বর যাচাই করুন" : "Verify Your Mobile Number"}
              </h3>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                {lang === "bangla" ? "আমরা আপনার নম্বরে ৬ ডিজিটের কোড পাঠিয়েছি: " : "We sent a 6-digit verification code to "}
                <span className="font-bold text-[#0F172A]">{mobile}</span>
              </p>
            </div>

            {testOtpHint && (
              <div className="mb-4 p-2.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg text-xs font-semibold text-[#1D4ED8] text-center">
                Test Mode OTP: <span className="font-mono text-sm tracking-widest">{testOtpHint}</span>
              </div>
            )}

            {otpError && (
              <div className="mb-4 p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg text-xs font-semibold text-[#DC2626] text-center">
                {otpError}
              </div>
            )}

            <form onSubmit={handleVerifyAndRegister} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-center text-[#64748B] uppercase tracking-wider mb-2">
                  {lang === "bangla" ? "৬ ডিজিটের ওটিপি লিখুন" : "Enter 6-Digit Code"}
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

              <div className="text-center text-xs">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={otpLoading}
                    className="font-bold text-[#2563EB] hover:underline cursor-pointer"
                  >
                    {lang === "bangla" ? "এসএমএস পাননি? পুনরায় কোড পাঠান" : "Didn't receive the SMS? Resend code"}
                  </button>
                ) : (
                  <span className="text-[#94A3B8]">
                    {lang === "bangla" ? "পুনরায় কোড পাঠাতে অপেক্ষা করুন: " : "Resend code in "}
                    <span className="font-bold text-[#0F172A]">{resendCooldown}s</span>
                  </span>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
                >
                  {lang === "bangla" ? "বাতিল" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={otpLoading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  {otpLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{lang === "bangla" ? "যাচাই হচ্ছে..." : "Verifying..."}</span>
                    </>
                  ) : (
                    <span>{lang === "bangla" ? "নিশ্চিত করুন →" : "Confirm & Activate →"}</span>
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
