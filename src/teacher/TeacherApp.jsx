import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import TeacherDataProvider from "./TeacherDataProvider";
import TeacherLayout from "./TeacherLayout";
import { SkeletonRows } from "./components/ui";

const Overview = lazy(() => import("./pages/Overview"));
const Students = lazy(() => import("./pages/Students"));
const QuestionBank = lazy(() => import("./pages/QuestionBank"));
const CreateQuestion = lazy(() => import("./pages/CreateQuestion"));
const Exams = lazy(() => import("./pages/Exams"));
const CreateExam = lazy(() => import("./pages/CreateExam"));
const PaperBuilder = lazy(() => import("./pages/PaperBuilder"));
const Results = lazy(() => import("./pages/Results"));
const Subscription = lazy(() => import("./pages/Subscription"));
const Settings = lazy(() => import("./pages/Settings"));
const Help = lazy(() => import("./pages/Help"));
const ComingSoon = lazy(() => import("./pages/ComingSoon"));

function PageFallback() {
  return (
    <div className="rounded-card border border-examino-border bg-white">
      <SkeletonRows rows={5} />
    </div>
  );
}

const page = (el) => <Suspense fallback={<PageFallback />}>{el}</Suspense>;

// The backend registers every account with role "tutor", including students who sign up
// through the student portal (their email ends in @student.examino.edu.bd). Keep those
// accounts in the student portal. This is a UI guard only — see the completion report.
function isStudentAccount() {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    return u.role === "student" || /@student\.examino\.edu\.bd$/i.test(u.email || "");
  } catch {
    return false;
  }
}

export default function TeacherApp() {
  if (isStudentAccount()) return <Navigate to="/dashboard" replace />;
  return (
    <TeacherDataProvider>
      <Routes>
        <Route element={<TeacherLayout />}>
          <Route index element={page(<Overview />)} />
          <Route path="courses" element={page(<ComingSoon module="courses" />)} />
          <Route path="students" element={page(<Students />)} />
          <Route path="questions" element={page(<QuestionBank />)} />
          <Route path="questions/new" element={page(<CreateQuestion />)} />
          <Route path="exams" element={page(<Exams />)} />
          <Route path="exams/new" element={page(<CreateExam />)} />
          <Route path="paper-builder" element={page(<PaperBuilder />)} />
          <Route path="results" element={page(<Results />)} />
          <Route path="results/:code" element={page(<Results />)} />
          <Route path="payments" element={page(<ComingSoon module="payments" />)} />
          <Route path="website" element={page(<ComingSoon module="website" />)} />
          <Route path="subscription" element={page(<Subscription />)} />
          <Route path="settings" element={page(<Settings />)} />
          <Route path="help" element={page(<Help />)} />
          <Route path="*" element={<Navigate to="/teacher" replace />} />
        </Route>
      </Routes>
    </TeacherDataProvider>
  );
}
