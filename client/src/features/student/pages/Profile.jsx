import { Header } from "../../../components/ui/SharedUi";
import { Link } from "react-router";
import { useAuth } from "../../../hooks/useAuth";
import ProfileForm from "../components/ProfileForm";
import "../student-account.css";

export default function Profile() {
  const { user } = useAuth();
  const initials = user.name.trim().split(/\s+/).slice(0, 2)
    .map((part) => Array.from(part)[0]).join("").toUpperCase();

  return (
    <div className="student-account">
      <Header title="My profile">Manage how your name appears in your workspace.</Header>
      <section className="student-account-identity" aria-label="Account details">
        <span className="student-account-avatar" aria-hidden="true">{initials}</span>
        <div>
          <h2>{user.name}</h2>
          <dl>
            <dt>Email address</dt>
            <dd>{user.email}</dd>
          </dl>
        </div>
        <Link to="/dashboard/settings">Change email in Settings</Link>
      </section>
      <ProfileForm />
    </div>
  );
}
