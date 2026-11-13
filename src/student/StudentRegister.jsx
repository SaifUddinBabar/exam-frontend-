import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ExaminoLogo from "../components/ExaminoLogo";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function StudentRegister() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [level, setLevel] = useState("HSC 2027");
  const [group, setGroup] = useState("Science");
  const [coachingCode, setCoachingCode] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const groups = ["Science", "Commerce", "Humanities"];

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!mobile.trim()) {
      setError("Please enter your mobile number.");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!agreeTerms) {
      setError("Please accept the terms and privacy policy to continue.");
      return;
    }

    setLoading(true);
    try {
      // Create student email representation
      const cleanMobile = mobile.replace(/[^0-9]/g, "");
      const email = `${cleanMobile}@student.examino.edu.bd`;

      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Registration failed. This account may already exist.");
        setLoading(false);
        return;
      }

      // Store authentic token and student profile
      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...data.user,
          mobile: cleanMobile,
          level,
          group,
          coachingCode: coachingCode.trim() || "Public Student",
          role: "student",
        })
      );

      // Navigate to student dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Registration error:", err);
      setError("Cannot reach registration server. Please check backend connection.");
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

          <div className="mt-12 lg:mt-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
              Practise like it's <br /> the real exam.
            </h2>
            <p className="mt-4 text-sm text-[#94A3B8] leading-relaxed max-w-sm">
              SSC, HSC and admission model tests with the same timing, marking and pressure — then see exactly which chapters to fix.
            </p>

            {/* 3 Checkmark bullets */}
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-[#F59E0B] font-bold text-lg leading-none mt-0.5">✓</span>
                <span className="text-xs text-[#CBD5E1] leading-relaxed">
                  Answers save on every tap — even on a weak connection
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#F59E0B] font-bold text-lg leading-none mt-0.5">✓</span>
                <span className="text-xs text-[#CBD5E1] leading-relaxed">
                  Rank, chapter-wise score and full explanations after every exam
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#F59E0B] font-bold text-lg leading-none mt-0.5">✓</span>
                <span className="text-xs text-[#CBD5E1] leading-relaxed">
                  Questions in <span className="font-bengali font-medium">বাংলা</span> and English, with proper maths notation
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-[#1E2D4A] mt-10 md:mt-0">
          <p className="text-xs text-[#94A3B8]">
            © 2026 Examino · Privacy · Terms
          </p>
        </div>
      </div>

      {/* ── RIGHT REGISTRATION FORM PANEL ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16">
        <div className="w-full max-w-md">
          
          <div className="mb-6">
            <span className="text-[11px] font-bold tracking-wider text-[#64748B] uppercase">
              Step 1 of 2 · Your details
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mt-1">
              Create your student account
            </h1>
            <p className="text-xs text-[#64748B] mt-1.5">
              Already registered?{" "}
              <Link to="/login" className="text-[#2563EB] font-semibold hover:underline">
                Log in
              </Link>
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] text-xs font-medium rounded-lg flex items-start gap-2.5">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Saif Uddin Babar"
                className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors"
                required
              />
            </div>

            {/* Mobile Number with +880 Prefix */}
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                Mobile number
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-[#CBD5E1] bg-[#F1F5F9] text-xs font-semibold text-[#64748B]">
                  +880
                </span>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="1810993792"
                  className="flex-1 px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-r-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors"
                  required
                />
              </div>
              <p className="text-[11px] text-[#64748B] mt-1">
                We'll text a 6-digit code to verify it. Used to log in.
              </p>
            </div>

            {/* Level & Group Row */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="HSC 2027">HSC 2027</option>
                  <option value="HSC 2026">HSC 2026</option>
                  <option value="SSC 2026">SSC 2026</option>
                  <option value="Admission">University Admission</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Group
                </label>
                <div className="flex bg-[#F1F5F9] p-0.5 rounded-lg border border-[#E2E8F0]">
                  {groups.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGroup(g)}
                      className={`flex-1 py-1.5 text-[11px] font-medium rounded-md transition-all ${
                        group === g
                          ? "bg-white text-[#0F172A] shadow-sm font-semibold"
                          : "text-[#64748B] hover:text-[#0F172A]"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Coaching Centre Code (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                Coaching centre code <span className="text-[#94A3B8] font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={coachingCode}
                onChange={(e) => setCoachingCode(e.target.value)}
                placeholder="e.g. NOBODOY-MIRPUR"
                className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors"
              />
              <p className="text-[11px] text-[#64748B] mt-1">
                Joins you to your centre's batch and exams. You can add it later.
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors"
                required
              />
              
              {/* Password strength indicators */}
              <div className="flex gap-1.5 mt-2">
                <div className={`h-1 flex-1 rounded-full ${password.length >= 6 ? "bg-[#10B981]" : "bg-[#E2E8F0]"}`} />
                <div className={`h-1 flex-1 rounded-full ${password.length >= 8 ? "bg-[#10B981]" : "bg-[#E2E8F0]"}`} />
                <div className={`h-1 flex-1 rounded-full ${password.length >= 10 ? "bg-[#10B981]" : "bg-[#E2E8F0]"}`} />
              </div>
              <p className="text-[10px] text-[#10B981] font-medium mt-1">
                {password.length >= 6 ? "Good password" : "Minimum 6 characters"}
              </p>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="agree"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
              />
              <label htmlFor="agree" className="text-xs text-[#64748B] leading-relaxed cursor-pointer select-none">
                I agree to the Terms and Privacy Policy. Exam data is shared only with my coaching centre.
              </label>
            </div>

            {/* Continue Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? "Creating account..." : "Continue"}
            </button>
          </form>

        </div>
      </div>

    </div>
  );
}
