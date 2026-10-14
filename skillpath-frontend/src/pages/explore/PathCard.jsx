import { Link } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faArrowRight,
  faGraduationCap,
  faCode,
  faChartPie,
  faPalette,
  faShieldHalved,
  faFolder,
  faTag
} from "@fortawesome/free-solid-svg-icons";

function getCategoryIcon(cat) {
  const c = cat.toLowerCase();
  if (c.includes("dev") || c.includes("web") || c.includes("code")) return faCode;
  if (c.includes("data") || c.includes("analy") || c.includes("sql")) return faChartPie;
  if (c.includes("design") || c.includes("ui") || c.includes("ux")) return faPalette;
  if (c.includes("cyber") || c.includes("secur")) return faShieldHalved;
  return faFolder;
}

export default function PathCard({ path, index = 0 }) {
  const extra = path.skills.length - 4;
  return (
    <article className="path-card glass-card" data-glow style={{ "--i": index }}>
      <div className="path-card-top">
        <span className="path-category">
          <FontAwesomeIcon icon={getCategoryIcon(path.category)} className="category-icon" />
          <span>{path.category}</span>
        </span>
        <span className="path-level">
          <FontAwesomeIcon icon={faGraduationCap} className="level-icon" />
          <span>{path.level}</span>
        </span>
      </div>
      <h3>{path.title}</h3>
      <p className="path-description">{path.description}</p>
      <ul className="path-skills" aria-label="Skills you will learn">
        {path.skills.slice(0, 4).map(s => (
          <li key={s}>
            <FontAwesomeIcon icon={faTag} className="skill-icon" />
            <span>{s}</span>
          </li>
        ))}
        {extra > 0 && <li className="more">+{extra}</li>}
      </ul>
      <div className="path-card-footer">
        <span className="path-duration">
          <FontAwesomeIcon icon={faClock} aria-hidden="true" />
          <span>{path.durationWeeks} weeks</span>
        </span>
        <Link to={`/paths/${path.id}`} className="path-link">
          <span>View path</span>
          <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}