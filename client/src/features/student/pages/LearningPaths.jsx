import { useState } from "react";
import { Link } from "react-router";
import { useDemo, activeEnrollment } from "../../demo/store";
import { Header, Empty, Notice, Confirm } from "../../../components/ui/SharedUi";
import SkillTree from "../../demo/DemoSkillTree";
import { orderedLessons, reasonFor } from "../../demo/planning";

export default function LearningPaths() {
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
