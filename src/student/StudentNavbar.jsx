import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ExaminoLogo from "../components/ExaminoLogo";
import Icon from "../teacher/components/Icon";
import { Avatar } from "../teacher/components/ui";
import { signOutUser } from "../firebase/firebase";
import { api } from "../teacher/api";
import { setLanguagePref } from "../lib/questionLanguage";
import { currentUser, useLanguage } from "../lib/useAsync";

const cx = (...c) => c.filter(Boolean).join(" ");

const NAV = [
  { to: "/dashboard", label: "Home", icon: "home", match: ["/dashboard"] },
  { to: "/exams", label: "Exams", icon: "clipboard", match: ["/exams", "/exam/"] },
  { to: "/practice", label: "Practice", icon: "target", match: ["/practice", "/weak-topics", "/saved-questions"] },
  { to: "/battle", label: "Battle", icon: "swords", match: ["/battle"] },
  { to: "/league", label: "League", icon: "trophy", match: ["/league", "/leaderboard"] },
];

const MENU = [
  { to: "/profile", label: "Profile", icon: "user" },
  { to: "/batches", label: "My batches", icon: "layers" },
  { to: "/notices", label: "Notices", icon: "megaphone" },
  { to: "/performance", label: "Progress", icon: "chart" },
  { to: "/history", label: "Exam history", icon: "clock" },
  { to: "/weak-topics", label: "Weak topics", icon: "flag" },
  { to: "/saved-questions", label: "Saved questions", icon: "star" },
];

export default function StudentNavbar() {
  const { pathname } = useLocation();
  const [user, setUser] = useState(currentUser);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const lang = useLanguage();
  const menuRef = useRef(null);

  const isActive = (item) => item.match.some((m) => pathname === m || pathname.startsWith(m.endsWith("/") ? m : `${m}/`) || pathname === m);

  useEffect(() => {
    const ctrl = new AbortController();
    api.notices({ signal: ctrl.signal }).then((r) => setUnread(r?.unread || 0)).catch(() => {});
    if (!user.name) api.me({ signal: ctrl.signal }).then((r) => r?.user && (setUser(r.user), localStorage.setItem("user", JSON.stringify(r.user)))).catch(() => {});
    const onRead = () => api.notices().then((r) => setUnread(r?.unread || 0)).catch(() => {});
    window.addEventListener("examino:notices-changed", onRead);
    return () => {
      ctrl.abort();
      window.removeEventListener("examino:notices-changed", onRead);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onDown = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenuOpen(false);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-examino-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <ExaminoLogo to="/dashboard" />
            <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={isActive(item) ? "page" : undefined}
                  className={cx(
                    "inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors",
                    isActive(item) ? "bg-examino-blue-light text-examino-blue" : "text-examino-muted hover:bg-slate-100 hover:text-examino-text"
                  )}
                >
                  <Icon name={item.icon} size={16} />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden rounded-lg border border-examino-border bg-slate-50 p-0.5 sm:flex" role="group" aria-label="Question language">
              {[
                ["bangla", "বাংলা"],
                ["english", "English"],
              ].map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setLanguagePref(k)}
                  aria-pressed={lang === k}
                  className={cx("rounded-md px-2.5 py-1 text-xs font-semibold", lang === k ? "bg-white text-examino-text shadow-subtle" : "text-examino-muted hover:text-examino-text")}
                >
                  {label}
                </button>
              ))}
            </div>

            <Link to="/notices" className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-examino-muted hover:bg-slate-100 hover:text-examino-text" aria-label={`Notices${unread ? `, ${unread} unread` : ""}`}>
              <Icon name="bell" size={19} />
              {unread ? (
                <span className="absolute right-1.5 top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-examino-rose px-1 text-[10px] font-bold text-white">{unread > 9 ? "9+" : unread}</span>
              ) : null}
            </Link>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-examino-blue"
              >
                <Avatar name={user.name || "Student"} size={32} />
                <span className="hidden max-w-[120px] truncate text-sm font-semibold text-examino-text lg:block">{user.name || "Student"}</span>
                <Icon name="chevronDown" size={14} className="hidden text-examino-muted lg:block" />
              </button>
              {menuOpen ? (
                <div role="menu" className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-examino-border bg-white py-1 shadow-dropdown">
                  <div className="border-b border-examino-border px-4 py-3">
                    <p className="truncate text-sm font-semibold text-examino-text">{user.name || "Student"}</p>
                    <p className="truncate text-xs text-examino-muted">{user.email || user.phone || ""}</p>
                  </div>
                  <div className="flex gap-1 border-b border-examino-border p-2 sm:hidden">
                    {[
                      ["bangla", "বাংলা"],
                      ["english", "English"],
                    ].map(([k, label]) => (
                      <button key={k} type="button" onClick={() => setLanguagePref(k)} className={cx("flex-1 rounded-md py-1.5 text-xs font-semibold", lang === k ? "bg-examino-blue-light text-examino-blue" : "text-examino-muted")}>
                        {label}
                      </button>
                    ))}
                  </div>
                  {MENU.map((m) => (
                    <Link key={m.to} to={m.to} role="menuitem" className="flex items-center gap-3 px-4 py-2 text-sm text-examino-text hover:bg-slate-50">
                      <Icon name={m.icon} size={16} className="text-examino-muted" />
                      {m.label}
                      {m.to === "/notices" && unread ? <span className="ml-auto rounded-full bg-examino-rose-light px-1.5 text-[11px] font-bold text-examino-rose-dark">{unread}</span> : null}
                    </Link>
                  ))}
                  <button type="button" role="menuitem" onClick={() => signOutUser()} className="flex w-full items-center gap-3 border-t border-examino-border px-4 py-2.5 text-sm text-examino-rose-dark hover:bg-examino-rose-light">
                    <Icon name="logout" size={16} />
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-examino-border bg-white pb-[env(safe-area-inset-bottom)] md:hidden" aria-label="Main">
        <div className="grid grid-cols-5">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              aria-current={isActive(item) ? "page" : undefined}
              className={cx("flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold", isActive(item) ? "text-examino-blue" : "text-examino-muted")}
            >
              <Icon name={item.icon} size={20} />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
