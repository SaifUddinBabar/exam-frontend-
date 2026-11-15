import StudentNavbar from "./StudentNavbar";

export default function StudentLayout({ children, maxWidth = "max-w-7xl" }) {
  return (
    <div className="flex min-h-screen flex-col bg-examino-bg font-sans">
      <StudentNavbar />
      <main className={`mx-auto w-full flex-1 px-4 pb-24 pt-6 sm:px-6 md:pb-12 md:pt-8 lg:px-8 ${maxWidth}`}>{children}</main>
    </div>
  );
}

// Page title block shared by every student page.
export function StudentPageHeader({ title, subtitle, actions, eyebrow }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-examino-blue">{eyebrow}</p> : null}
        <h1 className="text-2xl font-bold tracking-tight text-examino-text sm:text-[28px]">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-examino-muted">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
