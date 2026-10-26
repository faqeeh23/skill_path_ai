import { createContext, useContext, useEffect, useReducer } from "react";
import { initialDemo, demoReducer } from "./core";

const KEY = "skillpath_frontend_demo_v3";
const Context = createContext(null);
function load() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY));
    const theme =
      localStorage.getItem("theme") ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    if (value?.version === 3) value.theme = theme;
    const fresh = { ...initialDemo(), theme };
    return value?.version === 3 ? { ...initialDemo(), ...value } : fresh;
  } catch {
    return initialDemo();
  }
}
export function DemoProvider({ children }) {
  const [state, dispatch] = useReducer(demoReducer, undefined, load);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* Works for this visit if storage is disabled. */
    }
  }, [state]);
  useEffect(() => {
    document.documentElement.dataset.theme = state.theme ?? "light";
    try {
      localStorage.setItem("theme", state.theme ?? "light");
    } catch {
      /* Optional theme preference. */
    }
  }, [state.theme]);
  return (
    <Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>
  );
}
// This hook does not authenticate or authorize a real user.
// eslint-disable-next-line react-refresh/only-export-components
export function useDemo() {
  const context = useContext(Context);
  return {
    ...context,
    pathById: Object.fromEntries(context.state.catalog.map((p) => [p.id, p])),
    lessonById: Object.fromEntries(context.state.lessons.map((l) => [l.id, l])),
  };
}
// eslint-disable-next-line react-refresh/only-export-components
export function activeEnrollment(state) {
  return (
    state.enrollments.find((e) => e.status === "active") ??
    state.enrollments.find((e) => e.pathId === state.pathId) ??
    null
  );
}
