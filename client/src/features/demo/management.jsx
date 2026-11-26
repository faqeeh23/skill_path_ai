import { useState } from "react";
import { skillById } from "./catalog";
import { useDemo } from "./store";
import { Header, Notice, Empty } from "../../components/ui/SharedUi";
import { useLocation } from "react-router";
import RecordManager from "../management/components/RecordManager";
import PlatformMetrics from "../management/components/PlatformMetrics";

function QuizManager() {
  const { state, dispatch } = useDemo();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [skill, setSkill] = useState("semantic");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", ""]);
  const [correct, setCorrect] = useState(0);
  const [reviewed, setReviewed] = useState(false);
  const generated = false;
  const [message, setMessage] = useState("");
  function save(event) {
    event.preventDefault();
    const quiz = {
      id: crypto.randomUUID(),
      title,
      skillId: skill,
      question,
      options,
      correct,
      reviewed,
      status: "draft",
      source: generated ? "AI draft" : "manual draft",
    };
    dispatch({ type: "PATCH", value: { quizzes: [...state.quizzes, quiz] } });
    setEditing(false);
    setMessage("Draft saved. Review the correct option before publishing.");
  }
  return (
    <>
      <Header
        title="Quiz & question management"
        action={
          <button className="btn btn-primary" onClick={() => setEditing(true)}>
            Create quiz draft
          </button>
        }
      >
        Draft one multiple-choice question, select exactly one correct answer,
        and explicitly review it before publication.
      </Header>
      <Notice>{message}</Notice>
      {editing && (
        <form className="sp-panel sp-form" onSubmit={save}>
          <label>
            Quiz title
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label>
            Leaf skill
            <select value={skill} onChange={(e) => setSkill(e.target.value)}>
              {Object.values(skillById)
                .filter((s) => !s.children.length)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
            </select>
          </label>

          <label>
            Question
            <textarea
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </label>
          {options.map((value, index) => (
            <label key={index}>
              Option {index + 1}
              <input
                required
                value={value}
                onChange={(e) =>
                  setOptions(
                    options.map((v, i) => (i === index ? e.target.value : v)),
                  )
                }
              />
            </label>
          ))}
          <fieldset>
            <legend>Correct answer</legend>
            {options.map((_, index) => (
              <label className="sp-check" key={index}>
                <input
                  type="radio"
                  name="correct"
                  checked={correct === index}
                  onChange={() => setCorrect(index)}
                />
                Option {index + 1}
              </label>
            ))}
          </fieldset>
          <label className="sp-check">
            <input
              type="checkbox"
              checked={reviewed}
              onChange={(e) => setReviewed(e.target.checked)}
            />
            I reviewed the question and its answer
          </label>
          <div className="sp-actions">
            <button className="btn btn-primary">Save draft</button>
            <button
              className="btn btn-outline"
              type="button"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {state.quizzes.length ? (
        state.quizzes.map((q) => (
          <section className="sp-panel" key={q.id}>
            <span className="sp-tag">{q.status}</span>
            <h2>{q.title}</h2>
            <p>{q.question}</p>
            <p>
              Skill: {skillById[q.skillId].title} · Source: {q.source}
            </p>
            <ul>
              {q.options.map((o, index) => (
                <li key={index}>
                  {o}
                  {q.correct === index ? " (correct answer)" : ""}
                </li>
              ))}
            </ul>
            <div className="sp-actions">
              <button
                disabled={q.reviewed}
                onClick={() =>
                  dispatch({
                    type: "PATCH",
                    value: {
                      quizzes: state.quizzes.map((row) =>
                        row.id === q.id ? { ...row, reviewed: true } : row,
                      ),
                    },
                  })
                }
              >
                Mark reviewed
              </button>
              <button
                disabled={!q.reviewed || q.status === "published"}
                onClick={() =>
                  dispatch({
                    type: "PATCH",
                    value: {
                      quizzes: state.quizzes.map((row) =>
                        row.id === q.id ? { ...row, status: "published" } : row,
                      ),
                    },
                  })
                }
              >
                Publish reviewed quiz
              </button>
              <button
                disabled={q.status === "archived"}
                onClick={() =>
                  dispatch({
                    type: "PATCH",
                    value: {
                      quizzes: state.quizzes.map((row) =>
                        row.id === q.id ? { ...row, status: "archived" } : row,
                      ),
                    },
                  })
                }
              >
                Archive
              </button>
            </div>
          </section>
        ))
      ) : (
        <Empty title="No instructor quiz drafts yet">
          {" "}
          Create a question, review it, and publish it when ready.{" "}
        </Empty>
      )}
    </>
  );
}
function ProjectReviews() {
  const { state, dispatch } = useDemo();
  const [feedback, setFeedback] = useState({});
  const entries = Object.entries(state.projects);
  return (
    <>
      <Header title="Project idea review & feedback">
        {" "}
        Review project ideas and share feedback with learners.{" "}
      </Header>
      {entries.length ? (
        entries.map(([enrollmentId, p]) => (
          <section className="sp-panel" key={enrollmentId}>
            <span className="sp-tag">{p.status}</span>
            <h2>{p.title || "Untitled draft"}</h2>
            <p>{p.description}</p>
            <label>
              Instructor feedback
              <textarea
                value={feedback[enrollmentId] ?? p.feedback ?? ""}
                onChange={(e) =>
                  setFeedback({ ...feedback, [enrollmentId]: e.target.value })
                }
              />
            </label>
            <div className="sp-actions">
              {["approved", "rejected"].map((status) => (
                <button
                  className="btn btn-outline"
                  disabled={p.status === "passed"}
                  key={status}
                  onClick={() =>
                    dispatch({
                      type: "PROJECT",
                      enrollmentId,
                      value: {
                        ...p,
                        status,
                        feedback:
                          feedback[enrollmentId] ||
                          `Instructor review: ${status}.`,
                      },
                    })
                  }
                >
                  {status === "approved" ? "Approve idea" : "Request revision"}
                </button>
              ))}
            </div>
            <button
              className="btn btn-outline"
              onClick={() =>
                dispatch({
                  type: "PROJECT",
                  enrollmentId,
                  value: {
                    ...p,
                    feedback: feedback[enrollmentId] ?? p.feedback ?? "",
                  },
                })
              }
            >
              Save feedback
            </button>
            <p>{p.history.length} submission(s) in the history </p>
          </section>
        ))
      ) : (
        <Empty title="No ideas awaiting review">
          {" "}
          Propose an idea in the student to populate this workspace.{" "}
        </Empty>
      )}
    </>
  );
}
function StudentProgress() {
  const { state } = useDemo();
  return (
    <>
      <Header title="Student progress overview">
        {" "}
        Track lesson completion and skill evidence across learners.{" "}
      </Header>
      {state.enrollments.length ? (
        state.enrollments.map((e) => (
          <section className="sp-panel" key={e.id}>
            <h2>{state.catalog.find((p) => p.id === e.pathId)?.title}</h2>
            <p>
              Status: {e.status} · {e.completed.length} lessons completed
            </p>
            <p>
              {state.attempts.filter((a) => a.enrollmentId === e.id).length}{" "}
              assessments · {state.projects[e.id]?.history.length ?? 0} project
              submissions
            </p>
          </section>
        ))
      ) : (
        <Empty title="No student enrollments yet">
          {" "}
          Enroll in a path using the student first.{" "}
        </Empty>
      )}
    </>
  );
}

export default function Management({ role }) {
  const kind = useLocation().pathname.split("/")[2] ?? "";
  if (["paths", "lessons", "resources"].includes(kind)) {
    return <RecordManager key={kind} kind={kind} />;
  }
  if (kind === "quizzes") return <QuizManager />;
  if (kind === "projects") return <ProjectReviews />;
  if (kind === "students") return <StudentProgress />;
  return <PlatformMetrics role={role} title="A clear view of your learning platform." />;
}
