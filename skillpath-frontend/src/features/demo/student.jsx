import { interfaceText } from "../../lib/interfaceText";
import TechnologyMark, { TechnologyStrip } from "./TechnologyMark";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { resolvePath, skillById } from "./catalog";
import { useDemo, activeEnrollment } from "./store";
import { Header, Empty, Notice, SkillTree, Confirm } from "./ui";
import { orderedLessons, reasonFor } from "./planning";

export function PathDetail({ dashboard = false }) {
  const { pathId } = useParams();
  const { state, dispatch, pathById } = useDemo();
  const path = pathById[pathId] ?? pathById[resolvePath(pathId)?.id];
  const base = dashboard ? "/dashboard/explore" : "/paths";
  if (
    !path ||
    path.status === "archived" ||
    !state.goals.some((g) => g.id === path.goalId && g.status !== "archived")
  )
    return (
      <Empty title="Path not found" to={base} label="Browse learning paths">
        Choose a published curriculum from the catalog.
      </Empty>
    );
  return (
    <div className={dashboard ? "" : "sp-public"} data-path={path.id}>
      <Link className="sp-back" to={base}>
        Back to learning paths
      </Link>
      <TechnologyStrip technologies={[path.id, ...path.roots]} />
      <Header
        eyebrow={
          state.goals.find((g) => g.id === path.goalId)?.title ??
          "Learning path"
        }
        title={path.title}
      >
        {path.description}
      </Header>
      <div className="sp-columns">
        <section className="sp-panel">
          <div className="sp-tags">
            <span>{path.level}</span>
            <span>{path.weeks} weeks</span>
            <span>{path.lessonIds.length} lessons</span>
          </div>
          <h2>What you’ll be able to do</h2>
          <ul>
            {path.outcomes.map((outcome) => (
              <li key={outcome}>{outcome}</li>
            ))}
          </ul>
          <h2>Your skills and sub-skills</h2>
          <SkillTree path={path} />
        </section>
        <aside className="sp-panel sp-aside">
          <p className="sp-eyebrow">Choose your starting point</p>
          <h2>A specific route toward your goal.</h2>
          <p>
            Take a placement assessment, review gaps, and follow your
            personalized lesson plan.
          </p>
          <Link
            className="btn btn-primary"
            to={
              state.user
                ? `/onboarding?path=${path.id}`
                : `/register?path=${path.id}`
            }
            onClick={() =>
              dispatch({
                type: "PATCH",
                value: {
                  goalId: path.goalId,
                  pathId: path.id,
                  onboardingStep: 0,
                },
              })
            }
          >
            Choose this learning path
          </Link>
        </aside>
      </div>
    </div>
  );
}
export function Overview() {
  const { state, pathById, lessonById } = useDemo();
  const e = activeEnrollment(state);
  if (!e)
    return (
      <>
        <Header title={`Welcome, ${state.user.name.split(" ")[0]}.`}>
          Start with your career goal, then choose the curriculum that fits you.
        </Header>
        <Empty
          title="Your learning journey starts here"
          to="/onboarding"
          label="Choose a goal and path"
        >
          Your dashboard will reflect the path you select, your assessment
          evidence, and your lesson activity.
        </Empty>
      </>
    );
  const path = pathById[e.pathId];
  const ordered = orderedLessons(path, e, state);
  const next = ordered.find((id) => !e.completed.includes(id));
  const project = state.projects[e.id];
  const assessed = path.leafIds.filter(
    (id) => state.evidence[id]?.length,
  ).length;
  return (
    <>
      <Header
        eyebrow="Your active learning journey"
        title={path.title}
        action={
          <Link className="btn btn-outline" to="/dashboard/path">
            Manage enrollments
          </Link>
        }
      >
        Keep lesson progress, assessment evidence, and project completion in
        view.
      </Header>
      <div className="sp-hero" data-path={path.id}>
        <div>
          <div className="sp-hero-identity">
            <TechnologyMark technology={path.id} size="lg" />
            <span className="sp-tag">{e.status}</span>
          </div>
          <h2>
            {next
              ? lessonById[next].title
              : "Lessons finished. Put your skills into practice."}
          </h2>
          <p>
            {next
              ? reasonFor(next, e, state)
              : "Your path is complete only after a passing final project evaluation."}
          </p>
          <Link
            className="btn btn-primary"
            to={next ? `/dashboard/lessons/${next}` : "/dashboard/projects"}
          >
            {next ? "Continue learning" : "Open final project"}
          </Link>
        </div>
        <div className="sp-hero-summary">
          <strong>
            {e.completed.filter((id) => path.lessonIds.includes(id)).length}
            <small> / {path.lessonIds.length}</small>
          </strong>
          <span>Lessons completed</span>
          <progress
            value={
              e.completed.filter((id) => path.lessonIds.includes(id)).length
            }
            max={path.lessonIds.length}
            aria-label="Lesson completion"
          />
        </div>
      </div>
      <div className="sp-stat-grid">
        <article>
          <span>Skills assessed</span>
          <strong>
            {assessed} / {path.leafIds.length}
          </strong>
          <Link to="/dashboard/skills">View evidence</Link>
        </article>
        <article>
          <span>Next checkpoint</span>
          <strong>
            {next
              ? skillById[lessonById[next].skillId].title
              : "Review your skills"}
          </strong>
          <Link
            to={`/dashboard/assessment?kind=checkpoint&skill=${next ? lessonById[next].skillId : path.leafIds[0]}`}
          >
            Open checkpoint
          </Link>
        </article>
        <article>
          <span>Final project</span>
          <strong>
            {e.status === "completed"
              ? "Passed"
              : (project?.status ?? "Not started")}
          </strong>
          <Link to="/dashboard/projects">View project</Link>
        </article>
      </div>
      <div className="sp-columns">
        <section className="sp-panel">
          <h2>Recommended next lessons</h2>
          {ordered
            .filter((id) => !e.completed.includes(id))
            .slice(0, 3)
            .map((id) => (
              <div className="sp-list-row" key={id}>
                <div>
                  <h3>{lessonById[id].title}</h3>
                  <p>{reasonFor(id, e, state)}</p>
                </div>
                <Link to={`/dashboard/lessons/${id}`}>Open lesson</Link>
              </div>
            ))}
          {!next && (
            <p>
              All lessons are complete. You can still review them from your
              curriculum.
            </p>
          )}
        </section>
        <section className="sp-panel">
          <h2>Recent activity</h2>
          {state.activity.length ? (
            state.activity.slice(0, 5).map((item) => (
              <div className="sp-list-row" key={item.id}>
                <span>{interfaceText(item.text)}</span>
                <small>{new Date(item.time).toLocaleDateString()}</small>
              </div>
            ))
          ) : (
            <p>Your completed lessons and assessments will appear here.</p>
          )}
        </section>
      </div>
    </>
  );
}
export function LearningPaths() {
  const { state, dispatch, pathById, lessonById } = useDemo();
  const e = activeEnrollment(state);
  const [switchTo, setSwitchTo] = useState(null);
  if (!state.enrollments.length)
    return (
      <Empty
        title="No enrollments yet"
        to="/onboarding"
        label="Choose your first path"
      >
        Select a career goal and a specific technology curriculum.
      </Empty>
    );
  const path = e ? pathById[e.pathId] : null;
  const ordered = e ? orderedLessons(path, e, state) : [];
  const firstOpen = ordered.find((id) => !e.completed.includes(id));
  return (
    <>
      {state.journeyStage === 8 && firstOpen && (
        <Notice>
          Step 9 of 10 · Review your personalized plan below.{" "}
          <Link
            to={`/dashboard/lessons/${firstOpen}`}
            onClick={() =>
              dispatch({ type: "PATCH", value: { journeyStage: 10 } })
            }
          >
            Step 10: start learning
          </Link>
        </Notice>
      )}
      <Header title="Your learning paths">
        Switch paths without losing progress. One enrollment is active at a
        time.
      </Header>
      <div className="sp-enrollments">
        {state.enrollments.map((item) => (
          <section key={item.id} className="sp-panel">
            <span className="sp-tag">{item.status}</span>
            <h2>{pathById[item.pathId].title}</h2>
            <p>
              {
                item.completed.filter((id) =>
                  pathById[item.pathId].lessonIds.includes(id),
                ).length
              }{" "}
              / {pathById[item.pathId].lessonIds.length} lessons completed
            </p>
            <button
              className="btn btn-outline"
              onClick={() => setSwitchTo(item.pathId)}
            >
              {e?.id === item.id ? "Review this path" : "Resume this path"}
            </button>
          </section>
        ))}
        <Link className="sp-panel sp-add-path" to="/dashboard/explore">
          Explore another learning path
        </Link>
      </div>
      {e && (
        <>
          <section className="sp-section-heading">
            <p className="sp-eyebrow">Personalized curriculum</p>
            <h2>{path.title}</h2>
            <p>
              {" "}
              Recommendations are based on assessment evidence. Lesson
              completion never changes mastery directly.{" "}
            </p>
          </section>
          <div className="sp-panel">
            {ordered.map((id, index) => {
              const completed = e.completed.includes(id);
              const locked =
                id !== firstOpen &&
                !completed &&
                index > ordered.indexOf(firstOpen);
              return (
                <div className="sp-curriculum-row" key={id}>
                  <span className="sp-sequence">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3>{lessonById[id].title}</h3>
                    <p>{reasonFor(id, e, state)}</p>
                    <span className="sp-tag">
                      {completed
                        ? "Completed"
                        : locked
                          ? "Upcoming"
                          : "Current lesson"}
                    </span>
                  </div>
                  {locked ? (
                    <button
                      className="btn btn-outline"
                      disabled
                      title="Complete the current lesson first"
                    >
                      Locked
                    </button>
                  ) : (
                    <Link
                      className="btn btn-outline"
                      to={`/dashboard/lessons/${id}`}
                    >
                      {completed ? "Review" : "Open lesson"}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
          <section className="sp-panel">
            <h2>Skill structure</h2>
            <SkillTree path={path} />
          </section>
        </>
      )}
      {switchTo && (
        <Confirm
          title="Use this learning path?"
          label="Use this path"
          onCancel={() => setSwitchTo(null)}
          onConfirm={() => {
            dispatch({ type: "ENROLL", pathId: switchTo });
            setSwitchTo(null);
          }}
        >
          <p>
            Your current enrollment will pause, and its progress will remain
            saved. Completed paths remain completed.
          </p>
        </Confirm>
      )}
    </>
  );
}
export function SkillProfile() {
  const { state, pathById } = useDemo();
  const e = activeEnrollment(state);
  if (!e)
    return (
      <Empty
        title="Choose a path to see your skills"
        to="/onboarding"
        label="Start onboarding"
      >
        Unassessed skills will stay distinct from a score of zero.
      </Empty>
    );
  const path = pathById[e.pathId];
  return (
    <>
      <Header title="Your skill evidence">
        {" "}
        assessment estimates, not authoritative mastery measurements.{" "}
      </Header>
      <div className="sp-skill-grid">
        {path.leafIds.map((id) => {
          const history = state.evidence[id] ?? [];
          const latest = history.at(-1);
          return (
            <section className="sp-panel" key={id}>
              <TechnologyMark technology={id} size="sm" />
              <h2>{skillById[id].title}</h2>
              {latest ? (
                <>
                  <span className="sp-tag">
                    {latest.estimate >= 70
                      ? "Demonstrated strength"
                      : "Needs more practice"}
                  </span>
                  <p>
                    {latest.estimate} % estimate · {latest.correct}/
                    {latest.total} correct in the latest {latest.kind}
                  </p>
                  <progress
                    value={latest.estimate}
                    max="100"
                    aria-label={`${skillById[id].title}estimate`}
                  />
                  <details>
                    <summary>Development history</summary>
                    {history.map((h, index) => (
                      <p key={index}>
                        {new Date(h.time).toLocaleString()}: {h.estimate}% (
                        {h.kind})
                      </p>
                    ))}
                  </details>
                </>
              ) : (
                <p className="sp-unassessed">
                  Not assessed — no estimate available.
                </p>
              )}
              <p>{skillById[id].explanation}</p>
              <div className="sp-actions">
                <Link to={`/dashboard/lessons/lesson-${id}`}>
                  Review recommended lesson
                </Link>
                <Link to={`/dashboard/assessment?kind=checkpoint&skill=${id}`}>
                  Take checkpoint
                </Link>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
export function Notifications() {
  const { state, dispatch } = useDemo();
  return (
    <>
      <Header
        title="Notifications"
        action={
          <button
            className="btn btn-outline"
            disabled={!state.notifications.some((n) => !n.read)}
            onClick={() =>
              dispatch({
                type: "PATCH",
                value: {
                  notifications: state.notifications.map((n) => ({
                    ...n,
                    read: true,
                  })),
                },
              })
            }
          >
            Mark all read
          </button>
        }
      >
        {" "}
        Updates from your learning workspace.{" "}
      </Header>
      {state.notifications.length ? (
        <div className="sp-panel">
          {state.notifications.map((n) => (
            <div className="sp-list-row" key={n.id}>
              <div>
                <strong>{interfaceText(n.text)}</strong>
                <p>{new Date(n.time).toLocaleString()}</p>
              </div>
              <span className="sp-tag">{n.read ? "Read" : "New"}</span>
            </div>
          ))}
        </div>
      ) : (
        <Empty title="You’re all caught up">
          Learning updates appear here when you enroll.
        </Empty>
      )}
    </>
  );
}
export function Profile({ settings = false }) {
  const { state, dispatch } = useDemo();
  const [name, setName] = useState(state.user.name);
  const [bio, setBio] = useState(state.profile.bio);
  const [message, setMessage] = useState("");
  return (
    <>
      <Header title={settings ? "Account settings" : "Your profile"}>
        {settings
          ? "Manage your learning preferences and account."
          : "Update the learner profile shown in your workspace."}
      </Header>
      <form
        className="sp-panel sp-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (name.trim().length < 2) {
            setMessage("Enter at least two characters for your name.");
            return;
          }
          dispatch({
            type: "PATCH",
            value: {
              user: { ...state.user, name: name.trim() },
              users: state.users.map((user) =>
                user.id === state.user.id
                  ? { ...user, name: name.trim() }
                  : user,
              ),
              profile: { bio },
            },
          });
          setMessage("profile saved.");
        }}
      >
        <label>
          Display name
          <input
            value={name}
            name="name"
            autoComplete="name"
            onChange={(e) => setName(e.target.value)}
            required
            minLength="2"
          />
        </label>
        <label>
          About you
          <textarea
            value={bio}
            name="bio"
            maxLength="500"
            onChange={(e) => setBio(e.target.value)}
          />
        </label>
        <p>Email: {state.user.email} ( profile) </p>
        <button className="btn btn-primary">Save profile</button>
        <Notice>{message}</Notice>
      </form>
      {settings && (
        <>
          <section className="sp-panel">
            <h2>Learning preferences</h2>
            <label className="sp-check">
              <input
                type="checkbox"
                checked={state.preferences.notifications}
                onChange={(e) =>
                  dispatch({
                    type: "PATCH",
                    value: {
                      preferences: {
                        ...state.preferences,
                        notifications: e.target.checked,
                      },
                    },
                  })
                }
              />{" "}
              Show learning reminders{" "}
            </label>
            <label>
              Daily learning time
              <select
                value={state.preferences.minutes}
                onChange={(e) =>
                  dispatch({
                    type: "PATCH",
                    value: {
                      preferences: {
                        ...state.preferences,
                        minutes: Number(e.target.value),
                      },
                    },
                  })
                }
              >
                {[15, 20, 30, 45].map((n) => (
                  <option key={n} value={n}>
                    {n} minutes
                  </option>
                ))}
              </select>
            </label>
            <p>Access: {state.subscription === "pro" ? "Pro" : "Free trial"}</p>
            <Link to="/pricing"> Review plans </Link>
          </section>
        </>
      )}
    </>
  );
}
