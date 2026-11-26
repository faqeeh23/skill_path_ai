import { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { updateProfile } from "../../services/authService";

export function useProfileForm() {
    const { user, refreshUser } = useAuth();

    const [editedName, setEditedName] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const name = editedName ?? user?.name ?? "";

    function setName(value) {
        setEditedName(value);
        setMessage("");
        setError("");
    }

    async function saveProfile(e) {
        e.preventDefault();

        if (loading) return;

        setMessage("");
        setError("");
        const trimmedName = name.trim();

        if (!trimmedName) {
            setError("Enter your display name.");
            return;
        }

        try {
            setLoading(true);

            const result = await updateProfile({
                name: trimmedName,
            });

            await refreshUser();

            setEditedName(null);
            setMessage(result.message);

        } catch (err) {
            setError(
                err.response?.data?.errors?.name?.[0] ||
                err.response?.data?.message ||
                "Unable to update your profile."
            );

        } finally {
            setLoading(false);
        }
    }

    return {
        name,
        setName,
        message,
        error,
        loading,
        saveProfile,
    };
}
