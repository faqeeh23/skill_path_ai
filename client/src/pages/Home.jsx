import { useState } from "react";
import { Link } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faArrowUpRightFromSquare,
  faClock,
  faBookOpen,
  faRoute,
  faSliders,
  faRobot,
  faChartLine,
  faCheck,
  faBullseye,
} from "@fortawesome/free-solid-svg-icons";
import TechnologyMark, {
  TechnologyStrip,
} from "../features/demo/TechnologyMark";
import { useDemo } from "../features/demo/store";
import { skillById } from "../features/demo/catalog";
import "../styles/Home.css";

const benefits = [
  {
    title: "Start with what you know.",
    text: "Use assessments to identify strengths, uncover gaps and choose the lessons that deserve your time.",
    icon: faSliders,
    tone: "amber",
    label: "Skill assessments",
  },
  {
    title: "Give every lesson a purpose.",
    text: "Follow a structured curriculum connected to your career goal, with a clear next step along the way.",
    icon: faRoute,
    tone: "teal",
    label: "Personalized paths",
  },
  {
    title: "Get support in the moment.",
    text: "Explore explanations, examples and practice prompts connected to the lesson in front of you.",
    icon: faRobot,
    tone: "violet",
    label: "Lesson-aware tutor",
  },
  {
    title: "See the progress you make.",
    text: "Keep lesson completion, assessment evidence and practical project work together in one workspace.",
    icon: faChartLine,
    tone: "rose",
    label: "Skill tracking",
  },
];
const journey = [
  {
    title: "Choose your direction",
    text: "Pick a career goal and explore a curriculum built around the technology you want to learn.",
  },
  {
    title: "Find your starting point",
    text: "Assess your skills to understand what you know and where a little practice will make a difference.",
  },
  {
    title: "Learn. Practice. Build.",
    text: "Work through lessons, check your understanding and bring your skills together in a final project.",
  },
];
function Icon({ icon, ...props }) {
  return <FontAwesomeIcon icon={icon} aria-hidden="true" {...props} />;
}
function matchPath(query, paths, goals) {
  const text = query.trim().toLowerCase();
  return paths.find((path) => {
    const career = goals
      .find((goal) => goal.id === path.goalId)
      ?.title.toLowerCase();
    return (
      path.title.toLowerCase().includes(text) ||
      (career && (text.includes(career) || career.includes(text))) ||
      [path.id, ...path.roots].some(
        (key) => key.length > 2 && text.includes(key.replaceAll("-", " ")),
      )
    );
  });
}
export default function Home() {
  const { state } = useDemo();
  const paths = state.catalog.filter(
    (path) =>
      path.status !== "archived" &&
      state.goals.some(
        (goal) => goal.id === path.goalId && goal.status !== "archived",
      ),
  );
  const [selectedId, setSelectedId] = useState(paths[0]?.id);
  const [goal, setGoal] = useState("");
  const [feedback, setFeedback] = useState("");
  const selected = paths.find((path) => path.id === selectedId) ?? paths[0];
  const featuredIds = ["react", "laravel", "python-ml"];
  const featured = paths.filter((path) => featuredIds.includes(path.id));
  const featuredPaths = (featured.length ? featured : paths).slice(0, 3);
  function choose(path) {
    setSelectedId(path.id);
    setGoal(path.title);
    setFeedback("Your path is ready to explore: " + path.title + ".");
  }
  function submit(event) {
    event.preventDefault();
    if (!goal.trim()) return;
    const match = matchPath(goal, paths, state.goals);
    if (match) {
      setSelectedId(match.id);
      setFeedback("Your path is ready to explore: " + match.title + ".");
    } else
      setFeedback(
        "No matching path found. Try a technology such as React or Python, or browse all learning paths.",
      );
  }
  return (
    <div className="lh-home">
      <section className="lh-hero" aria-labelledby="home-heading">
        <div className="lh-shell lh-hero-grid">
          <div className="lh-hero-copy">
            <span className="lh-kicker">
              <Icon icon={faRoute} />
              Learning with direction
            </span>
            <h1 id="home-heading">Build the skills for what comes next.</h1>
            <p className="lh-lead">
              A career goal. A clear learning path. The right next step. Bring
              your lessons, skill assessments and practical projects together
              with SkillPath AI.
            </p>
            <form className="lh-goal-form" onSubmit={submit}>
              <label htmlFor="goal-input">Where do you want to go?</label>
              <div className="lh-goal-controls">
                <input
                  id="goal-input"
                  name="goal"
                  value={goal}
                  onChange={(event) => setGoal(event.target.value)}
                  placeholder="Try React or become a data analyst…"
                  autoComplete="off"
                  maxLength={160}
                  required
                />
                <button type="submit">
                  Find my path <Icon icon={faArrowRight} />
                </button>
              </div>
            </form>
            <div
              className="lh-popular"
              role="group"
              aria-label="Choose a learning path"
            >
              <span>Start with</span>
              {paths.slice(0, 4).map((path) => (
                <button
                  key={path.id}
                  type="button"
                  onClick={() => choose(path)}
                  aria-pressed={selected?.id === path.id}
                >
                  <TechnologyMark technology={path.id} size="xs" />
                  {path.id === "node-api"
                    ? "Node.js"
                    : path.id === "python-ml"
                      ? "Python"
                      : path.id.charAt(0).toUpperCase() + path.id.slice(1)}
                </button>
              ))}
            </div>
            <p className="lh-feedback" role="status" aria-live="polite">
              {feedback}
            </p>
            <Link className="lh-text-link" to="/paths">
              Explore all learning paths <Icon icon={faArrowRight} />
            </Link>
          </div>
          <aside className="lh-plan" aria-label="Selected learning path">
            <div className="lh-plan-top">
              <span>Your learning direction</span>
              <Icon icon={faBullseye} />
            </div>
            {selected ? (
              <>
                <div className="lh-plan-title">
                  <TechnologyMark technology={selected.id} size="lg" />
                  <div>
                    <span>{selected.level}</span>
                    <h2>{selected.title}</h2>
                  </div>
                </div>
                <p className="lh-plan-description">{selected.description}</p>
                <div className="lh-plan-meta">
                  <span>
                    <Icon icon={faClock} />
                    {selected.weeks} weeks
                  </span>
                  <span>
                    <Icon icon={faBookOpen} />
                    {selected.roots.length} skill groups
                  </span>
                </div>
                <ol className="lh-plan-steps">
                  {selected.roots.map((id, index) => (
                    <li key={id}>
                      <span className="lh-step-index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{skillById[id]?.title ?? id}</span>
                      {index === 0 && <small>Start here</small>}
                    </li>
                  ))}
                </ol>
                <div className="lh-plan-bottom">
                  <p>
                    Find your starting point.
                    <br />
                    Then make the path your own.
                  </p>
                  <Link
                    to={"/paths/" + selected.id}
                    aria-label={"Explore " + selected.title}
                  >
                    Explore this path <Icon icon={faArrowRight} />
                  </Link>
                </div>
              </>
            ) : (
              <div className="lh-plan-empty">
                <h2>Your next chapter starts with a goal.</h2>
                <p>Available learning paths will appear here.</p>
                <Link to="/paths">
                  Browse learning paths <Icon icon={faArrowRight} />
                </Link>
              </div>
            )}
          </aside>
        </div>
      </section>
      <section
        className="lh-technologies"
        aria-label="Technology learning areas"
      >
        <div className="lh-shell">
          <p>Build practical skills in the tools you want to work with.</p>
          <TechnologyStrip
            technologies={[
              "react",
              "angular",
              "laravel",
              "node",
              "python",
              "figma",
            ]}
          />
        </div>
      </section>
      <section
        className="lh-section lh-paths"
        id="learning-paths"
        aria-labelledby="paths-heading"
      >
        <div className="lh-shell">
          <div className="lh-section-heading">
            <div>
              <span className="lh-kicker">Find your direction</span>
              <h2 id="paths-heading">A clear path into technology.</h2>
              <p>
                Choose a curriculum with connected skills and a practical
                destination.
              </p>
            </div>
            <Link className="lh-text-link" to="/paths">
              Browse all paths <Icon icon={faArrowRight} />
            </Link>
          </div>
          <div className="lh-path-grid">
            {featuredPaths.map((path) => (
              <article className="lh-path-card" key={path.id}>
                <div className="lh-path-card-top">
                  <TechnologyMark technology={path.id} />
                  <span>{path.level}</span>
                </div>
                <p className="lh-career">
                  {state.goals.find((goal) => goal.id === path.goalId)?.title}
                </p>
                <h3>
                  <Link to={"/paths/" + path.id}>{path.title}</Link>
                </h3>
                <p className="lh-path-description">{path.description}</p>
                <ul aria-label="Skills in this path">
                  {path.roots.slice(0, 4).map((id) => (
                    <li key={id}>{skillById[id]?.title ?? id}</li>
                  ))}
                </ul>
                <div className="lh-path-card-bottom">
                  <span>
                    <Icon icon={faClock} />
                    {path.weeks} weeks
                  </span>
                  <Link
                    to={"/paths/" + path.id}
                    aria-label={"View " + path.title}
                  >
                    View path <Icon icon={faArrowRight} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
          {!featuredPaths.length && (
            <p>
              More learning paths are on their way.{" "}
              <Link to="/paths">Explore the catalog</Link>.
            </p>
          )}
        </div>
      </section>
      <section
        className="lh-section lh-benefits"
        id="features"
        aria-labelledby="features-heading"
      >
        <div className="lh-shell lh-benefits-layout">
          <div className="lh-benefits-intro">
            <span className="lh-kicker">More than a list of lessons</span>
            <h2 id="features-heading">
              Know what to learn.
              <br />{" "}
              Understand why it matters.
            </h2>
            <p>
              A learning experience that connects your goal to your next action,
              with evidence of progress along the way.
            </p>
            <Link className="lh-text-link" to="/register">
              Start your learning journey{" "}
              <Icon icon={faArrowUpRightFromSquare} />
            </Link>
          </div>
          <div className="lh-benefit-grid">
            {benefits.map((item) => (
              <article
                className={"lh-benefit tone-" + item.tone}
                key={item.title}
              >
                <Icon icon={item.icon} />
                <span>{item.label}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section
        className="lh-section lh-journey"
        id="how-it-works"
        aria-labelledby="journey-heading"
      >
        <div className="lh-shell">
          <div className="lh-section-heading">
            <div>
              <span className="lh-kicker">From ambition to action</span>
              <h2 id="journey-heading">
                Your next chapter, one step at a time.
              </h2>
            </div>
            <Link className="lh-text-link" to="/pricing">
              Find your plan <Icon icon={faArrowRight} />
            </Link>
          </div>
          <ol className="lh-journey-grid">
            {journey.map((step, index) => (
              <li key={step.title}>
                <span className="lh-journey-number">0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
          <div className="lh-journey-note">
            <Icon icon={faCheck} />
            <p>One place for your path, your practice and your progress.</p>
            <Link to="/register">
              Create your account <Icon icon={faArrowRight} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
