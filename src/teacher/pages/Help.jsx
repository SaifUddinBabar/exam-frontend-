import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import { Card, CardHeader, PageHeader, SoonBadge } from "../components/ui";
import { ALL_NAV } from "../nav";

const GUIDES = [
  {
    q: "How do I create and share an online exam?",
    a: (
      <>
        Open <Link to="/teacher/exams/new" className="font-semibold text-examino-blue hover:underline">Create exam</Link>, set the title, duration and negative marking, tick
        questions from the bank, then publish. You'll get an exam code and a student link to share on WhatsApp, Messenger or your class group.
      </>
    ),
  },
  {
    q: "How do I write maths, chemistry or physics notation?",
    a: (
      <>
        Wrap formulas in dollar signs, e.g. <code className="rounded bg-slate-100 px-1">$x^2 + 5x + 6 = 0$</code>. Unicode such as x², H₂O and 10⁻¹⁹ also works. The preview on
        the Create question page shows exactly what students will see.
      </>
    ),
  },
  {
    q: "Where do I see results?",
    a: (
      <>
        <Link to="/teacher/results" className="font-semibold text-examino-blue hover:underline">Results & Analytics</Link> lists every exam with average, highest, lowest and pass rate.
        Open an exam for its rank list, score distribution and CSV export. Set the pass mark at the top of the page.
      </>
    ),
  },
  {
    q: "How do I print a question paper?",
    a: (
      <>
        Use the <Link to="/teacher/paper-builder" className="font-semibold text-examino-blue hover:underline">Question Paper Builder</Link>: add sections, pick questions or copy
        them from an exam, then Print or Download PDF. Turn on “Answer key” to add an answer page.
      </>
    ),
  },
  {
    q: "Why can't I edit an exam or a question?",
    a: "The current API can create and delete, but has no update endpoints. To change an exam, duplicate it from the Online Exams menu, adjust the questions, and delete the old one.",
  },
  {
    q: "Why do some students appear twice or merged?",
    a: "Students are identified by the name and roll they type when submitting. Different spellings appear as separate students; identical name and roll pairs are merged.",
  },
];

export default function Help() {
  const [open, setOpen] = useState(0);
  return (
    <>
      <PageHeader title="Help & Support" description="Short guides for everyday tasks and the status of every module." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Guides" />
          <div className="divide-y divide-examino-border px-5 py-2">
            {GUIDES.map((g, i) => (
              <div key={g.q}>
                <h3>
                  <button
                    type="button"
                    aria-expanded={open === i}
                    onClick={() => setOpen(open === i ? -1 : i)}
                    className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-semibold focus:outline-none focus-visible:text-examino-blue"
                  >
                    {g.q}
                    <Icon name={open === i ? "chevronUp" : "chevronDown"} size={16} className="text-examino-muted" />
                  </button>
                </h3>
                {open === i ? <p className="pb-4 text-sm leading-relaxed text-slate-600">{g.a}</p> : null}
              </div>
            ))}
          </div>
        </Card>
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Keyboard" />
            <div className="flex items-center justify-between p-5 text-sm">
              <span>Search anything</span>
              <kbd className="rounded border border-examino-border px-2 py-0.5 text-xs">Ctrl / ⌘ + K</kbd>
            </div>
          </Card>
          <Card>
            <CardHeader title="Module status" />
            <ul className="px-5 py-3 text-sm">
              {ALL_NAV.map((n) => (
                <li key={n.to} className="flex items-center justify-between py-1.5">
                  <Link to={n.to} className="hover:text-examino-blue">
                    {n.label}
                  </Link>
                  {n.soon ? <SoonBadge /> : <span className="text-xs font-semibold text-emerald-700">Available</span>}
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardHeader title="Still stuck?" />
            <p className="p-5 pt-3 text-sm text-examino-muted">Contact the Examino administrator who set up your account. A built-in support inbox isn't available yet.</p>
          </Card>
        </div>
      </div>
    </>
  );
}
