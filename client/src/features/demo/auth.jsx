import { TechnologyStrip } from "./TechnologyMark";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faCheck,
  faEye,
  faEyeSlash,
  faRoute,
  faChartLine,
  faLaptopCode,
} from "@fortawesome/free-solid-svg-icons";
import darkLogo from "../../assets/skillPathAI_logo_dark_mode.png";
import "../../styles/PublicPages.css";
import { useDelay } from "./hooks";
import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { demoUsers, plans } from "./catalog";
import { useDemo } from "./store";
import { Header, Notice, Confirm, ThemeToggle } from "./ui";
import { subscriptionConfig } from "../subscription/plans";

export function Auth({ mode = "login" }) {
  const { state, dispatch } = useDemo();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const delay = useDelay();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const title = {
    login: "Welcome back.",
    register: "Make room for your next skill.",
    forgot: "Recover your account.",
    reset: "Choose a new password.",
    verify: "Verify your email.",
  }[mode];
  function enter(user) {
    const record = state.users.find((row) => row.id === user.id);
    if (record?.status === "archived") {
      setMessage("This user is archived. Restore it from the admin workspace.");
      return;
    }
    user = { ...user, ...record };
    dispatch({ type: "LOGIN", user });
    const requested = location.state?.from;
    const destination =
      user.role === "student"
        ? requested?.startsWith("/dashboard")
          ? requested
          : "/dashboard"
        : `/${user.role}`;
    navigate(destination);
  }
  function submit(event) {
    event.preventDefault();
    const e = {};
    if (mode !== "reset" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email address.";
    if (
      ["register", "login", "reset"].includes(mode) &&
      form.password.length < 8
    )
      e.password = "Use at least eight characters.";
    if (["register", "reset"].includes(mode) && form.confirm !== form.password)
      e.confirm = "The passwords must match.";
    if (mode === "register" && form.name.trim().length < 2)
      e.name = "Enter at least two characters.";

    setErrors(e);
    if (Object.keys(e).length) {
      setMessage("Correct the highlighted fields.");
      event.currentTarget.elements.namedItem(Object.keys(e)[0])?.focus();
      return;
    }
    setBusy(true);
    setMessage("");
    delay(() => {
      setBusy(false);

      if (mode === "login") enter({ ...demoUsers[0], email: form.email });
      else if (mode === "register") {
        const user = {
          ...demoUsers[0],
          name: form.name.trim(),
          email: form.email,
        };
        dispatch({
          type: "PATCH",
          value: {
            user,
            users: state.users.map((row) => (row.id === user.id ? user : row)),
          },
        });
        navigate(
          params.get("path")
            ? `/onboarding?path=${encodeURIComponent(params.get("path"))}`
            : "/onboarding",
        );
      } else
        setMessage(
          mode === "forgot"
            ? "Recovery options are ready below."
            : mode === "reset"
              ? "Password recovery steps completed."
              : "Email verification steps completed.",
        );
    });
  }
  function field(name, label, type = "text") {
    const password = type === "password";
    const id = "account-" + name;
    return (
      <div className="pa-field">
        <label htmlFor={id}>{label}</label>
        <div className="pa-input-wrap">
          <input
            id={id}
            name={name}
            type={password && show ? "text" : type}
            autoComplete={
              name === "email"
                ? "email"
                : name === "name"
                  ? "name"
                  : mode === "login"
                    ? "current-password"
                    : "new-password"
            }
            placeholder={
              name === "email"
                ? "you@example.com"
                : name === "name"
                  ? "Your full name"
                  : name === "confirm"
                    ? "Re-enter your password"
                    : "At least 8 characters"
            }
            value={form[name]}
            required
            minLength={password ? 8 : name === "name" ? 2 : undefined}
            spellCheck={name === "email" ? false : undefined}
            aria-invalid={Boolean(errors[name])}
            aria-describedby={
              errors[name]
                ? "error-" + name
                : name === "password" && mode === "register"
                  ? "password-hint"
                  : undefined
            }
            onChange={(event) => {
              setForm({ ...form, [name]: event.target.value });
              setErrors({ ...errors, [name]: "" });
            }}
          />
          {password && (
            <button
              type="button"
              className="pa-password-toggle"
              aria-label={show ? "Hide passwords" : "Show passwords"}
              aria-pressed={show}
              onClick={() => setShow(!show)}
            >
              <FontAwesomeIcon
                icon={show ? faEyeSlash : faEye}
                aria-hidden="true"
              />
            </button>
          )}
        </div>
        {name === "password" && mode === "register" && (
          <small id="password-hint">Use at least 8 characters.</small>
        )}
        {errors[name] && (
          <span id={"error-" + name} className="sp-error">
            {errors[name]}
          </span>
        )}
      </div>
    );
  }
  const heading =
    mode === "register"
      ? "Create your account"
      : mode === "login"
        ? "Sign in to SkillPath AI"
        : mode === "forgot"
          ? "Reset your password"
          : mode === "reset"
            ? "Choose a new password"
            : "Verify your email";
  return (
    <div className={"pa-auth pa-mode-" + mode}>
      <aside className="pa-story" aria-label="Your learning journey">
        <Link className="pa-logo" to="/" aria-label="SkillPath AI home">
          <img src={darkLogo} alt="SkillPath AI" width="190" height="54" />
        </Link>
        <div className="pa-story-copy">
          <span className="pa-story-label">A clear path forward</span>
          <h1>{title}</h1>
          <p>
            {mode === "login"
              ? "Pick up where you left off. Your next lesson, skill and milestone are waiting."
              : "Turn your ambition into a learning journey. Find your path, build your skills and see your progress."}
          </p>
        </div>
        <ol className="pa-journey">
          {[
            [
              faRoute,
              "Find your direction",
              "Choose a path shaped around your goals.",
            ],
            [
              faChartLine,
              "Know your next step",
              "Use skill evidence to guide your learning.",
            ],
            [
              faLaptopCode,
              "Put skills into practice",
              "Bring your learning together in a project.",
            ],
          ].map(([icon, title, text]) => (
            <li key={title}>
              <FontAwesomeIcon icon={icon} aria-hidden="true" />
              <div>
                <strong>{title}</strong>
                <span>{text}</span>
              </div>
            </li>
          ))}
        </ol>
        <div className="pa-story-bottom">
          <span>Built for your next chapter.</span>
          <TechnologyStrip
            technologies={["react", "laravel", "python", "figma"]}
          />
        </div>
      </aside>
      <section className="pa-form-area" aria-labelledby="account-heading">
        <div className="pa-form-top">
          <Link to="/paths">
            Explore learning paths{" "}
            <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
          </Link>
        </div>
        <div className="pa-form-content">
          <h2 id="account-heading">{heading}</h2>
          <p className="pa-form-description">
            {mode === "register"
              ? "Start with your account. Make the journey your own."
              : mode === "login"
                ? "Welcome back. Let’s keep your learning moving."
                : "Follow the steps below to continue to your account."}
          </p>
          <form className="pa-form" onSubmit={submit} aria-busy={busy}>
            {mode === "register" && field("name", "Full name")}
            {mode !== "reset" && field("email", "Email address", "email")}
            {["register", "login", "reset"].includes(mode) &&
              field("password", "Password", "password")}
            {["register", "reset"].includes(mode) &&
              field("confirm", "Confirm password", "password")}
            {mode === "login" && (
              <div className="pa-form-options">
                <span>Continue your learning journey</span>
                <Link to="/forgot-password">Forgot password?</Link>
              </div>
            )}
            <button className="pa-submit" disabled={busy}>
              {busy
                ? "Please wait…"
                : mode === "login"
                  ? "Sign in"
                  : mode === "register"
                    ? "Create account"
                    : mode === "forgot"
                      ? "Continue recovery"
                      : mode === "reset"
                        ? "Reset password"
                        : "Verify email"}
              <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
            </button>
            <Notice
              error={
                message.includes("failure") || message.startsWith("Correct")
              }
            >
              {message}
            </Notice>
            {mode === "forgot" && message.startsWith("Recovery") && (
              <Link to="/reset-password?token=demo">
                Continue to password reset
              </Link>
            )}
            {mode === "reset" && message.startsWith("Password recovery") && (
              <Link to="/login">Return to sign in</Link>
            )}
          </form>
          <p className="pa-account-switch">
            {mode === "login" ? (
              <>
                New to SkillPath AI?{" "}
                <Link to="/register">Create an account</Link>
              </>
            ) : mode === "register" ? (
              <>
                Already have an account? <Link to="/login">Sign in</Link>
              </>
            ) : (
              <Link to="/login">Back to sign in</Link>
            )}
          </p>
          <div className="pa-form-note">
            <FontAwesomeIcon icon={faRoute} aria-hidden="true" />
            <span>Your goals. Your pace. Your path.</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export function Pricing() {
  const [billing, setBilling] = useState("monthly");
  const prices = subscriptionConfig.prices;
  const saving = Math.round((1 - prices.yearly / (prices.monthly * 12)) * 100);
  const money = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: subscriptionConfig.currency,
    }).format(value);
  const features = [
    "Personalized learning paths",
    "Skill assessments and checkpoints",
    "Lesson-aware learning tutor",
    "Progress and skill tracking",
    "Lessons, practice and projects",
  ];
  return (
    <div className="pp-pricing">
      <header className="pp-heading">
        <span>Invest in your next chapter</span>
        <h1>
          A clear path.
          <br />A plan that fits.
        </h1>
        <p>
          Start with time to explore. Continue with a plan that keeps your
          learning moving forward.
        </p>
      </header>
      <div className="pp-billing" role="group" aria-label="Billing period">
        {["monthly", "yearly"].map((value) => (
          <button
            key={value}
            aria-pressed={billing === value}
            onClick={() => setBilling(value)}
          >
            {value === "monthly" ? "Monthly" : "Yearly"}
            {value === "yearly" && <span>Save {saving}%</span>}
          </button>
        ))}
      </div>
      <div className="pp-plans">
        {plans.map((plan) => {
          const trial = plan.id === "trial";
          return (
            <section
              key={plan.id}
              className={"pp-plan " + (!trial ? "pp-pro" : "")}
              aria-labelledby={"plan-" + plan.id}
            >
              <div className="pp-plan-top">
                <span>
                  {trial ? "Find your starting point" : "Keep your momentum"}
                </span>
                {!trial && (
                  <span className="pp-plan-badge">For your next step</span>
                )}
              </div>
              <h2 id={"plan-" + plan.id}>{plan.name}</h2>
              <p className="pp-plan-intro">
                {trial
                  ? "Take your first step and find the learning path that fits you."
                  : "Continue building skills with a plan for consistent progress."}
              </p>
              <div
                className="pp-plan-price"
                aria-live="polite"
                aria-atomic="true"
              >
                <strong>{trial ? "$0" : money(prices[billing])}</strong>
                <span>
                  {trial
                    ? "for " + subscriptionConfig.trialDays + " days"
                    : "/ " + (billing === "monthly" ? "month" : "year")}
                </span>
              </div>
              <p className="pp-billing-note">
                {trial
                  ? "Explore the core learning experience."
                  : billing === "yearly"
                    ? money(prices.yearly) +
                      " billed yearly · equivalent to " +
                      money(prices.yearly / 12) +
                      "/month"
                    : money(prices.monthly) + " billed monthly"}
              </p>
              <Link
                className={trial ? "pp-plan-link" : "pp-plan-link pp-primary"}
                to={
                  trial ? "/register" : "/checkout?plan=pro&billing=" + billing
                }
              >
                {trial ? "Start your free trial" : "Choose Pro"}
                <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
              </Link>
              <h3>
                {trial
                  ? "Your trial includes"
                  : "Everything you need to keep learning"}
              </h3>
              <ul>
                {features.map((feature) => (
                  <li key={feature}>
                    <FontAwesomeIcon icon={faCheck} aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <p className="pp-plan-footnote">
                {trial
                  ? "A focused introduction to your learning journey."
                  : "Choose monthly or yearly billing to suit your goals."}
              </p>
            </section>
          );
        })}
      </div>
      <section className="pp-explainer">
        <div>
          <FontAwesomeIcon icon={faRoute} aria-hidden="true" />
          <h2>One journey, from goal to project.</h2>
          <p>
            Choose a direction, understand your starting point, and build
            practical evidence of your skills.
          </p>
        </div>
        <Link to="/paths">
          Explore the learning paths{" "}
          <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
        </Link>
      </section>
      <section className="pp-faq" aria-labelledby="pricing-questions">
        <div>
          <span>Before you get started</span>
          <h2 id="pricing-questions">A few things to know.</h2>
          <p>Keep your focus on the learning ahead.</p>
        </div>
        <div>
          <details>
            <summary>What’s included in the free trial?</summary>
            <p>
              The {subscriptionConfig.trialDays}-day trial introduces the same
              core learning workflow: paths, lessons, assessments, skill
              tracking and projects.
            </p>
          </details>
          <details>
            <summary>How does yearly pricing compare?</summary>
            <p>
              Yearly Pro is {money(prices.yearly)} per year, compared with{" "}
              {money(prices.monthly * 12)} for twelve monthly periods. That is
              approximately {saving}% less.
            </p>
          </details>
          <details>
            <summary>Where should I start?</summary>
            <p>
              Browse <Link to="/paths">learning paths</Link> to find a
              curriculum, or <Link to="/register">create an account</Link> and
              choose a career goal.
            </p>
          </details>
        </div>
      </section>
    </div>
  );
}
export function Checkout() {
  const { state, dispatch } = useDemo();
  const [params] = useSearchParams();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const delay = useDelay();
  const billing = params.get("billing");
  const valid =
    params.get("plan") === "pro" && ["monthly", "yearly"].includes(billing);
  return (
    <div className="sp-public sp-narrow">
      <Header title={valid ? "Review your access" : "Choose a valid plan"}>
        {" "}
        Review your plan and access preferences.{" "}
      </Header>
      {valid ? (
        <section className="sp-panel">
          <h2>Pro · {billing}</h2>
          <p className="sp-price">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(subscriptionConfig.prices[billing])}
          </p>
          <p> Profile: {state.user?.name ?? "Guest"}</p>
          <button
            className="btn btn-primary"
            disabled={busy}
            onClick={() => setConfirm(true)}
          >
            {busy ? "Activating …" : "Activate Pro access"}
          </button>
          <Notice>{message}</Notice>
          {message && (
            <Link to={state.user ? "/dashboard" : "/login"}>
              {" "}
              Open your workspace{" "}
            </Link>
          )}
        </section>
      ) : (
        <Link className="btn btn-primary" to="/pricing">
          View plans
        </Link>
      )}
      {confirm && (
        <Confirm
          title="Activate Pro in this?"
          label="Activate"
          onCancel={() => setConfirm(false)}
          onConfirm={() => {
            setConfirm(false);
            setBusy(true);
            delay(() => {
              dispatch({ type: "PATCH", value: { subscription: "pro" } });
              setBusy(false);
              setMessage("Pro access is selected. No payment was processed.");
            });
          }}
        >
          <p> Confirm your selected plan. No payment will be processed. </p>
        </Confirm>
      )}
    </div>
  );
}
export function NotFound() {
  return (
    <div className="sp-public sp-narrow">
      <Header title="We couldn’t find that page.">
        The address may have changed. Choose a working destination to continue.
      </Header>
      <div className="sp-actions">
        <Link className="btn btn-primary" to="/">
          Go home
        </Link>
        <Link className="btn btn-outline" to="/paths">
          Explore learning paths
        </Link>
        <ThemeToggle />
      </div>
    </div>
  );
}
