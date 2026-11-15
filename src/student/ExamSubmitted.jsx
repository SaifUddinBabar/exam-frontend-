import { Navigate, useParams } from "react-router-dom";
import ExaminoLogo from "../components/ExaminoLogo";
import { Card, LinkButton, Notice } from "../teacher/components/ui";
import Icon from "../teacher/components/Icon";
import { fmtWhen } from "./examFormat";

// Receipt shown right after submission. It only displays the server's response
// for this browser session; without one, the student is sent to the real result page.
export default function ExamSubmitted() {
  const { code } = useParams();
  let receipt = null;
  try {
    receipt = JSON.parse(sessionStorage.getItem(`examino_submission_${String(code).toUpperCase()}`) || "null");
  } catch {
    receipt = null;
  }
  if (!receipt) return <Navigate to={`/exams/${code}/result`} replace />;

  const answered = receipt.correctCount + receipt.wrongCount;
  return (
    <div className="flex min-h-screen flex-col items-center bg-examino-bg px-4 py-10">
      <ExaminoLogo to="/dashboard" />
      <Card className="mt-8 w-full max-w-md p-6 text-center sm:p-8">
        <span className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-examino-green-light text-emerald-600">
          <Icon name="check" size={28} strokeWidth={2.5} />
        </span>
        <h1 className="text-2xl font-bold text-examino-text">{receipt.auto ? "Time's up — exam submitted" : "Exam submitted"}</h1>
        <p className="mt-1 text-sm text-examino-muted font-bengali">{receipt.examTitle}</p>
        <dl className="mt-6 divide-y divide-examino-border rounded-xl border border-examino-border text-left text-sm">
          {[
            ["Submitted", fmtWhen(receipt.submittedAt)],
            ["Answered", `${answered} of ${receipt.totalQuestions}`],
            ["Attempt", `#${receipt.attemptNumber}`],
            ...(receipt.solutionsReleased ? [["Score", `${receipt.score} / ${receipt.totalQuestions}`]] : []),
            ...(receipt.xpEarned ? [["XP earned", `+${receipt.xpEarned}`]] : []),
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between px-4 py-2.5">
              <dt className="text-examino-muted">{k}</dt>
              <dd className="font-semibold text-examino-text">{v}</dd>
            </div>
          ))}
        </dl>
        {receipt.lateAutosaveUsed ? (
          <Notice tone="warning" className="mt-4 text-left">
            Time had already run out, so your last automatically saved answers were graded.
          </Notice>
        ) : null}
        {!receipt.solutionsReleased ? (
          <Notice tone="info" className="mt-4 text-left">
            Scores and solutions are published {receipt.solutionReleaseTime ? `on ${fmtWhen(receipt.solutionReleaseTime)}` : "after the exam closes"}.
          </Notice>
        ) : null}
        <div className="mt-6 grid grid-cols-2 gap-2">
          <LinkButton to="/dashboard" variant="secondary">
            Dashboard
          </LinkButton>
          <LinkButton to={`/exams/${code}/result`}>View result</LinkButton>
        </div>
      </Card>
    </div>
  );
}
