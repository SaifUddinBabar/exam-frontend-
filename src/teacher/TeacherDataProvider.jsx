import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "./api";
import { TeacherDataContext } from "./teacherData";
import { aggregateStudents, buildAttempts, userId } from "./utils";

const RANKING_CONCURRENCY = 6;

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null") || {};
  } catch {
    return {};
  }
}

/**
 * Loads the signed-in teacher's own exams (GET /api/exams/list, filtered by authorId)
 * and each exam's submissions (GET /api/exams/ranking/:code). Everything the dashboard
 * shows about students, activity and performance is derived from these two real sources.
 */
export default function TeacherDataProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [exams, setExams] = useState({ status: "loading", items: [], error: null });
  const [rankings, setRankings] = useState({});
  const [rankingStatus, setRankingStatus] = useState({ loading: false, failed: 0 });
  const loadId = useRef(0);

  const me = userId(user);

  useEffect(() => {
    const ctrl = new AbortController();
    api
      .me({ signal: ctrl.signal })
      .then((res) => {
        if (res?.user) {
          setUser((prev) => ({ ...prev, ...res.user, id: res.user._id || prev.id }));
        }
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  const loadRankings = useCallback(async (list, runId) => {
    setRankingStatus({ loading: true, failed: 0 });
    const queue = [...list];
    const result = {};
    let failed = 0;
    const worker = async () => {
      while (queue.length) {
        const exam = queue.shift();
        try {
          const rows = await api.ranking(exam.examCode);
          result[exam.examCode] = Array.isArray(rows) ? rows : [];
        } catch {
          failed += 1;
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(RANKING_CONCURRENCY, list.length) }, worker));
    if (runId !== loadId.current) return;
    setRankings(result);
    setRankingStatus({ loading: false, failed });
  }, []);

  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!me) return;
    const runId = ++loadId.current;
    api
      .listExams()
      .then((all) => {
        if (runId !== loadId.current) return;
        const mine = (Array.isArray(all) ? all : []).filter((e) => String(e.authorId || "") === me);
        setExams({ status: "ready", items: mine, error: null });
        loadRankings(mine, runId);
      })
      .catch((err) => {
        if (runId !== loadId.current) return;
        setExams({ status: "error", items: [], error: err.message });
      });
  }, [me, loadRankings, tick]);

  const reload = useCallback(() => {
    setExams((s) => ({ ...s, status: "loading", error: null }));
    setTick((t) => t + 1);
  }, []);

  const addExam = useCallback((exam) => {
    setExams((s) => ({ ...s, items: [exam, ...s.items] }));
    setRankings((r) => ({ ...r, [exam.examCode]: [] }));
  }, []);

  const removeExam = useCallback((code) => {
    setExams((s) => ({ ...s, items: s.items.filter((e) => e.examCode !== code) }));
    setRankings((r) => {
      const next = { ...r };
      delete next[code];
      return next;
    });
  }, []);

  const attempts = useMemo(() => buildAttempts(exams.items, rankings), [exams.items, rankings]);
  const students = useMemo(() => aggregateStudents(attempts), [attempts]);

  const value = useMemo(
    () => ({
      user,
      userId: me,
      exams: exams.items,
      examsStatus: exams.status,
      examsError: exams.error,
      rankings,
      rankingsLoading: rankingStatus.loading,
      rankingsFailed: rankingStatus.failed,
      attempts,
      students,
      reload,
      addExam,
      removeExam,
    }),
    [user, me, exams, rankings, rankingStatus, attempts, students, reload, addExam, removeExam]
  );

  return <TeacherDataContext.Provider value={value}>{children}</TeacherDataContext.Provider>;
}
