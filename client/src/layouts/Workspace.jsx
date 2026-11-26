import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import {
  faArrowRightFromBracket, faBell, faBookOpen, faChartLine, faCompass,
  faHouse, faRoute, faSliders, faUser,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { Icon, ThemeToggle } from "../components/ui/SharedUi";
import lightLogo from "../assets/skillPathAI_logo_light_mode.png";
import darkLogo from "../assets/skillPathAI_logo_dark_mode.png";

const navigation = {
  student: [
    ["", "Overview"],
    ["path", "My learning paths"],
    ["explore", "Explore paths"],
    ["skills", "Skill profile"],
    ["assessment", "Assessments"],
    ["projects", "Final project"],
    ["notifications", "Notifications"],
    ["profile", "My profile"],
    ["settings", "Settings"],
  ],
  instructor: [
    ["", "Overview"],
    ["paths", "Learning paths"],
    ["lessons", "Skills & lessons"],
    ["resources", "Video & resources"],
    ["quizzes", "Quiz management"],
    ["students", "Student progress"],
    ["projects", "Project reviews"],
  ],
  admin: [
    ["", "Overview"],
    ["users", "Users"],
    ["instructors", "Instructors"],
    ["goals", "Career goals"],
    ["paths", "Learning paths"],
    ["content", "Platform content"],
    ["subscriptions", "Subscriptions"],
    ["analytics", "Analytics"],
  ],
};

export default function Workspace({ role = "student" }) {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState(false);

  async function signOut() {
    setSigningOut(true);
    setSignOutError(false);
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch {
      setSignOutError(true);
      setSigningOut(false);
    }
  }
  const location = useLocation();
  const main = useRef(null);
  const base = role === "student" ? "/dashboard" : `/${role}`;
  const segment = location.pathname.slice(base.length + 1).split("/")[0];
  const current = navigation[role].find(([slug]) => slug === segment);
  const dark = theme === "dark";
  useEffect(() => {
    document.title = `${current?.[1] ?? "Learning workspace"} | SkillPath AI`;
    window.scrollTo(0, 0);
    main.current?.focus({ preventScroll: true });
  }, [location.pathname, current]);
  const icons = [
    faHouse,
    faRoute,
    faCompass,
    faChartLine,
    faSliders,
    faBookOpen,
    faBell,
    faUser,
    faSliders,
  ];
  return (
    <div className="sp-workspace">
      <a className="skip-link" href="#workspace-main">
        Skip to content
      </a>
      <aside className="sp-sidebar">
        <Link to="/" aria-label="SkillPath AI home">
          <img
            className="sp-logo"
            src={dark ? darkLogo : lightLogo}
            width="180"
            height="52"
            alt="SkillPath AI"
          />
        </Link>
        <p className="sp-workspace-label">
          {role[0].toUpperCase() + role.slice(1)} workspace
        </p>
        <nav aria-label={`${role} navigation`}>
          {navigation[role].map(([slug, label], index) => (
            <Link
              key={slug}
              to={`${base}${slug ? "/" + slug : ""}`}
              aria-current={segment === slug ? "page" : undefined}
              data-section={slug || "overview"}
            >
              <Icon icon={icons[index % icons.length]} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="sp-sidebar-footer">
          <strong>{user.name}</strong>

          <button type="button" onClick={signOut} disabled={signingOut}>
            <Icon icon={faArrowRightFromBracket} /> {signingOut ? "Signing out…" : "Sign out"}
          </button>
          {signOutError && <p role="alert">Couldn’t sign out. Try again.</p>}
        </div>
      </aside>
      <main ref={main} id="workspace-main" className="sp-main" tabIndex={-1}>
        <div className="sp-topbar">
          <span>
            {role === "student" ? "Your learning space" : `${role} workspace`} /{" "}
            <strong>{current?.[1] ?? "Lesson"}</strong>
          </span>
          <div>
            <ThemeToggle />
          </div>
        </div>
        <div className="sp-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
