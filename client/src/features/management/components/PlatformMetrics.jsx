import { useDemo } from "../../demo/store";
import { Header } from "../../../components/ui/SharedUi";

export default function PlatformMetrics({ role, title }) {
  const { state } = useDemo();
  return (
    <>
      <Header
        eyebrow={`${role}`}
        title={title}
      >
        {" "}
        Metrics are derived from the shared records. No external systems are
        queried.{" "}
      </Header>
      <div className="sp-stat-grid">
        <article>
          <span> user records </span>
          <strong>
            {state.users.filter((u) => u.status !== "archived").length}
          </strong>
        </article>
        <article>
          <span>Published / available paths</span>
          <strong>
            {state.catalog.filter((p) => p.status !== "archived").length}
          </strong>
        </article>
        <article>
          <span>Student enrollments</span>
          <strong>{state.enrollments.length}</strong>
        </article>
      </div>
      <section className="sp-panel">
        <h2>Content & learning activity</h2>
        <dl className="sp-metrics-list">
          <div>
            <dt>Published lessons</dt>
            <dd>
              {state.lessons.filter((l) => l.status === "published").length}
            </dd>
          </div>
          <div>
            <dt> Assessments completed </dt>
            <dd>{state.attempts.length}</dd>
          </div>
          <div>
            <dt>Project submissions</dt>
            <dd>
              {Object.values(state.projects).reduce(
                (sum, p) => sum + p.history.length,
                0,
              )}
            </dd>
          </div>
          <div>
            <dt>Reviewed quizzes</dt>
            <dd>{state.quizzes.filter((q) => q.reviewed).length}</dd>
          </div>
        </dl>
      </section>
    </>
  );
}
