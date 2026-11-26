import { interfaceText } from "../../lib/interfaceText";
import { createPortal } from "react-dom";
import {
  confirmAction,
  showMessage,
  closeAlert,
  setAlertBusy,
} from "../../lib/alerts";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Link } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRoute, faCompass, faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "../../hooks/useTheme";
import "../../styles/Workspace.css";

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
  const { theme, toggle } = useTheme();
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
