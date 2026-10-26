import { demoUsers, goals, paths, lessons, pathById } from "./catalog.js";
const stamp = () => new Date().toISOString();
export function initialDemo() {
  return {
    version: 3,
    theme: "light",
    user: null,
    users: demoUsers,
    enrollments: [],
    evidence: {},
    positions: {},
    chats: {},
    projects: {},
    attempts: [],
    notifications: [],
    activity: [],
    preferences: { minutes: 20, format: "video", notifications: true },
    goalId: "",
    pathId: "",
    experience: "beginner",
    onboardingStep: 0,
    journeyStage: 0,
    lessons: lessons.map((l) => ({ ...l })),
    catalog: paths.map((p) => ({ ...p })),
    goals: goals.map((g) => ({ ...g })),
    quizzes: [],
    subscription: "trial",
    profile: { bio: "" },
  };
}
export function demoReducer(state, action) {
  if (action.type === "RESET") return initialDemo();
  if (action.type === "PATCH") return { ...state, ...action.value };
  if (action.type === "LOGIN") return { ...state, user: action.user };
  if (action.type === "LOGOUT") return { ...state, user: null };
  if (action.type === "ENROLL") {
    const existing = state.enrollments.find((e) => e.pathId === action.pathId);
    const enrollments = state.enrollments.map((e) => ({
      ...e,
      status: e.status === "completed" ? "completed" : "paused",
    }));
    if (existing) {
      const e = enrollments.find((e) => e.id === existing.id);
      if (e.status !== "completed") e.status = "active";
    } else
      enrollments.push({
        id: `enrollment-${action.pathId}`,
        pathId: action.pathId,
        status: "active",
        completed: [],
        remediation: [],
        startedAt: stamp(),
      });
    return {
      ...state,
      pathId: action.pathId,
      goalId: (
        state.catalog.find((p) => p.id === action.pathId) ??
        pathById[action.pathId]
      ).goalId,
      enrollments,
      notifications: [
        {
          id: crypto.randomUUID(),
          text: `${(state.catalog.find((p) => p.id === action.pathId) ?? pathById[action.pathId]).title} is ready to explore.`,
          read: false,
          time: stamp(),
        },
        ...state.notifications,
      ],
    };
  }
  if (action.type === "LESSON")
    return {
      ...state,
      enrollments: state.enrollments.map((e) =>
        e.id === action.enrollmentId
          ? { ...e, completed: [...new Set([...e.completed, action.lessonId])] }
          : e,
      ),
      activity: [
        {
          id: crypto.randomUUID(),
          text: `Completed ${action.title}`,
          time: stamp(),
        },
        ...state.activity,
      ],
    };
  if (action.type === "ASSESS") {
    const evidence = { ...state.evidence };
    for (const result of action.results)
      evidence[result.skillId] = [
        ...(evidence[result.skillId] ?? []),
        { ...result, time: stamp(), kind: action.kind },
      ];
    return {
      ...state,
      evidence,
      attempts: [
        { ...action, id: crypto.randomUUID(), time: stamp() },
        ...state.attempts,
      ],
      enrollments: state.enrollments.map((e) =>
        e.id === action.enrollmentId
          ? {
              ...e,
              remediation: [
                ...new Set([...e.remediation, ...action.remediation]),
              ],
              completed:
                action.kind === "checkpoint" && action.remediation.length
                  ? e.completed.filter((id) => !action.remediation.includes(id))
                  : e.completed,
            }
          : e,
      ),
      activity: [
        {
          id: crypto.randomUUID(),
          text: `Finished a ${action.kind} assessment`,
          time: stamp(),
        },
        ...state.activity,
      ],
    };
  }
  if (action.type === "PROJECT") {
    const projects = { ...state.projects, [action.enrollmentId]: action.value };
    const enrollment = state.enrollments.find(
      (e) => e.id === action.enrollmentId,
    );
    const required =
      state.catalog.find((p) => p.id === enrollment?.pathId)?.leafIds ?? [];
    const passes =
      required.length > 0 &&
      action.value.history?.some(
        (h) =>
          h.status === "evaluated" &&
          required.every((id) =>
            h.coverage?.some(
              (row) => row.skillId === id && row.coverage === "covered",
            ),
          ),
      );
    return {
      ...state,
      projects,
      enrollments: state.enrollments.map((e) =>
        e.id === action.enrollmentId && passes
          ? { ...e, status: "completed" }
          : e,
      ),
    };
  }
  return state;
}
