
import { useState } from "react";
import { Link } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelopeOpenText,
  faRotate,
  faShieldHalved,
  faArrowLeft
} from "@fortawesome/free-solid-svg-icons";
import { resendVerificationEmail } from "../../services/authService";
import "../auth-recovery.css";

export default function VerifyEmail() {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleResend() {
    if (status === "loading") return;

    setError("");
    setMessage("");
    setStatus("loading");

    try {
      const result = await resendVerificationEmail();
      setMessage(result.message);
      setStatus(result.demo ? "demo" : "success");
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setStatus("error");
    }
  }

  return (
    <section className="recovery-page">
      <div className="recovery-ambient" aria-hidden="true" />

      <div className="recovery-card verification-card">
        <div className="recovery-icon">
          <FontAwesomeIcon icon={faEnvelopeOpenText} />
        </div>

        <span className="eyebrow">VERIFY YOUR ACCOUNT</span>
        <h1>Check your inbox</h1>

        <p className="recovery-description">
          Verify your email address to continue your learning
          journey with SkillPath AI.
        </p>

        <div className="verification-info">
          <FontAwesomeIcon icon={faShieldHalved} />
          <div>
            <strong>Secure your account</strong>
            <p>
              Email verification helps protect your account
              and confirms ownership of your email address.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="recovery-submit"
          onClick={handleResend}
          disabled={status === "loading"}
        >
          <FontAwesomeIcon icon={faRotate} spin={status === "loading"} />
          {status === "loading"
            ? "Sending..."
            : "Resend verification email"}
        </button>

        {message && (
          <div className="recovery-feedback" role="status">
            {message}
          </div>
        )}

        {error && (
          <p className="recovery-error" role="alert">{error}</p>
        )}

        <p className="recovery-footer">
          <Link to="/login">
            <FontAwesomeIcon icon={faArrowLeft} /> Back to login
          </Link>
        </p>
      </div>
    </section>
  );
}
