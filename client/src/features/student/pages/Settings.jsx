import { Link } from "react-router";
import { faShieldHalved, faSliders } from "@fortawesome/free-solid-svg-icons";
import { Header, Icon } from "../../../components/ui/SharedUi";
import { useDemo } from "../../demo/store";
import ChangePasswordForm from "../components/ChangePasswordForm";
import ChangeEmailForm from "../components/ChangeEmailForm";
import "../student-account.css";

export default function Settings() {
  const { state, dispatch } = useDemo();

  function updatePreference(key, value) {
    dispatch({
      type: "PATCH",
      value: { preferences: { ...state.preferences, [key]: value } },
    });
  }

  return (
    <div className="student-account">
      <Header title="Account settings">Manage your learning preferences and account.</Header>
      <section aria-labelledby="student-security-title">
        <h2 id="student-security-title" className="student-account-section-title"><Icon icon={faShieldHalved} /> Sign-in and security</h2>
        <div className="student-account-grid">
          <ChangeEmailForm />
          <ChangePasswordForm />
        </div>
      </section>
      <section className="sp-panel student-account-panel student-account-preferences">
        <h2><Icon icon={faSliders} /> Learning preferences</h2>
        <div className="student-account-preference-row">
        <label className="sp-check">
          <input
            type="checkbox"
            checked={state.preferences.notifications}
            onChange={(event) => updatePreference("notifications", event.target.checked)}
          />{" "}
          Show learning reminders{" "}
        </label>
        <label className="student-account-time">
          Daily learning time
          <select
            value={state.preferences.minutes}
            onChange={(event) => updatePreference("minutes", Number(event.target.value))}
          >
            {[15, 20, 30, 45].map((n) => (
              <option key={n} value={n}>
                {n} minutes
              </option>
            ))}
          </select>
        </label>
        </div>
        <div className="student-account-plan">
          <p>Current plan <strong>{state.subscription === "pro" ? "Pro" : "Free trial"}</strong></p>
          <Link to="/pricing">Review plans</Link>
        </div>
      </section>
    </div>
  );
}
