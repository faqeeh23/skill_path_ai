import { paths, goals, skillById } from "../features/demo/catalog";
export const learningPaths = paths.map((path) => ({
  ...path,
  category: goals.find((goal) => goal.id === path.goalId).title,
  durationWeeks: path.weeks,
  skills: path.roots.map((id) => skillById[id].title),
}));
