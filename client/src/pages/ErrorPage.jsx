import { Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import "./error-page.css";

const errors = {
  401: {
    title: "Sign in required",
    description: "Sign in to access this part of SkillPath AI.",
  },
  403: {
    title: "Access denied",
    description: "Your account doesn’t have permission to open this page.",
  },
  404: {
    title: "Page not found",
    description: "This page may have moved. Check the address or return to a page you can access.",
  },
  session: {
    title: "Couldn’t verify your session",
    description: "Try loading this page again.",
  },
};

const workspaceByRole = { student: "/dashboard", instructor: "/instructor", admin: "/admin" };

export default function ErrorPage({ status = 404 }) {
  const { user } = useAuth();
  const { title, description } = errors[status];
  const workspace = workspaceByRole[user?.role];

  return (
    <section className="app-error-page" aria-labelledby="app-error-title">
      {status !== "session" && <p className="app-error-code">Error {status}</p>}
      <h1 id="app-error-title">{title}</h1>
      <p className="app-error-description">{description}</p>
      <div className="app-error-actions">
        {status === "session" ? (
          <button type="button" onClick={() => window.location.reload()}>Try again</button>
        ) : status === 401 ? (
          <Link to="/login">Sign in</Link>
        ) : workspace ? (
          <Link to={workspace}>Go to my dashboard</Link>
        ) : null}
        <Link to="/" className="app-error-home">Back to home</Link>
      </div>
    </section>
  );
}
