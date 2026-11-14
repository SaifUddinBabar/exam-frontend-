// Thin client for the existing Examino Express API.
// Only endpoints that already exist in exam-backend/routes are used here.

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function toQuery(params = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "" || value === "All") return;
    sp.set(key, String(value));
  });
  return sp.toString();
}

export async function request(path, { method = "GET", body, formData, auth = true, signal } = {}) {
  const headers = {};
  const token = localStorage.getItem("token");
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let payload;
  if (formData) {
    payload = formData;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { method, headers, body: payload, signal });
  } catch (err) {
    if (err?.name === "AbortError") throw err;
    throw new ApiError("Can't reach the Examino server. Check your connection and try again.", 0);
  }

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok || (data && data.success === false)) {
    const message = data?.message || data?.error || `Request failed (${res.status}).`;
    if (res.status === 401) {
      window.dispatchEvent(new CustomEvent("examino:unauthorized"));
    }
    throw new ApiError(message, res.status);
  }

  return data;
}

export const api = {
  me: (opts) => request("/api/auth/me", opts),

  // Exams (routes/examRoutes.js)
  listExams: (opts) => request("/api/exams/list", opts),
  examAdmin: (code, opts) => request(`/api/exams/${encodeURIComponent(code)}/admin`, opts),
  createExam: (body) => request("/api/exams/create", { method: "POST", body }),
  deleteExam: (code) => request(`/api/exams/${encodeURIComponent(code)}`, { method: "DELETE" }),
  ranking: (code, opts) => request(`/api/exams/ranking/${encodeURIComponent(code)}`, { ...opts, auth: false }),

  // Questions (routes/questionRoutes.js + routes/practiceRoutes.js)
  metadata: (opts) => request("/api/practice/metadata", opts),
  questionBank: (params, opts) => request(`/api/practice/question-bank?${toQuery(params)}`, opts),
  createQuestion: (formData) => request("/api/questions", { method: "POST", formData }),

  // Organizations (routes/organizationRoutes.js)
  organizations: (opts) => request("/api/organizations", opts),
};

export function imageUrl(file) {
  if (!file) return "";
  if (/^https?:\/\//i.test(file)) return file;
  return `${API_BASE}/uploads/${file}`;
}

export function studentExamLink(code) {
  return `${window.location.origin}/exams/${code}/details`;
}
