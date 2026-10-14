import { useState } from "react";
import {Link} from "react-router"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faEnvelope, faPaperPlane, faCircleCheck, faLock } from "@fortawesome/free-solid-svg-icons";
import { requestPasswordReset } from "../../services/authService";
import "../auth-recovery.css";

export default function ForgotPassword() {
    const [email, setEmail] = useState("")
    const [error, setError] = useState("")
    const [status, setStatus] = useState("idle")
    const [message, setMessage] = useState("")


    async function handleSubmit(e) {
        e.preventDefault();
        if (status === "loading") return;

        setError("")
        setMessage("")

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
          setError("Please enter a valid email address.");
          return;
        }

        try {
            setStatus("loading");
            const result = await requestPasswordReset(email.trim())
            setMessage(result.message)
            setStatus(result.demo ? "demo" : "success")
        } catch (err) {
            setError(err.message)
            setStatus("idle")
        }
    }

    return (
    <section className="recovery-page">
      <div className="recovery-ambient" aria-hidden="true" />

      <div className="recovery-card">
        <Link to="/login" className="recovery-back">
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to login
        </Link>

        <div className="recovery-icon">
          <FontAwesomeIcon icon={status === "success" ? faCircleCheck : faLock} />
        </div>

        <span className="eyebrow">ACCOUNT RECOVERY</span>
        <h1>Forgot your password?</h1>
        <p className="recovery-description">
          Enter your email address and we'll help you reset your password.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="recovery-email">Email address</label>
          <div className="recovery-input">
            <FontAwesomeIcon icon={faEnvelope} aria-hidden="true" />
            <input
              id="recovery-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                setError("");
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "recovery-email-error" : undefined}
            />
          </div>

          {error && (
            <p className="recovery-error" id="recovery-email-error" role="alert">
              {error}
            </p>
          )}

          <button className="recovery-submit" disabled={status === "loading"}>
            <FontAwesomeIcon icon={faPaperPlane} />
            {status === "loading" ? "Processing..." : "Send reset link"}
          </button>
        </form>

        {message && (
          <div className="recovery-feedback" role="status">{message}</div>
        )}

        <p className="recovery-footer">
          Remember your password? <Link to="/login">Log in</Link>
        </p>
      </div>
    </section>
  );
}



