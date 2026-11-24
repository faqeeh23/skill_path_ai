
import { useEffect, useReducer, useRef } from "react";
import { Link } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { careerGoals } from "../../onboarding/careerGoals";
import { initialAssessmentState, assessmentReducer } from "../assessmentReducer";
import { createAssessment, evaluateAssessment } from "../services/assessmentService";
import AssessmentIntro from "../components/AssessmentIntro";
import QuestionCard from "../components/QuestionCard";
import AssessmentResult from "../components/AssessmentResult";
import "../assessment.css";

function getSelectedGoal() {
  try {
    const draft = JSON.parse(sessionStorage.getItem("skillpath_onboarding_draft"));
    return careerGoals.find(goal => goal.id === draft?.careerGoalId) ?? null;
  } catch {
    return null;
  }
}

export default function InitialAssessment({ goalPath = "/onboarding" }) {
  const [state, dispatch] = useReducer(assessmentReducer, initialAssessmentState);
  const panel = useRef(null);
  const goal = getSelectedGoal();
  useEffect(() => {
    const heading = panel.current?.querySelector('h1,h2');
    heading?.setAttribute('tabindex', '-1');
    heading?.focus({ preventScroll: true });
  }, [state.phase, state.currentIndex]);

  async function startAssessment() {
    if (!goal || state.phase === "loading") return;

    dispatch({ type: "START_LOADING" });

    try {
      const attempt = await createAssessment(goal.id);
      dispatch({ type: "START_SUCCESS", payload: attempt });
    } catch (error) {
      dispatch({ type: "ERROR", payload: error.message });
    }
  }

  async function submitAnswer() {
    if (state.phase !== "question" || state.selectedIndex === null) return;

    const isLast = state.currentIndex === state.questions.length - 1;
    const responses = [
      ...state.responses,
      {
        questionId: state.questions[state.currentIndex].id,
        selectedIndex: state.selectedIndex
      }
    ];

    dispatch({ type: "ANSWER_SUBMITTED" });

    if (!isLast) return;

    try {
      const result = await evaluateAssessment(goal.id, responses);
      dispatch({ type: "RESULT_SUCCESS", payload: result });
    } catch (error) {
      dispatch({ type: "ERROR", payload: error.message });
    }
  }

  if (!goal) {
    return (
      <section className="assessment-page">
        <div ref={panel} className="assessment-panel assessment-intro">
          <h1>Select your career goal first</h1>
          <p>Complete the onboarding preview before starting an assessment.</p>
          <Link className="assessment-button" to={goalPath}>
            Go to onboarding
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="assessment-page">
      <div className="assessment-ambient" aria-hidden="true" />

      <div ref={panel} className="assessment-panel">
        {state.phase === "intro" && (
          <AssessmentIntro goal={goal} onStart={startAssessment} />
        )}

        {state.phase === "loading" && (
          <div className="assessment-loading" role="status">
            <FontAwesomeIcon icon={faSpinner} spin />
            <h2>Preparing your assessment…</h2>
          </div>
        )}

        {state.phase === "question" && (
          <QuestionCard
            key={state.questions[state.currentIndex].id}
            question={state.questions[state.currentIndex]}
            index={state.currentIndex}
            total={state.questions.length}
            selectedIndex={state.selectedIndex}
            onSelect={index => dispatch({ type: "SELECT_ANSWER", payload: index })}
            onSubmit={submitAnswer}
          />
        )}

        {state.phase === "submitting" && (
          <div className="assessment-loading" role="status">
            <FontAwesomeIcon icon={faSpinner} spin />
            <h2>Calculating demo results…</h2>
          </div>
        )}

        {state.phase === "completed" && state.result && (
          <AssessmentResult
            result={state.result}
            onRestart={() => dispatch({ type: "RESET" })}
          />
        )}

        {state.phase === "error" && (
          <div className="assessment-loading">
            <FontAwesomeIcon icon={faTriangleExclamation} />
            <h2>Something went wrong</h2>
            <p role="alert">{state.error}</p>
            <button
              className="assessment-button"
              onClick={() => dispatch({ type: "RESET" })}
            >
              Restart assessment
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
