import { useState } from "react";
import { loginWithGoogle } from "../../services/googleAuthService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

export default function GoogleLoginButton() {
    const [error, setError] =useState("");

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
            {error && (
                <p className="google-login-notice" role="status">
                    {error}
                </p>
            )}
        </div>
    )
} 