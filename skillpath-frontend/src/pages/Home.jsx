import { useState } from "react";
import { Link } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faBrain,
  faWandMagicSparkles,
  faClock,
  faBookOpen,
  faBookmark,
  faBullseye,
  faSliders,
  faRoute,
  faRobot,
  faChartLine,
  faRocket,
  faListCheck,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/Landing.css";
import TechnologyMark from "../features/demo/TechnologyMark";
import { useDemo } from "../features/demo/store";
import { skillById } from "../features/demo/catalog";

/* ---------- helpers ---------- */
/* ---------- data ---------- */
const GENERIC = [
  "Foundations",
  "Core skills",
  "Hands-on project",
  "Career prep",
];

function buildPath(text, PATHS) {
  const t = text.toLowerCase();
  const hit = Object.entries(PATHS).find(([, p]) =>
    p.keys.some((k) => t.includes(k)),
  );
  if (hit) return { title: hit[0], ...hit[1] };
  return {
    title: text.trim().slice(0, 40),
    weeks: 12,
    level: "Adapts to you",
    modules: GENERIC,
  };
}

const features = [
  {
    icon: <FontAwesomeIcon icon={faSliders} />,
    title: "skill assessment",
    description:
      "Find your starting point and focus on the skills you need to build.",
    size: "wide",
  },
  {
    icon: <FontAwesomeIcon icon={faRoute} />,
    title: "Personalized learning paths",
    description:
      "Your path updates as your goals and progress change. Type a goal at the top of the page to see one.",
  },
  {
    icon: <FontAwesomeIcon icon={faRobot} />,
    title: "Lesson-aware tutor",
    description:
      "Get explanations and practice prompts tied to your current lesson.",
  },
  {
    icon: <FontAwesomeIcon icon={faChartLine} />,
    title: "Progress analytics",
    description:
      "See skill growth over time, so you always know what to focus on next.",
    size: "wide",
  },
];

const steps = [
  {
    number: "01",
    icon: faBullseye,
    title: "Define your goal",
    text: "Choose the skills or career you want to develop.",
  },
  {
    number: "02",
    icon: faSliders,
    title: "Assess your skills",
    text: "Complete an adaptive diagnostic assessment.",
  },
  {
    number: "03",
    icon: faRoute,
    title: "Follow your path",
    text: "Learn with lessons, practice, and AI guidance.",
  },
];

export default function Home() {
  const { state } = useDemo();
  const PATHS = Object.fromEntries(
    state.catalog
      .filter(
        (path) =>
          path.status !== "archived" &&
          state.goals.some(
            (goal) => goal.id === path.goalId && goal.status !== "archived",
          ),
      )
      .map((path) => [
        path.title,
        {
          keys: [
            path.id,
            ...path.roots,
            state.goals
              .find((g) => g.id === path.goalId)
              ?.title.toLowerCase() ?? "",
          ],
          weeks: path.weeks,
          level: path.level,
          modules: path.roots.map((id) => skillById[id].title),
        },
      ]),
  );

  const [goal, setGoal] = useState("");
  const [path, setPath] = useState(() => ({
    title: Object.keys(PATHS)[0] ?? "Choose a learning path",
    ...(Object.values(PATHS)[0] ?? {
      weeks: 0,
      modules: [],
      level: "Explore paths",
    }),
  }));
  const submit = (e) => {
    e.preventDefault();
    if (!goal.trim()) return;
    setPath(buildPath(goal, PATHS));
  };
  const choose = (name) => {
    setGoal(name);
    setPath({ title: name, ...PATHS[name] });
  };

  return (
    <div className="landing">
      {/* HERO */}
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-content">
            <span className="eyebrow">
              <FontAwesomeIcon icon={faBrain} className="eyebrow-icon" />
              Learning with direction
            </span>
            <h1>Give your ambition a learning plan.</h1>
            <p className="lead">
              Type what you want to become, or pick one below. SkillPath AI
              builds a path around it, then fine-tunes it with an adaptive
              assessment.
            </p>

            <form className="goal-form surface-card" onSubmit={submit}>
              <label className="goal-label" htmlFor="goal-input">
                What would you like to learn?
              </label>
              <div className="goal-controls">
                <input
                  id="goal-input"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  name="goal"
                  placeholder="e.g. Become a data analyst…"
                  autoComplete="off"
                  required
                  maxLength={160}
                />
                <button className="btn btn-primary" type="submit">
                  <FontAwesomeIcon
                    icon={faWandMagicSparkles}
                    className="btn-icon"
                  />
                  <span>Build my path</span>
                </button>
              </div>
            </form>

            <div className="chips" role="group" aria-label="Popular goals">
              {Object.keys(PATHS).map((name) => (
                <button
                  key={name}
                  type="button"
                  className={`chip ${path.title === name ? "is-active" : ""}`}
                  aria-pressed={path.title === name}
                  onClick={() => choose(name)}
                >
                  <TechnologyMark technology={name} size="xs" />
                  <span>{name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="hero-visual">
            <p className="sr-only" role="status">
              {" "}
              updated: {path.title}, {path.weeks} weeks, {path.modules.length}{" "}
              modules.
            </p>
            <div className="surface-card learning-preview" key={path.title}>
              <div className="preview-top">
                <span className="preview-label">From ambition to action</span>
                <span className="status-pill">
                  <FontAwesomeIcon icon={faWandMagicSparkles} /> Path{" "}
                </span>
              </div>
              <h2>{path.title}</h2>
              <p>Built from your goal. Your assessment will fine-tune it.</p>

              <div className="preview-meta">
                <div>
                  <strong>
                    <FontAwesomeIcon icon={faClock} className="meta-icon" />
                    {path.weeks} weeks
                  </strong>
                  <span>Estimated time</span>
                </div>
                <div>
                  <strong>
                    <FontAwesomeIcon icon={faBookOpen} className="meta-icon" />
                    {path.modules.length} modules
                  </strong>
                  <span>{path.level}</span>
                </div>
              </div>

              <ol className="preview-modules">
                {path.modules.map((m, i) => (
                  <li key={m} className={i === 0 ? "is-current" : ""}>
                    <i aria-hidden="true">{String(i + 1).padStart(2, "0")}</i>
                    <span>{m}</span>
                    {i === 0 && (
                      <em>
                        <FontAwesomeIcon icon={faBolt} /> Start here
                      </em>
                    )}
                  </li>
                ))}
              </ol>

              <Link className="btn btn-primary" to="/register">
                <FontAwesomeIcon icon={faBookmark} className="btn-icon" />
                <span>Save this path</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section" id="features">
        <div className="container">
          <div className="section-heading">
            <h2>Learning designed around you</h2>
            <p>See how each part works before you sign up.</p>
          </div>
          <div className="feature-grid">
            {features.map((f) => (
              <article
                className={`feature-card surface-card ${f.size === "wide" ? "is-wide" : ""} feature-path`}
                key={f.title}
              >
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="section steps-section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">
              <FontAwesomeIcon icon={faListCheck} className="eyebrow-icon" />
              How it works
            </span>
            <h2>Three steps to better learning</h2>
          </div>
          <ol className="steps-grid">
            {steps.map((s) => (
              <li className="step-card surface-card" key={s.number}>
                <div className="step-badge-row">
                  <span className="step-number">{s.number}</span>
                  <span className="step-icon-badge">
                    <FontAwesomeIcon icon={s.icon} />
                  </span>
                </div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container">
          <div className="cta-panel surface-card">
            <h2>Build skills that move you forward.</h2>
            <p>Explore a more intelligent and personalized way to learn.</p>
            <Link to="/register" className="btn btn-primary btn-lg">
              <FontAwesomeIcon icon={faRocket} className="btn-icon" />
              <span>Get started</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
