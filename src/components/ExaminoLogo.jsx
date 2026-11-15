import { Link } from "react-router-dom";

// The one Examino logo: navy "E" badge with the blue dot.
// `light` = white wordmark (and inverted badge) for navy backgrounds.
// `subtitle` = small caption under the wordmark (e.g. "Teacher workspace").
export default function ExaminoLogo({ light = false, size = "md", to = "/dashboard", subtitle, compact = false }) {
  const badge = size === "sm" ? 28 : size === "lg" ? 44 : 36;
  const text = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-xl";
  const content = (
    <span className="group flex select-none items-center gap-2.5">
      <svg width={badge} height={badge} viewBox="0 0 40 40" aria-hidden="true" className="shrink-0 transition-transform group-hover:scale-105">
        <rect width="40" height="40" rx="10" fill={light ? "#FFFFFF" : "#101B35"} />
        <path d="M13 11h13M13 20h10M13 29h13M13 11v18" fill="none" stroke={light ? "#101B35" : "#FFFFFF"} strokeWidth="3.4" strokeLinecap="round" />
        <circle cx="29" cy="20" r="3.2" fill="#2563EB" />
      </svg>
      {compact ? (
        <span className="sr-only">Examino</span>
      ) : (
        <span className="flex flex-col leading-tight">
          <span className={`font-bold tracking-tight ${text} ${light ? "text-white" : "text-examino-text"}`}>Examino</span>
          {subtitle ? <span className={`text-[11px] font-medium ${light ? "text-slate-400" : "text-examino-muted"}`}>{subtitle}</span> : null}
        </span>
      )}
    </span>
  );
  return to ? (
    <Link to={to} className="inline-block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-examino-blue">
      {content}
    </Link>
  ) : (
    content
  );
}
