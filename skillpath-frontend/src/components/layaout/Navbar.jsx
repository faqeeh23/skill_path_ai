
import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark, faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import "../../styles/Navbar.css";
import darkLogo from "../../assets/skillPathAI_logo_dark_mode.png"
import lightLogo from "../../assets/skillPathAI_logo_light_mode.png"
const navItems = [
  { label: "Home", path: "/" },
  { label: "Explore Paths", path: "/paths" }
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "light" || savedTheme === "dark") return savedTheme;

      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    });

  const closeMenu = () => setMenuOpen(false);
  const toggleMenu = () => setMenuOpen(prev => !prev);
  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <header className="site-header">
      <nav className="navbar container" aria-label="Main navigation">
        <Link className="brand" to="/" onClick={closeMenu}>
          <img
              src={
                theme === "dark"
                  ? darkLogo
                  : lightLogo
              }
              alt="SkillPath AI Logo"
              className="brand-logo"
            />
        </Link>

        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="nav-content"
          onClick={toggleMenu}
        >
          <FontAwesomeIcon icon={menuOpen ? faXmark : faBars} />
        </button>

        <div id="nav-content" className={`nav-content ${menuOpen ? "open" : ""}`}>
          <div className="nav-links">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={closeMenu}
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="nav-actions">
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              <FontAwesomeIcon icon={theme === "light" ? faMoon : faSun} />
            </button>

            <Link className="btn btn-outline" to="/login" onClick={closeMenu}>
              Log in
            </Link>
            <Link className="btn btn-primary" to="/register" onClick={closeMenu}>
              Get Started
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
