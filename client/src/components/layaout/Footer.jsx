import { Link } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import logo from "../../assets/skillPathAI_logo_dark_mode.png";
import "../../styles/Footer.css";

const groups = [
  {
    title: "Explore",
    links: [
      ["Learning paths", "/paths"],
      ["Career goals", "/#goal-input"],
      ["Skill assessments", "/#features"],
      ["Learning tutor", "/#features"],
    ],
  },
  {
    title: "SkillPath AI",
    links: [
      ["How it works", "/#features"],
      ["Pricing", "/pricing"],
      ["Create an account", "/register"],
      ["Sign in", "/login"],
    ],
  },
  {
    title: "Your next step",
    links: [
      ["Your workspace", "/dashboard"],
      ["Find your path", "/paths"],
      ["Account recovery", "/forgot-password"],
    ],
  },
];
export default function Footer() {
  return (
    <footer className="site-footer pf-footer">
      <div className="pf-inner">
        <div className="pf-invitation">
          <div>
            <span>Make your next move count.</span>
            <h2>Your ambition deserves a path.</h2>
          </div>
          <Link className="pf-cta" to="/register">
            Get started{" "}
            <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
          </Link>
        </div>
        <div className="pf-main">
          <div className="pf-brand">
            <Link to="/" aria-label="SkillPath AI home">
              <img src={logo} alt="SkillPath AI" width="190" height="54" />
            </Link>
            <p>
              Learning with direction.
              <br />
              Build the skills for what comes next.
            </p>
            <Link className="pf-path-link" to="/paths">
              Find your learning path{" "}
              <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
            </Link>
          </div>
          {groups.map((group) => (
            <nav key={group.title} aria-label={group.title + " footer links"}>
              <h3>{group.title}</h3>
              <ul>
                {group.links.map(([label, to]) => (
                  <li key={label}>
                    <Link to={to}>{label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="pf-bottom">
          <p>
            © {new Date().getFullYear()} SkillPath AI. All rights reserved.
          </p>
          <span>Your goals. Your pace. Your path.</span>
          <a href="#main-content">Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}
