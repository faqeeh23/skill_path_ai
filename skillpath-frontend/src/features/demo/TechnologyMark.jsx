import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faReact,
  faLaravel,
  faAngular,
  faNodeJs,
  faPython,
  faJs,
  faHtml5,
  faCss3Alt,
  faPhp,
  faFigma,
  faLinux,
} from "@fortawesome/free-brands-svg-icons";
import { faDatabase, faCode } from "@fortawesome/free-solid-svg-icons";

const technologies = {
  react: { name: "React", icon: faReact },
  laravel: { name: "Laravel", icon: faLaravel },
  angular: { name: "Angular", icon: faAngular },
  node: { name: "Node.js", icon: faNodeJs },
  python: { name: "Python", icon: faPython },
  javascript: { name: "JavaScript", icon: faJs },
  html: { name: "HTML5", icon: faHtml5 },
  css: { name: "CSS3", icon: faCss3Alt },
  php: { name: "PHP", icon: faPhp },
  figma: { name: "Figma", icon: faFigma },
  linux: { name: "Linux", icon: faLinux },
  sql: { name: "SQL", icon: faDatabase },
  code: { name: "Development", icon: faCode },
};
function resolveTechnology(value = "") {
  const text = value.toLowerCase();
  if (/react|hooks|use-state|use-effect|use-context|components/.test(text))
    return "react";
  if (/laravel/.test(text)) return "laravel";
  if (/angular/.test(text)) return "angular";
  if (/node/.test(text)) return "node";
  if (/python|machine|\bml\b/.test(text)) return "python";
  if (/javascript|\bjs\b|functions|arrays/.test(text)) return "javascript";
  if (/html|semantic|forms/.test(text)) return "html";
  if (/css|layout|contrast/.test(text)) return "css";
  if (/php/.test(text)) return "php";
  if (/figma|design|\bux\b|wireframe|prototyp/.test(text)) return "figma";
  if (/linux|security|networks|defense/.test(text)) return "linux";
  if (/sql|data|visualization/.test(text)) return "sql";
  return "code";
}
export default function TechnologyMark({ technology, size = "md" }) {
  const key = resolveTechnology(technology);
  const brand = technologies[key];
  return (
    <span
      className={`sp-tech-mark tech-${key} size-${size}`}
      title={brand.name}
      aria-hidden="true"
    >
      <FontAwesomeIcon icon={brand.icon} />
    </span>
  );
}
export function TechnologyStrip({ technologies: values }) {
  const unique = [...new Set(values.map(resolveTechnology))];
  return (
    <div
      className="sp-technology-strip"
      aria-label="Technologies in this curriculum"
    >
      {unique.map((key) => (
        <span className="sp-technology-item" key={key}>
          <TechnologyMark technology={key} size="sm" />
          <span>{technologies[key].name}</span>
        </span>
      ))}
    </div>
  );
}
