export function orderedLessons(path, enrollment, state) {
  const lessonById = Object.fromEntries(state.lessons.map((l) => [l.id, l]));
  return [...path.lessonIds].sort((a, b) => {
    function rank(id) {
      if (enrollment.remediation.includes(id)) return -2;
      const evidence = state.evidence[lessonById[id].skillId]?.at(-1);
      return evidence ? (evidence.estimate < 70 ? -1 : 1) : 0;
    }
    return (
      rank(a) - rank(b) || path.lessonIds.indexOf(a) - path.lessonIds.indexOf(b)
    );
  });
}
export function reasonFor(id, enrollment, state) {
  const lessonById = Object.fromEntries(state.lessons.map((l) => [l.id, l]));
  if (enrollment.remediation.includes(id))
    return "Recommended again after two incorrect checkpoint answers.";
  const evidence = state.evidence[lessonById[id].skillId]?.at(-1);
  return !evidence
    ? "This skill is unassessed. Build evidence before advancing."
    : evidence.estimate < 70
      ? "Your assessment suggests this skill needs practice."
      : "Revisit this lesson to reinforce a demonstrated strength.";
}
