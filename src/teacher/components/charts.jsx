import { useEffect, useRef, useState } from "react";

// Lightweight SVG charts (no extra dependency). Single series, brand blue,
// recessive grid, hover crosshair/tooltip, table fallback via aria-label summary.

const BLUE = "#2563EB";
const GRID = "#EEF2F6";
const AXIS_TEXT = "#64748B";

function useElementWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!ref.current) return undefined;
    const el = ref.current;
    const update = () => setWidth(el.getBoundingClientRect().width);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

function niceMax(max) {
  if (max <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(max));
  const n = max / pow;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return nice * pow;
}

function Tooltip({ x, y, width, label, value }) {
  const w = 132;
  const left = Math.min(Math.max(x - w / 2, 0), width - w);
  return (
    <div
      className="pointer-events-none absolute z-10 rounded-lg border border-examino-border bg-white px-3 py-2 shadow-elevated"
      style={{ left, top: Math.max(0, y - 64), width: w }}
    >
      <p className="text-[11px] text-examino-muted">{label}</p>
      <p className="text-sm font-semibold tabular-nums text-examino-text">{value}</p>
    </div>
  );
}

/**
 * data: [{ label, value }] — value may be null (gap, e.g. no attempts that day).
 */
export function AreaChart({ data, height = 220, formatValue = (v) => v, maxValue, ariaLabel, valueSuffix = "" }) {
  const [ref, width] = useElementWidth();
  const [hover, setHover] = useState(null);
  const pad = { top: 16, right: 12, bottom: 28, left: 40 };
  const innerW = Math.max(0, width - pad.left - pad.right);
  const innerH = height - pad.top - pad.bottom;
  const values = data.map((d) => d.value).filter((v) => v !== null && v !== undefined);
  const max = maxValue ?? niceMax(Math.max(0, ...values));
  const step = data.length > 1 ? innerW / (data.length - 1) : 0;
  const x = (i) => pad.left + (data.length > 1 ? i * step : innerW / 2);
  const y = (v) => pad.top + innerH - (v / max) * innerH;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);

  // Build path segments that break on null values.
  const segments = [];
  let current = [];
  data.forEach((d, i) => {
    if (d.value === null || d.value === undefined) {
      if (current.length) segments.push(current);
      current = [];
    } else current.push([x(i), y(d.value)]);
  });
  if (current.length) segments.push(current);

  const labelEvery = Math.max(1, Math.ceil(data.length / Math.max(2, Math.floor(innerW / 70))));
  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const i = data.length > 1 ? Math.round((px - pad.left) / step) : 0;
    setHover(Math.min(data.length - 1, Math.max(0, i)));
  };
  const last = [...data].reverse().find((d) => d.value !== null && d.value !== undefined);

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      {width > 0 ? (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={ariaLabel}
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
          className="block"
        >
          <defs>
            <linearGradient id="exAreaFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={BLUE} stopOpacity="0.14" />
              <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
            </linearGradient>
          </defs>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.left} x2={width - pad.right} y1={y(t)} y2={y(t)} stroke={GRID} />
              <text x={pad.left - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill={AXIS_TEXT}>
                {formatValue(Math.round(t * 10) / 10)}
              </text>
            </g>
          ))}
          {data.map((d, i) =>
            i % labelEvery === 0 || i === data.length - 1 ? (
              <text key={d.label + i} x={x(i)} y={height - 8} textAnchor={data.length > 1 && i === data.length - 1 ? "end" : i === 0 && data.length > 1 ? "start" : "middle"} fontSize="11" fill={AXIS_TEXT}>
                {d.label}
              </text>
            ) : null
          )}
          {segments.map((seg, si) => (
            <g key={si}>
              {seg.length > 1 ? (
                <path
                  d={`M${seg[0][0]},${pad.top + innerH} ${seg.map((p) => `L${p[0]},${p[1]}`).join(" ")} L${seg[seg.length - 1][0]},${pad.top + innerH} Z`}
                  fill="url(#exAreaFill)"
                />
              ) : null}
              <path d={seg.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ")} fill="none" stroke={BLUE} strokeWidth="2" strokeLinejoin="round" />
              {seg.length === 1 ? <circle cx={seg[0][0]} cy={seg[0][1]} r="4" fill={BLUE} /> : null}
            </g>
          ))}
          {hover !== null ? (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={pad.top} y2={pad.top + innerH} stroke="#CBD5E1" strokeDasharray="3 3" />
              {data[hover].value !== null && data[hover].value !== undefined ? (
                <circle cx={x(hover)} cy={y(data[hover].value)} r="5" fill={BLUE} stroke="#fff" strokeWidth="2" />
              ) : null}
            </g>
          ) : null}
        </svg>
      ) : null}
      {hover !== null && width > 0 ? (
        <Tooltip
          x={x(hover)}
          y={data[hover].value !== null && data[hover].value !== undefined ? y(data[hover].value) : pad.top + innerH / 2}
          width={width}
          label={data[hover].label}
          value={data[hover].value === null || data[hover].value === undefined ? "No data" : `${formatValue(data[hover].value)}${valueSuffix}`}
        />
      ) : null}
      {last && hover === null ? <span className="sr-only">Latest value {formatValue(last.value)}</span> : null}
    </div>
  );
}

/** data: [{ label, value }] */
export function BarChart({ data, height = 220, formatValue = (v) => v, ariaLabel, highlightFrom, valueSuffix = "" }) {
  const [ref, width] = useElementWidth();
  const [hover, setHover] = useState(null);
  const pad = { top: 16, right: 8, bottom: 28, left: 36 };
  const innerW = Math.max(0, width - pad.left - pad.right);
  const innerH = height - pad.top - pad.bottom;
  const max = niceMax(Math.max(0, ...data.map((d) => d.value || 0)));
  const slot = data.length ? innerW / data.length : 0;
  const barW = Math.max(4, Math.min(40, slot - 4));
  const y = (v) => pad.top + innerH - (v / max) * innerH;
  const ticks = [0, 0.5, 1].map((t) => t * max);
  const labelEvery = Math.max(1, Math.ceil(data.length / Math.max(2, Math.floor(innerW / 56))));

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      {width > 0 ? (
        <svg width={width} height={height} role="img" aria-label={ariaLabel} onMouseLeave={() => setHover(null)} className="block">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.left} x2={width - pad.right} y1={y(t)} y2={y(t)} stroke={GRID} />
              <text x={pad.left - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill={AXIS_TEXT}>
                {formatValue(t)}
              </text>
            </g>
          ))}
          {data.map((d, i) => {
            const cx = pad.left + slot * i + slot / 2;
            const h = Math.max(0, pad.top + innerH - y(d.value || 0));
            const r = Math.min(4, barW / 2, h);
            const top = pad.top + innerH - h;
            const left = cx - barW / 2;
            const fill = highlightFrom !== undefined && i < highlightFrom ? "#94A3B8" : BLUE;
            return (
              <g key={d.label + i} onMouseEnter={() => setHover(i)}>
                <rect x={pad.left + slot * i} y={pad.top} width={slot} height={innerH} fill="transparent" />
                {h > 0 ? (
                  <path
                    d={`M${left},${top + h} L${left},${top + r} Q${left},${top} ${left + r},${top} L${left + barW - r},${top} Q${left + barW},${top} ${left + barW},${top + r} L${left + barW},${top + h} Z`}
                    fill={fill}
                    opacity={hover === null || hover === i ? 1 : 0.55}
                  />
                ) : null}
                {i % labelEvery === 0 ? (
                  <text x={cx} y={height - 8} textAnchor="middle" fontSize="11" fill={AXIS_TEXT}>
                    {d.label}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      ) : null}
      {hover !== null && width > 0 ? (
        <Tooltip
          x={pad.left + slot * hover + slot / 2}
          y={y(data[hover].value || 0)}
          width={width}
          label={data[hover].label}
          value={`${formatValue(data[hover].value || 0)}${valueSuffix}`}
        />
      ) : null}
    </div>
  );
}

export function Sparkline({ values, width = 88, height = 28, label }) {
  if (!values.length || values.every((v) => !v)) {
    return <span className="text-[11px] text-examino-subtle">No trend yet</span>;
  }
  const max = Math.max(...values, 1);
  const step = values.length > 1 ? (width - 4) / (values.length - 1) : 0;
  const pts = values.map((v, i) => [2 + i * step, height - 3 - (v / max) * (height - 6)]);
  return (
    <svg width={width} height={height} role="img" aria-label={label}>
      <path d={pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ")} fill="none" stroke={BLUE} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3" fill={BLUE} />
    </svg>
  );
}
