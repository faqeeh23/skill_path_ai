import { useState, useEffect } from "react";
import { Link } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faRocket,
    faSliders,
    faRoute,
    faRobot,
    faArrowRight,
    faCircleInfo,
    faCircleExclamation
} from "@fortawesome/free-solid-svg-icons";
import GoogleLoginButton from "../components/GoogleLoginButton";
import AuthField from "../components/AuthField";
import darkLogo from "../../../assets/skillPathAI_logo_dark_mode.png";
import lightLogo from "../../../assets/skillPathAI_logo_light_mode.png";
import "../auth.css";

const initialForm = {
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
};

function validateRegistration(form) {
    const errors = {};

    if (form.name.trim().length < 2) {
        errors.name = "Name must be at least 2 characters.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        errors.email = "Enter a valid email address.";
    }

    if (form.password.length > 0 && form.password.length < 8) {
        errors.password = "Password must be at least 8 characters.";
    }

    if (form.confirmPassword !== form.password) {
        errors.confirmPassword = "Passwords do not match.";
    }

    return errors;
}

export default function Register() {
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [notice, setNotice] = useState("");
    const [theme, setTheme] = useState(() => document.documentElement.getAttribute("data-theme") || "light");

    useEffect(() => {
        const syncTheme = () => setTheme(document.documentElement.getAttribute("data-theme") || "light");
        syncTheme();

        const observer = new MutationObserver(syncTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["data-theme"]
        });

        return () => observer.disconnect();
    }, []);

    function handleChange(event) {
        const { name, value } = event.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: "" }));
        setNotice("");
    }

    function handleSubmit(event) {
        event.preventDefault();

        const nextErrors = validateRegistration(form);
        if (!acceptedTerms) {
            nextErrors.terms = "You must accept the terms.";
        }

        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        setNotice("Your form is valid. Account creation and trial activation will be available when the backend is connected.");
    }

    return (
        <section className="auth-page register-page">
            <div className="auth-ambient" aria-hidden="true" />

            <div className="auth-panel">
                <div className="auth-intro">
                    <div className="auth-brand register-brand" aria-label="SkillPath AI brand logo">
                        <img
                            src={theme === "dark" ? darkLogo : lightLogo}
                            alt="SkillPath AI Logo"
                            className="auth-brand-logo"
                        />
                    </div>
                    <span className="eyebrow">
                        <FontAwesomeIcon icon={faRocket} className="eyebrow-icon" />
                        START YOUR JOURNEY
                    </span>
                    <h1>Build your future with SkillPath AI</h1>
                    <p>
                        Discover your strengths, follow personalized paths,
                        and learn with intelligent guidance.
                    </p>
                    <div className="auth-highlights">
                        <span>
                            <span className="highlight-badge">
                                <FontAwesomeIcon icon={faSliders} />
                            </span>
                            Adaptive skill assessment
                        </span>
                        <span>
                            <span className="highlight-badge">
                                <FontAwesomeIcon icon={faRoute} />
                            </span>
                            Personalized learning journeys
                        </span>
                        <span>
                            <span className="highlight-badge">
                                <FontAwesomeIcon icon={faRobot} />
                            </span>
                            Contextual AI tutor
                        </span>
                    </div>
                </div>
                <div className="auth-form-card">
                    <span className="auth-kicker">
                        <FontAwesomeIcon icon={faRocket} className="eyebrow-icon" />
                        GET STARTED
                    </span>
                    <h2>Create your account</h2>
                    <p>Start with a free trial. No payment required today.</p>
                    <GoogleLoginButton/>
                    <form onSubmit={handleSubmit} noValidate className="register-form">
                        <div className="register-form-grid">
                            <AuthField
                                label="Full name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                error={errors.name}
                                autoComplete="name"
                                placeholder="Your full name"
                            />
                            <AuthField
                                label="Email address"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                error={errors.email}
                                autoComplete="email"
                                placeholder="you@example.com"
                            />
                            <AuthField
                                label="Password"
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                error={errors.password}
                                autoComplete="new-password"
                                placeholder="Minimum 8 characters"
                            />
                            <AuthField
                                label="Confirm password"
                                name="confirmPassword"
                                type="password"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                error={errors.confirmPassword}
                                autoComplete="new-password"
                                placeholder="Repeat your password"
                            />
                        </div>

                        <label className="auth-checkbox register-checkbox">
                            <input
                                type="checkbox"
                                checked={acceptedTerms}
                                onChange={e => setAcceptedTerms(e.target.checked)}
                            />
                            <span>I agree to the Terms of Service and Privacy Policy.</span>
                        </label>
                        {errors.terms && (
                            <p className="auth-error">
                                <FontAwesomeIcon icon={faCircleExclamation} className="auth-error-icon" aria-hidden="true" />
                                <span>{errors.terms}</span>
                            </p>
                        )}

                        <button type="submit" className="auth-submit">
                            <span>Start my free trial</span>
                            <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
                        </button>

                        {notice && (
                            <p className="auth-notice" role="status">
                                <FontAwesomeIcon icon={faCircleInfo} className="notice-icon" aria-hidden="true" />
                                <span>{notice}</span>
                            </p>
                        )}
                    </form>
                    <p className="auth-switch">
                        Already have an account?{" "}
                        <Link to="/login">
                            <span>Log in</span>
                            <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    );
}