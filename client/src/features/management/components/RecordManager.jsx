import { useState } from "react";
import { useDelay } from "../../demo/hooks";
import { paths, skillById, leavesOf } from "../../demo/catalog";
import { useDemo } from "../../demo/store";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { Header, Icon, Notice, Empty, Confirm } from "../../../components/ui/SharedUi";

const configs = {
  users: { title: "User management", key: "users", name: "name" },
  instructors: { title: "Instructor management", key: "users", name: "name" },
  goals: { title: "Career goals", key: "goals", name: "title" },
  paths: { title: "Learning path management", key: "catalog", name: "title" },
  content: { title: "Platform content", key: "lessons", name: "title" },
  lessons: { title: "Skills & lessons", key: "lessons", name: "title" },
  resources: { title: "Video & resources", key: "lessons", name: "title" },
};
export default function RecordManager({ kind, presentation }) {
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
      `${row[config.name]} ${row.description ?? ""} ${row.role ?? ""} ${presentation ? row.email ?? "" : ""}`
        .toLowerCase()
        .includes((presentation ? search.trim() : search).toLowerCase()),
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
        title={presentation ? <><Icon icon={presentation.icon} /> {presentation.title}</> : config.title}
        action={
          <button className="btn btn-primary" onClick={create}>
            {presentation && <Icon icon={faPlus} />} Add{" "}
            {presentation?.noun ?? (config.key === "users"
              ? "person"
              : config.key === "catalog"
                ? "path"
                : config.key === "goals"
                  ? "goal"
                  : "lesson")}
          </button>
        }
      >
        {presentation?.description ?? "Create and edit records. Archiving is reversible and does not delete learning history."}
      </Header>
      {presentation && <p className="admin-data-note">Demo data</p>}
      <div className={presentation ? "sp-toolbar admin-record-toolbar" : "sp-toolbar"}>
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
      {presentation && <p className="admin-record-count" role="status">{filtered.length} of {records.length} records</p>}
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
                    {presentation ? <span className="admin-record-status">{row.status ?? "active"}</span> : row.status ?? "active"}
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
        presentation ? (
          <section className="admin-overview-panel admin-empty">
            <h2>No records match</h2>
            <p>Change your search or check another record status.</p>
            <button type="button" className="btn btn-outline" onClick={() => { setSearch(""); setStatus("all"); }}>
              Clear filters
            </button>
          </section>
        ) : (
          <Empty title="No records match">
            Try a different search or status, or add a record.
          </Empty>
        )
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
