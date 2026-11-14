import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ExaminoLogo from "../components/ExaminoLogo";

export default function StudentNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Retrieve authenticated student
  const [currentUser, setCurrentUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user") || "{}");
  });

  // Language / Medium Mode State ("bangla" | "english")
  const [languageMode, setLanguageMode] = useState(() => {
    return localStorage.getItem("examino_language_mode") || "bangla";
  });

  const handleLanguageChange = (mode) => {
    if (mode === languageMode) return;
    setLanguageMode(mode);
    localStorage.setItem("examino_language_mode", mode);
    window.dispatchEvent(new CustomEvent("languageModeChanged", { detail: { mode } }));
  };

  useEffect(() => {
    const handleModeUpdate = (e) => {
      if (e.detail?.mode && e.detail.mode !== languageMode) {
        setLanguageMode(e.detail.mode);
      }
    };
    window.addEventListener("languageModeChanged", handleModeUpdate);
    return () => window.removeEventListener("languageModeChanged", handleModeUpdate);
  }, [languageMode]);

  const studentName = currentUser.name || "Student";

  // Derive initials
  const initials = studentName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("") || "ST";

  // Verify and refresh profile from /api/auth/me if token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && (!currentUser.name || !currentUser.email)) {
      fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setCurrentUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        })
        .catch(() => {});
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navLinks = [
    { label: "Home", path: "/dashboard" },
    { label: "Exams", path: "/exams" },
    { label: "Practice Zone", path: "/practice" },
    { label: "Question Bank", path: "/question-bank" },
    { label: "Saved Questions", path: "/saved-questions" },
    { label: "Performance", path: "/performance" },
    { label: "History", path: "/history" },
  ];

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/" || location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* ── TOP HEADER (DESKTOP & TABLET) ── */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Left: Brand Logo & Desktop Nav Links */}
          <div className="flex items-center gap-10">
            <ExaminoLogo to="/dashboard" />

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "text-[#2563EB] font-semibold"
                        : "text-[#64748B] hover:text-[#0F172A]"
                    }`}
                  >
                    {link.label}
                    {active && (
                      <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#2563EB] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Notifications & Profile Avatar */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Language / Medium Mode Switcher Toggle */}
            <div className="flex items-center bg-[#F1F5F9] p-0.5 sm:p-1 rounded-xl border border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => handleLanguageChange("bangla")}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  languageMode === "bangla"
                    ? "bg-white text-[#15803D] shadow-xs"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
                title="বাংলা মাধ্যম (NCTB ও বোর্ড প্রশ্নসমূহ)"
              >
                <span className="text-xs sm:text-sm">🇧🇩</span>
                <span className="font-bold">বাংলা</span>
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange("english")}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  languageMode === "english"
                    ? "bg-white text-[#2563EB] shadow-xs"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
                title="English Medium (ICT & Model Questions)"
              >
                <span className="text-xs sm:text-sm">🇬🇧</span>
                <span className="font-bold">English</span>
              </button>
            </div>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-full transition-colors focus:outline-none"
                aria-label="Notifications"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.75"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {/* Active notification indicator dot */}
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full ring-2 ring-white" />
              </button>

              {/* Notification Popover */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E2E8F0] rounded-xl shadow-dropdown py-3 px-4 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
                    <span className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider">Notifications</span>
                    <span className="text-[11px] text-[#2563EB] cursor-pointer hover:underline">Mark all read</span>
                  </div>
                  <div className="divide-y divide-[#F1F5F9] text-xs text-[#0F172A]">
                    <div className="py-2.5">
                      <p className="font-semibold text-[#0F172A]">Physics Model Test 04 Result Published</p>
                      <p className="text-[#64748B] text-[11px] mt-0.5">Your score is 35.5 / 40 (Rank 4 of 126). View detailed answer review.</p>
                      <span className="text-[10px] text-[#94A3B8] mt-1 block">15m ago</span>
                    </div>
                    <div className="py-2.5">
                      <p className="font-semibold text-[#0F172A]">Upcoming Exam Tonight</p>
                      <p className="text-[#64748B] text-[11px] mt-0.5">ICT Chapter Test starts at 8:00 PM. Instructions open 15 mins early.</p>
                      <span className="text-[10px] text-[#94A3B8] mt-1 block">2h ago</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Pill */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-[#F1F5F9] transition-colors focus:outline-none"
              >
                <div className="w-9 h-9 rounded-full bg-[#DBEAFE] text-[#1D4ED8] font-bold text-sm flex items-center justify-center ring-2 ring-transparent hover:ring-[#2563EB]/20 transition-all">
                  {initials}
                </div>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E2E8F0] rounded-xl shadow-dropdown py-2 z-50">
                  <div className="px-4 py-2 border-b border-[#F1F5F9]">
                    <p className="text-sm font-semibold text-[#0F172A] truncate">{studentName}</p>
                    <p className="text-xs text-[#64748B] truncate">{currentUser.email || "student@examino.edu.bd"}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] font-medium bg-[#ECFDF5] text-[#059669] rounded">
                      Student Account
                    </span>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
                  >
                    <svg className="w-4 h-4 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile & settings
                  </Link>

                  {(currentUser.role === "tutor" || currentUser.role === "org_admin" || currentUser.globalRole === "super_admin") && (
                    <Link
                      to="/teacher"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#2563EB] font-bold bg-[#EFF6FF] hover:bg-[#DBEAFE] transition-colors"
                    >
                      <svg className="w-4 h-4 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Teacher Workspace &rarr;
                    </Link>
                  )}

                  <Link
                    to="/practice"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
                  >
                    <svg className="w-4 h-4 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Practice Zone
                  </Link>

                  <Link
                    to="/question-bank"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
                  >
                    <svg className="w-4 h-4 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                    </svg>
                    Question Bank
                  </Link>

                  <Link
                    to="/saved-questions"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
                  >
                    <svg className="w-4 h-4 text-[#F59E0B]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                    </svg>
                    Saved Questions
                  </Link>

                  <Link
                    to="/history"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
                  >
                    <svg className="w-4 h-4 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Exam history
                  </Link>

                  <div className="border-t border-[#F1F5F9] my-1" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-[#EF4444] hover:bg-[#FEF2F2] transition-colors text-left"
                  >
                    <svg className="w-4 h-4 text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* ── MOBILE BOTTOM NAVIGATION (SMARTPHONES) ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E2E8F0] shadow-elevated">
        <div className="grid grid-cols-5 h-16">
          
          <Link
            to="/dashboard"
            className={`flex flex-col items-center justify-center text-xs font-medium transition-colors ${
              isActive("/dashboard") ? "text-[#2563EB]" : "text-[#64748B]"
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Home</span>
          </Link>

          <Link
            to="/exams"
            className={`flex flex-col items-center justify-center text-xs font-medium transition-colors ${
              isActive("/exams") ? "text-[#2563EB]" : "text-[#64748B]"
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Exams</span>
          </Link>

          <Link
            to="/practice"
            className={`flex flex-col items-center justify-center text-xs font-medium transition-colors ${
              isActive("/practice") ? "text-[#2563EB]" : "text-[#64748B]"
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Practice</span>
          </Link>

          <Link
            to="/question-bank"
            className={`flex flex-col items-center justify-center text-xs font-medium transition-colors ${
              isActive("/question-bank") ? "text-[#2563EB]" : "text-[#64748B]"
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Q-Bank</span>
          </Link>

          <Link
            to="/profile"
            className={`flex flex-col items-center justify-center text-xs font-medium transition-colors ${
              isActive("/profile") ? "text-[#2563EB]" : "text-[#64748B]"
            }`}
          >
            <div className="w-5 h-5 mb-0.5 rounded-full bg-[#DBEAFE] text-[#1D4ED8] font-bold text-[10px] flex items-center justify-center">
              {initials}
            </div>
            <span>Profile</span>
          </Link>

        </div>
      </div>
    </>
  );
}
