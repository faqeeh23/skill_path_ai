import { useState } from "react";
import { useSearchParams } from "react-router";
import { loginWithGoogle } from "../../services/googleAuthService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

export default function GoogleLoginButton() {
    const [params] = useSearchParams();
    const [error, setError] =useState("");
    const googleError = params.get("google_error");
    const callbackError = googleError === "account_exists"
        ? "An account already uses this email. Sign in with your password."
        : googleError === "sign_in_failed"
            ? "Google sign-in could not be completed. Please try again."
            : "";

    function handleGoogleLogin() {
        try {
            setError("")
            loginWithGoogle()
        }catch (err) {
            setError(err.message)
        }
    }

    return (
        <div className="google-login-container">
            <button
                type="button"
                className="google-login-btn"
                onClick={handleGoogleLogin}
            >
                <FontAwesomeIcon icon={faGoogle} aria-hidden="true" />
                <span>Continue with Google</span>
            </button>
            {(error || callbackError) && (
                <p className="google-login-notice" role="status">
                    {error || callbackError}
                </p>
            )}
        </div>
    )
} 
