import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBrain,
  faWandMagicSparkles,
  faClock,
  faBookOpen,
  faBookmark,
  faStar,
  faBullseye,
  faSliders,
  faRoute,
  faRobot,
  faChartLine,
  faCircleCheck,
  faCircleXmark,
  faUser,
  faRocket,
  faListCheck,
  faBolt,
  faCode,
  faChartPie,
  faPalette,
  faShieldHalved
} from "@fortawesome/free-solid-svg-icons";
import "../styles/Landing.css";

/* ---------- helpers ---------- */
const reduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function useInView(threshold = 0.4) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setSeen(true); io.disconnect(); }
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen];
}

/* ---------- data ---------- */
const PATHS = {
  "Frontend Developer": {
    keys: ["front", "react", "web", "javascript", "developer"], weeks: 16, level: "Beginner friendly",
    modules: ["HTML & CSS", "JavaScript essentials", "React fundamentals", "Build a portfolio site"]
  },
  "Data Analyst": {
    keys: ["data", "sql", "analy", "excel"], weeks: 14, level: "Beginner friendly",
    modules: ["Excel & SQL", "Python for data", "Dashboards", "Real-world case study"]
  },
  "UI/UX Designer": {
    keys: ["design", "ux", "ui", "figma"], weeks: 12, level: "Beginner friendly",
    modules: ["Design principles", "Wireframes in Figma", "User research", "Case study portfolio"]
  },
  "Cybersecurity Analyst": {
    keys: ["secur", "cyber", "hack", "network"], weeks: 20, level: "Intermediate",
    modules: ["Networking basics", "Linux & tools", "Threat detection", "Incident response lab"]
  }
};
const GENERIC = ["Foundations", "Core skills", "Hands-on project", "Career prep"];

const GOAL_ICONS = {
  "Frontend Developer": faCode,
  "Data Analyst": faChartPie,
  "UI/UX Designer": faPalette,
  "Cybersecurity Analyst": faShieldHalved
};

function buildPath(text) {
  const t = text.toLowerCase();
  const hit = Object.entries(PATHS).find(([, p]) => p.keys.some(k => t.includes(k)));
  if (hit) return { title: hit[0], ...hit[1] };
  return { title: text.trim().slice(0, 40), weeks: 12, level: "Adapts to you", modules: GENERIC };
}

const ANSWER =
  "A closure is a function that remembers the variables around it, even after the outer function has finished. Try it: write a counter that keeps its own count.";

const features = [
  {
    icon: <FontAwesomeIcon icon={faSliders} />,
    title: "AI skill assessment",
    description: "Adaptive questions find your strengths and the exact gaps holding you back. Try one:",
    size: "wide", demo: "assess"
  },
  {
    icon: <FontAwesomeIcon icon={faRoute} />,
    title: "Personalized learning paths",
    description: "Your path updates as your goals and progress change. Type a goal at the top of the page to see one."
  },
  {
    icon: <FontAwesomeIcon icon={faRobot} />,
    title: "Contextual AI tutor",
    description: "Ask mid-lesson and get explanations and practice tied to what you're studying.",
    demo: "tutor"
  },
  {
    icon: <FontAwesomeIcon icon={faChartLine} />,
    title: "Progress analytics",
    description: "See skill growth over time, so you always know what to focus on next.",
    size: "wide", demo: "analytics"
  }
];

const steps = [
  { number: "01", icon: faBullseye, title: "Define your goal", text: "Choose the skills or career you want to develop." },
  { number: "02", icon: faSliders, title: "Assess your skills", text: "Complete an adaptive diagnostic assessment." },
  { number: "03", icon: faRoute, title: "Follow your path", text: "Learn with lessons, practice, and AI guidance." }
];

/* ---------- live demos ---------- */
function AssessDemo() {
  const [picked, setPicked] = useState(null);
  const options = ["const total = 10;", "constant total = 10;", "let const total = 10;"];
  return (
    <div className="demo assess">
      <p className="assess-q">Which line declares a constant in JavaScript?</p>
      <div className="assess-options" role="group" aria-label="Answer options">
        {options.map((o, i) => (
          <button key={o} type="button"
            className={`assess-opt ${picked === i ? (i === 0 ? "is-right" : "is-wrong") : ""}`}
            onClick={() => setPicked(i)}>
            <code>{o}</code>
          </button>
        ))}
      </div>
      <p className="assess-feedback" aria-live="polite">
        {picked === null ? (
          <span>Pick an answer.</span>
        ) : picked === 0 ? (
          <span className="feedback-result right">
            <FontAwesomeIcon icon={faCircleCheck} className="result-icon" />
            Correct. Your path would skip variables and start further ahead.
          </span>
        ) : (
          <span className="feedback-result wrong">
            <FontAwesomeIcon icon={faCircleXmark} className="result-icon" />
            Not quite. Your path would add a short lesson on variables.
          </span>
        )}
      </p>
    </div>
  );
}

function TutorDemo() {
  const [ref, seen] = useInView();
  const [n, setN] = useState(-30); // negative = pause before typing starts
  useEffect(() => {
    if (!seen) return;
    if (reduced()) return;
    if (n >= ANSWER.length) return;
    const id = setTimeout(() => setN(n + 1), 22);
    return () => clearTimeout(id);
  }, [seen, n]);
  const visibleN = reduced() ? ANSWER.length : n;
  return (
    <div className="demo chat" ref={ref} role="img" aria-label="Example chat with the AI tutor">
      <div className="bubble bubble-user">
        <FontAwesomeIcon icon={faUser} className="bubble-icon" />
        <span>What's a closure in JavaScript?</span>
      </div>
      <div className="bubble bubble-ai">
        <FontAwesomeIcon icon={faRobot} className="bubble-icon ai" />
        <div className="bubble-text">
          {visibleN < 0 ? <span className="dots"><i /><i /><i /></span> : ANSWER.slice(0, visibleN)}
          {visibleN >= 0 && visibleN < ANSWER.length && <span className="caret" />}
        </div>
      </div>
    </div>
  );
}

function AnalyticsDemo() {
  const [ref, seen] = useInView();
  const skills = [["HTML & CSS", 92], ["JavaScript", 74], ["React", 48], ["SQL", 30]];
  return (
    <div className={`demo bars ${seen ? "in" : ""}`} ref={ref}>
      {skills.map(([label, v], i) => (
        <div className="bar-row" key={label}>
          <span>{label}</span>
          <div className="bar-track"><i style={{ "--w": `${v}%`, transitionDelay: `${i * 120}ms` }} /></div>
          <strong>{v}%</strong>
        </div>
      ))}
      <small>Example data</small>
    </div>
  );
}

const demos = { assess: <AssessDemo />, tutor: <TutorDemo />, analytics: <AnalyticsDemo /> };

/* ---------- page ---------- */
export default function Home() {
  const root = useRef(null);
  const [goal, setGoal] = useState("");
  const [path, setPath] = useState(() => ({ title: "Frontend Developer", ...PATHS["Frontend Developer"] }));
  const [shown, setShown] = useState(0);

  // Reveal modules one by one every time a new path is generated
  useEffect(() => {
    if (reduced()) return;
    const ids = path.modules.map((_, i) => setTimeout(() => setShown(i + 1), 400 + i * 420));
    return () => ids.forEach(clearTimeout);
  }, [path]);

  const submit = (e) => {
    e.preventDefault();
    if (!goal.trim()) return;
    setShown(0);
    setPath(buildPath(goal));
  };
  const choose = (name) => {
    setGoal(name);
    setShown(0);
    setPath({ title: name, ...PATHS[name] });
  };
  const visibleModules = reduced() ? path.modules.length : shown;

  // Pointer-following light on [data-glow] surfaces168
  useEffect(() => {
    const el = root.current;
    if (!el || reduced()) return;
    const move = (e) => {
      const card = e.target.closest("[data-glow]");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    el.addEventListener("pointermove", move);
    return () => el.removeEventListener("pointermove", move);
  }, []);

  return (
    <div className="landing" ref={root}>
      <div className="aurora" aria-hidden="true">
        <span className="blob blob-1" /><span className="blob blob-2" /><span className="blob blob-3" />
      </div>

      {/* HERO */}
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-content">
            <span className="eyebrow">
              <FontAwesomeIcon icon={faBrain} className="eyebrow-icon" />
              AI-powered learning platform
            </span>
            <h1>Tell us your goal. Get a learning path in seconds.</h1>
            <p className="lead">
              Type what you want to become, or pick one below. SkillPath AI builds a path
              around it, then fine-tunes it with an adaptive assessment.
            </p>

            <form className="goal-form glass-card" onSubmit={submit}>
              <label className="sr-only" htmlFor="goal-input">Your goal</label>
              <input id="goal-input" value={goal} onChange={(e) => setGoal(e.target.value)}
                     placeholder="I want to become a..." autoComplete="off" />
              <button className="btn btn-primary" type="submit">
                <FontAwesomeIcon icon={faWandMagicSparkles} className="btn-icon" />
                <span>Build my path</span>
              </button>
            </form>

            <div className="chips" role="group" aria-label="Popular goals">
              {Object.keys(PATHS).map(name => (
                <button key={name} type="button"
                        className={`chip ${path.title === name ? "is-active" : ""}`}
                        onClick={() => choose(name)}>
                  {GOAL_ICONS[name] && <FontAwesomeIcon icon={GOAL_ICONS[name]} className="chip-icon" />}
                  <span>{name}</span>
                </button>
              ))}
            </div>

            <p className="hero-note">Free to start. Learn at your pace.</p>
          </div>

          <div className="hero-visual">
            <div className="glass-card learning-preview" key={path.title} data-glow>
              <div className="preview-top">
                <span className="preview-label">Your learning path</span>
                <span className="status-pill">
                  <FontAwesomeIcon icon={faWandMagicSparkles} /> Generated for you
                </span>
              </div>
              <h3>{path.title}</h3>
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
                  <li key={m} className={i < visibleModules ? "is-in" : ""}>
                    <i aria-hidden="true">
                      {i < visibleModules ? <FontAwesomeIcon icon={faCircleCheck} /> : (i + 1)}
                    </i>
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
            <span className="eyebrow">
              <FontAwesomeIcon icon={faStar} className="eyebrow-icon" />
              Why SkillPath AI
            </span>
            <h2>Learning designed around you</h2>
            <p>See how each part works before you sign up.</p>
          </div>
          <div className="feature-grid">
            {features.map(f => (
              <article className={`feature-card glass-card ${f.size === "wide" ? "is-wide" : ""}`} key={f.title} data-glow>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.description}</p>
                {f.demo && demos[f.demo]}
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
            {steps.map(s => (
              <li className="step-card glass-card" key={s.number} data-glow>
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
          <div className="cta-panel glass-card" data-glow>
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