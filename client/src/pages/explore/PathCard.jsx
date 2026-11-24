import TechnologyMark from "../../features/demo/TechnologyMark";
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
} from "@fortawesome/free-solid-svg-icons";

function getCategoryIcon(cat) {
  const c = cat.toLowerCase();
  if (c.includes("dev") || c.includes("web") || c.includes("code"))
    return faCode;
  if (c.includes("data") || c.includes("analy") || c.includes("sql"))
    return faChartPie;
  if (c.includes("design") || c.includes("ui") || c.includes("ux"))
    return faPalette;
  if (c.includes("cyber") || c.includes("secur")) return faShieldHalved;
  return faFolder;
}

export default function PathCard({ path, basePath = "/paths" }) {
  const extra = path.skills.length - 4;
  return (
    <article className="path-card">
      <div className="path-card-top">
        <div className="path-identity">
          <TechnologyMark technology={path.id} />
          <span className="path-category">
            <FontAwesomeIcon
              icon={getCategoryIcon(path.category)}
              className="category-icon"
            />
            <span>{path.category}</span>
          </span>
        </div>
        <span className="path-level">
          <FontAwesomeIcon icon={faGraduationCap} className="level-icon" />
          <span>{path.level}</span>
        </span>
      </div>
      <h3>{path.title}</h3>
      <p className="path-description">{path.description}</p>
      <ul className="path-skills" aria-label="Skills you will learn">
        {path.skills.slice(0, 4).map((s) => (
          <li key={s}>
            <TechnologyMark technology={s} size="xs" />
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
        <Link
          to={`${basePath}/${path.id}`}
          className="path-link"
          aria-label={`View ${path.title} path`}
        >
          <span>View path</span>
          <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
