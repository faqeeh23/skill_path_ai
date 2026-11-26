import { Link } from "react-router";
import {
  faArrowRight, faBookOpen, faBullseye, faClipboardCheck, faFolderOpen,
  faGraduationCap, faRoute, faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { Header, Icon } from "../../../components/ui/SharedUi";
import { useDemo } from "../../demo/store";

const shortcuts = [
  { to: "users", title: "Users", description: "Find learners and manage account access.", icon: faUsers },
  { to: "goals", title: "Career goals", description: "Organize the outcomes learners work toward.", icon: faBullseye },
  { to: "paths", title: "Learning paths", description: "Review available curricula.", icon: faRoute },
  { to: "content", title: "Platform content", description: "Find lessons and review their publishing status.", icon: faBookOpen },
];

export default function Overview() {
  const { state } = useDemo();
  const metrics = [
    { label: "User records", value: state.users.filter((user) => user.status !== "archived").length, icon: faUsers },
    { label: "Available paths", value: state.catalog.filter((path) => path.status !== "archived").length, icon: faRoute },
    { label: "Student enrollments", value: state.enrollments.length, icon: faGraduationCap },
  ];
  const activity = [
    { label: "Published lessons", value: state.lessons.filter((lesson) => lesson.status === "published").length, icon: faBookOpen },
    { label: "Reviewed quizzes", value: state.quizzes.filter((quiz) => quiz.reviewed).length, icon: faClipboardCheck },
    { label: "Completed assessments", value: state.attempts.length, icon: faGraduationCap },
    { label: "Project submissions", value: Object.values(state.projects).reduce((total, project) => total + project.history.length, 0), icon: faFolderOpen },
  ];

  return (
    <div className="admin-overview">
      <Header title="Platform overview">Track learning activity and access your management tools.</Header>
      <p className="admin-data-note">Demo data</p>

      <dl className="admin-metrics">
        {metrics.map(({ label, value, icon }) => (
          <div key={label}>
            <dt><Icon icon={icon} /> {label}</dt>
            <dd>{value.toLocaleString()}</dd>
          </div>
        ))}
      </dl>

      <div className="admin-overview-grid">
        <section className="admin-overview-panel" aria-labelledby="admin-activity">
          <header>
            <h2 id="admin-activity">Learning activity</h2>
            <Link to="/admin/analytics">View analytics <Icon icon={faArrowRight} /></Link>
          </header>
          <dl className="admin-activity">
            {activity.map(({ label, value, icon }) => (
              <div key={label}>
                <dt><Icon icon={icon} /> {label}</dt>
                <dd>{value.toLocaleString()}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="admin-overview-panel" aria-labelledby="admin-shortcuts">
          <header><h2 id="admin-shortcuts">Management shortcuts</h2></header>
          <ul className="admin-shortcuts">
            {shortcuts.map(({ to, title, description, icon }) => (
              <li key={to}>
                <Link to={to}>
                  <Icon icon={icon} />
                  <span><strong>{title}</strong><small>{description}</small></span>
                  <Icon icon={faArrowRight} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
