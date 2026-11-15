// Sidebar structure. `soon: true` marks modules with no backend support yet —
// they open an honest "coming soon" page instead of fake functionality.
export const NAV_SECTIONS = [
  {
    label: null,
    items: [{ to: "/teacher", label: "Overview", icon: "home", end: true }],
  },
  {
    label: "Teaching",
    items: [
      { to: "/teacher/courses", label: "My Courses", icon: "book", soon: true },
      { to: "/teacher/students", label: "My Students", icon: "users" },
      { to: "/teacher/batches", label: "Batches", icon: "layers" },
      { to: "/teacher/notices", label: "Notices", icon: "megaphone" },
    ],
  },
  {
    label: "Content",
    items: [
      { to: "/teacher/questions", label: "Question Bank", icon: "database" },
    ],
  },
  {
    label: "Assessment",
    items: [
      { to: "/teacher/exams", label: "Online Exams", icon: "clipboard" },
      { to: "/teacher/results", label: "Results & Analytics", icon: "chart" },
    ],
  },
  {
    label: "Business",
    items: [
      { to: "/teacher/payments", label: "Payments & Earnings", icon: "wallet", soon: true },
      { to: "/teacher/website", label: "My Website", icon: "globe", soon: true },
      { to: "/teacher/subscription", label: "Subscription & Plans", icon: "card" },
    ],
  },
];

export const NAV_FOOTER = [
  { to: "/teacher/settings", label: "Settings", icon: "settings" },
  { to: "/teacher/help", label: "Help & Support", icon: "help" },
];

export const ALL_NAV = [...NAV_SECTIONS.flatMap((s) => s.items), ...NAV_FOOTER];

// Longest matching nav item for a path — used for the top-bar title & breadcrumb.
export function matchNav(pathname) {
  let best = null;
  ALL_NAV.forEach((item) => {
    const hit = item.end ? pathname === item.to || pathname === `${item.to}/` : pathname === item.to || pathname.startsWith(`${item.to}/`);
    if (hit && (!best || item.to.length > best.to.length)) best = item;
  });
  return best || ALL_NAV[0];
}
