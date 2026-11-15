import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ExaminoLogo from "../components/ExaminoLogo";
import Icon from "../teacher/components/Icon";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AcceptInvitation() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inviteData, setInviteData] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    async function checkInvite() {
      if (!code) {
        setError("Invalid invitation link.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API}/api/invitations/verify/${encodeURIComponent(code)}`);
        const data = await res.json();
        if (res.ok && data.valid) {
          setInviteData(data.invitation);
        } else {
          setError(data.message || "This invitation is invalid or has expired.");
        }
      } catch (err) {
        setError("Unable to verify invitation link. Please check your connection.");
      } finally {
        setLoading(false);
      }
    }
    checkInvite();
  }, [code]);

  const handleAccept = async () => {
    if (!token) {
      navigate("/login", { state: { from: `/invite/${code}`, message: "Please sign in to accept this invitation." } });
      return;
    }

    setAccepting(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/invitations/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Failed to accept invitation.");
        setAccepting(false);
        return;
      }

      setSuccessMsg(data.message || "Invitation accepted successfully!");
      setTimeout(() => {
        if (inviteData?.role === "teacher") {
          navigate("/teacher", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      }, 1500);
    } catch {
      setError("Network error while accepting invitation.");
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-2xl shadow-elevated p-8 text-center animate-scaleUp">
        <div className="mb-6 flex justify-center">
          <ExaminoLogo to="/dashboard" />
        </div>

        {loading ? (
          <div className="py-12">
            <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-[#64748B]">Verifying invitation...</p>
          </div>
        ) : error ? (
          <div className="py-6">
            <div className="w-12 h-12 rounded-full bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center text-xl mx-auto mb-3">
              ✕
            </div>
            <h2 className="text-lg font-bold text-[#0F172A]">Invitation Unavailable</h2>
            <p className="text-xs text-[#DC2626] mt-2 font-medium">{error}</p>
            <div className="mt-6">
              <Link to="/login" className="px-4 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-lg shadow-sm">
                Go to Sign in
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center text-2xl mx-auto mb-4 border border-[#BFDBFE]">
              <Icon name="school" size={26} />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB] bg-[#EFF6FF] px-2.5 py-0.5 rounded-full">
              Organization Invitation
            </span>

            <h2 className="text-xl font-extrabold text-[#0F172A] mt-3">
              You're invited to join <br />
              <span className="text-[#2563EB]">{inviteData?.organization?.name}</span>
            </h2>

            <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
              Invited by <span className="font-semibold text-[#0F172A]">{inviteData?.invitedBy}</span> as a{" "}
              <span className="font-bold uppercase text-[#0F172A]">{inviteData?.role}</span>.
            </p>

            {successMsg ? (
              <div className="mt-6 p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl text-xs font-semibold text-[#059669]">
                ✓ {successMsg}
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {currentUser ? (
                  <div>
                    <p className="text-xs text-[#64748B] mb-3">
                      Logged in as: <span className="font-bold text-[#0F172A]">{currentUser.name || currentUser.email}</span>
                    </p>
                    <button
                      type="button"
                      onClick={handleAccept}
                      disabled={accepting}
                      className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      {accepting ? "Joining workspace..." : "Accept Invitation & Enter \u2192"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleAccept}
                      className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl shadow-md transition-all"
                    >
                      Sign In to Accept &rarr;
                    </button>
                    <Link
                      to="/register"
                      className="block text-xs font-semibold text-[#64748B] hover:text-[#0F172A] py-1"
                    >
                      Don't have an account? Register first
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
