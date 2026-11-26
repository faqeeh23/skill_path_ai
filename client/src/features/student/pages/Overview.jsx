import { interfaceText } from "../../../lib/interfaceText";
import TechnologyMark from "../../demo/TechnologyMark";
import { Link } from "react-router";
import { skillById } from "../../demo/catalog";
import { useDemo, activeEnrollment } from "../../demo/store";
import { Header, Empty } from "../../../components/ui/SharedUi";
import { orderedLessons, reasonFor } from "../../demo/planning";

export default function Overview() {
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
