import React, { useState, useEffect } from "react";
import StudentLayout from "./StudentLayout";
import { signOutUser } from "../firebase/firebase";
import { Link } from "react-router-dom";
import { api } from "../teacher/api";
import useAsync, { currentUser as readUser } from "../lib/useAsync";

// Real academic details: level/group from the profile, batches from memberships.
function AcademicInfo() {
  const u = readUser();
  const { data } = useAsync((signal) => api.myBatches({ signal }), []);
  const batches = data?.batches || [];
  const item = (label, value) => (
    <div>
      <span className="block text-[11px] text-examino-muted">{label}</span>
      <p className="mt-0.5 font-bold text-examino-text">{value || "—"}</p>
    </div>
  );
  return (
    <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-3">
      {item("Level", u.metadata?.level)}
      {item("Group", u.metadata?.group)}
      <div>
        <span className="block text-[11px] text-examino-muted">Batches</span>
        {batches.length ? (
          <p className="mt-0.5 font-bold text-examino-text">{batches.map((b) => b.name).join(", ")}</p>
        ) : (
          <Link to="/batches" className="mt-0.5 inline-block font-semibold text-examino-blue hover:underline">
            Join a batch
          </Link>
        )}
      </div>
    </div>
  );
}

export default function StudentProfile() {
  const [currentUser, setCurrentUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user") || "{}");
  });

  const [activeTab, setActiveTab] = useState("Profile");
  const [fullName, setFullName] = useState(currentUser.name || "Student");
  const [banglaName, setBanglaName] = useState("শিক্ষার্থী");
  const [roll, setRoll] = useState(currentUser.roll || currentUser.rollNumber || currentUser.metadata?.rollNumber || "");
  const [mobile, setMobile] = useState(currentUser.phone || currentUser.mobile || "");
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar || "");
  const [email, setEmail] = useState(currentUser.email || "student@examino.edu.bd");
  const [language, setLanguage] = useState("English");
  const [dataSaver, setDataSaver] = useState(false);
  const [examReminders, setExamReminders] = useState(true);
  const [savedMessage, setSavedMessage] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  // Sync with authenticated backend on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setCurrentUser(data.user);
            setFullName(data.user.name || "");
            setEmail(data.user.email || "");
            if (data.user.phone) setMobile(data.user.phone);
            if (data.user.rollNumber || data.user.roll || data.user.metadata?.rollNumber) {
              setRoll(data.user.rollNumber || data.user.roll || data.user.metadata?.rollNumber || "");
            }
            if (data.user.avatar) setAvatarUrl(data.user.avatar);
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        })
        .catch(() => {});
    }
  }, []);

  const tabs = [
    "Profile",
    "Academic info",
    "Exam preferences",
    "Notifications",
    "Password & security",
  ];

  // Derive initials
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("") || "ST";

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveError("");
    setSaveLoading(true);
    const token = localStorage.getItem("token");

    try {
      if (token) {
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: fullName,
            phone: mobile,
            roll,
            avatar: avatarUrl,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setSaveError(data.message || "Failed to update profile.");
          setSaveLoading(false);
          return;
        }
        if (data.user) {
          setCurrentUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      }

      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } catch (err) {
      setSaveError("Failed to save changes. Please check network connection.");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <StudentLayout>
      {/* ── HEADER ── */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
          Profile & settings
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">
          Manage your personal details, coaching enrollment and exam preferences
        </p>
      </div>

      {savedMessage && (
        <div className="mb-6 p-4 bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-xs font-semibold rounded-xl flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Your changes have been saved successfully.</span>
        </div>
      )}

      {saveError && (
        <div className="mb-6 p-4 bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] text-xs font-semibold rounded-xl flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{saveError}</span>
        </div>
      )}

      {/* ── TWO-COLUMN SETTINGS LAYOUT (matches PDF Page 13) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* LEFT TAB MENU */}
        <div className="lg:col-span-1">
          <nav className="space-y-1 bg-white border border-[#E2E8F0] rounded-card p-2 shadow-card sticky top-24">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === tab
                    ? "bg-[#EFF6FF] text-[#2563EB]"
                    : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
                }`}
              >
                {tab}
              </button>
            ))}
            <div className="pt-2 border-t border-[#F1F5F9] mt-2">
              <button
                type="button"
                onClick={signOutUser}
                className="w-full text-left px-3.5 py-2 text-xs font-semibold rounded-lg text-[#EF4444] hover:bg-[#FEF2F2] transition-colors flex items-center gap-2"
              >
                <span>↪</span>
                <span>Log out (লগআউট)</span>
              </button>
            </div>
          </nav>
        </div>

        {/* RIGHT CONTENT CARDS */}
        <div className="lg:col-span-3 space-y-6">
          
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* 1. Profile Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-card p-6 shadow-card space-y-6">
              
              {/* Avatar Row */}
              <div className="flex items-center justify-between pb-5 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-4">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={fullName}
                      className="w-14 h-14 rounded-full object-cover ring-4 ring-[#EFF6FF] border border-[#CBD5E1]"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-[#DBEAFE] text-[#1D4ED8] font-bold text-lg flex items-center justify-center ring-4 ring-[#EFF6FF]">
                      {initials}
                    </div>
                  )}
                  <div>
                    <h2 className="text-base font-bold text-[#0F172A]">{fullName}</h2>
                    <p className="text-xs text-[#64748B]">
                      Student · রোল: <span className="font-mono font-bold text-slate-800">{roll || "নির্ধারণ করা হয়নি"}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 hidden sm:inline">প্রোফাইল ছবি লিংক নিচে দিন</span>
                </div>
              </div>

              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                    রোল নম্বর / স্টুডেন্ট আইডি (Roll Number) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: 1017 বা HSC-4402"
                    value={roll}
                    onChange={(e) => setRoll(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs font-mono font-bold text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  />
                  <span className="text-[10px] text-[#64748B] mt-1 block">
                    শিক্ষকের কাছে এই রোল নম্বরটিই আপনার পরিচয় হিসেবে দেখা যাবে।
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                    প্রোফাইল ছবি লিংক (Avatar Image URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  />
                  <span className="text-[10px] text-[#64748B] mt-1 block">
                    গুগল ড্রাইভ বা অনলাইন ছবির ডিরেক্ট লিংক দিন।
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                    পূর্ণ নাম (Full Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                    মোবাইল নম্বর (Mobile Number)
                  </label>
                  <input
                    type="text"
                    placeholder="017XXXXXXXX"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  />
                  <span className="text-[10px] text-[#10B981] font-semibold mt-1 block">
                    শিক্ষক প্রয়োজনীয় তথ্য পাঠাতে এই নম্বরটি দেখতে পাবেন।
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                    ইমেইল (Email Address)
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-3.5 py-2 bg-slate-50 border border-[#E2E8F0] rounded-lg text-xs text-[#64748B] cursor-not-allowed"
                  />
                </div>
              </div>

            </div>

            {/* 2. Academic Info Card (matches PDF Page 13) */}
            <div className="bg-white border border-[#E2E8F0] rounded-card p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                <h3 className="text-sm font-bold text-[#0F172A]">Academic info</h3>
                <span className="text-[11px] text-[#64748B]">Managed by your coaching centre</span>
              </div>

              <AcademicInfo />
            </div>

            {/* 3. Preferences Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-card p-6 shadow-card space-y-4">
              
              {/* Interface language */}
              <div className="flex items-center justify-between py-2 border-b border-[#F1F5F9]">
                <div>
                  <p className="text-xs font-bold text-[#0F172A]">Interface language</p>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Buttons and menus. Questions always show in the language they were written in.
                  </p>
                </div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                >
                  <option>English</option>
                  <option>বাংলা</option>
                </select>
              </div>

              {/* Data Saver Toggle */}
              <div className="flex items-center justify-between py-2 border-b border-[#F1F5F9]">
                <div>
                  <p className="text-xs font-bold text-[#0F172A]">Data saver</p>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Load question images only when you tap them
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDataSaver(!dataSaver)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    dataSaver ? "bg-[#2563EB]" : "bg-[#CBD5E1]"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      dataSaver ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Exam Reminders Toggle */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-xs font-bold text-[#0F172A]">Exam reminders</p>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    SMS and app notification 1 hour and 10 minutes before each exam
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setExamReminders(!examReminders)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    examReminders ? "bg-[#2563EB]" : "bg-[#CBD5E1]"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      examReminders ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>

            </div>

            {/* 4. Password & Sessions Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-card p-6 shadow-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-[#0F172A]">Password & sessions</p>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Last changed 2 months ago · signed in on 2 devices
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => alert("To change password, contact your coaching administrator.")}
                    className="px-3 py-1.5 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0F172A] font-semibold text-xs rounded-lg transition-colors"
                  >
                    Change password
                  </button>
                  <button
                    type="button"
                    onClick={signOutUser}
                    className="px-3.5 py-1.5 bg-[#FEF2F2] border border-[#FCA5A5] hover:bg-[#FEE2E2] text-[#DC2626] font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <span>Log out (লগআউট)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Save Buttons & Mobile Logout Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={signOutUser}
                className="w-full sm:w-auto px-4 py-2 bg-[#FEF2F2] border border-[#FCA5A5] hover:bg-[#FEE2E2] text-[#DC2626] font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>↪</span>
                <span>Log out of Examino (লগআউট)</span>
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0F172A] font-semibold text-xs rounded-lg transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-6 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-lg shadow transition-colors"
                >
                  {saveLoading ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>

          </form>

        </div>

      </div>

    </StudentLayout>
  );
}
