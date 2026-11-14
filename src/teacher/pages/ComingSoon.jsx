import Icon from "../components/Icon";
import { Card, LinkButton, PageHeader, SoonBadge } from "../components/ui";

const MODULES = {
  courses: {
    title: "My Courses",
    icon: "book",
    summary: "Create courses, group students into them, and track course-level performance.",
    plan: ["Course cards and table view with subject, student count and status", "Published / draft courses", "Course performance from linked exams", "Search, filter and sort"],
    missing: ["A Course model and /api/courses CRUD endpoints", "Enrollment linking students to courses"],
    alternative: { to: "/teacher/students", label: "See your students" },
  },
  payments: {
    title: "Payments & Earnings",
    icon: "wallet",
    summary: "See what you've earned from course and exam sales, your available balance and payouts, in BDT.",
    plan: ["Total earnings and available balance", "Transaction history with payment status", "Revenue trend chart"],
    missing: ["A payment gateway integration (e.g. bKash, Nagad or SSLCOMMERZ)", "Transaction and payout models plus their API"],
    alternative: { to: "/teacher/subscription", label: "View your plan" },
  },
  website: {
    title: "My Website",
    icon: "globe",
    summary: "Publish a branded public page for your coaching with your courses and exams.",
    plan: ["Website status and public URL", "Logo and brand colour", "Public profile and course visibility", "Live preview"],
    missing: ["Teacher-scoped website settings endpoints (organisation branding exists only for org admins)", "A public site renderer and custom-domain routing"],
    alternative: { to: "/teacher/exams", label: "Share an exam link instead" },
  },
};

export default function ComingSoon({ module }) {
  const m = MODULES[module];
  return (
    <>
      <PageHeader title={<span className="flex items-center gap-3">{m.title} <SoonBadge /></span>} description={m.summary} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-examino-blue-light text-examino-blue">
            <Icon name={m.icon} size={22} />
          </span>
          <h2 className="mt-4 text-base font-semibold">What this module will include</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {m.plan.map((p) => (
              <li key={p} className="flex gap-2">
                <Icon name="check" size={16} className="mt-0.5 text-examino-blue" />
                {p}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-6">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-examino-amber-soft text-amber-700">
            <Icon name="lock" size={22} />
          </span>
          <h2 className="mt-4 text-base font-semibold">Why it isn't available yet</h2>
          <p className="mt-1 text-sm text-examino-muted">This screen won't show placeholder numbers. It needs backend support that doesn't exist yet:</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {m.missing.map((p) => (
              <li key={p} className="flex gap-2">
                <Icon name="info" size={16} className="mt-0.5 text-amber-600" />
                {p}
              </li>
            ))}
          </ul>
          <LinkButton to={m.alternative.to} variant="secondary" className="mt-5" iconRight="arrowRight">
            {m.alternative.label}
          </LinkButton>
        </Card>
      </div>
    </>
  );
}
