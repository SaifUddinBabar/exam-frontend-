import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import Icon from "./components/Icon";
import { Avatar, Dropdown, IconButton, MenuItem, SoonBadge, ToastProvider } from "./components/ui";
import { useTeacherData } from "./teacherData";
import { ALL_NAV, NAV_FOOTER, NAV_SECTIONS, matchNav } from "./nav";
import { DAY, readPref, timeAgo, writePref } from "./utils";
import { signOutUser } from "../firebase/firebase";

const cx = (...c) => c.filter(Boolean).join(" ");

function Logo({ collapsed }) {
  return (
    <Link to="/teacher" className="flex items-center gap-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
      <svg width="32" height="32" viewBox="0 0 48 48" aria-hidden="true" className="shrink-0">
        <rect width="48" height="48" rx="12" fill="#FFFFFF" />
        <path d="M15 14h18M15 24h9M15 34h18M15 14v20" fill="none" stroke="#101B35" strokeWidth="4" strokeLinecap="round" />
        <circle cx="32" cy="24" r="4" fill="#F59E0B" />
      </svg>
      {!collapsed ? (
        <span className="flex flex-col leading-tight">
          <span className="text-[17px] font-bold tracking-tight text-white">Examino</span>
          <span className="text-[11px] font-medium text-slate-400">Teacher workspace</span>
        </span>
      ) : (
        <span className="sr-only">Examino teacher workspace</span>
      )}
    </Link>
  );
}

function NavItem({ item, collapsed, onNavigate }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      title={collapsed ? `${item.label}${item.soon ? " (coming soon)" : ""}` : undefined}
      className={({ isActive }) =>
        cx(
          "group relative flex h-9 items-center gap-3 rounded-lg text-[13.5px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
          collapsed ? "justify-center px-0" : "px-3",
          isActive ? "bg-white/[0.08] font-semibold text-white" : "font-medium text-slate-300 hover:bg-white/[0.05] hover:text-white"
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive ? <span className="absolute left-0 top-1.5 h-6 w-[3px] rounded-r bg-examino-blue" aria-hidden="true" /> : null}
          <Icon name={item.icon} size={18} className={isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"} />
          {!collapsed ? (
            <>
              <span className="flex-1 truncate">{item.label}</span>
              {item.soon ? <SoonBadge /> : null}
            </>
          ) : null}
        </>
      )}
    </NavLink>
  );
}

function Sidebar({ collapsed, onToggle, mobile, onClose }) {
  const { user } = useTeacherData();
  const show = mobile ? false : collapsed;
  return (
    <div className="flex h-full flex-col bg-examino-navy">
      <div className={cx("flex h-16 shrink-0 items-center border-b border-white/[0.06]", show ? "justify-center px-2" : "justify-between px-4")}>
        <Logo collapsed={show} />
        {mobile ? <IconButton icon="x" label="Close menu" className="text-slate-300 hover:bg-white/10 hover:text-white" onClick={onClose} /> : null}
      </div>
      <nav aria-label="Teacher" className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS.map((section, si) => (
          <div key={si} className={si ? "mt-5" : ""}>
            {section.label && !show ? (
              <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{section.label}</p>
            ) : section.label ? (
              <div className="mx-auto mb-2 h-px w-6 bg-white/10" aria-hidden="true" />
            ) : null}
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <NavItem key={item.to} item={item} collapsed={show} onNavigate={mobile ? onClose : undefined} />
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="shrink-0 border-t border-white/[0.06] px-3 py-3">
        <div className="flex flex-col gap-0.5">
          {NAV_FOOTER.map((item) => (
            <NavItem key={item.to} item={item} collapsed={show} onNavigate={mobile ? onClose : undefined} />
          ))}
        </div>
        <div className={cx("mt-3 flex items-center gap-3 rounded-lg bg-white/[0.04] p-2", show && "justify-center")}>
          <Avatar name={user.name || "Teacher"} size={32} tone="navy" />
          {!show ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-white">{user.name || "Teacher"}</p>
              <p className="truncate text-[11px] text-slate-400">{user.email || "Signed in"}</p>
            </div>
          ) : null}
        </div>
        {!mobile ? (
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cx(
              "mt-2 flex h-8 w-full items-center gap-2 rounded-lg px-3 text-xs font-medium text-slate-400 hover:bg-white/[0.05] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
              collapsed && "justify-center px-0"
            )}
          >
            <Icon name={collapsed ? "expand" : "collapse"} size={16} />
            {!collapsed ? "Collapse" : null}
          </button>
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Global search (Ctrl/⌘ K)

// Mounted only while open, so its state starts fresh every time.
function CommandPalette({ onClose }) {
  const navigate = useNavigate();
  const { exams, students } = useTeacherData();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const pages = ALL_NAV.filter((n) => !term || n.label.toLowerCase().includes(term)).map((n) => ({
      kind: "Page",
      label: n.label,
      hint: n.soon ? "Coming soon" : "",
      icon: n.icon,
      to: n.to,
    }));
    if (!term) return pages.slice(0, 8);
    const examHits = exams
      .filter((e) => e.title?.toLowerCase().includes(term) || e.examCode?.toLowerCase().includes(term))
      .slice(0, 6)
      .map((e) => ({ kind: "Exam", label: e.title, hint: e.examCode, icon: "clipboard", to: `/teacher/results/${e.examCode}` }));
    const studentHits = students
      .filter((s) => s.name.toLowerCase().includes(term) || s.roll.toLowerCase().includes(term))
      .slice(0, 5)
      .map((s) => ({ kind: "Student", label: s.name, hint: `ID ${s.roll}`, icon: "users", to: `/teacher/students?q=${encodeURIComponent(s.roll)}` }));
    return [
      ...pages.slice(0, 4),
      ...examHits,
      ...studentHits,
      { kind: "Questions", label: `Search question bank for “${q.trim()}”`, icon: "database", to: `/teacher/questions?search=${encodeURIComponent(q.trim())}` },
    ];
  }, [q, exams, students]);

  const go = (r) => {
    onClose();
    navigate(r.to);
  };

  return (
    <div className="fixed inset-0 z-[75] flex items-start justify-center px-4 pt-[12vh]">
      <div className="absolute inset-0 bg-examino-navy/50" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-label="Search" className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-dropdown">
        <div className="flex items-center gap-3 border-b border-examino-border px-4">
          <Icon name="search" size={18} className="text-examino-subtle" />
          <input
            autoFocus
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(results.length - 1, a + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(0, a - 1));
              } else if (e.key === "Enter" && results[active]) {
                go(results[active]);
              } else if (e.key === "Escape") {
                onClose();
              }
            }}
            placeholder="Search pages, exams, students, questions…"
            aria-label="Search"
            role="combobox"
            aria-expanded="true"
            aria-controls="teacher-search-results"
            className="h-14 flex-1 bg-transparent text-[15px] focus:outline-none"
          />
          <kbd className="rounded border border-examino-border px-1.5 text-[11px] text-examino-muted">Esc</kbd>
        </div>
        <ul id="teacher-search-results" role="listbox" className="max-h-80 overflow-y-auto py-2">
          {results.map((r, i) => (
            <li key={`${r.kind}-${r.to}-${i}`} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(r)}
                className={cx("flex w-full items-center gap-3 px-4 py-2.5 text-left", i === active ? "bg-examino-blue-light" : "")}
              >
                <Icon name={r.icon} size={17} className="text-examino-muted" />
                <span className="flex-1 truncate text-sm text-examino-text">{r.label}</span>
                {r.hint ? <span className="font-mono text-xs text-examino-muted">{r.hint}</span> : null}
                <span className="text-[11px] font-medium text-examino-subtle">{r.kind}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Notifications (recent submissions)

function Notifications() {
  const { attempts } = useTeacherData();
  const navigate = useNavigate();
  const [lastSeen, setLastSeen] = useState(() => readPref("notificationsSeenAt", 0));
  const [openedAt] = useState(() => Date.now());
  const recent = useMemo(() => {
    const cutoff = openedAt - 7 * DAY;
    return attempts.filter((a) => new Date(a.createdAt).getTime() >= cutoff).slice(0, 12);
  }, [attempts, openedAt]);
  const unread = recent.filter((a) => new Date(a.createdAt).getTime() > lastSeen).length;

  const markRead = () => {
    const now = Date.now();
    setLastSeen(now);
    writePref("notificationsSeenAt", now);
  };

  return (
    <Dropdown
      width="w-[340px] max-w-[calc(100vw-2rem)]"
      trigger={({ toggle, open }) => (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-label={unread ? `Notifications, ${unread} new` : "Notifications"}
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-examino-muted hover:bg-slate-100 hover:text-examino-text focus:outline-none focus-visible:ring-2 focus-visible:ring-examino-blue"
        >
          <Icon name="bell" size={19} />
          {unread ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-examino-rose-dark ring-2 ring-white" /> : null}
        </button>
      )}
    >
      <div className="flex items-center justify-between border-b border-examino-border px-4 py-2.5">
        <p className="text-sm font-semibold">Notifications</p>
        {unread ? (
          <button type="button" onClick={markRead} className="text-xs font-semibold text-examino-blue hover:underline">
            Mark all read
          </button>
        ) : null}
      </div>
      {recent.length ? (
        <ul className="max-h-80 overflow-y-auto">
          {recent.map((a) => {
            const isNew = new Date(a.createdAt).getTime() > lastSeen;
            return (
              <li key={a.id}>
                <button
                  type="button"
                  data-close
                  onClick={() => navigate(`/teacher/results/${a.examCode}`)}
                  className="flex w-full gap-3 px-4 py-2.5 text-left hover:bg-slate-50"
                >
                  <span className={cx("mt-1.5 h-2 w-2 shrink-0 rounded-full", isNew ? "bg-examino-blue" : "bg-transparent")} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] text-examino-text">
                      <b className="font-semibold">{a.name}</b> submitted <span className="font-medium">{a.examTitle}</span>
                    </span>
                    <span className="text-xs text-examino-muted">
                      {a.score}/{a.total} · {timeAgo(a.createdAt)}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="px-4 py-8 text-center text-sm text-examino-muted">No submissions in the last 7 days.</p>
      )}
    </Dropdown>
  );
}

// ---------------------------------------------------------------- Top bar

function Breadcrumb({ pathname }) {
  const item = matchNav(pathname);
  const rest = pathname.slice(item.to.length).replace(/^\//, "");
  const extra = rest === "new" ? (item.to.endsWith("exams") ? "Create exam" : "New") : rest ? decodeURIComponent(rest) : null;
  return (
    <div className="min-w-0">
      <nav aria-label="Breadcrumb" className="hidden items-center gap-1.5 text-xs text-examino-muted sm:flex">
        <Link to="/teacher" className="hover:text-examino-text">
          Teacher
        </Link>
        {item.to !== "/teacher" ? (
          <>
            <Icon name="chevronRight" size={12} />
            {extra ? (
              <Link to={item.to} className="hover:text-examino-text">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </>
        ) : null}
        {extra ? (
          <>
            <Icon name="chevronRight" size={12} />
            <span aria-current="page" className="font-mono">
              {extra}
            </span>
          </>
        ) : null}
      </nav>
      <p className="truncate text-[15px] font-semibold text-examino-text">{extra && extra !== "Create exam" ? item.label : extra || item.label}</p>
    </div>
  );
}

function Topbar({ onMenu, onSearch }) {
  const { user } = useTeacherData();
  const location = useLocation();
  const navigate = useNavigate();
  const signOut = async () => {
    await signOutUser();
  };
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-examino-border bg-white/95 px-4 backdrop-blur sm:px-6">
      <IconButton icon="menu" label="Open menu" className="lg:hidden" onClick={onMenu} />
      <div className="min-w-0 flex-1">
        <Breadcrumb pathname={location.pathname} />
      </div>
      <button
        type="button"
        onClick={onSearch}
        className="hidden h-10 w-72 items-center gap-2 rounded-lg border border-examino-border bg-examino-bg px-3 text-sm text-examino-subtle hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-examino-blue md:flex"
      >
        <Icon name="search" size={16} />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="rounded border border-examino-border bg-white px-1.5 text-[11px] font-medium text-examino-muted">Ctrl K</kbd>
      </button>
      <IconButton icon="search" label="Search" className="md:hidden" onClick={onSearch} />
      <Notifications />
      <IconButton icon="help" label="Help & support" className="hidden sm:inline-flex" onClick={() => navigate("/teacher/help")} />
      <Dropdown
        trigger={({ toggle, open }) => (
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-haspopup="menu"
            className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-examino-blue"
          >
            <Avatar name={user.name || "Teacher"} size={32} />
            <Icon name="chevronDown" size={14} className="hidden text-examino-muted sm:block" />
            <span className="sr-only">Account menu</span>
          </button>
        )}
      >
        <div className="border-b border-examino-border px-3 py-2.5">
          <p className="truncate text-sm font-semibold">{user.name || "Teacher"}</p>
          <p className="truncate text-xs text-examino-muted">{user.email}</p>
        </div>
        <MenuItem icon="settings" onClick={() => navigate("/teacher/settings")}>
          Settings
        </MenuItem>
        <MenuItem icon="card" onClick={() => navigate("/teacher/subscription")}>
          Subscription
        </MenuItem>
        <MenuItem icon="help" onClick={() => navigate("/teacher/help")}>
          Help & support
        </MenuItem>
        <div className="my-1 h-px bg-examino-border" />
        <MenuItem icon="logout" tone="danger" onClick={signOut}>
          Sign out
        </MenuItem>
      </Dropdown>
    </header>
  );
}

// ---------------------------------------------------------------- Shell

export default function TeacherLayout() {
  const [collapsed, setCollapsed] = useState(() => readPref("sidebarCollapsed", false));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
      if (e.key === "Escape") setMobileOpen(false);
    };
    const onUnauthorized = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("examino:unauthorized", onUnauthorized);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("examino:unauthorized", onUnauthorized);
    };
  }, [navigate]);

  const toggle = () => {
    setCollapsed((c) => {
      writePref("sidebarCollapsed", !c);
      return !c;
    });
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-examino-bg font-sans text-examino-text">
        <a href="#teacher-main" className="sr-only z-[90] rounded bg-white px-3 py-2 focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
          Skip to content
        </a>
        <aside
          className={cx("fixed inset-y-0 left-0 z-50 hidden transition-[width] duration-200 lg:block", collapsed ? "w-[72px]" : "w-64")}
          aria-label="Sidebar"
        >
          <Sidebar collapsed={collapsed} onToggle={toggle} />
        </aside>

        {mobileOpen ? (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <div className="absolute inset-0 bg-examino-navy/50" onClick={() => setMobileOpen(false)} aria-hidden="true" />
            <aside
              className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-dropdown"
              aria-label="Sidebar"
              onClick={(e) => {
                if (e.target.closest("a")) setMobileOpen(false);
              }}
            >
              <Sidebar mobile onClose={() => setMobileOpen(false)} />
            </aside>
          </div>
        ) : null}

        <div className={cx("flex min-h-screen flex-col transition-[padding] duration-200", collapsed ? "lg:pl-[72px]" : "lg:pl-64")}>
          <Topbar onMenu={() => setMobileOpen(true)} onSearch={() => setSearchOpen(true)} />
          <main id="teacher-main" className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Outlet />
          </main>
        </div>
        {searchOpen ? <CommandPalette onClose={() => setSearchOpen(false)} /> : null}
      </div>
    </ToastProvider>
  );
}
