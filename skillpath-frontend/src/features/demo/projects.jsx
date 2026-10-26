import { interfaceText } from "../../lib/interfaceText";
import { useDelay } from "./hooks";
import { useState } from "react";
import { Link } from "react-router";
import { skillById } from "./catalog";
import { useDemo, activeEnrollment } from "./store";
import { Header, Notice, Empty, Confirm } from "./ui";

export default function Projects() {
  const { state, dispatch, pathById } = useDemo();
  const e = activeEnrollment(state);
  const path = e ? pathById[e.pathId] : null;
  const project = e
    ? (state.projects[e.id] ?? {
        status: "draft",
        title: "",
        description: "",
        history: [],
      })
    : null;
  const [title, setTitle] = useState(project?.title ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [repo, setRepo] = useState("");
  const scenario = "pass";
  const [manual, setManual] = useState(false);
  const [message, setMessage] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const delay = useDelay();
  if (!e)
    return (
      <Empty
        title="Choose a path before proposing a project"
        to="/onboarding"
        label="Choose your path"
      >
        Your project is tied to one enrollment and its required skills.
      </Empty>
    );
  const guideId = path.lessonIds.at(-1);
  const allowance = 3 + (e.completed.includes(guideId) ? 1 : 0);
  const used = project.history.filter((h) => h.status === "evaluated").length;
  const remaining = allowance - used;
  const passed = project.history.some((h) => h.passed);
  const pending = ["awaiting approval", "queued", "processing"].includes(
    project.status,
  );
  function save(value) {
    dispatch({ type: "PROJECT", enrollmentId: e.id, value });
  }
  function idea(event) {
    event.preventDefault();
    if (description.trim().length < 20) {
      setMessage(
        "Describe your idea in at least 20 characters. Explain the problem and which skills you’ll demonstrate.",
      );
      return;
    }
    const draft = {
      ...project,
      title: title.trim(),
      description: description.trim(),
      status: "awaiting approval",
      feedback: "Your idea review is pending.",
    };
    save(draft);
    setBusy(true);
    delay(() => {
      setBusy(false);
      if (manual) {
        setMessage(
          "Saved for instructor review. Open the instructor to review it.",
        );
        return;
      }
      const approved = description.trim().length >= 60;
      save({
        ...draft,
        status: approved ? "approved" : "rejected",
        feedback: approved
          ? "approval: the description is detailed enough to proceed. Ensure the repository demonstrates every required skill."
          : "revision request: expand the description to at least 60 characters and explain how the required skills appear in your project.",
      });
    });
  }
  function validateRepo() {
    try {
      const url = new URL(repo);
      return (
        url.protocol === "https:" &&
        url.hostname === "github.com" &&
        !url.username &&
        !url.password &&
        !url.port &&
        !url.search &&
        !url.hash &&
        /^\/[\w.-]+\/[\w.-]+\/?$/.test(url.pathname)
      );
    } catch {
      return false;
    }
  }
  function queue() {
    setConfirm(false);
    setBusy(true);
    const run = {
      id: crypto.randomUUID(),
      repo,
      time: new Date().toISOString(),
      status: "queued",
      passed: false,
    };
    const queued = {
      ...project,
      status: "queued",
      history: [run, ...project.history],
    };
    save(queued);
    delay(() => {
      const processing = { ...run, status: "processing" };
      save({
        ...queued,
        status: "processing",
        history: [processing, ...project.history],
      });
      delay(() => {
        const error = scenario === "error";
        const success = scenario === "pass";
        const coverage = path.leafIds.map((id, index) => ({
          skillId: id,
          coverage:
            success || index < path.leafIds.length - 1
              ? "covered"
              : scenario === "partial"
                ? "partial"
                : "missing",
          feedback:
            success || index < path.leafIds.length - 1
              ? "rubric: required skill demonstrated."
              : "Review the corresponding skill and include visible evidence in your repository.",
        }));
        const evaluated = {
          ...run,
          status: error ? "error" : "evaluated",
          passed: !error && coverage.every((row) => row.coverage === "covered"),
          build: !error,
          tests: scenario !== "fail" && !error,
          coverage: error ? [] : coverage,
          logs: error
            ? "Runner could not start. No evaluated attempt consumed."
            : "Repository reference accepted.\nBuild completed.\nTests" +
              (scenario === "fail" ? "failed" : "passed") +
              ".\nRequired skill coverage checked.\nNo repository was fetched and no code was executed.",
        };
        save({
          ...project,
          status: error ? "error" : evaluated.passed ? "passed" : "failed",
          history: [evaluated, ...project.history],
        });
        setBusy(false);
        setMessage(
          error
            ? "runner error. Retry without consuming an evaluated attempt."
            : evaluated.passed
              ? "project passed. This enrollment is now shown as completed."
              : "Project needs revision. Review every required skill, then retry.",
        );
      });
    });
  }
  return (
    <>
      <Header eyebrow={path.title} title="Your final project">
        {" "}
        Propose an idea, demonstrate every required skill, and review a GitHub
        evaluation.{" "}
      </Header>

      <div className="sp-stat-grid">
        <article>
          <span>Idea status</span>
          <strong>{project.status}</strong>
        </article>
        <article>
          <span>Evaluated attempts remaining</span>
          <strong>
            {Math.max(0, remaining)} / {allowance}
          </strong>
        </article>
        <article>
          <span>Path completion</span>
          <strong>{passed ? "Passed project" : "Not yet complete"}</strong>
        </article>
      </div>
      <div className="sp-columns">
        <form className="sp-panel sp-form" onSubmit={idea}>
          <h2>Project idea</h2>
          <label>
            Title
            <input
              name="title"
              value={title}
              onChange={(ev) => setTitle(ev.target.value)}
              required
              maxLength="150"
              disabled={passed || pending}
            />
          </label>
          <label>
            Describe the problem and your approach
            <textarea
              name="description"
              value={description}
              onChange={(ev) => setDescription(ev.target.value)}
              required
              minLength="20"
              maxLength="3000"
              disabled={passed || pending}
            />
          </label>
          <label className="sp-check">
            <input
              type="checkbox"
              checked={manual}
              onChange={(ev) => setManual(ev.target.checked)}
              disabled={busy || passed}
            />{" "}
            Send to the instructor instead of automatic review{" "}
          </label>
          <div className="sp-actions">
            <button
              className="btn btn-outline"
              type="button"
              disabled={busy || passed || pending}
              onClick={() => {
                save({ ...project, title, description, status: "draft" });
                setMessage("Draft saved.");
              }}
            >
              Save draft
            </button>
            <button
              className="btn btn-primary"
              disabled={busy || passed || pending}
            >
              {busy ? "Reviewing…" : "Submit idea"}
            </button>
          </div>
          {project.feedback && (
            <Notice>{interfaceText(project.feedback)}</Notice>
          )}
        </form>
        <section className="sp-panel">
          <h2>Required skill coverage</h2>
          <p>
            A successful build alone is not enough. Every required skill must be
            covered.
          </p>
          <ul>
            {path.leafIds.map((id) => (
              <li key={id}>{skillById[id].title}</li>
            ))}
          </ul>
          {used >= 3 && !e.completed.includes(guideId) && (
            <Notice>
              Complete the project guide lesson to unlock one additional
              evaluated attempt.{" "}
              <Link to={`/dashboard/lessons/${guideId}`}>
                Open guide lesson
              </Link>
            </Notice>
          )}
        </section>
      </div>
      {!busy && ["queued", "processing"].includes(project.status) && (
        <Notice>
          Evaluation was interrupted.{" "}
          <button
            onClick={() =>
              save({
                ...project,
                status: "error",
                history: project.history.map((h) =>
                  ["queued", "processing"].includes(h.status)
                    ? {
                        ...h,
                        status: "error",
                        logs: "Evaluation interrupted. No evaluated attempt consumed.",
                      }
                    : h,
                ),
              })
            }
          >
            Recover and retry
          </button>
        </Notice>
      )}
      <form
        className="sp-panel sp-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!validateRepo()) {
            setMessage(
              "Use an HTTPS GitHub repository URL, such as https://github.com/learner/project, without extra query parameters.",
            );
            return;
          }
          setMessage("");
          setConfirm(true);
        }}
      >
        <h2>Submit your repository</h2>
        <label>
          GitHub repository URL
          <input
            type="url"
            name="repo"
            value={repo}
            onChange={(ev) => setRepo(ev.target.value)}
            placeholder="https://github.com/learner/project"
            autoComplete="off"
            required
            disabled={
              project.status !== "approved" &&
              project.status !== "failed" &&
              project.status !== "error"
            }
          />
        </label>

        <button
          className="btn btn-primary"
          disabled={
            busy ||
            remaining <= 0 ||
            passed ||
            !["approved", "failed", "error"].includes(project.status)
          }
        >
          {busy ? `${project.status}…` : "Review submission"}
        </button>
        {remaining <= 0 && (
          <Notice>
            No evaluated attempts remain.{" "}
            {allowance === 3
              ? "Complete the guide lesson for one extra attempt."
              : "The additional attempt has been used."}
          </Notice>
        )}
        <Notice
          error={message.startsWith("Use ") || message.startsWith("Describe ")}
        >
          {message}
        </Notice>
      </form>
      <section className="sp-panel">
        <h2>Submission history</h2>
        {project.history.length ? (
          project.history.map((run) => (
            <details key={run.id} open={run.id === project.history[0].id}>
              <summary>
                {run.status === "evaluated"
                  ? run.passed
                    ? "Passed"
                    : "Failed"
                  : run.status}{" "}
                · {new Date(run.time).toLocaleString()}
              </summary>
              <p>{run.repo}</p>
              {run.status === "evaluated" && (
                <p>
                  Build: {run.build ? "passed" : "failed"} · Tests:{" "}
                  {run.tests ? "passed" : "failed"}
                </p>
              )}
              {run.coverage?.map((row) => (
                <div className="sp-list-row" key={row.skillId}>
                  <strong>{skillById[row.skillId].title}</strong>
                  <span>{row.coverage}</span>
                  <p>{interfaceText(row.feedback)}</p>
                </div>
              ))}
            </details>
          ))
        ) : (
          <p>No repository submissions yet. Start by proposing your idea.</p>
        )}
      </section>
      {confirm && (
        <Confirm
          title="Run a project evaluation?"
          label="Queue evaluation"
          onCancel={() => setConfirm(false)}
          onConfirm={queue}
        >
          <p>
            Repository: {repo} . Evaluated results consume one attempt; runner
            errors do not. This does not contact GitHub.{" "}
          </p>
        </Confirm>
      )}
    </>
  );
}
