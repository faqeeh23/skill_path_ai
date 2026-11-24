import { useEffect, useReducer, useRef, useState } from "react";
import { Link } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faArrowLeft,
  faBrain,
  faGraduationCap,
  faRotate,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";

import { careerGoals, experienceLevels } from "../careerGoals";
import { initialOnboardingState, onboardingReducer } from "../onboardingReducer";
import SelectionCard from "../components/SelectionCard";
import OnboardingProgress from "../components/OnboardingProgress";

import "../onboarding.css";

const STORAGE_KEY = "skillpath_onboarding_draft";

function loadDraft() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
    if (!saved) return initialOnboardingState;

    return {
      step: Math.min(
        Number.isInteger(saved.step) ? Math.max(saved.step, 0) : 0,
        3
      ),
      careerGoalId: saved.careerGoalId ?? null,
      experienceLevel: saved.experienceLevel ?? null,
    };
  } catch {
    return initialOnboardingState;
  }
}

export default function Onboarding({ assessmentPath = "/assessment/initial", exitPath = "/" }) {
  const [state, dispatch] = useReducer(
    onboardingReducer,
    initialOnboardingState,
    loadDraft
  );
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);
  const panel = useRef(null);
  useEffect(() => {
    const heading = panel.current?.querySelector('h1');
    heading?.setAttribute('tabindex', '-1');
    heading?.focus({ preventScroll: true });
  }, [state.step, completed]);

  const selectedGoal = careerGoals.find((goal) => goal.id === state.careerGoalId);
  const selectedLevel = experienceLevels.find(
    (level) => level.id === state.experienceLevel
  );

  useEffect(() => {
    if (!completed) {
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
      catch { /* The flow remains usable when browser storage is unavailable. */ }
    }
  }, [state, completed]);

  function nextStep() {
    setError("");

    if (state.step === 1 && !selectedGoal) {
      setError("Please choose a career goal.");
      panel.current?.querySelector('.selection-card')?.focus();
      return;
    }

    if (state.step === 2 && !selectedLevel) {
      setError("Please select your experience level.");
      panel.current?.querySelector('.selection-card')?.focus();
      return;
    }

    dispatch({ type: "NEXT_STEP" });
  }

  function previousStep() {
    setError("");
    dispatch({ type: "PREVIOUS_STEP" });
  }

  function finishOnboarding() {
    if (!selectedGoal || !selectedLevel) {
      setError("Please complete your selections.");
      return;
    }

    setCompleted(true);
  }

  function resetOnboarding() {
    try { sessionStorage.removeItem(STORAGE_KEY); }
    catch { /* Reset the in-memory form even if storage is unavailable. */ }
    dispatch({ type: "RESET" });
    setCompleted(false);
    setError("");
  }

  if (completed) {
    return (
      <section className="onboarding-page">
        <div ref={panel} className="onboarding-panel completion-panel">
          <div className="onboarding-feature-icon">
            <FontAwesomeIcon icon={faCircleCheck} />
          </div>
          <h1>Your onboarding preview is ready!</h1>
          <p>
            You&apos;ve selected <strong>{selectedGoal?.title}</strong> as your career goal. The next stage will be an adaptive initial assessment.
          </p>
          <div className="onboarding-info">
            This is a frontend preview. Your selections have not been saved to an account, and no assessment was started.
          </div>
          <button className="onboarding-btn primary" onClick={resetOnboarding}>
            <FontAwesomeIcon icon={faRotate} /> Start again
          </button>
          <Link to={assessmentPath} className="onboarding-btn primary">
              Start initial assessment
              <FontAwesomeIcon icon={faArrowRight} />
            </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="onboarding-page">
      <div className="onboarding-ambient" aria-hidden="true" />

      <div ref={panel} className="onboarding-panel">
        <OnboardingProgress currentStep={state.step} />

        {state.step === 0 && (
          <div className="onboarding-step welcome-step">
            <div className="onboarding-feature-icon">
              <FontAwesomeIcon icon={faGraduationCap} />
            </div>
            <span className="eyebrow">Welcome to SkillPath AI</span>
            <h1>Let&apos;s shape your learning journey</h1>
            <p>
              Tell us what you want to achieve. We&apos;ll use your goal to prepare an initial skill assessment and eventually build a personalized learning path.
            </p>
            <div className="onboarding-info">
              <FontAwesomeIcon icon={faBrain} aria-hidden="true" />
              <span>
                Your actual skill level will be estimated through assessment questions, not from self-reporting alone.
              </span>
            </div>
          </div>
        )}

        {state.step === 1 && (
          <div className="onboarding-step">
            <span className="eyebrow">Your direction</span>
            <h1>What do you want to become?</h1>
            <p>Choose the career goal you want to work toward.</p>

            <div className="goal-grid">
              {careerGoals.map((goal) => (
                <SelectionCard
                  key={goal.id}
                  title={goal.title}
                  description={goal.description}
                  icon={goal.icon}
                  skills={goal.skills}
                  selected={state.careerGoalId === goal.id}
                  onSelected={() => {
                    setError("");
                    dispatch({ type: "SET_GOAL", payload: goal.id });
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {state.step === 2 && (
          <div className="onboarding-step">
            <span className="eyebrow">Your experience</span>
            <h1>How familiar are you with {selectedGoal?.title}?</h1>
            <p>Give us a starting point. Your assessment will help refine it.</p>

            <div className="experience-grid">
              {experienceLevels.map((level) => (
                <SelectionCard
                  key={level.id}
                  title={level.title}
                  description={level.description}
                  icon={level.icon}
                  selected={state.experienceLevel === level.id}
                  onSelected={() => {
                    setError("");
                    dispatch({ type: "SET_EXPERIENCE", payload: level.id });
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {state.step === 3 && (
          <div className="onboarding-step">
            <span className="eyebrow">Review your choices</span>
            <h1>You&apos;re almost ready.</h1>
            <p>Review your information before proceeding.</p>

            <div className="onboarding-review">
              <div>
                <span>Career goal</span>
                <strong>{selectedGoal?.title}</strong>
              </div>
              <div>
                <span>Experience level</span>
                <strong>{selectedLevel?.title}</strong>
              </div>
              <div>
                <span>Next stage</span>
                <strong>Initial Skill Assessment</strong>
              </div>
            </div>
            <div className="onboarding-info">
              Your first assessment will help us identify your skill strengths and gaps before recommending lessons.
            </div>
          </div>
        )}

        {error && (
          <p className="onboarding-error" role="alert">
            {error}
          </p>
        )}

        <div className="onboarding-actions">
          {state.step > 0 ? (
            <button
              type="button"
              className="onboarding-btn secondary"
              onClick={previousStep}
            >
              <FontAwesomeIcon icon={faArrowLeft} /> Back
            </button>
          ) : (
            <Link to={exitPath} className="onboarding-btn secondary">
              Exit
            </Link>
          )}

          {state.step < 3 ? (
            <button
              type="button"
              className="onboarding-btn primary"
              onClick={nextStep}
            >
              Continue <FontAwesomeIcon icon={faArrowRight} />
            </button>
          ) : (
            <button
              type="button"
              className="onboarding-btn primary"
              onClick={finishOnboarding}
            >
              Finish preview <FontAwesomeIcon icon={faArrowRight} />
            </button>
            

          )}
        </div>
      </div>
    </section>
  );
}
