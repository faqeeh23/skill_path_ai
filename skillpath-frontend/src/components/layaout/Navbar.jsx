import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faXmark,
  faMoon,
  faSun,
  faMagnifyingGlass,
  faChevronDown,
  faArrowRight,
  faBullseye,
  faRoute,
  faGaugeHigh,
  faRobot,
  faListCheck,
  faSliders,
  faChartLine,
  faLaptopCode,
  faBookOpen,
  faCircleQuestion,
  faLifeRing,
} from "@fortawesome/free-solid-svg-icons";
import { useDemo } from "../../features/demo/store";
import { showMessage } from "../../lib/alerts";
import logo from "../../assets/skillPathAI_logo_dark_mode.png";
import "../../styles/Navbar.css";

const groups = [
  {
    id: "explore",
    title: "Explore",
    label: "Build your next skill",
    description: "A clear direction. A path that fits you.",
    items: [
      [
        "Career Goals",
        "Find the skills for the role you want.",
        "/#goal-input",
        faBullseye,
      ],
      [
        "Learning Paths",
        "Explore structured journeys in technology.",
        "/paths",
        faRoute,
      ],
      [
        "Skill Assessments",
        "Discover where to start and what to practice.",
        "/#features",
        faGaugeHigh,
      ],
      [
        "AI Tutor",
        "See guided support for your learning.",
        "/#features",
        faRobot,
      ],
    ],
  },
  {
    id: "why",
    title: "Why SkillPath AI",
    label: "Learning with direction",
    description: "From your first step to practical progress.",
    items: [
      [
        "How It Works",
        "Choose a goal, assess your skills, start learning.",
        "/#features",
        faListCheck,
      ],
      [
        "Adaptive Learning",
        "Discover learning that responds to your needs.",
        "/#features",
        faSliders,
      ],
      [
        "Skill Tracking",
        "Understand your progress and your next step.",
        "/#features",
        faChartLine,
      ],
      [
        "Project-Based Learning",
        "Turn what you learn into practical work.",
        "/#features",
        faLaptopCode,
      ],
    ],
  },
  {
    id: "resources",
    title: "Resources",
    label: "Support your learning",
    description: "Find your way forward.",
    items: [
      [
        "Learning Resources",
        "Browse the available learning paths.",
        "/paths",
        faBookOpen,
      ],
      ["FAQ", "Answers to common questions.", "faq", faCircleQuestion],
      ["Help", "Guidance for getting started.", "help", faLifeRing],
    ],
  },
];
const answers = {
  faq: "How do I start? Choose a career goal on the home page or browse Learning Paths.\n\nCan I assess my skills? Sign in and use Skill Assessments in your dashboard.\n\nWhere is my progress? Your dashboard contains your paths, skill evidence and projects.",
  help: "Start with Explore → Learning Paths to choose a curriculum. Create an account or sign in to access your dashboard.\n\nContinue lessons, take assessments and review projects from your dashboard. You can change appearance with the theme button.\n\nFor account access, choose Sign in → Forgot password.",
};
const Icon = ({ icon, ...props }) => (
  <FontAwesomeIcon icon={icon} aria-hidden="true" {...props} />
);
export default function Navbar() {
  const [open, setOpen] = useState(null),
    [mobile, setMobile] = useState(false),
    [search, setSearch] = useState(false);
  const header = useRef(null),
    drawer = useRef(null),
    searchDialog = useRef(null),
    pointer = useRef(false);
  const { state, dispatch } = useDemo(),
    location = useLocation(),
    navigate = useNavigate();
  const theme = state.theme ?? "light";
  function closeAll() {
    setOpen(null);
    setMobile(false);
    setSearch(false);
  }
  useEffect(() => {
    const outside = (e) => {
      if (!header.current?.contains(e.target)) setOpen(null);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setOpen(null);
      setMobile(false);
      setSearch(false);
      if (location.hash) {
        const target = document.getElementById(location.hash.slice(1));
        target?.scrollIntoView({ block: "center", behavior: "instant" });
        if (target?.matches("input,button,a"))
          target.focus({ preventScroll: true });
      }
    });
    return () => cancelAnimationFrame(id);
  }, [location.key, location.hash]);
  useEffect(() => {
    const dialog = mobile
      ? drawer.current
      : search
        ? searchDialog.current
        : null;
    if (!dialog) return;
    const previous = document.activeElement,
      overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    if (search) dialog.querySelector("input")?.focus();
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus();
    };
  }, [mobile, search]);
  useEffect(() => {
    const media = window.matchMedia("(min-width:1120px)");
    const resize = () => {
      if (media.matches) setMobile(false);
      setOpen(null);
    };
    media.addEventListener("change", resize);
    return () => media.removeEventListener("change", resize);
  }, []);
  function help(kind) {
    closeAll();
    showMessage({
      title:
        kind === "faq"
          ? "Frequently asked questions"
          : "Help with SkillPath AI",
      text: answers[kind],
      icon: "info",
    });
  }
  function itemLink([title, text, to, icon]) {
    const content = (
      <>
        <span className="sn-item-icon">
          <Icon icon={icon} />
        </span>
        <span>
          <strong>{title}</strong>
          <small>{text}</small>
        </span>
        <Icon className="sn-item-arrow" icon={faArrowRight} />
      </>
    );
    return to.startsWith("/") ? (
      <Link className="sn-item" key={title} to={to} onClick={closeAll}>
        {content}
      </Link>
    ) : (
      <button className="sn-item" key={title} onClick={() => help(to)}>
        {content}
      </button>
    );
  }
  function submit(e) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q").trim();
    closeAll();
    navigate(`/paths${q ? "?q=" + encodeURIComponent(q) : ""}`);
  }
  const toggle = (
    <button
      type="button"
      className="sn-icon-button"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      onClick={() =>
        dispatch({
          type: "PATCH",
          value: { theme: theme === "light" ? "dark" : "light" },
        })
      }
    >
      <Icon icon={theme === "light" ? faMoon : faSun} />
    </button>
  );
  return (
    <header
      ref={header}
      className="site-header sn-header"
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          header.current.querySelector(`#nav-trigger-${open}`)?.focus();
          setOpen(null);
        }
      }}
    >
      <nav className="sn-bar" aria-label="Main navigation">
        <Link
          className="sn-brand"
          to="/"
          onClick={closeAll}
          aria-label="SkillPath AI home"
        >
          <img src={logo} alt="SkillPath AI" width="174" height="48" />
        </Link>
        <div
          className="sn-desktop"
          onMouseLeave={(event) => {
            if (!event.currentTarget.contains(document.activeElement))
              setOpen(null);
          }}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setOpen(null);
          }}
        >
          <div className="sn-links">
            {groups.map((group) => (
              <div
                className="sn-group"
                key={group.id}
                onMouseEnter={() => {
                  if (window.matchMedia("(hover:hover)").matches)
                    setOpen(group.id);
                }}
              >
                <button
                  type="button"
                  id={`nav-trigger-${group.id}`}
                  className={`sn-trigger ${group.id === "explore" && location.pathname.startsWith("/paths") ? "is-active" : ""}`}
                  aria-expanded={open === group.id}
                  aria-controls={`nav-panel-${group.id}`}
                  onPointerDown={() => {
                    pointer.current = true;
                  }}
                  onFocus={() => {
                    if (!pointer.current) setOpen(group.id);
                  }}
                  onClick={() => {
                    pointer.current = false;
                    setOpen(open === group.id ? null : group.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setOpen(group.id);
                      requestAnimationFrame(() =>
                        header.current
                          .querySelector(
                            `#nav-panel-${group.id} a, #nav-panel-${group.id} button`,
                          )
                          ?.focus(),
                      );
                    }
                  }}
                >
                  {group.title}
                  <Icon icon={faChevronDown} />
                </button>
                <div
                  id={`nav-panel-${group.id}`}
                  className={`sn-panel ${group.id === "resources" ? "sn-resources" : ""}`}
                  aria-labelledby={`nav-trigger-${group.id}`}
                  hidden={open !== group.id}
                >
                  <div className="sn-panel-inner">
                    <div className="sn-intro">
                      <span>{group.label}</span>
                      <h2>{group.title}</h2>
                      <p>{group.description}</p>
                      <Link to="/paths" onClick={closeAll}>
                        Browse learning paths <Icon icon={faArrowRight} />
                      </Link>
                    </div>
                    <div className="sn-items">{group.items.map(itemLink)}</div>
                  </div>
                  <div className="sn-panel-footer">
                    <span>Your ambition. Your next step.</span>
                    <Link to="/register" onClick={closeAll}>
                      Find your path <Icon icon={faArrowRight} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            <NavLink
              className="sn-direct"
              to="/pricing"
              onMouseEnter={() => setOpen(null)}
              onFocus={() => setOpen(null)}
            >
              Pricing
            </NavLink>
          </div>
          <div className="sn-actions" onMouseEnter={() => setOpen(null)}>
            <button
              className="sn-icon-button"
              type="button"
              aria-label="Search learning paths"
              onClick={() => {
                setOpen(null);
                setSearch(true);
              }}
            >
              <Icon icon={faMagnifyingGlass} />
            </button>
            {toggle}
            <Link className="sn-signin" to="/login" onClick={closeAll}>
              Sign in
            </Link>
            <Link className="sn-cta" to="/register" onClick={closeAll}>
              Get Started
            </Link>
          </div>
        </div>
        <div className="sn-mobile-tools">
          {toggle}
          <button
            className="sn-icon-button"
            type="button"
            aria-label="Open navigation"
            aria-expanded={mobile}
            aria-controls="sn-mobile-drawer"
            onClick={() => {
              setOpen(null);
              setMobile(true);
            }}
          >
            <Icon icon={faBars} />
          </button>
        </div>
      </nav>
      <dialog
        ref={drawer}
        id="sn-mobile-drawer"
        className="sn-drawer"
        aria-labelledby="sn-drawer-title"
        onCancel={() => {
          setMobile(false);
          setOpen(null);
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setMobile(false);
            setOpen(null);
          }
        }}
      >
        <div className="sn-drawer-body">
          <div className="sn-drawer-top">
            <h2 id="sn-drawer-title">Explore SkillPath AI</h2>
            <button
              autoFocus
              className="sn-close"
              aria-label="Close navigation"
              onClick={() => {
                setMobile(false);
                setOpen(null);
              }}
            >
              <Icon icon={faXmark} />
            </button>
          </div>
          <form className="sn-mobile-search" onSubmit={submit}>
            <label htmlFor="sn-mobile-query">What do you want to learn?</label>
            <div>
              <input
                id="sn-mobile-query"
                name="q"
                type="search"
                placeholder="Search React, Python…"
              />
              <button aria-label="Search learning paths">
                <Icon icon={faMagnifyingGlass} />
              </button>
            </div>
          </form>
          <nav aria-label="Mobile navigation">
            {groups.map((group) => (
              <section className="sn-mobile-group" key={group.id}>
                <button
                  className="sn-mobile-trigger"
                  aria-expanded={open === group.id}
                  aria-controls={`mobile-${group.id}`}
                  onClick={() => setOpen(open === group.id ? null : group.id)}
                >
                  {group.title}
                  <Icon icon={faChevronDown} />
                </button>
                <div id={`mobile-${group.id}`} hidden={open !== group.id}>
                  {group.items.map(itemLink)}
                </div>
              </section>
            ))}
            <NavLink
              className="sn-mobile-pricing"
              to="/pricing"
              onClick={closeAll}
            >
              Pricing
            </NavLink>
          </nav>
          <div className="sn-mobile-auth">
            <Link to="/login" onClick={closeAll}>
              Sign in
            </Link>
            <Link className="sn-cta" to="/register" onClick={closeAll}>
              Get Started
            </Link>
          </div>
        </div>
      </dialog>
      <dialog
        ref={searchDialog}
        className="sn-search-dialog"
        aria-labelledby="sn-search-title"
        onCancel={() => setSearch(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setSearch(false);
        }}
      >
        <div className="sn-search-content">
          <div className="sn-drawer-top">
            <h2 id="sn-search-title">What do you want to learn?</h2>
            <button
              className="sn-close"
              type="button"
              aria-label="Close search"
              onClick={() => setSearch(false)}
            >
              <Icon icon={faXmark} />
            </button>
          </div>
          <form onSubmit={submit}>
            <label htmlFor="sn-query">Search learning paths</label>
            <div className="sn-search-field">
              <input
                autoFocus
                id="sn-query"
                name="q"
                type="search"
                placeholder="Try React, Laravel or Python…"
              />
              <button className="sn-cta" type="submit">
                Search
              </button>
            </div>
          </form>
          <p>Explore technology, build skills and find your next step.</p>
        </div>
      </dialog>
    </header>
  );
}
