import TechnologyMark from "../../demo/TechnologyMark";
import { Link } from "react-router";
import { skillById } from "../../demo/catalog";
import { useDemo, activeEnrollment } from "../../demo/store";
import { Header, Empty } from "../../../components/ui/SharedUi";

export default function SkillProfile() {
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
