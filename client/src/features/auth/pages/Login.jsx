import { useState, useEffect } from "react";
import { Link } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faRightToBracket,
    faRoute,
    faChartLine,
    faRobot,
    faArrowRight,
    faCircleInfo
} from "@fortawesome/free-solid-svg-icons";
import AuthField from "../components/AuthField";
import darkLogo from "../../../assets/skillPathAI_logo_dark_mode.png";
import lightLogo from "../../../assets/skillPathAI_logo_light_mode.png";
import "../auth.css";
import GoogleLoginButton from "../components/GoogleLoginButton";
export default function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [rememberMe, setRememberMe] = useState(false);
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
        const nextErrors = {};

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            nextErrors.email = "Enter a valid email address.";
        }

        if (!form.password) {
            nextErrors.password = "Password is required";
        }

        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        setNotice("Form validated. Secure login will be enabled when Laravel authentication is connected.");
    }

    return (
        <section className="auth-page">
            <div className="auth-ambient" aria-hidden="true" />
            <div className="auth-panel">
                <div className="auth-intro">
                    <span className="eyebrow">
                        <FontAwesomeIcon icon={faRightToBracket} className="eyebrow-icon" />
                        WELCOME BACK
                    </span>
                    <h1>Keep moving toward your goals.</h1>
                    <p>
                        Pick up where you left off, track your progress,
                        and continue building the skills that matter.
                    </p>
                    <div className="auth-highlights">
                        <span>
                            <span className="highlight-badge">
                                <FontAwesomeIcon icon={faRoute} />
                            </span>
                            Continue your learning paths
                        </span>
                        <span>
                            <span className="highlight-badge">
                                <FontAwesomeIcon icon={faChartLine} />
                            </span>
                            Track your skill growth
                        </span>
                        <span>
                            <span className="highlight-badge">
                                <FontAwesomeIcon icon={faRobot} />
                            </span>
                            Learn with AI assistance
                        </span>
                    </div>
                </div>

                <div className="auth-form-card">
                    <div className="auth-brand" aria-label="SkillPath AI brand logo">
                        <img
                            src={theme === "dark" ? darkLogo : lightLogo}
                            alt="SkillPath AI Logo"
                            className="auth-brand-logo"
                        />
                    </div>
                    <span className="auth-kicker">
                        <FontAwesomeIcon icon={faRightToBracket} className="eyebrow-icon" />
                        WELCOME BACK
                    </span>
                    <h2>Log in to your account</h2>
                    <p>Enter your credentials to continue.</p>
                    <GoogleLoginButton/>
                    <form onSubmit={handleSubmit} noValidate>
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
                            autoComplete="current-password"
                            placeholder="Enter your password"
                        />

                        <div className="auth-options">
                            <label className="auth-checkbox">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={e => setRememberMe(e.target.checked)}
                                />
                                <span>Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="auth-pending-link">
                                Forgot password?
                            </Link>
                        </div>

                        <button type="submit" className="auth-submit">
                            <span>Log in</span>
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
                        New to SkillPath AI?{" "}
                        <Link to="/register">
                            <span>Start free trial</span>
                            <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    );
}