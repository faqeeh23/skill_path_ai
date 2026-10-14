
import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faKey, faCircleCheck, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { resetPassword } from "../../services/authService";
import "../auth-recovery.css";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const email = params.get("email");

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle");

  const hasValidParams = Boolean(token && email);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!hasValidParams || status === "loading") return;

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setStatus("loading");
      setError("");
      setMessage("");

      const result = await resetPassword({
        token,
        email,
        password: form.password,
        password_confirmation: form.confirmPassword
      });

      setMessage(result.message);
      setStatus(result.demo ? "demo" : "success");
      setForm({ password: "", confirmPassword: "" });
    } catch (err) {
      setError(err.message);
      setStatus("idle");
    }
  }

  return (
    <section className="recovery-page">
      <div className="recovery-ambient" aria-hidden="true" />
      <div className="recovery-card">
        <Link to="/login" className="recovery-back">
          <FontAwesomeIcon icon={faArrowLeft} /> Back to login
        </Link>

        <div className="recovery-icon">
          <FontAwesomeIcon icon={status === "success" ? faCircleCheck : faKey} />
        </div>

        {status === "success" ? (
          <div className="recovery-completed">
            <h1>Password updated</h1>
            <p>Your password has been changed successfully.</p>
            <Link className="recovery-submit recovery-link-btn" to="/login">
              Continue to login
            </Link>
          </div>
        ) : (
          <>
            <span className="eyebrow">SECURE YOUR ACCOUNT</span>
            <h1>Reset your password</h1>
            <p className="recovery-description">
              Choose a strong password to protect your SkillPath AI account.
            </p>

            {!hasValidParams ? (
              <div className="recovery-feedback">
                This reset link is incomplete. Please request a new link.
                <Link to="/forgot-password"> Request reset</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <label htmlFor="new-password">New password</label>
                <div className="recovery-input">
                  <FontAwesomeIcon icon={faLock} aria-hidden="true" />
                  <input id="new-password" name="password" type="password"
                    autoComplete="new-password" minLength={8} required
                    value={form.password} onChange={handleChange}
                    placeholder="Minimum 8 characters" />
                </div>

                <label htmlFor="confirm-new-password">Confirm password</label>
                <div className="recovery-input">
                  <FontAwesomeIcon icon={faLock} aria-hidden="true" />
                  <input id="confirm-new-password" name="confirmPassword"
                    type="password" autoComplete="new-password" required
                    value={form.confirmPassword} onChange={handleChange}
                    placeholder="Repeat your new password" />
                </div>

                {error && <p className="recovery-error" role="alert">{error}</p>}

                <button className="recovery-submit" disabled={status === "loading"}>
                  {status === "loading" ? "Updating..." : "Reset password"}
                </button>
              </form>
            )}

            {message && <div className="recovery-feedback" role="status">{message}</div>}
          </>
        )}
      </div>
    </section>
  );
}
