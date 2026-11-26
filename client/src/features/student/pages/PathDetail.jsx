import { TechnologyStrip } from "../../demo/TechnologyMark";
import { Link, useParams } from "react-router";
import { resolvePath } from "../../demo/catalog";
import { useDemo } from "../../demo/store";
import { Header, Empty } from "../../../components/ui/SharedUi";
import SkillTree from "../../demo/DemoSkillTree";

export default function PathDetail({ dashboard = false }) {
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
