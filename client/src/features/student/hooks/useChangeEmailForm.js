import { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import {
    confirmPassword,
    requestEmailChange,
    verifyEmailChange,
} from "../../services/authService";

export function useChangeEmailForm() {
    const { user, refreshUser } = useAuth();
    const [step, setStep] = useState(1);
    const [resumeStep, setResumeStep] = useState(2);
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    async function handleRequest(action) {
        if (loading) return;

        setLoading(true);
        setError("");
        setMessage("");

        try {
            await action();
        } catch (err) {
            const { status, data } = err.response ?? {};

            if (status === 423 && step !== 1) {
                setResumeStep(step);
                setStep(1);
                setPassword("");
                setError("Please confirm your password again.");
                return;
            }

            setError(
                data?.errors?.password?.[0] ||
                data?.errors?.email?.[0] ||
                data?.errors?.code?.[0] ||
                data?.message ||
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleConfirmPassword(event) {
        event.preventDefault();

        await handleRequest(async () => {
            await confirmPassword(password);
            setPassword("");
            setStep(resumeStep);
        });
    }

    async function sendCode() {
        await handleRequest(async () => {
            const newEmail = email.trim();
            const result = await requestEmailChange(newEmail);
            setEmail(newEmail);
            setCode("");
            setStep(3);
            setMessage(result.message);
        });
    }

    async function handleRequestEmailChange(event) {
        event.preventDefault();
        await sendCode();
    }

    async function handleVerifyEmail(event) {
        event.preventDefault();

        await handleRequest(async () => {
            const result = await verifyEmailChange(code.trim());

            setEmail("");
            setCode("");
            setPassword("");
            setResumeStep(2);
            setStep(1);

            const refreshedUser = await refreshUser().catch(() => null);
            setMessage(
                refreshedUser
                    ? result.message
                    : "Email updated. Refresh the page to see your new email."
            );
        });
    }

    function resetForm() {
        if (loading) return;

        setStep(1);
        setResumeStep(2);
        setPassword("");
        setEmail("");
        setCode("");
        setError("");
        setMessage("");
    }

    return {
        step,
        password,
        setPassword,
        email,
        setEmail,
        code,
        setCode,
        currentEmail: user?.email ?? "",
        loading,
        error,
        message,
        handleConfirmPassword,
        handleRequestEmailChange,
        handleVerifyEmail,
        handleResendCode: sendCode,
        resetForm,
    };
}
