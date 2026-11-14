import { createContext, useContext } from "react";

export const ToastContext = createContext({ notify: () => {} });

// notify({ title, description?, tone?: "success" | "error" | "info", action?: { label, onClick } })
export function useToast() {
  return useContext(ToastContext);
}
