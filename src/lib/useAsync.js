import { useCallback, useEffect, useRef, useState } from "react";

// Loads data with a status of "loading" | "ready" | "error" and a reload() function.
// `fn` receives an AbortSignal; deps re-run the request.
export default function useAsync(fn, deps = []) {
  const [state, setState] = useState({ status: "loading", data: null, error: null });
  const [tick, setTick] = useState(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    const ctrl = new AbortController();
    setState((s) => ({ ...s, status: s.data ? "refreshing" : "loading", error: null }));
    fnRef
      .current(ctrl.signal)
      .then((data) => setState({ status: "ready", data, error: null }))
      .catch((err) => {
        if (err?.name !== "AbortError") setState({ status: "error", data: null, error: err?.message || "Something went wrong." });
      });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, loading: state.status === "loading", reload, setData: (data) => setState((s) => ({ ...s, data })) };
}

export function useLanguage() {
  const read = () => {
    try {
      return localStorage.getItem("examino_language_mode") === "english" ? "english" : "bangla";
    } catch {
      return "bangla";
    }
  };
  const [lang, setLang] = useState(read);
  useEffect(() => {
    const on = (e) => setLang(e.detail?.mode === "english" ? "english" : "bangla");
    window.addEventListener("languageModeChanged", on);
    return () => window.removeEventListener("languageModeChanged", on);
  }, []);
  return lang;
}

export function currentUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}") || {};
  } catch {
    return {};
  }
}
