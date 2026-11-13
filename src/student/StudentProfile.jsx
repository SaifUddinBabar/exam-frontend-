import React, { useState } from "react";
import StudentLayout from "./StudentLayout";

export default function StudentProfile() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [activeTab, setActiveTab] = useState("Profile");
  const [fullName, setFullName] = useState(user.name || "Nusrat Jahan");
  const [banglaName, setBanglaName] = useState("নুসরাত জাহান");
  const [mobile, setMobile] = useState(user.mobile || "+880 1712-345678");
  const [email, setEmail] = useState(user.email || "nusrat.jahan@gmail.com");
  const [language, setLanguage] = useState("English");
  const [dataSaver, setDataSaver] = useState(false);
  const [examReminders, setExamReminders] = useState(true);
  const [savedMessage, setSavedMessage] = useState(false);

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
    .join("") || "NJ";

  const handleSave = (e) => {
    e.preventDefault();
    const updated = {
      ...user,
      name: fullName,
      email,
      mobile,
    };
    localStorage.setItem("user", JSON.stringify(updated));
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
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
                  <div className="w-14 h-14 rounded-full bg-[#DBEAFE] text-[#1D4ED8] font-bold text-lg flex items-center justify-center ring-4 ring-[#EFF6FF]">
                    {initials}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#0F172A]">{fullName}</h2>
                    <p className="text-xs text-[#64748B]">Student · Roll 1017</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => alert("Photo upload feature will be available in Phase 2.")}
                  className="px-3.5 py-1.5 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0F172A] font-semibold text-xs rounded-lg transition-colors"
                >
                  Change photo
                </button>
              </div>

              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                    নাম (বাংলায়)
                  </label>
                  <input
                    type="text"
                    value={banglaName}
                    onChange={(e) => setBanglaName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] font-bengali"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                    Mobile number
                  </label>
                  <input
                    type="text"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  />
                  <span className="text-[11px] text-[#10B981] font-semibold mt-1 block">
                    ✓ Verified · used to log in
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                    Email <span className="text-[#94A3B8] font-normal">(optional)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
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

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[#64748B] block text-[11px]">Level</span>
                  <p className="font-bold text-[#0F172A] mt-0.5">HSC 2027</p>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[11px]">Group</span>
                  <p className="font-bold text-[#0F172A] mt-0.5">Science</p>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[11px]">Batch</span>
                  <p className="font-bold text-[#0F172A] mt-0.5">Batch A · Sat/Mon/Wed</p>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[11px]">Centre</span>
                  <p className="font-bold text-[#0F172A] mt-0.5">Nobodoy Academic Care, Mirpur</p>
                </div>
              </div>
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
                    onClick={() => alert("Signed out of all other device sessions.")}
                    className="px-3 py-1.5 bg-white border border-[#FCA5A5] hover:bg-[#FEF2F2] text-[#DC2626] font-semibold text-xs rounded-lg transition-colors"
                  >
                    Sign out other devices
                  </button>
                </div>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0F172A] font-semibold text-xs rounded-lg transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-lg shadow transition-colors"
              >
                Save changes
              </button>
            </div>

          </form>

        </div>

      </div>

    </StudentLayout>
  );
}
