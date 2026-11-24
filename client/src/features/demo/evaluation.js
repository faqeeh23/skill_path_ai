import { questionsFor } from "./catalog.js";
export function makeResults(path, kind, skillId, answers, displayed) {
  const questions = displayed ?? questionsFor(path, skillId);
  const results = [...new Set(questions.map((q) => q.skillId))].map((id) => {
    const group = questions.filter((q) => q.skillId === id);
    const correct = group.filter(
      (q) => answers[q.id] === q.correctIndex,
    ).length;
    return {
      skillId: id,
      correct,
      total: group.length,
      estimate: Math.round((correct / group.length) * 100),
    };
  });
  const wrong = questions.filter(
    (q) => answers[q.id] !== q.correctIndex,
  ).length;
  return {
    results,
    remediation:
      kind === "checkpoint" && wrong >= 2 ? [`lesson-${skillId}`] : [],
    questions,
  };
}

export function displayedQuestions(
  path,
  kind,
  skillId,
  quizzes = [],
  evidence = {},
) {
  const eligible =
    kind === "checkpoint"
      ? path
      : {
          ...path,
          leafIds: path.leafIds.filter((id) => !evidence[id]?.length),
        };
  const bank = questionsFor(eligible, kind === "checkpoint" ? skillId : null);
  return bank.map((question, index) => {
    const published = quizzes.filter(
      (q) =>
        q.status === "published" &&
        q.reviewed &&
        q.skillId === question.skillId &&
        q.options.length === 3,
    );
    const custom = published.at(-1);
    return custom && (kind !== "checkpoint" || index === 0)
      ? {
          id: "published-" + custom.id,
          skillId: custom.skillId,
          text: custom.question,
          options: [...custom.options],
          correctIndex: custom.correct,
          explanation: custom.options[custom.correct],
        }
      : question;
  });
}
