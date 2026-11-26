import { useEffect, useState } from "react";
import { Link } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen, faClipboardCheck, faFolderOpen, faRoute } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../hooks/useAuth";
import api from "../services/api";
import "./student-dashboard.css";

const projectStatuses = {
  proposed: "Proposed",
  needs_changes: "Changes requested",
  approved: "Approved",
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const [request, setRequest] = useState(0);
  const [result, setResult] = useState(null);
  const current = result?.request === request && result.userId === user.id ? result : null;
  const { id: userId } = user;

  useEffect(() => {
    const controller = new AbortController();
    api.get("/api/student/dashboard", { signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) setResult({ request, userId, data });
      })
      .catch(() => {
        if (!controller.signal.aborted) setResult({ request, userId, failed: true });
      });
    return () => controller.abort();
  }, [request, userId]);

  return (
    <div className="student-dashboard">
      <header className="student-dash-heading">
        <h1>Welcome, {user.name}</h1>
        <p>Pick up where you left off and track your learning progress.</p>
      </header>
      {!current ? (
        <p className="student-dash-card" role="status">Loading your dashboard…</p>
      ) : current.failed ? (
        <div className="student-dash-card">
          <p role="alert">We couldn’t load your dashboard.</p>
          <button className="student-dash-action" onClick={() => setRequest(request + 1)}>Try again</button>
        </div>
      ) : current.data.path ? (
        <LearningOverview data={current.data} />
      ) : (
        <section className="student-dash-path">
          <FontAwesomeIcon icon={faRoute} aria-hidden="true" />
          <h2>No active learning path</h2>
          <p>Explore the available paths to find one that fits your career goal.</p>
          <Link className="student-dash-action" to="/paths">Explore learning paths</Link>
        </section>
      )}
    </div>
  );
}

function LearningOverview({ data: { path, lessons, next_lesson: lesson, checkpoint, project } }) {
  const percent = lessons.total ? Math.round(100 * lessons.completed / lessons.total) : 0;
  const videoUrl = lesson?.video_url;
  const canPlay = videoUrl && /^(https?:\/\/|\/(?!\/))/i.test(videoUrl);

  return (
    <>
      <section className="student-dash-path" aria-labelledby="student-path-title">
        <p><FontAwesomeIcon icon={faRoute} aria-hidden="true" /> Active learning path</p>
        <h2 id="student-path-title">{path.title}</h2>
        {path.description && <p>{path.description}</p>}
        <div className="student-dash-progress">
          <label htmlFor="student-path-progress">Lesson progress</label>
          <strong>{percent}%</strong>
          <progress id="student-path-progress" max="100" value={percent}>{percent}%</progress>
          <p>{lessons.completed} of {lessons.total} lessons completed</p>
        </div>
      </section>

      <div className="student-dash-grid">
        <section className="student-dash-card student-dash-next">
          <h2><FontAwesomeIcon icon={faBookOpen} aria-hidden="true" /> Next lesson</h2>
          {lesson ? (
            <>
              <h3>{lesson.title}</h3>
              {lesson.duration_seconds > 0 && <p>{Math.ceil(lesson.duration_seconds / 60)} min</p>}
              {lesson.description && <p>{lesson.description}</p>}
              {canPlay && (
                <details>
                  <summary>{lesson.resume_at > 0 ? "Resume lesson" : "Watch lesson"}</summary>
                  <video
                    controls
                    playsInline
                    preload="none"
                    src={videoUrl}
                    onLoadedMetadata={(event) => {
                      if (lesson.resume_at < event.currentTarget.duration) {
                        event.currentTarget.currentTime = lesson.resume_at;
                      }
                    }}
                  />
                </details>
              )}
            </>
          ) : (
            <p>{lessons.total ? "You’ve completed all available lessons." : "Your path has no published lessons yet."}</p>
          )}
        </section>
        <section className="student-dash-card">
          <h2><FontAwesomeIcon icon={faClipboardCheck} aria-hidden="true" /> Quiz checkpoint</h2>
          {checkpoint.next && <h3>{checkpoint.next}</h3>}
          <p>{checkpoint.total ? `${checkpoint.submitted} of ${checkpoint.total} quizzes submitted` : "No published checkpoints yet."}</p>
        </section>
        <section className="student-dash-card">
          <h2><FontAwesomeIcon icon={faFolderOpen} aria-hidden="true" /> Final project</h2>
          {project && <h3>{project.title}</h3>}
          <p>{project ? projectStatuses[project.status] : "No final project has been proposed yet."}</p>
        </section>
      </div>
    </>
  );
}
