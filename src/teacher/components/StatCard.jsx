import { Link } from "react-router-dom";
import Icon from "./Icon";
import { Skeleton } from "./ui";
import { Sparkline } from "./charts";

/**
 * state: "loading" | "ready" | "unavailable"
 * delta: number | null  (difference vs previous period; null hides the comparison)
 */
export default function StatCard({ label, value, icon, state = "ready", delta = null, deltaLabel, spark, note, unavailableText, unavailableLink }) {
  return (
    <div className="flex flex-col rounded-card border border-examino-border bg-white p-5 shadow-subtle">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-examino-muted">{label}</p>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-examino-blue-light text-examino-blue">
          <Icon name={icon} size={17} />
        </span>
      </div>

      {state === "loading" ? (
        <div className="mt-3 space-y-2" aria-busy="true">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
      ) : state === "unavailable" ? (
        <div className="mt-3 flex flex-1 flex-col">
          <p className="text-2xl font-semibold tracking-tight text-examino-subtle">—</p>
          <p className="mt-1 text-xs text-examino-muted">{unavailableText}</p>
          {unavailableLink ? (
            <Link to={unavailableLink.to} className="mt-auto pt-2 text-xs font-semibold text-examino-blue hover:underline">
              {unavailableLink.label}
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[28px] font-semibold leading-none tracking-tight tabular-nums text-examino-text">{value}</p>
            {delta !== null ? (
              <p className="mt-2 flex items-center gap-1 text-xs">
                <span
                  className={
                    delta > 0
                      ? "inline-flex items-center gap-0.5 font-semibold text-emerald-700"
                      : delta < 0
                      ? "inline-flex items-center gap-0.5 font-semibold text-red-700"
                      : "font-semibold text-examino-muted"
                  }
                >
                  {delta !== 0 ? <Icon name={delta > 0 ? "arrowUp" : "arrowDown"} size={12} strokeWidth={2.4} /> : null}
                  {delta > 0 ? "+" : ""}
                  {delta}
                </span>
                <span className="text-examino-muted">{deltaLabel}</span>
              </p>
            ) : note ? (
              <p className="mt-2 text-xs text-examino-muted">{note}</p>
            ) : null}
          </div>
          {spark ? <Sparkline values={spark} label={`${label} trend`} /> : null}
        </div>
      )}
    </div>
  );
}
