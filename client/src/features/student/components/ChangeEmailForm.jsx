import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "../../../components/ui/SharedUi";
import { useChangeEmailForm } from "../hooks/useChangeEmailForm";

export default function ChangeEmailForm() {
  const {
    step, password, setPassword, email, setEmail, code, setCode,
    currentEmail, loading, error, message, handleConfirmPassword,
    handleRequestEmailChange, handleVerifyEmail, handleResendCode, resetForm,
  } = useChangeEmailForm();

  return (
    <section className="sp-panel student-account-panel" aria-labelledby="change-email-title">
      <h3 id="change-email-title"><Icon icon={faEnvelope} /> Change email address</h3>
      <p className="student-account-current-email">Current email <strong>{currentEmail}</strong></p>
      <ol className="student-account-steps" aria-label="Email change steps">
        {["Confirm password", "New email", "Verify code"].map((label, index) => (
          <li key={label} aria-current={step === index + 1 ? "step" : undefined}>{label}</li>
        ))}
      </ol>

      {step === 1 && (
        <form key={step} className="sp-form" onSubmit={handleConfirmPassword}>
          <label>
            Confirm your current password
            <input type="password" autoComplete="current-password" required
              value={password} onChange={(event) => setPassword(event.target.value)} disabled={loading} />
          </label>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Confirming…" : "Continue"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form key={step} className="sp-form" onSubmit={handleRequestEmailChange}>
          <label>
            New email address
            <input type="email" autoComplete="email" required maxLength={255}
              value={email} onChange={(event) => setEmail(event.target.value)} disabled={loading} />
          </label>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Sending…" : "Send verification code"}
          </button>
        </form>
      )}

      {step === 3 && (
        <form key={step} className="sp-form" onSubmit={handleVerifyEmail}>
          <label>
            Six-digit code sent to {email}
            <input type="text" inputMode="numeric" autoComplete="one-time-code" required pattern="[0-9]{6}"
              value={code} onChange={(event) => setCode(event.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
              disabled={loading} />
          </label>
          <div className="sp-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              Verify and change email
            </button>
            <button type="button" className="btn btn-outline" onClick={handleResendCode} disabled={loading}>
              Send a new code
            </button>
          </div>
        </form>
      )}

      {step !== 1 && (
        <div className="sp-actions">
          <button type="button" className="btn btn-outline" onClick={resetForm} disabled={loading}>
            Start over
          </button>
        </div>
      )}
      {error && <p className="sp-notice error" role="alert">{error}</p>}
      {message && <p className="sp-notice" role="status">{message}</p>}
    </section>
  );
}
