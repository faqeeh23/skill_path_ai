import { useDelay } from "./hooks";
import { useState } from "react";
import { useLocation } from "react-router";
import { paths, skillById, leavesOf } from "./catalog";
import { useDemo } from "./store";
import { Header, Notice, Empty, Confirm } from "./ui";

const configs = {
  users: { title: "User management", key: "users", name: "name" },
  instructors: { title: "Instructor management", key: "users", name: "name" },
  goals: { title: "Career goals", key: "goals", name: "title" },
  paths: { title: "Learning path management", key: "catalog", name: "title" },
  content: { title: "Platform content", key: "lessons", name: "title" },
  lessons: { title: "Skills & lessons", key: "lessons", name: "title" },
  resources: { title: "Video & resources", key: "lessons", name: "title" },
};
function RecordManager({ kind }) {
  const { state, dispatch } = useDemo();
  const config = configs[kind];
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [editing, setEditing] = useState(null);
  const [archive, setArchive] = useState(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const delay = useDelay();
  const records = state[config.key].filter(
    (row) => kind !== "instructors" || row.role === "instructor",
  );
  const filtered = records.filter(
    (row) =>
      (status === "all" ||
        (status === "archived"
          ? row.status === "archived"
          : row.status !== "archived")) &&
      `${row[config.name]} ${row.description ?? ""} ${row.role ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  function update(rows) {
    const value = { [config.key]: rows };
    if (config.key === "lessons") {
      value.catalog = state.catalog.map((path) => ({
        ...path,
        lessonIds: [
          ...new Set([
            ...path.lessonIds,
            ...rows
              .filter(
                (l) =>
                  l.status === "published" &&
                  l.processing === "ready" &&
                  path.leafIds.includes(l.skillId),
              )
              .map((l) => l.id),
          ]),
        ].filter((id) =>
          rows.some(
            (l) =>
              l.id === id &&
              l.status === "published" &&
              l.processing === "ready",
          ),
        ),
      }));
    }
    dispatch({ type: "PATCH", value });
  }
  function save(event) {
    event.preventDefault();
    if (!editing[config.name]?.trim()) {
      setNotice("Enter a name or title before saving.");
      return;
    }
    if (config.key === "catalog" && !editing.roots?.length) {
      setNotice("Choose at least one required skill group.");
      return;
    }
    if (
      config.key === "lessons" &&
      editing.status === "published" &&
      editing.processing !== "ready"
    ) {
      setNotice("A lesson must be processed and ready before publishing.");
      return;
    }
    setBusy(true);
    delay(() => {
      const exists = state[config.key].some((row) => row.id === editing.id);
      update(
        exists
          ? state[config.key].map((row) =>
              row.id === editing.id ? editing : row,
            )
          : [...state[config.key], editing],
      );
      setEditing(null);
      setBusy(false);
      setNotice("Changes saved.");
    });
  }
  function create() {
    const seed =
      config.key === "catalog"
        ? {
            ...(paths.find((p) => p.goalId === state.goals[0].id) ?? paths[0]),
            goalId: state.goals[0].id,
          }
        : config.key === "lessons"
          ? {
              skillId: "semantic",
              summary: "New instructor lesson.",
              objectives: ["Practice the selected skill."],
              transcript: "Add teaching notes for this lesson.",
              minutes: 10,
              video: "/skillpath-demo.mp4",
              resources: [],
              processing: "uploaded",
              status: "draft",
            }
          : config.key === "users"
            ? {
                email: "",
                role: kind === "instructors" ? "instructor" : "student",
                status: "active",
              }
            : { description: "", status: "active" };
    setEditing({
      ...seed,
      id: `local-${crypto.randomUUID()}`,
      [config.name]: "",
    });
  }
  return (
    <>
      <Header
        title={config.title}
        action={
          <button className="btn btn-primary" onClick={create}>
            Add{" "}
            {config.key === "users"
              ? "person"
              : config.key === "catalog"
                ? "path"
                : config.key === "goals"
                  ? "goal"
                  : "lesson"}
          </button>
        }
      >
        {" "}
        Create and edit records. Archiving is reversible and does not delete
        learning history.{" "}
      </Header>
      <div className="sp-toolbar">
        <label>
          Search
          <input
            type="search"
            name="search"
            autoComplete="off"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search records…"
          />
        </label>
        <label>
          Record status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="active">Current</option>
            <option value="archived">Archived</option>
            <option value="all">All records</option>
          </select>
        </label>
      </div>
      <Notice>{notice}</Notice>
      {filtered.length ? (
        <div className="sp-panel sp-table-scroll">
          <table>
            <caption>{config.title} · records </caption>
            <thead>
              <tr>
                <th scope="col">{config.name === "name" ? "Name" : "Title"}</th>
                <th scope="col">Details</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <th scope="row">{row[config.name]}</th>
                  <td>
                    {row.email ??
                      row.description ??
                      (skillById[row.skillId]?.title || "Record")}
                    {row.fileName && (
                      <small>File: {row.fileName} (metadata only)</small>
                    )}
                  </td>
                  <td>
                    {row.status ?? "active"}
                    {row.processing && <small>Media: {row.processing}</small>}
                  </td>
                  <td>
                    <div className="sp-actions">
                      <button
                        aria-label={`Edit ${row[config.name]}`}
                        onClick={() => {
                          setEditing({ ...row });
                          setNotice("");
                        }}
                      >
                        Edit
                      </button>
                      {row.status === "archived" ? (
                        <button
                          onClick={() => {
                            update(
                              state[config.key].map((r) =>
                                r.id === row.id
                                  ? {
                                      ...r,
                                      status:
                                        config.key === "lessons"
                                          ? "draft"
                                          : "active",
                                    }
                                  : r,
                              ),
                            );
                            setNotice("Record restored.");
                          }}
                        >
                          Restore
                        </button>
                      ) : (
                        <button
                          aria-label={`Archive ${row[config.name]}`}
                          onClick={() => setArchive(row)}
                        >
                          Archive
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty title="No records match">
          Try a different search or status, or add a record.
        </Empty>
      )}
      {editing && (
        <Confirm
          title={`Edit ${config.key === "users" ? "person" : config.key === "catalog" ? "learning path" : config.key === "goals" ? "career goal" : "lesson"}`}
          label="Save changes"
          busy={busy}
          onCancel={() => setEditing(null)}
          onConfirm={() =>
            document.getElementById("record-form")?.requestSubmit()
          }
        >
          <form id="record-form" className="sp-form" onSubmit={save}>
            <label>
              {config.name === "name" ? "Name" : "Title"}
              <input
                value={editing[config.name]}
                onChange={(e) =>
                  setEditing({ ...editing, [config.name]: e.target.value })
                }
                name="title"
                required
                maxLength="150"
              />
            </label>
            {config.key === "users" ? (
              <>
                <label>
                  Email
                  <input
                    type="email"
                    name="email"
                    required
                    value={editing.email}
                    onChange={(e) =>
                      setEditing({ ...editing, email: e.target.value })
                    }
                  />
                </label>
                <label>
                  {" "}
                  role{" "}
                  <select
                    value={editing.role}
                    onChange={(e) =>
                      setEditing({ ...editing, role: e.target.value })
                    }
                  >
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
              </>
            ) : (
              <label>
                Description / teaching notes
                <textarea
                  value={editing.description ?? editing.transcript ?? ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      description: e.target.value,
                      ...(config.key === "lessons"
                        ? {
                            transcript: e.target.value,
                            summary: e.target.value.slice(0, 180),
                          }
                        : {}),
                    })
                  }
                />
              </label>
            )}
            {config.key === "catalog" && (
              <label>
                Career goal
                <select
                  value={editing.goalId}
                  onChange={(e) =>
                    setEditing({ ...editing, goalId: e.target.value })
                  }
                >
                  {state.goals
                    .filter((g) => g.status !== "archived")
                    .map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title}
                      </option>
                    ))}
                </select>
              </label>
            )}
            {config.key === "catalog" && (
              <>
                <label>
                  Estimated duration in weeks
                  <input
                    type="number"
                    min="1"
                    max="104"
                    required
                    value={editing.weeks}
                    onChange={(e) =>
                      setEditing({ ...editing, weeks: Number(e.target.value) })
                    }
                  />
                </label>
                <label>
                  Required skill groups
                  <select
                    multiple
                    value={editing.roots}
                    onChange={(e) => {
                      const roots = [...e.target.selectedOptions].map(
                        (o) => o.value,
                      );
                      const leafIds = roots.flatMap(leavesOf);
                      setEditing({
                        ...editing,
                        roots,
                        leafIds,
                        lessonIds: state.lessons
                          .filter(
                            (l) =>
                              leafIds.includes(l.skillId) &&
                              l.status === "published" &&
                              l.processing === "ready",
                          )
                          .map((l) => l.id),
                      });
                    }}
                  >
                    {Object.values(skillById)
                      .filter((s) => !s.parentId)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                  </select>
                </label>
                <p className="sp-muted">
                  Select one or more skill groups. The curriculum reuses their
                  published lessons.
                </p>
              </>
            )}
            {config.key === "lessons" && (
              <>
                <label>
                  Skill
                  <select
                    value={editing.skillId}
                    onChange={(e) =>
                      setEditing({ ...editing, skillId: e.target.value })
                    }
                  >
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
                  Video/resource file
                  <input
                    type="file"
                    accept="video/*,.pdf,.txt"
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        fileName: e.target.files?.[0]?.name ?? "",
                        processing: "uploaded",
                      })
                    }
                  />
                </label>
                <p className="sp-muted">
                  Only the file name is stored. No file is uploaded or
                  processed.
                </p>
                <label>
                  {" "}
                  Processing{" "}
                  <select
                    value={editing.processing}
                    onChange={(e) =>
                      setEditing({ ...editing, processing: e.target.value })
                    }
                  >
                    <option value="uploaded">Uploaded</option>
                    <option value="processing">Processing</option>
                    <option value="ready">Ready</option>
                    <option value="error">Error</option>
                  </select>
                </label>
                <label>
                  Publishing status
                  <select
                    value={editing.status}
                    onChange={(e) =>
                      setEditing({ ...editing, status: e.target.value })
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="published">
                      Published (requires ready)
                    </option>
                    <option value="archived">Archived</option>
                  </select>
                </label>
              </>
            )}
            <Notice
              error={notice.includes("must") || notice.startsWith("Enter ")}
            >
              {notice}
            </Notice>
          </form>
        </Confirm>
      )}
      {archive && (
        <Confirm
          title="Archive this record?"
          label="Archive"
          onCancel={() => setArchive(null)}
          onConfirm={() => {
            update(
              state[config.key].map((row) =>
                row.id === archive.id ? { ...row, status: "archived" } : row,
              ),
            );
            setArchive(null);
            setNotice(
              "Record archived. Use the Archived filter to restore it.",
            );
          }}
        >
          <p>
            {archive[config.name]} will be marked archived. Existing enrollment
            and assessment history is retained.
          </p>
        </Confirm>
      )}
    </>
  );
}
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
  const { state } = useDemo();
  const kind = useLocation().pathname.split("/")[2] ?? "";
  if (configs[kind]) return <RecordManager key={kind} kind={kind} />;
  if (kind === "quizzes") return <QuizManager />;
  if (kind === "projects") return <ProjectReviews />;
  if (kind === "students") return <StudentProgress />;
  if (kind === "subscriptions")
    return (
      <>
        <Header title="Subscription overview">
          {" "}
          Review your learning plan and access settings.{" "}
        </Header>
        <section className="sp-panel">
          <h2> Current access </h2>
          <p>{state.subscription === "pro" ? "Pro" : "Free trial"}</p>
          <p>
            Financial transactions: none. This prototype never collects payment
            credentials.
          </p>
        </section>
      </>
    );
  return (
    <>
      <Header
        eyebrow={`${role}`}
        title={
          kind === "analytics"
            ? "Platform analytics"
            : "A clear view of your learning platform."
        }
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
