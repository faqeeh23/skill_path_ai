import { interfaceText } from "../../lib/interfaceText";
import { createPortal } from "react-dom";
import {
  confirmAction,
  showMessage,
  closeAlert,
  setAlertBusy,
} from "../../lib/alerts";
import TechnologyMark from "./TechnologyMark";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRoute,
  faChartLine,
  faBookOpen,
  faCompass,
  faBell,
  faUser,
  faSliders,
  faHouse,
  faMoon,
  faSun,
  faArrowRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { navigation } from "./catalog";
import { useDemo } from "./store";
import lightLogo from "../../assets/skillPathAI_logo_light_mode.png";
import darkLogo from "../../assets/skillPathAI_logo_dark_mode.png";

export function Icon({ icon = faRoute }) {
  return <FontAwesomeIcon icon={icon} aria-hidden="true" />;
}
export function Header({ eyebrow, title, children, action }) {
  return (
    <header className="sp-page-heading">
      <div>
        {eyebrow && <p className="sp-eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {children && <p>{children}</p>}
      </div>
      {action}
    </header>
  );
}
export function Notice({ children: rawChildren, error = false }) {
  const children = interfaceText(rawChildren);
  const last = useRef(children);
  useEffect(() => {
    if (children !== last.current && typeof children === "string" && children) {
      showMessage({
        text: children,
        icon: error ? "error" : "success",
        toast: true,
        position: "top-end",
        timer: 4500,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
    last.current = children;
  }, [children, error]);
  return children ? (
    <p
      className={`sp-notice ${error ? "error" : ""}`}
      role={error ? "alert" : "status"}
    >
      {children}
    </p>
  ) : null;
}
export function Empty({ title, children, to, label }) {
  return (
    <section className="sp-panel sp-empty">
      <Icon icon={faCompass} />
      <h2>{title}</h2>
      <p>{children}</p>
      {to && (
        <Link className="btn btn-primary" to={to}>
          {label}
        </Link>
      )}
    </section>
  );
}
export function Confirm({
  title,
  children,
  onConfirm,
  onCancel,
  label = "Confirm",
  busy = false,
}) {
  const [host] = useState(() => document.createElement("div"));
  const accepted = useEffectEvent(() => {
    if (!busy) onConfirm();
  });
  const canceled = useEffectEvent(() => {
    if (!busy) onCancel();
  });
  const currentBusy = useEffectEvent(() => busy);
  useEffect(() => {
    setAlertBusy(busy);
  }, [busy]);
  useEffect(() => {
    let active = true;
    let opened = false;
    const frame = requestAnimationFrame(() => {
      opened = true;
      confirmAction({
        title,
        html: host,
        confirmButtonText: label,
        preConfirm: () => {
          accepted();
          return false;
        },
        allowOutsideClick: () => !currentBusy(),
        allowEscapeKey: () => !currentBusy(),
        didOpen: () => {
          setAlertBusy(currentBusy());
          host
            .querySelector("input:not([disabled]), select, textarea")
            ?.focus();
        },
      }).then((result) => {
        if (active && result.isDismissed) canceled();
      });
    });
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      if (opened) closeAlert();
    };
  }, [title, label, host]);
  return createPortal(children, host);
}

export function ThemeToggle() {
  const { state, dispatch } = useDemo();
  const theme = state.theme ?? "light";
  function toggle() {
    dispatch({
      type: "PATCH",
      value: { theme: theme === "light" ? "dark" : "light" },
    });
  }
  return (
    <button
      className="sp-icon-button"
      type="button"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      onClick={toggle}
    >
      <Icon icon={theme === "light" ? faMoon : faSun} />
    </button>
  );
}
export function Guard({ role, children }) {
  const { state } = useDemo();
  const location = useLocation();
  if (!state.user)
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (role && state.user.role !== role)
    return (
      <div className="sp-public">
        <Header title="Choose the right workspace">
          This page is for the {role} role. Sign in with the appropriate
          account.{" "}
        </Header>
        <Link className="btn btn-primary" to="/login">
          {" "}
          Sign in{" "}
        </Link>
      </div>
    );
  return children;
}
export function Workspace({ role = "student" }) {
  const { state, dispatch } = useDemo();
  const location = useLocation();
  const main = useRef(null);
  const base = role === "student" ? "/dashboard" : `/${role}`;
  const segment = location.pathname.slice(base.length + 1).split("/")[0];
  const current = navigation[role].find(([slug]) => slug === segment);
  const dark = state.theme === "dark";
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
              {slug === "notifications" &&
                state.notifications.some((n) => !n.read) && (
                  <span className="sp-dot" aria-label="Unread notifications" />
                )}
            </Link>
          ))}
        </nav>
        <div className="sp-sidebar-footer">
          <strong>{state.user.name}</strong>

          <button onClick={() => dispatch({ type: "LOGOUT" })}>
            <Icon icon={faArrowRightFromBracket} /> Sign out
          </button>
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
export function SkillTree({ path }) {
  const { state } = useDemo();
  return (
    <div className="sp-skill-tree">
      {path.roots.map((id) => (
        <SkillBranch key={id} id={id} evidence={state.evidence} />
      ))}
    </div>
  );
}
import { skillById } from "./catalog";
function SkillBranch({ id, evidence }) {
  const skill = skillById[id];
  return (
    <div className="sp-skill-branch">
      <span className="sp-skill-label">
        {skill.children.length > 0 && (
          <TechnologyMark technology={id} size="xs" />
        )}
        <strong>{skill.title}</strong>
      </span>
      {skill.children.length ? (
        <div>
          {skill.children.map((child) => (
            <SkillBranch key={child} id={child} evidence={evidence} />
          ))}
        </div>
      ) : (
        <span className="sp-tag">
          {evidence[id]?.length ? "Assessed in" : "Not assessed"}
        </span>
      )}
    </div>
  );
}
