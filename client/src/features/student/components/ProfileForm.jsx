import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { Icon, Notice } from "../../../components/ui/SharedUi";
import { useProfileForm } from "../hooks/useProfileForm";

export default function ProfileForm() {

    const {
        name,
        setName,
        message,
        error,
        loading,
        saveProfile,
    } = useProfileForm();

    return (
        <form
            className="sp-panel sp-form student-account-panel"
            onSubmit={saveProfile}
        >
            <h2><Icon icon={faPenToSquare} /> Edit your profile</h2>
            <label>
                Display name

                <input
                    value={name}
                    name="name"
                    autoComplete="name"
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={100}
                    disabled={loading}
                />
            </label>

            <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
            >
                {loading ? "Saving..." : "Save profile"}
            </button>

            {message && (
                <Notice>{message}</Notice>
            )}

            {error && (
                <p role="alert" className="recovery-error">
                    {error}
                </p>
            )}
        </form>
    );
}
