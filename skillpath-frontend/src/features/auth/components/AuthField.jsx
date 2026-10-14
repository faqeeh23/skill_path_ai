import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEye,
    faEyeSlash,
    faEnvelope,
    faLock,
    faUser,
    faCircleExclamation
} from "@fortawesome/free-solid-svg-icons";

function getFieldIcon(name, type) {
    if (type === "email" || name === "email") return faEnvelope;
    if (type === "password" || name?.toLowerCase().includes("password")) return faLock;
    if (name?.toLowerCase().includes("name") || name?.toLowerCase().includes("user")) return faUser;
    return null;
}

export default function AuthField({
    label, name, type = "text", value, onChange, error, autoComplete, placeholder, icon
}) {
    const [visible, setVisible] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && visible ? "text" : type;
    const errorId = `${name}-error`;
    const fieldIcon = icon || getFieldIcon(name, type);

    return (
        <div className="auth-field">
            <label htmlFor={name}>{label}</label>
            <div className={`auth-input-wrap ${fieldIcon ? "has-leading-icon" : ""}`}>
                {fieldIcon && (
                    <FontAwesomeIcon icon={fieldIcon} className="auth-field-leading-icon" aria-hidden="true" />
                )}
                <input
                    id={name}
                    name={name}
                    type={inputType}
                    value={value}
                    onChange={onChange}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? errorId : undefined}
                />
                {isPassword && (
                    <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setVisible(prev => !prev)}
                        aria-label={visible ? "Hide password" : "Show password"}
                        aria-pressed={visible}
                    >
                        <FontAwesomeIcon icon={visible ? faEyeSlash : faEye} />
                    </button>
                )}
            </div>
            {error && (
                <span id={errorId} className="auth-error">
                    <FontAwesomeIcon icon={faCircleExclamation} className="auth-error-icon" aria-hidden="true" />
                    <span>{error}</span>
                </span>
            )}
        </div>
    );
}