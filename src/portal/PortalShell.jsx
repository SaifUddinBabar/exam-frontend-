import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import ExaminoLogo from "../components/ExaminoLogo";
import Icon from "../teacher/components/Icon";
import { Avatar, IconButton } from "../teacher/components/ui";
import { signOutUser } from "../firebase/firebase";
import { currentUser } from "../lib/useAsync";

const cx = (...c) => c.filter(Boolean).join(" ");

// Shared shell for the admin and organization portals — same navy sidebar,
// typography and spacing as the teacher workspace.
export default function PortalShell({ title, subtitle, nav, children }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const user = currentUser();
  useEffect(() => setOpen(false), [pathname]);

  const sidebar = (
    <div className="flex h-full flex-col bg-examino-navy">
      <div className="flex h-16 items-center justify-between px-4">
        <ExaminoLogo light size="sm" to={nav[0]?.to} subtitle={subtitle} />
        <IconButton icon="x" label="Close menu" className="text-slate-300 hover:bg-white/10 hover:text-white lg:hidden" onClick={() => setOpen(false)} />
      </div>
      <nav aria-label={title} className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cx(
                "relative flex h-9 items-center gap-3 rounded-lg px-3 text-[13.5px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                isActive ? "bg-white/[0.08] font-semibold text-white" : "font-medium text-slate-300 hover:bg-white/[0.05] hover:text-white"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? <span className="absolute left-0 top-1.5 h-6 w-[3px] rounded-r bg-examino-blue" aria-hidden="true" /> : null}
                <Icon name={item.icon} size={18} className={isActive ? "text-white" : "text-slate-400"} />
                <span className="truncate">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/[0.06] p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar name={user.name || "Admin"} size={32} tone="navy" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-white">{user.name || "Admin"}</p>
            <p className="truncate text-[11px] text-slate-400">{user.email || ""}</p>
          </div>
          <IconButton icon="logout" label="Sign out" className="h-8 w-8 text-slate-400 hover:bg-white/10 hover:text-white" onClick={() => signOutUser()} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-examino-bg">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block">{sidebar}</aside>
      {open ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-examino-navy/50" onClick={() => setOpen(false)} aria-hidden="true" />
          <aside className="relative h-full w-72">{sidebar}</aside>
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-examino-border bg-white/95 px-4 backdrop-blur sm:px-6">
          <IconButton icon="menu" label="Open menu" className="lg:hidden" onClick={() => setOpen(true)} />
          <p className="text-sm font-semibold text-examino-text">{title}</p>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

export function MiniBars({ series, label }) {
  const max = Math.max(1, ...series.map((d) => d.count));
  return (
    <div>
      <div className="flex h-28 items-end gap-[3px]" role="img" aria-label={`${label}: ${series.map((d) => d.count).join(", ")}`}>
        {series.map((d) => (
          <div key={d.day} title={`${d.day}: ${d.count}`} className="flex-1 rounded-t bg-examino-blue/80" style={{ height: `${Math.max(2, (d.count / max) * 100)}%` }} />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-examino-muted">
        <span>{series[0]?.day}</span>
        <span>{series[series.length - 1]?.day}</span>
      </div>
    </div>
  );
}
