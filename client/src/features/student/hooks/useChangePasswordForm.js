import { useState } from "react";
import { updatePassword } from "../../services/authService";

const initialForm = {
    current_password: "",
    password: "",
    password_confirmation: "",
};

export function useChangePasswordForm() {

    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    function handleChange(e) {
        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value,
        }));

        setError("");
        setMessage("");
    }

    async function savePassword(e) {
        e.preventDefault();

        if (loading) return;

        setError("");
        setMessage("");

        if (form.password !== form.password_confirmation) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            const result = await updatePassword(form);

            setMessage(result.message);
            setForm(initialForm);

        } catch (err) {
            setError(
                err.response?.data?.errors?.current_password?.[0] ||
                err.response?.data?.errors?.password?.[0] ||
                err.response?.data?.message ||
                "Unable to update your password."
            );

        } finally {
            setLoading(false);
        }
    }

    return {
        form,
        loading,
        message,
        error,
        handleChange,
        savePassword,
    };
}