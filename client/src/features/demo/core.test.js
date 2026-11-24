import test from "node:test";
import assert from "node:assert/strict";
import { initialDemo, demoReducer } from "./core.js";
import { paths, lessons, skills, pathById, questionsFor } from "./catalog.js";
import { makeResults, displayedQuestions } from "./evaluation.js";

test("catalog relationships resolve and shared foundation lessons are reused", () => {
  assert.equal(new Set(skills.map((s) => s.id)).size, skills.length);
  for (const path of paths) {
    assert.ok(path.leafIds.length > 0);
    for (const id of path.leafIds)
      assert.equal(skills.find((s) => s.id === id).children.length, 0);
    for (const id of path.lessonIds)
      assert.ok(lessons.some((l) => l.id === id));
  }
  assert.ok(pathById.react.lessonIds.includes("lesson-semantic"));
  assert.ok(pathById.angular.lessonIds.includes("lesson-semantic"));
});
test("switching enrollment keeps one active path and preserves its completed lessons", () => {
  let s = demoReducer(initialDemo(), { type: "ENROLL", pathId: "react" });
  s = demoReducer(s, {
    type: "LESSON",
    enrollmentId: "enrollment-react",
    lessonId: "lesson-semantic",
    title: "Semantic HTML",
  });
  s = demoReducer(s, { type: "ENROLL", pathId: "angular" });
  assert.equal(s.enrollments.filter((e) => e.status === "active").length, 1);
  assert.equal(
    s.enrollments.find((e) => e.pathId === "react").status,
    "paused",
  );
  s = demoReducer(s, { type: "ENROLL", pathId: "react" });
  assert.equal(s.enrollments.length, 2);
  assert.deepEqual(s.enrollments.find((e) => e.pathId === "react").completed, [
    "lesson-semantic",
  ]);
});
test("lesson completion is idempotent and does not create skill mastery", () => {
  let s = demoReducer(initialDemo(), { type: "ENROLL", pathId: "react" });
  const action = {
    type: "LESSON",
    enrollmentId: "enrollment-react",
    lessonId: "lesson-semantic",
    title: "Semantic HTML",
  };
  s = demoReducer(demoReducer(s, action), action);
  assert.equal(s.enrollments[0].completed.length, 1);
  assert.deepEqual(s.evidence, {});
  assert.equal(s.enrollments[0].status, "active");
});
test("placement scores displayed questions and leaves the other skills unassessed", () => {
  const path = pathById.react;
  const questions = questionsFor(path);
  const answers = Object.fromEntries(
    questions.map((q) => [q.id, q.correctIndex]),
  );
  const result = makeResults(path, "placement", null, answers);
  assert.equal(result.results.length, 6);
  assert.ok(result.results.every((r) => r.estimate === 100));
  assert.ok(
    path.leafIds.some((id) => !result.results.some((r) => r.skillId === id)),
  );
  const unanswered = makeResults(path, "placement", null, {});
  assert.ok(
    unanswered.results.every((r) => r.correct === 0 && r.estimate === 0),
  );
});
test("two incorrect checkpoint answers reopen a completed lesson for remediation", () => {
  let s = demoReducer(initialDemo(), { type: "ENROLL", pathId: "react" });
  s = demoReducer(s, {
    type: "LESSON",
    enrollmentId: "enrollment-react",
    lessonId: "lesson-semantic",
    title: "Semantic HTML",
  });
  const evaluated = makeResults(pathById.react, "checkpoint", "semantic", {});
  s = demoReducer(s, {
    type: "ASSESS",
    kind: "checkpoint",
    enrollmentId: "enrollment-react",
    pathId: "react",
    ...evaluated,
  });
  assert.deepEqual(s.enrollments[0].remediation, ["lesson-semantic"]);
  assert.equal(s.enrollments[0].completed.length, 0);
  assert.equal(s.evidence.semantic[0].estimate, 0);
  assert.equal(s.evidence["use-state"], undefined);
});
test("a partial or error project cannot complete a path even with a claimed pass flag", () => {
  let s = demoReducer(initialDemo(), { type: "ENROLL", pathId: "react" });
  const coverage = pathById.react.leafIds.map((id) => ({
    skillId: id,
    coverage: "covered",
  }));
  coverage[0].coverage = "partial";
  s = demoReducer(s, {
    type: "PROJECT",
    enrollmentId: "enrollment-react",
    value: {
      status: "failed",
      history: [{ status: "evaluated", passed: true, coverage }],
    },
  });
  assert.equal(s.enrollments[0].status, "active");
  s = demoReducer(s, {
    type: "PROJECT",
    enrollmentId: "enrollment-react",
    value: {
      status: "error",
      history: [
        {
          status: "error",
          passed: true,
          coverage: coverage.map((r) => ({ ...r, coverage: "covered" })),
        },
      ],
    },
  });
  assert.equal(s.enrollments[0].status, "active");
  s = demoReducer(s, {
    type: "PROJECT",
    enrollmentId: "enrollment-react",
    value: {
      status: "passed",
      history: [
        {
          status: "evaluated",
          passed: true,
          coverage: coverage.map((r) => ({ ...r, coverage: "covered" })),
        },
      ],
    },
  });
  assert.equal(s.enrollments[0].status, "completed");
  assert.deepEqual(s.evidence, {});
});
test("reset removes learner progress without storing credentials", () => {
  const s = demoReducer(
    {
      ...initialDemo(),
      user: { name: "Demo" },
      enrollments: [{ id: "example" }],
    },
    { type: "RESET" },
  );
  assert.equal(s.user, null);
  assert.deepEqual(s.enrollments, []);
  assert.equal(JSON.stringify(s).includes("password"), false);
});
test("only reviewed published instructor questions enter a new assessment", () => {
  const q = {
    id: "instructor-question",
    skillId: "semantic",
    question: "Reviewed semantic question",
    options: ["A", "B", "C"],
    correct: 1,
    status: "draft",
    reviewed: false,
  };
  const untouched = displayedQuestions(
    pathById.react,
    "checkpoint",
    "semantic",
    [q],
  );
  assert.equal(untouched[0].text.includes("Which approach"), true);
  const published = displayedQuestions(
    pathById.react,
    "checkpoint",
    "semantic",
    [{ ...q, status: "published", reviewed: true }],
  );
  assert.equal(published[0].text, q.question);
  assert.equal(published.length, 2);
  const result = makeResults(
    pathById.react,
    "checkpoint",
    "semantic",
    { [published[0].id]: 1 },
    published,
  );
  assert.equal(result.results[0].correct, 1);
  assert.equal(result.results[0].total, 2);
  q.options[1] = "Changed after display";
  assert.equal(published[0].options[1], "B");
});

test("a second path placement skips shared skills that were already assessed", () => {
  const evidence = Object.fromEntries(
    pathById.react.leafIds.map((id) => [id, [{ estimate: 0 }]]),
  );
  const next = displayedQuestions(
    pathById.angular,
    "placement",
    null,
    [],
    evidence,
  );
  assert.deepEqual(
    next.map((q) => q.skillId),
    ["angular-components", "angular-services"],
  );
  const complete = Object.fromEntries(
    pathById.angular.leafIds.map((id) => [id, [{ estimate: 100 }]]),
  );
  assert.equal(
    displayedQuestions(pathById.angular, "placement", null, [], complete)
      .length,
    0,
  );
});
