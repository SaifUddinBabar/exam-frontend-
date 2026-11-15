// League emblem used on the dashboard, league page and battle results.
export const LEAGUE_COLORS = {
  bronze: ["#B45309", "#FDE7C7"],
  silver: ["#64748B", "#E2E8F0"],
  gold: ["#CA8A04", "#FEF3C7"],
  platinum: ["#0E7490", "#CFFAFE"],
  diamond: ["#2563EB", "#DBEAFE"],
  champion: ["#7C3AED", "#EDE9FE"],
};

export function LeagueBadge({ league, size = 40 }) {
  const [fg, bg] = LEAGUE_COLORS[league?.key] || LEAGUE_COLORS.bronze;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label={`${league?.name || "Bronze"} league`}>
      <path d="M24 3 42 10v13c0 11-7.6 19.4-18 22C13.6 42.4 6 34 6 23V10L24 3Z" fill={bg} stroke={fg} strokeWidth="2.5" />
      <path d="m24 14 3 6.2 6.8 1-4.9 4.7 1.2 6.7L24 29.4l-6.1 3.2 1.2-6.7-4.9-4.7 6.8-1L24 14Z" fill={fg} />
    </svg>
  );
}
