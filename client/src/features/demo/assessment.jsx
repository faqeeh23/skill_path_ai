import { useDelay } from "./hooks";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { skillById } from "./catalog";
import { useDemo, activeEnrollment } from "./store";
import { makeResults, displayedQuestions } from "./evaluation";
import { Header, Notice, Empty, Confirm } from "./ui";

export default function AssessmentRoute() {
  const { state } = useDemo();
  const [params] = useSearchParams();
  const enrollment = activeEnrollment(state);
  return <Assessment key={String(enrollment?.id) + params.toString()} />;
}
function Assessment() {
  const { state, dispatch, pathById } = useDemo();
  const e = activeEnrollment(state);
  const [params] = useSearchParams();
  const path = e ? pathById[e.pathId] : null;
  const kind = params.get("kind") === "checkpoint" ? "checkpoint" : "placement";
  const selected = params.get("skill");
  const skillId =
    kind === "checkpoint" && path?.leafIds.includes(selected)
      ? selected
      : path?.leafIds[0];
  const draft =
    state.quizDraft?.pathId === path?.id &&
    state.quizDraft?.kind === kind &&
    state.quizDraft?.skillId === (kind === "checkpoint" ? skillId : null)
      ? state.quizDraft
      : null;
  const [snapshot, setSnapshot] = useState(draft?.questions ?? null);
  const questions =
    snapshot ??
    (path
      ? displayedQuestions(path, kind, skillId, state.quizzes, state.evidence)
      : []);
  const [phase, setPhase] = useState(draft ? "question" : "intro");
  const [answers, setAnswers] = useState(draft?.answers ?? {});
  const [index, setIndex] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const [result, setResult] = useState(null);
  const [now, setNow] = useState(() => Date.now());
  const delay = useDelay();
  useEffect(() => {
    if (phase !== "question") return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [phase]);
  if (!e)
    return (
      <Empty
        title="Choose your learning path first"
        to="/onboarding"
        label="Choose goal and path"
      >
        Placement assesses a specific curriculum, not a broad career goal.
      </Empty>
    );
  const remaining = Math.max(
    0,
    600 - Math.floor((now - (draft?.startedAt ?? now)) / 1000),
  );
  function start() {
    const selectedQuestions = displayedQuestions(
      path,
      kind,
      skillId,
      state.quizzes,
      state.evidence,
    );
    if (!selectedQuestions.length) return;
    setSnapshot(selectedQuestions);
    const value = {
      pathId: path.id,
      kind,
      skillId: kind === "checkpoint" ? skillId : null,
      answers: {},
      questions: selectedQuestions,
      startedAt: Date.now(),
    };
    dispatch({ type: "PATCH", value: { quizDraft: value } });
    setAnswers({});
    setIndex(0);
    setNow(Date.now());
    setPhase("question");
  }
  function choose(value) {
    const next = { ...answers, [questions[index].id]: value };
    setAnswers(next);
    dispatch({
      type: "PATCH",
      value: { quizDraft: { ...draft, answers: next } },
    });
  }
  function submit() {
    setConfirm(false);
    setPhase("loading");
    delay(() => {
      const evaluated = makeResults(
        path,
        kind,
        kind === "checkpoint" ? skillId : null,
        answers,
        questions,
      );
      dispatch({
        type: "ASSESS",
        kind,
        pathId: path.id,
        enrollmentId: e.id,
        results: evaluated.results,
        remediation: evaluated.remediation,
        answers,
      });
      dispatch({
        type: "PATCH",
        value: {
          quizDraft: null,
          onboardingStep: 5,
          journeyStage: params.has("onboarding") ? 8 : state.journeyStage,
        },
      });
      setResult(evaluated);
      setPhase("results");
    });
  }
  return (
    <div className="sp-assessment">
      <Header
        eyebrow={
          params.has("onboarding")
            ? phase === "intro"
              ? "Step 6 of 10 · Assessment introduction"
              : phase === "results"
                ? "Step 8 of 10 · Skill gaps"
                : "Step 7 of 10 · Initial assessment"
            : "assessment"
        }
        title={
          kind === "checkpoint"
            ? `${skillById[skillId].title} checkpoint`
            : `Placement: ${path.title}`
        }
      >
        {" "}
        Your answers help identify strengths and skills to practice.{" "}
      </Header>
      {phase === "intro" && (
        <section className="sp-panel">
          <h2>Find your starting point</h2>
          <p>
            {questions.length} multiple-choice questions · 10-minute limit.
            Unanswered questions count as incorrect. Skills without questions
            remain unassessed.{" "}
          </p>
          <p>
            {kind === "checkpoint"
              ? "Two incorrect answers recommend or reopen this skill’s lesson."
              : "Your results will prioritize lessons for unassessed skills and gaps."}
          </p>
          {questions.length ? (
            <button className="btn btn-primary" onClick={start}>
              Start assessment
            </button>
          ) : (
            <Notice>
              {" "}
              All required skills already have assessment evidence.{" "}
              <Link to="/dashboard/skills">
                Review your skill profile
              </Link> or{" "}
              <Link to="/dashboard/path">continue your curriculum</Link>.
            </Notice>
          )}
          <h3>Recent assessment evidence</h3>
          {state.attempts
            .filter((a) => a.pathId === path.id)
            .slice(0, 3)
            .map((attempt) => (
              <p key={attempt.id}>
                {attempt.kind} · {new Date(attempt.time).toLocaleString()}
              </p>
            ))}
        </section>
      )}
      {phase === "loading" && (
        <section className="sp-panel sp-skeleton" role="status">
          <h2> Evaluating answers… </h2>
          <p>Calculating results from the displayed question set.</p>
        </section>
      )}
      {phase === "question" && (
        <section className="sp-panel">
          <div className="sp-between sp-actions">
            <span>
              Question {index + 1} of {questions.length}
            </span>
            <span role="timer" aria-label="Time remaining">
              {Math.floor(remaining / 60)}:
              {String(remaining % 60).padStart(2, "0")}
            </span>
          </div>
          <progress
            value={index + 1}
            max={questions.length}
            aria-label="Assessment progress"
          />
          <p className="sp-eyebrow">
            {skillById[questions[index].skillId].title}
          </p>
          <h2 tabIndex="-1">{questions[index].text}</h2>
          {remaining === 0 && (
            <Notice error>
              Time is up. Submit the answers you’ve recorded.
            </Notice>
          )}
          <fieldset disabled={remaining === 0} className="sp-answer-options">
            <legend className="sr-only">Choose one answer</legend>
            {questions[index].options.map((option, i) => (
              <label
                key={`${questions[index].id}-${i}`}
                className={answers[questions[index].id] === i ? "selected" : ""}
              >
                <input
                  type="radio"
                  name={questions[index].id}
                  checked={answers[questions[index].id] === i}
                  onChange={() => choose(i)}
                />
                <span>{option}</span>
              </label>
            ))}
          </fieldset>
          <nav className="sp-question-nav" aria-label="Question navigation">
            {questions.map((q, i) => (
              <button
                key={q.id}
                className={i === index ? "selected" : ""}
                aria-label={`Question ${i + 1}${answers[q.id] !== undefined ? ", answered" : ""}`}
                aria-current={i === index ? "step" : undefined}
                onClick={() => setIndex(i)}
              >
                {i + 1}
                {answers[q.id] !== undefined ? " ✓" : ""}
              </button>
            ))}
          </nav>
          <div className="sp-actions sp-between">
            <button
              className="btn btn-outline"
              disabled={index === 0}
              onClick={() => setIndex(index - 1)}
            >
              Previous
            </button>
            {index < questions.length - 1 ? (
              <button
                className="btn btn-outline"
                onClick={() => setIndex(index + 1)}
              >
                Next question
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => setConfirm(true)}
              >
                Review & submit
              </button>
            )}
          </div>
        </section>
      )}
      {phase === "results" && result && (
        <>
          <section className="sp-panel">
            <h2>
              {params.has("onboarding")
                ? "Step 8 of 10 · Your results and skill gaps"
                : "Your practice evidence"}
            </h2>
            <p>
              {result.results.reduce((n, r) => n + r.correct, 0)} of{" "}
              {questions.length} correct. Quiz accuracy is not an authoritative
              mastery score.
            </p>
            {result.results.map((r) => (
              <div className="sp-list-row" key={r.skillId}>
                <div>
                  <strong>{skillById[r.skillId].title}</strong>
                  <p>
                    {r.correct}/{r.total} correct · {r.estimate} % estimate{" "}
                  </p>
                </div>
                <span className="sp-tag">
                  {r.estimate >= 70 ? "Strength" : "Practice recommended"}
                </span>
              </div>
            ))}
            <p>
              {path.leafIds.filter((id) => !state.evidence[id]?.length).length}{" "}
              required skills remain unassessed across your profile.{" "}
            </p>
            {result.remediation.length > 0 && (
              <Notice>
                Two incorrect checkpoint answers reopened this skill’s lesson
                and moved it to your recommendations.
              </Notice>
            )}
            <div className="sp-actions">
              <Link className="btn btn-primary" to="/dashboard/path">
                Review personalized plan
              </Link>
              <Link className="btn btn-outline" to="/dashboard/skills">
                View skill gaps
              </Link>
              <button
                className="btn btn-outline"
                disabled={
                  kind === "placement" &&
                  !path.leafIds.some((id) => !state.evidence[id]?.length)
                }
                onClick={start}
              >
                {kind === "placement"
                  ? "Assess remaining skills"
                  : "Retake practice"}
              </button>
            </div>
          </section>
          <section className="sp-panel">
            <h2>Answer explanations</h2>
            {questions.map((q) => (
              <details key={q.id}>
                <summary>
                  {answers[q.id] === q.correctIndex
                    ? "Correct"
                    : answers[q.id] === undefined
                      ? "Unanswered"
                      : "Incorrect"}
                  : {q.text}
                </summary>
                <p>
                  Your answer:{" "}
                  {answers[q.id] === undefined
                    ? "Not answered"
                    : q.options[answers[q.id]]}
                </p>
                <p>Explanation: {q.explanation}</p>
              </details>
            ))}
          </section>
        </>
      )}
      {confirm && (
        <Confirm
          title="Submit this practice assessment?"
          label="Submit answers"
          onCancel={() => setConfirm(false)}
          onConfirm={submit}
        >
          <p>
            {Object.keys(answers).length} of {questions.length} questions
            answered. Unanswered questions count as incorrect. The results are
            and stay in this browser.{" "}
          </p>
        </Confirm>
      )}
    </div>
  );
}
