
import { Link } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGraduationCap,
  faHouse,
  faCompass,
  faTags,
  faRocket,
} from "@fortawesome/free-solid-svg-icons";
import "../../styles/Footer.css";

const footerLinks = [
  { label: "Home", path: "/", icon: faHouse },
  { label: "Learning Paths", path: "/paths", icon: faCompass },
  { label: "Pricing", path: "/pricing", icon: faTags },
  { label: "Get Started", path: "/register", icon: faRocket }
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-content">
        <div className="footer-info">
          <Link to="/" className="footer-brand">
            <FontAwesomeIcon icon={faGraduationCap} className="footer-brand-icon" />
            <span>SkillPath AI</span>
          </Link>
          <p>Personalized learning, powered by intelligence.</p>
        </div>

        <nav className="footer-links" aria-label="Footer navigation">
          {footerLinks.map(link => (
            <Link key={link.path} to={link.path}>
              <FontAwesomeIcon icon={link.icon} className="footer-link-icon" />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="container footer-bottom">
        <div>© {new Date().getFullYear()} SkillPath AI. All rights reserved.</div>
        
      </div>
    </footer>
  );
}
