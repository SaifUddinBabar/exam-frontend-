import { useCallback, useEffect, useState } from "react";
import { api } from "./api";

export function useDebounced(value, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

// GET /api/practice/metadata → subjects/chapters/topics, boards, board years
export function useQuestionMetadata() {
  const [state, setState] = useState({ status: "loading", subjects: [], boards: [], boardYears: [], error: null });
  useEffect(() => {
    const ctrl = new AbortController();
    api
      .metadata({ signal: ctrl.signal })
      .then((res) =>
        setState({
          status: "ready",
          subjects: res?.subjects || [],
          boards: res?.boards || [],
          boardYears: res?.boardYears || [],
          error: null,
        })
      )
      .catch((err) => {
        if (err.name !== "AbortError") setState((s) => ({ ...s, status: "error", error: err.message }));
      });
    return () => ctrl.abort();
  }, []);
  return state;
}

export const EMPTY_FILTERS = { search: "", subject: "", chapter: "", topic: "", difficulty: "", boardName: "", boardYear: "" };

// GET /api/practice/question-bank (server-side pagination, search and filters)
export function useQuestionSearch(filters, page, limit = 15) {
  const search = useDebounced(filters.search, 350);
  const [state, setState] = useState({ key: null, status: "loading", questions: [], total: 0, totalPages: 1, error: null });
  const [tick, setTick] = useState(0);
  const { subject, chapter, topic, difficulty, boardName, boardYear } = filters;
  const key = JSON.stringify([page, limit, search, subject, chapter, topic, difficulty, boardName, boardYear, tick]);

  useEffect(() => {
    const ctrl = new AbortController();
    api
      .questionBank({ page, limit, search, subject, chapter, topic, difficulty, boardName, boardYear }, { signal: ctrl.signal })
      .then((res) =>
        setState({
          key,
          status: "ready",
          questions: res?.questions || [],
          total: res?.total || 0,
          totalPages: res?.totalPages || 1,
          error: null,
        })
      )
      .catch((err) => {
        if (err.name !== "AbortError") setState({ key, status: "error", questions: [], total: 0, totalPages: 1, error: err.message });
      });
    return () => ctrl.abort();
  }, [key, page, limit, search, subject, chapter, topic, difficulty, boardName, boardYear]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  // While a new request is in flight the previous result is stale, so report "loading".
  return state.key === key ? { ...state, reload } : { ...state, status: "loading", reload };
}
