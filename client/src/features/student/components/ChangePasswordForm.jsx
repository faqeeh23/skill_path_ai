import { faKey } from "@fortawesome/free-solid-svg-icons";
import { Icon, Notice } from "../../../components/ui/SharedUi";
import { useChangePasswordForm } from "../hooks/useChangePasswordForm";

export default function ChangePasswordForm() {

    const {
        form,
        loading,
        message,
        error,
        handleChange,
        savePassword,
    } = useChangePasswordForm();

    return (
        <form
            className="sp-panel sp-form student-account-panel"
            onSubmit={savePassword}
        >
            <h3><Icon icon={faKey} /> Change password</h3>

            <label>
                Current password

                <input
                    type="password"
                    name="current_password"
                    value={form.current_password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                    disabled={loading}
                />
            </label>

            <label>
                New password

                <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    minLength={8}
                    required
                    disabled={loading}
                />
            </label>

            <label>
                Confirm new password

                <input
                    type="password"
                    name="password_confirmation"
                    value={form.password_confirmation}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                    disabled={loading}
                />
            </label>

            <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
            >
                {loading ? "Updating..." : "Change password"}
            </button>

            {message && <Notice>{message}</Notice>}

            {error && (
                <p className="recovery-error" role="alert">
                    {error}
                </p>
            )}
        </form>
    );
}
