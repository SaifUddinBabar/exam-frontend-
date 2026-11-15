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
const Batches = lazy(() => import("./pages/Batches"));
const Notices = lazy(() => import("./pages/Notices"));

function PageFallback() {
  return (
    <div className="rounded-card border border-examino-border bg-white">
      <SkeletonRows rows={5} />
    </div>
  );
}

const page = (el) => <Suspense fallback={<PageFallback />}>{el}</Suspense>;

export default function TeacherApp() {
  return (
    <TeacherDataProvider>
      <Routes>
        <Route element={<TeacherLayout />}>
          <Route index element={page(<Overview />)} />
          <Route path="courses" element={page(<ComingSoon module="courses" />)} />
          <Route path="students" element={page(<Students />)} />
          <Route path="batches" element={page(<Batches />)} />
          <Route path="notices" element={page(<Notices />)} />
          <Route path="questions" element={page(<QuestionBank />)} />
          <Route path="questions/new" element={<Navigate to="/teacher/questions?tab=create" replace />} />
          <Route path="exams" element={page(<Exams />)} />
          <Route path="exams/new" element={page(<CreateExam />)} />
          <Route path="paper-builder" element={<Navigate to="/teacher/questions?tab=builder" replace />} />
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
