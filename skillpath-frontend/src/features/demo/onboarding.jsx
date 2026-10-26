import TechnologyMark from "./TechnologyMark";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useDemo } from "./store";
import { Header, Notice } from "./ui";

const steps = [
  "Welcome",
  "Career goal",
  "Learning path",
  "Experience",
  "Preferences",
  "Assessment introduction",
];
export default function Onboarding() {
  const { state, dispatch, pathById } = useDemo();
  const goals = state.goals.filter((g) => g.status !== "archived");
  const paths = state.catalog.filter((p) => p.status !== "archived");
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [step, setStep] = useState(Math.min(state.onboardingStep, 5));
  const [error, setError] = useState("");
  const proposed = pathById[params.get("path")];
  const goalId = state.goalId || proposed?.goalId || "";
  const pathId = state.pathId || proposed?.id || "";
  function patch(value) {
    dispatch({ type: "PATCH", value });
    setError("");
  }
  function next() {
    if (step === 1 && !goals.some((g) => g.id === goalId)) {
      setError("Choose your career goal to continue.");
      return;
    }
    if (
      step === 2 &&
      (!pathById[pathId] || pathById[pathId].goalId !== goalId)
    ) {
      setError("Choose a learning path for your career goal.");
      return;
    }
    const value = Math.min(step + 1, 5);
    setStep(value);
    patch({ onboardingStep: value });
  }
  function start() {
    if (!pathById[pathId]) {
      setStep(2);
      setError("Select a specific path before starting.");
      return;
    }
    dispatch({ type: "ENROLL", pathId });
    navigate("/dashboard/assessment?kind=placement&onboarding=1");
  }
  return (
    <div className="sp-onboarding sp-panel">
      <div className="sp-step-top">
        <span>Step {step + 1} of 10</span>
        <strong>{steps[step]}</strong>
      </div>
      <progress value={step + 1} max={10} aria-label="Onboarding progress" />
      <Header
        title={
          step === 0
            ? "Your next chapter, with a clear direction."
            : steps[step]
        }
      >
        {step === 0
          ? "Choose a career destination, select your curriculum, and find your starting point."
          : step === 1
            ? "A career goal is your destination. Your learning path is the technology you’ll use to get there."
            : step === 2
              ? "Choose the curriculum that fits your goal. Switching later pauses your previous enrollment and preserves its progress."
              : step === 3
                ? "This helps introduce the journey. It does not determine a mastery score."
                : step === 4
                  ? "Make the plan fit your schedule."
                  : "Review your selections before a short placement assessment."}
      </Header>
      {step === 0 && (
        <ol className="sp-simple-list">
          <li>Select goal and path</li>
          <li>Assess your starting point</li>
          <li>Review skill gaps and your personal plan</li>
          <li>Learn, check your skills, and build a final project</li>
        </ol>
      )}
      {step === 1 && (
        <div className="sp-choice-grid">
          {goals.map((goal) => (
            <button
              className={`sp-choice ${goalId === goal.id ? "selected" : ""}`}
              key={goal.id}
              aria-pressed={goalId === goal.id}
              onClick={() => patch({ goalId: goal.id, pathId: "" })}
            >
              <strong>{goal.title}</strong>
              <span>{goal.description}</span>
            </button>
          ))}
        </div>
      )}
      {step === 2 && !paths.some((path) => path.goalId === goalId) && (
        <Notice>
          {" "}
          No published learning paths are available for this goal yet. Go back
          to choose another goal, or add a path in the admin.{" "}
        </Notice>
      )}
      {step === 2 && (
        <div className="sp-choice-grid">
          {paths
            .filter((path) => path.goalId === goalId)
            .map((path) => (
              <button
                className={`sp-choice ${pathId === path.id ? "selected" : ""}`}
                key={path.id}
                aria-pressed={pathId === path.id}
                onClick={() => patch({ goalId, pathId: path.id })}
              >
                <TechnologyMark technology={path.id} />
                <strong>{path.title}</strong>
                <span>{path.description}</span>
                <small>
                  {path.level} · {path.weeks} weeks · {path.lessonIds.length}{" "}
                  lessons
                </small>
              </button>
            ))}
        </div>
      )}
      {step === 3 && (
        <div className="sp-choice-grid">
          {["beginner", "intermediate", "advanced"].map((level) => (
            <button
              className={`sp-choice ${state.experience === level ? "selected" : ""}`}
              key={level}
              aria-pressed={state.experience === level}
              onClick={() => patch({ experience: level })}
            >
              <strong>{level[0].toUpperCase() + level.slice(1)}</strong>
              <span>
                {level === "beginner"
                  ? "I’m starting with the foundations."
                  : level === "intermediate"
                    ? "I have practiced the basics."
                    : "I want to identify deeper gaps."}
              </span>
            </button>
          ))}
        </div>
      )}
      {step === 4 && (
        <div className="sp-form-grid">
          <label>
            Daily learning time
            <select
              value={state.preferences.minutes}
              onChange={(e) =>
                patch({
                  preferences: {
                    ...state.preferences,
                    minutes: Number(e.target.value),
                  },
                })
              }
            >
              {[15, 20, 30, 45].map((n) => (
                <option value={n} key={n}>
                  {n} minutes
                </option>
              ))}
            </select>
          </label>
          <label>
            Preferred learning format
            <select
              value={state.preferences.format}
              onChange={(e) =>
                patch({
                  preferences: { ...state.preferences, format: e.target.value },
                })
              }
            >
              <option value="video">Video and transcript</option>
              <option value="reading">Transcript first</option>
              <option value="practice">Practice first</option>
            </select>
          </label>
        </div>
      )}
      {step === 5 && (
        <div className="sp-review">
          <dl>
            <div>
              <dt>Career goal</dt>
              <dd>{goals.find((g) => g.id === goalId)?.title}</dd>
            </div>
            <div>
              <dt>Learning path</dt>
              <dd>{pathById[pathId]?.title}</dd>
            </div>
            <div>
              <dt>Experience</dt>
              <dd>{state.experience}</dd>
            </div>
            <div>
              <dt>Daily focus</dt>
              <dd>{state.preferences.minutes} minutes</dd>
            </div>
          </dl>
          <Notice>
            {" "}
            You’ll answer up to six questions. Results are estimates, followed
            by an explainable learning plan.{" "}
          </Notice>
        </div>
      )}
      <Notice error>{error}</Notice>
      <div className="sp-actions sp-between">
        {step ? (
          <button
            className="btn btn-outline"
            onClick={() => {
              setStep(step - 1);
              patch({ onboardingStep: step - 1 });
            }}
          >
            Back
          </button>
        ) : (
          <Link className="btn btn-outline" to="/dashboard">
            Return to workspace
          </Link>
        )}
        {step < 5 ? (
          <button className="btn btn-primary" onClick={next}>
            Next
          </button>
        ) : (
          <button className="btn btn-primary" onClick={start}>
            Start placement assessment
          </button>
        )}
      </div>
    </div>
  );
}
