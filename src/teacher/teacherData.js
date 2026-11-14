import { createContext, useContext } from "react";

export const TeacherDataContext = createContext(null);

export function useTeacherData() {
  const ctx = useContext(TeacherDataContext);
  if (!ctx) throw new Error("useTeacherData must be used inside <TeacherDataProvider>");
  return ctx;
}
