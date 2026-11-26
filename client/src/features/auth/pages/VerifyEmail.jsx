import { useState } from "react";
import { Link, Navigate } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelopeOpenText, faKey } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../../hooks/useAuth";
import { resendVerificationEmail, verifyEmailCode } from "../../services/authService";
import "../auth-recovery.css";

const roleHome = { student: "/dashboard", instructor: "/instructor", admin: "/admin" };

function getRequestError(error, action) {
  const { status, data } = error.response ?? {};
  if (status === 401 || status === 419) return "Your session expired. Sign in again.";
  if (status === 422) return data?.errors?.code?.[0] ?? "Enter a valid six-digit code.";
  if (status === 429) {
    return data?.message === "Too many attempts. Request a new code."
      ? data.message
      : "Please wait before trying again.";
  }
  return action === "send" ? "Couldn’t send a new code. Try again." : "Couldn’t verify your email. Try again.";
}

export default function VerifyEmail() {
  const { user, loading, error: sessionError, refreshUser } = useAuth();
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [codeError, setCodeError] = useState("");

  async function handleVerify(event) {
    event.preventDefault();
    if (pending) return;
    setError("");
    setNotice("");
    if (!/^[0-9]{6}$/.test(code)) {
      setCodeError("Enter the six-digit code from your email.");
      return;
    }

    setCodeError("");
    setPending("verify");
    try {
      await verifyEmailCode(code);
      await refreshUser();
    } catch (err) {
      const message = getRequestError(err, "verify");
      if (err.response?.status === 422) setCodeError(message);
      else setError(message);
    } finally {
      setPending(null);
    }
  }

  async function handleResend() {
    if (pending) return;
    setPending("send");
    setError("");
    setCodeError("");
    setNotice("");
    try {
      await resendVerificationEmail();
      setCode("");
      setNotice("A new code was sent. Use the most recent email.");
    } catch (err) {
      setError(getRequestError(err, "send"));
    } finally {
      setPending(null);
    }
  }

  if (user?.email_verified_at) return <Navigate to={roleHome[user.role] ?? "/"} replace />;

  return (
    <section className="recovery-page">
      <div className="recovery-ambient" aria-hidden="true" />
      <div className="recovery-card verification-card">
        <div className="recovery-icon">
          <FontAwesomeIcon icon={faEnvelopeOpenText} aria-hidden="true" />
        </div>
        <h1>Verify your email</h1>
        {loading ? (
          <p role="status">Checking your session…</p>
        ) : user ? (
          <>
            <p className="recovery-description">
              Enter the six-digit code sent to <strong>{user.email}</strong>.
            </p>
            <form onSubmit={handleVerify} noValidate>
              <label htmlFor="email-verification-code">Verification code</label>
              <div className="recovery-input">
                <FontAwesomeIcon icon={faKey} aria-hidden="true" />
                <input
                  id="email-verification-code"
                  name="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(event) => {
                    setCode(event.target.value.replace(/[^0-9]/g, "").slice(0, 6));
                    setCodeError("");
                  }}
                  aria-invalid={Boolean(codeError)}
                  aria-describedby={codeError ? "verification-code-error" : undefined}
                  disabled={Boolean(pending)}
                />
              </div>
              {codeError && <p className="recovery-error" id="verification-code-error" role="alert">{codeError}</p>}
              <button className="recovery-submit" type="submit" disabled={Boolean(pending)}>
                {pending === "verify" ? "Verifying…" : "Verify email"}
              </button>
            </form>
            <button className="recovery-submit verification-resend" type="button" onClick={handleResend} disabled={Boolean(pending)}>
              {pending === "send" ? "Sending…" : "Send a new code"}
            </button>
            {notice && <div className="recovery-feedback" role="status">{notice}</div>}
            {error && <p className="recovery-error" role="alert">{error}</p>}
          </>
        ) : (
          <p className="recovery-description" role={sessionError ? "alert" : undefined}>
            {sessionError ? "Couldn’t check your session. Sign in again to continue." : "Sign in to verify your email address."}
          </p>
        )}
        <p className="recovery-footer"><Link to="/login">Back to login</Link></p>
      </div>
    </section>
  );
}
