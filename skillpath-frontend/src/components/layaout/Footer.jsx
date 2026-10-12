
import { Link } from "react-router";
import "../../styles/Footer.css";

const footerLinks = [
  { label: "Home", path: "/" },
  { label: "Learning Paths", path: "/paths" },
  { label: "Get Started", path: "/register" }
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-content">
        <div className="footer-info">
          <Link to="/" className="footer-brand">
            SkillPath AI
          </Link>
          <p>Personalized learning, powered by intelligence.</p>
        </div>

        <nav className="footer-links" aria-label="Footer navigation">
          {footerLinks.map(link => (
            <Link key={link.path} to={link.path}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="container footer-bottom">
        © {new Date().getFullYear()} SkillPath AI. All rights reserved.
      </div>
    </footer>
  );
}
