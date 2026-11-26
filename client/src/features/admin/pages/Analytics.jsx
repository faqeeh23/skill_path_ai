import { faBookOpen, faChartLine, faUsers } from "@fortawesome/free-solid-svg-icons";
import { Header, Icon } from "../../../components/ui/SharedUi";
import { useDemo } from "../../demo/store";

export default function Analytics() {
  const { state } = useDemo();
  const users = state.users.filter((user) => user.status !== "archived");
  const groups = [
    {
      title: "Accounts by role",
      icon: faUsers,
      total: users.length,
      rows: [
        ["Students", users.filter((user) => user.role === "student").length],
        ["Instructors", users.filter((user) => user.role === "instructor").length],
        ["Admins", users.filter((user) => user.role === "admin").length],
      ],
    },
    {
      title: "Lessons by status",
      icon: faBookOpen,
      total: state.lessons.length,
      rows: [
        ["Published", state.lessons.filter((lesson) => lesson.status === "published").length],
        ["Draft", state.lessons.filter((lesson) => lesson.status === "draft").length],
        ["Archived", state.lessons.filter((lesson) => lesson.status === "archived").length],
      ],
    },
  ];

  return (
    <div className="admin-overview">
      <Header title={<><Icon icon={faChartLine} /> Platform analytics</>}>
        Review the distribution of current accounts and lesson publishing status.
      </Header>
      <p className="admin-data-note">Demo data</p>
      <div className="admin-overview-grid">
        {groups.map(({ title, icon, total, rows }) => (
          <section className="admin-overview-panel" key={title}>
            <header><h2><Icon icon={icon} /> {title}</h2></header>
            <dl className="admin-activity admin-breakdown">
              {rows.map(([label, count]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{count.toLocaleString()}</dd>
                  <meter aria-hidden="true" min={0} max={Math.max(total, 1)} value={count} />
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  );
}
