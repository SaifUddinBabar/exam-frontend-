import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "./Icon";
import { ToastContext } from "../toast";
import { initials as toInitials } from "../utils";

const cx = (...c) => c.filter(Boolean).join(" ");

// ---------------------------------------------------------------- Buttons

const BTN_BASE =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-lg whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-examino-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const BTN_VARIANTS = {
  primary: "bg-examino-blue text-white hover:bg-examino-blue-hover shadow-subtle",
  secondary: "bg-white text-examino-text border border-slate-300 hover:bg-slate-50",
  ghost: "bg-transparent text-examino-muted hover:bg-slate-100 hover:text-examino-text",
  danger: "bg-examino-rose-dark text-white hover:bg-red-700",
  "danger-ghost": "bg-transparent text-examino-rose-dark hover:bg-examino-rose-light",
  navy: "bg-examino-navy text-white hover:bg-examino-navy-light",
};
const BTN_SIZES = { sm: "h-8 px-3 text-xs", md: "h-10 px-4 text-sm", lg: "h-11 px-5 text-sm" };

export function Button({ variant = "primary", size = "md", icon, iconRight, loading, className, children, ...props }) {
  return (
    <button
      type="button"
      className={cx(BTN_BASE, BTN_VARIANTS[variant], BTN_SIZES[size], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Spinner size={14} /> : icon ? <Icon name={icon} size={size === "sm" ? 15 : 17} /> : null}
      {children}
      {iconRight ? <Icon name={iconRight} size={size === "sm" ? 15 : 17} /> : null}
    </button>
  );
}

export function LinkButton({ to, variant = "primary", size = "md", icon, iconRight, className, children, ...props }) {
  return (
    <Link to={to} className={cx(BTN_BASE, BTN_VARIANTS[variant], BTN_SIZES[size], className)} {...props}>
      {icon ? <Icon name={icon} size={size === "sm" ? 15 : 17} /> : null}
      {children}
      {iconRight ? <Icon name={iconRight} size={size === "sm" ? 15 : 17} /> : null}
    </Link>
  );
}

export function IconButton({ icon, label, className, size = 18, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx(
        "inline-flex h-10 w-10 items-center justify-center rounded-lg text-examino-muted hover:bg-slate-100 hover:text-examino-text focus:outline-none focus-visible:ring-2 focus-visible:ring-examino-blue",
        className
      )}
      {...props}
    >
      <Icon name={icon} size={size} />
    </button>
  );
}

export function Spinner({ size = 18, className }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cx("inline-block animate-spin rounded-full border-2 border-current border-t-transparent", className)}
      style={{ width: size, height: size }}
    />
  );
}

// ---------------------------------------------------------------- Layout primitives

export function Card({ className, children, as: Tag = "section", ...props }) {
  return (
    <Tag className={cx("rounded-card border border-examino-border bg-white shadow-subtle", className)} {...props}>
      {children}
    </Tag>
  );
}

export function CardHeader({ title, description, actions, className }) {
  return (
    <div className={cx("flex flex-wrap items-start justify-between gap-3 px-5 pt-5", className)}>
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold text-examino-text">{title}</h2>
        {description ? <p className="mt-0.5 text-xs text-examino-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function PageHeader({ title, description, actions, eyebrow }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow ? <p className="mb-1 text-xs font-medium text-examino-muted">{eyebrow}</p> : null}
        <h1 className="text-[22px] font-semibold tracking-tight text-examino-text sm:text-2xl">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-examino-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

const BADGE_TONES = {
  neutral: "bg-slate-100 text-slate-600",
  slate: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",
  blue: "bg-examino-blue-light text-examino-blue-hover",
  indigo: "bg-indigo-50 text-indigo-700",
  green: "bg-examino-green-light text-emerald-700",
  amber: "bg-examino-amber-soft text-amber-700",
  red: "bg-examino-rose-light text-red-700",
  navy: "bg-examino-navy text-white",
};

export function Badge({ tone = "neutral", dot, children, className }) {
  return (
    <span
      className={cx(
        "inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-md px-2 text-xs font-semibold",
        BADGE_TONES[tone],
        className
      )}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}

export function SoonBadge({ className }) {
  return (
    <span className={cx("rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-examino-amber-light text-amber-800", className)}>
      Soon
    </span>
  );
}

export function Avatar({ name, size = 32, tone = "blue" }) {
  const tones = { blue: "bg-examino-blue-light text-examino-blue-hover", navy: "bg-white/10 text-white" };
  return (
    <span
      className={cx("inline-flex shrink-0 items-center justify-center rounded-full font-semibold", tones[tone])}
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.38) }}
      aria-hidden="true"
    >
      {toInitials(name)}
    </span>
  );
}

export function Skeleton({ className }) {
  return <div className={cx("animate-pulse rounded-md bg-slate-100", className)} aria-hidden="true" />;
}

export function SkeletonRows({ rows = 5 }) {
  return (
    <div className="space-y-3 p-5" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ icon = "info", title, description, action, className }) {
  return (
    <div className={cx("flex flex-col items-center px-6 py-12 text-center", className)}>
      <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-examino-blue-light text-examino-blue">
        <Icon name={icon} size={22} />
      </span>
      <p className="text-sm font-semibold text-examino-text">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-sm text-examino-muted">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", message, onRetry, className }) {
  return (
    <div role="alert" className={cx("flex flex-col items-center px-6 py-12 text-center", className)}>
      <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-examino-rose-light text-examino-rose-dark">
        <Icon name="alert" size={22} />
      </span>
      <p className="text-sm font-semibold text-examino-text">{title}</p>
      {message ? <p className="mt-1 max-w-md text-sm text-examino-muted">{message}</p> : null}
      {onRetry ? (
        <Button variant="secondary" size="sm" icon="refresh" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function Notice({ tone = "info", title, children, className, action }) {
  const tones = {
    info: "bg-examino-blue-light/60 border-blue-200 text-slate-700",
    warning: "bg-examino-amber-soft border-amber-200 text-amber-900",
    neutral: "bg-slate-50 border-examino-border text-slate-600",
  };
  const iconTone = { info: "text-examino-blue", warning: "text-amber-600", neutral: "text-examino-muted" };
  return (
    <div className={cx("flex gap-3 rounded-lg border px-4 py-3 text-sm", tones[tone], className)}>
      <Icon name={tone === "warning" ? "alert" : "info"} size={18} className={cx("mt-0.5", iconTone[tone])} />
      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold text-examino-text">{title}</p> : null}
        <div className={title ? "mt-0.5" : ""}>{children}</div>
      </div>
      {action ? <div className="shrink-0 self-center">{action}</div> : null}
    </div>
  );
}

// ---------------------------------------------------------------- Form controls

const INPUT =
  "w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-examino-text placeholder:text-examino-subtle focus:border-examino-blue focus:outline-none focus:ring-[3px] focus:ring-examino-blue-soft disabled:bg-slate-50 disabled:text-examino-muted";

export function Field({ label, hint, error, children, htmlFor, required, className }) {
  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      {label ? (
        <label htmlFor={htmlFor} className="text-[13px] font-medium text-examino-text">
          {label}
          {required ? <span className="ml-0.5 text-examino-rose-dark">*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="flex items-center gap-1 text-xs text-red-700" role="alert">
          <Icon name="alert" size={13} /> {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-examino-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({ className, invalid, ...props }) {
  return (
    <input
      className={cx(INPUT, "h-10", invalid && "border-red-500 focus:border-red-500 focus:ring-red-100", className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export function Textarea({ className, invalid, ...props }) {
  return (
    <textarea
      className={cx(INPUT, "py-2.5 leading-relaxed", invalid && "border-red-500", className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }) {
  return (
    <div className={cx("relative", className)}>
      <select className={cx(INPUT, "h-10 appearance-none pr-9")} {...props}>
        {children}
      </select>
      <Icon name="chevronDown" size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-examino-muted" />
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = "Search", className, label = "Search", ...props }) {
  return (
    <label className={cx("relative block", className)}>
      <span className="sr-only">{label}</span>
      <Icon name="search" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-examino-subtle" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cx(INPUT, "h-10 pl-9")}
        {...props}
      />
    </label>
  );
}

export function Segmented({ options, value, onChange, label, size = "md" }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-lg bg-slate-100 p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={o.disabled}
            title={o.title}
            onClick={() => onChange(o.value)}
            className={cx(
              "rounded-md font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-examino-blue disabled:cursor-not-allowed disabled:opacity-50",
              size === "sm" ? "h-7 px-2.5 text-xs" : "h-8 px-3 text-[13px]",
              active ? "bg-white text-examino-text shadow-subtle" : "text-examino-muted hover:text-examino-text"
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Tabs({ tabs, value, onChange, label }) {
  return (
    <div role="tablist" aria-label={label} className="flex gap-6 overflow-x-auto border-b border-examino-border">
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={cx(
              "-mb-px flex h-11 shrink-0 items-center gap-2 border-b-2 text-sm transition-colors focus:outline-none focus-visible:text-examino-blue",
              active ? "border-examino-blue font-semibold text-examino-text" : "border-transparent font-medium text-examino-muted hover:text-examino-text"
            )}
          >
            {t.label}
            {t.count !== undefined ? (
              <span className={cx("rounded-full px-1.5 text-[11px] font-semibold", active ? "bg-examino-blue-light text-examino-blue" : "bg-slate-100 text-examino-muted")}>
                {t.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function Toggle({ checked, onChange, label, description }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <label htmlFor={id} className="text-sm font-medium text-examino-text">
          {label}
        </label>
        {description ? <p className="text-xs text-examino-muted">{description}</p> : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cx(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-examino-blue focus-visible:ring-offset-2",
          checked ? "bg-examino-blue" : "bg-slate-300"
        )}
      >
        <span className={cx("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", checked ? "left-[22px]" : "left-0.5")} />
      </button>
    </div>
  );
}

export function Pagination({ page, totalPages, onChange, summary }) {
  const pages = useMemo(() => {
    const set = new Set([1, totalPages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= totalPages));
    return [...set].sort((a, b) => a - b);
  }, [page, totalPages]);
  if (totalPages <= 1 && !summary) return null;
  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3 border-t border-examino-border px-5 py-3">
      <p className="text-xs text-examino-muted">{summary}</p>
      {totalPages > 1 ? (
        <div className="flex items-center gap-1">
          <IconButton icon="chevronLeft" label="Previous page" className="h-8 w-8" disabled={page <= 1} onClick={() => onChange(page - 1)} />
          {pages.map((p, i) => (
            <span key={p} className="flex items-center">
              {i > 0 && p - pages[i - 1] > 1 ? <span className="px-1 text-xs text-examino-subtle">…</span> : null}
              <button
                type="button"
                aria-current={p === page ? "page" : undefined}
                onClick={() => onChange(p)}
                className={cx(
                  "h-8 min-w-8 rounded-md px-2 text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-examino-blue",
                  p === page ? "bg-examino-navy text-white" : "text-examino-text hover:bg-slate-100"
                )}
              >
                {p}
              </button>
            </span>
          ))}
          <IconButton icon="chevronRight" label="Next page" className="h-8 w-8" disabled={page >= totalPages} onClick={() => onChange(page + 1)} />
        </div>
      ) : null}
    </nav>
  );
}

// ---------------------------------------------------------------- Overlays

function useEscape(open, onClose) {
  useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);
}

export function Modal({ open, onClose, title, description, children, footer, size = "md", labelledBy }) {
  const titleId = useId();
  const panelRef = useRef(null);
  useEscape(open, onClose);
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);
  if (!open) return null;
  const widths = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-3xl", xl: "max-w-5xl" };
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-examino-navy/50" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy || titleId}
        className={cx(
          "relative flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-dropdown focus:outline-none sm:rounded-2xl",
          widths[size]
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-examino-border px-5 py-4">
          <div>
            <h2 id={titleId} className="text-base font-semibold text-examino-text">
              {title}
            </h2>
            {description ? <p className="mt-0.5 text-sm text-examino-muted">{description}</p> : null}
          </div>
          <IconButton icon="x" label="Close" className="-mr-2 -mt-1" onClick={onClose} />
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? <div className="flex flex-wrap justify-end gap-2 border-t border-examino-border px-5 py-3">{footer}</div> : null}
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, title, children, confirmLabel = "Confirm", tone = "danger", busy, onConfirm, onCancel }) {
  return (
    <Modal
      open={open}
      onClose={busy ? undefined : onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={busy} autoFocus>
            Cancel
          </Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} loading={busy}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-sm leading-relaxed text-slate-600">{children}</div>
    </Modal>
  );
}

export function Drawer({ open, onClose, title, children, footer }) {
  const titleId = useId();
  useEscape(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-examino-navy/40" onClick={onClose} aria-hidden="true" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-dropdown"
      >
        <div className="flex items-center justify-between border-b border-examino-border px-5 py-4">
          <h2 id={titleId} className="text-base font-semibold">
            {title}
          </h2>
          <IconButton icon="x" label="Close panel" onClick={onClose} />
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? <div className="border-t border-examino-border px-5 py-3">{footer}</div> : null}
      </aside>
    </div>
  );
}

export function Dropdown({ trigger, children, align = "right", width = "w-56" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const esc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", handle);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open ? (
        <div
          role="menu"
          className={cx(
            "absolute top-full z-50 mt-2 overflow-hidden rounded-xl border border-examino-border bg-white py-1 shadow-dropdown",
            align === "right" ? "right-0" : "left-0",
            width
          )}
          onClick={(e) => {
            if (e.target.closest("[data-close]")) setOpen(false);
          }}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function MenuItem({ icon, children, tone, ...props }) {
  return (
    <button
      type="button"
      role="menuitem"
      data-close
      className={cx(
        "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-slate-50 focus:bg-slate-50 focus:outline-none",
        tone === "danger" ? "text-red-700" : "text-examino-text"
      )}
      {...props}
    >
      {icon ? <Icon name={icon} size={16} className={tone === "danger" ? "" : "text-examino-muted"} /> : null}
      {children}
    </button>
  );
}

// ---------------------------------------------------------------- Toasts

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
    clearTimeout(timers.current[id]);
  }, []);

  const notify = useCallback(
    ({ title, description, tone = "success", action, duration }) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((t) => [...t.slice(-3), { id, title, description, tone, action }]);
      const ms = duration ?? (tone === "error" ? 8000 : 4000);
      timers.current[id] = setTimeout(() => dismiss(id), ms);
      return id;
    },
    [dismiss]
  );

  const value = useMemo(() => ({ notify, dismiss }), [notify, dismiss]);
  const icons = { success: ["check", "bg-examino-green-dark"], error: ["alert", "bg-examino-rose-dark"], info: ["info", "bg-examino-blue"] };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.tone === "error" ? "alert" : "status"}
            className="pointer-events-auto flex items-start gap-3 rounded-xl border border-examino-border bg-white px-4 py-3 shadow-dropdown"
          >
            <span className={cx("mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-white", icons[t.tone][1])}>
              <Icon name={icons[t.tone][0]} size={12} strokeWidth={2.5} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-examino-text">{t.title}</p>
              {t.description ? <p className="mt-0.5 text-xs text-examino-muted">{t.description}</p> : null}
            </div>
            {t.action ? (
              <button
                type="button"
                className="text-xs font-semibold text-examino-blue hover:underline"
                onClick={() => {
                  t.action.onClick();
                  dismiss(t.id);
                }}
              >
                {t.action.label}
              </button>
            ) : null}
            <button type="button" aria-label="Dismiss" className="text-examino-subtle hover:text-examino-text" onClick={() => dismiss(t.id)}>
              <Icon name="x" size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
