import { interfaceText } from "../../lib/interfaceText";
import { useDelay } from "./hooks";
import { useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { skillById, tutorActions } from "./catalog";
import { useDemo, activeEnrollment } from "./store";
import { Header, Empty, Notice } from "./ui";
import { orderedLessons, reasonFor } from "./planning";

function Tutor({ lesson }) {
  const { state, dispatch } = useDemo();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState("");
  const [open, setOpen] = useState(false);
  const delay = useDelay();
  const messages = state.chats[lesson.id] ?? [];
  function ask(question = text, retry = false) {
    if (!question.trim() || busy) return;
    setBusy(true);
    setText("");
    setFailed("");
    const previous = state.chats[lesson.id] ?? [];
    const prompt = { id: crypto.randomUUID(), role: "user", text: question };
    dispatch({
      type: "PATCH",
      value: {
        chats: {
          ...state.chats,
          [lesson.id]: [...previous, ...(retry ? [] : [prompt])],
        },
      },
    });
    delay(() => {
      setBusy(false);

      const lower = question.toLowerCase();
      const response = lower.includes("practice")
        ? `Practice: explain ${lesson.title} in your own words. Then describe one situation where this rule helps: ${lesson.summary}`
        : lower.includes("example")
          ? `Example approach for ${lesson.title}: start with a small input, apply the rule, and compare the output with your goal. Key rule: ${lesson.summary}`
          : lower.includes("summar")
            ? `Summary of ${lesson.title}: ${lesson.summary} Try the practice question before marking this lesson complete.`
            : `For ${lesson.title}: ${lesson.summary}Break the task into one decision at a time, try a small example, and verify the outcome.`;
      dispatch({
        type: "PATCH",
        value: {
          chats: {
            ...state.chats,
            [lesson.id]: [
              ...previous,
              ...(retry ? [] : [prompt]),
              { id: crypto.randomUUID(), role: "assistant", text: response },
            ],
          },
        },
      });
    });
  }
  return (
    <aside className={`sp-tutor ${open ? "is-open" : ""}`}>
      <button
        className="sp-tutor-toggle btn btn-outline"
        aria-expanded={open}
        aria-controls="lesson-tutor-panel"
        onClick={() => setOpen(!open)}
      >
        {open ? "Close tutor" : "Open lesson tutor"}
      </button>
      <div id="lesson-tutor-panel" className="sp-tutor-body">
        <h2>Lesson tutor</h2>
        <span className="sp-tag"> assistant </span>
        <p>
          Responses use the current lesson’s teaching notes. No AI service is
          called.
        </p>
        <div
          className="sp-chat-history"
          role="log"
          aria-label="Lesson conversation"
          aria-live="polite"
        >
          {messages.length ? (
            messages.map((m) => (
              <div className={`sp-message ${m.role}`} key={m.id}>
                <strong>{m.role === "user" ? "You" : "tutor"}</strong>
                <p>{m.role === "user" ? m.text : interfaceText(m.text)}</p>
              </div>
            ))
          ) : (
            <p>Ask about {lesson.title}, or choose a prompt below.</p>
          )}
          {busy && <p role="status"> Preparing a reply… </p>}
        </div>
        {failed && (
          <Notice error>
            {" "}
            response failed.{" "}
            <button onClick={() => ask(failed, true)}>Retry response</button>
          </Notice>
        )}
        <div className="sp-prompt-buttons">
          {tutorActions.map((action) => (
            <button disabled={busy} key={action} onClick={() => ask(action)}>
              {action}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask();
          }}
        >
          <label htmlFor="tutor-question">Ask about this lesson</label>
          <textarea
            id="tutor-question"
            name="question"
            value={text}
            maxLength="1000"
            onChange={(e) => setText(e.target.value)}
            required
          />
          <button className="btn btn-primary" disabled={busy || !text.trim()}>
            Send question
          </button>
        </form>
      </div>
    </aside>
  );
}
export default function LessonRoute() {
  const { lessonId } = useParams();
  return <Lesson key={lessonId} />;
}
function Lesson() {
  const { lessonId } = useParams();
  const { state, dispatch, pathById, lessonById } = useDemo();
  const e = activeEnrollment(state);
  const lesson = lessonById[lessonId];
  const video = useRef(null);
  const [tab, setTab] = useState("transcript");
  const [practice, setPractice] = useState("");
  const [message, setMessage] = useState("");
  const current = e ? pathById[e.pathId] : null;
  const order = e ? orderedLessons(current, e, state) : [];
  const index = order.indexOf(lessonId);
  const nextOpen = e ? order.find((id) => !e.completed.includes(id)) : null;
  if (!e)
    return (
      <Empty
        title="Enroll before opening a lesson"
        to="/onboarding"
        label="Choose your path"
      >
        Lessons belong to your selected enrollment.
      </Empty>
    );
  if (
    !lesson ||
    lesson.status !== "published" ||
    !current.lessonIds.includes(lessonId)
  )
    return (
      <Empty
        title="Lesson unavailable in this path"
        to="/dashboard/path"
        label="Open your curriculum"
      >
        Choose a lesson from the selected path.
      </Empty>
    );
  if (
    !e.completed.includes(lessonId) &&
    nextOpen !== lessonId &&
    !(
      lessonId === current.lessonIds.at(-1) &&
      (state.projects[e.id]?.history.filter((h) => h.status === "evaluated")
        .length ?? 0) >= 3
    )
  )
    return (
      <Empty
        title="This lesson is upcoming"
        to="/dashboard/path"
        label="Continue your current lesson"
      >
        Finish the current recommended lesson first.
      </Empty>
    );
  function savePosition() {
    const position = video.current?.currentTime ?? 0;
    if (Math.abs(position - (state.positions[lessonId] ?? 0)) < 0.5) return;
    dispatch({
      type: "PATCH",
      value: { positions: { ...state.positions, [lessonId]: position } },
    });
  }
  return (
    <>
      <Link className="sp-back" to="/dashboard/path">
        Back to curriculum
      </Link>
      <Header eyebrow={current.title} title={lesson.title}>
        {reasonFor(lessonId, e, state)}
      </Header>
      <div className="sp-lesson-grid">
        <section className="sp-panel sp-lesson-content">
          <video
            aria-label={`${lesson.title} sample video player`}
            ref={video}
            key={lessonId}
            controls
            playsInline
            muted
            preload="metadata"
            onLoadedMetadata={() => {
              const p = state.positions[lessonId] ?? 0;
              if (video.current && p < video.current.duration)
                video.current.currentTime = p;
            }}
            onPause={savePosition}
            onEnded={savePosition}
            onTimeUpdate={() => {
              if (
                video.current &&
                Math.floor(video.current.currentTime) % 3 === 0
              )
                savePosition();
            }}
            onError={() =>
              setMessage(
                "The sample video could not load. You can use the teaching notes and complete the practice below.",
              )
            }
          >
            <source
              src={
                lesson.video?.includes("flower.mp4")
                  ? "/skillpath-demo.mp4"
                  : lesson.video
              }
              type="video/mp4"
            />
            <track
              kind="captions"
              label="English"
              srcLang="en"
              default
              src={
                "data:text/vtt;charset=utf-8," +
                encodeURIComponent(
                  "WEBVTT\n\n00:00.000 --> 00:05.000\nGeneric flower footage for testing playback. See the teaching notes below for the lesson content.\n",
                )
              }
            />
          </video>
          <p className="sp-muted">
            Read the teaching notes below for the lesson content.
          </p>
          <div className="sp-tags">
            <span>{lesson.minutes} min</span>
            <span>{skillById[lesson.skillId].title}</span>
            <span>
              {e.completed.includes(lessonId) ? "Completed" : "In progress"}
            </span>
          </div>
          <div className="sp-tabs" role="tablist" aria-label="Lesson content">
            {["transcript", "objectives", "resources", "practice"].map((t) => (
              <button
                role="tab"
                id={`tab-${t}`}
                aria-controls={`panel-${t}`}
                aria-selected={tab === t}
                tabIndex={tab === t ? 0 : -1}
                onKeyDown={(event) => {
                  if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                    event.preventDefault();
                    const all = [
                      "transcript",
                      "objectives",
                      "resources",
                      "practice",
                    ];
                    const next =
                      all[
                        (all.indexOf(t) +
                          (event.key === "ArrowRight" ? 1 : 3)) %
                          4
                      ];
                    setTab(next);
                    document.getElementById(`tab-${next}`)?.focus();
                  }
                }}
                key={t}
                onClick={() => setTab(t)}
              >
                {t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <div
            role="tabpanel"
            id={`panel-${tab}`}
            aria-labelledby={`tab-${tab}`}
            tabIndex="0"
          >
            {tab === "transcript" ? (
              <>
                <h2>Lesson transcript / teaching notes</h2>
                <p className="sp-prewrap">{lesson.transcript}</p>
              </>
            ) : tab === "objectives" ? (
              <ul>
                {lesson.objectives.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            ) : tab === "resources" ? (
              <ul>
                {lesson.resources.map((r) => (
                  <li key={r.url}>
                    <a href={r.url} target="_blank" rel="noreferrer">
                      {r.label} (opens in a new tab)
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <fieldset className="sp-answer-options">
                <legend>Which approach applies this lesson?</legend>
                {[
                  lesson.summary,
                  "Assume the outcome without checking it.",
                ].map((option) => (
                  <label key={option}>
                    <input
                      type="radio"
                      name="practice"
                      value={option}
                      checked={practice === option}
                      onChange={(e) => setPractice(e.target.value)}
                    />
                    {option}
                  </label>
                ))}
                <Notice>
                  {practice
                    ? practice === lesson.summary
                      ? "Correct. Apply the concept and verify the result."
                      : "Try again. Review the key rule in the lesson notes."
                    : ""}
                </Notice>
              </fieldset>
            )}
          </div>
          <Notice error={message.includes("could not")}>{message}</Notice>
          <div className="sp-actions">
            <button
              className="btn btn-primary"
              disabled={e.completed.includes(lessonId)}
              onClick={() => {
                savePosition();
                dispatch({
                  type: "LESSON",
                  enrollmentId: e.id,
                  lessonId,
                  title: lesson.title,
                });
                setMessage(
                  "Lesson completed. Skill estimates only change after an assessment.",
                );
              }}
            >
              Mark as completed
            </button>
            <Link
              className="btn btn-outline"
              to={`/dashboard/assessment?kind=checkpoint&skill=${lesson.skillId}`}
            >
              Take skill checkpoint
            </Link>
          </div>
          <div className="sp-actions sp-between">
            {index > 0 ? (
              <Link to={`/dashboard/lessons/${order[index - 1]}`}>
                Previous lesson
              </Link>
            ) : (
              <span />
            )}
            {index < order.length - 1 && e.completed.includes(lessonId) ? (
              <Link to={`/dashboard/lessons/${order[index + 1]}`}>
                Next lesson
              </Link>
            ) : (
              <Link to="/dashboard/path">View progress</Link>
            )}
          </div>
        </section>
        <Tutor key={lessonId} lesson={lesson} />
      </div>
    </>
  );
}
