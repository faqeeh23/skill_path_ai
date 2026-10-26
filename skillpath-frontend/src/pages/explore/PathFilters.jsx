import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faLayerGroup,
  faArrowDownWideShort,
  faCode,
  faChartPie,
  faPalette,
  faShieldHalved,
  faFolder,
} from "@fortawesome/free-solid-svg-icons";

function getCategoryIcon(cat) {
  const c = cat.toLowerCase();
  if (c === "all") return faLayerGroup;
  if (c.includes("dev") || c.includes("web") || c.includes("code"))
    return faCode;
  if (c.includes("data") || c.includes("analy") || c.includes("sql"))
    return faChartPie;
  if (c.includes("design") || c.includes("ui") || c.includes("ux"))
    return faPalette;
  if (c.includes("cyber") || c.includes("secur")) return faShieldHalved;
  return faFolder;
}

export default function PathFilters({
  search,
  onSearchChange,
  category,
  categories,
  onCategoryChange,
  level,
  levels,
  onLevelChange,
  sort,
  onSortChange,
  children,
}) {
  return (
    <>
      <div className="filters-bar" role="search">
        <div className="filter-search">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="filter-search-icon"
            aria-hidden="true"
          />
          <label className="filter-search-label" htmlFor="path-search">
            Search learning paths
          </label>
          <input
            id="path-search"
            type="search"
            name="q"
            value={search}
            autoComplete="off"
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="e.g. React, SQL, or design…"
          />
        </div>

        <div className="filter-selects">
          <label className="filter-select">
            <span>
              <FontAwesomeIcon icon={faLayerGroup} className="select-icon" />{" "}
              Level
            </span>
            <select
              name="level"
              value={level}
              onChange={(e) => onLevelChange(e.target.value)}
            >
              {levels.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="filter-select">
            <span>
              <FontAwesomeIcon
                icon={faArrowDownWideShort}
                className="select-icon"
              />{" "}
              Sort by
            </span>
            <select
              name="sort"
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
            >
              <option value="default">Recommended</option>
              <option value="name">Name</option>
              <option value="shortest">Shortest first</option>
              <option value="longest">Longest first</option>
            </select>
          </label>
        </div>

        <div className="filter-chips" role="group" aria-label="Career goal">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              className={`filter-chip ${category === c ? "is-active" : ""}`}
              onClick={() => onCategoryChange(c)}
            >
              <FontAwesomeIcon
                icon={getCategoryIcon(c)}
                className="chip-icon"
              />
              <span>{c}</span>
            </button>
          ))}
        </div>
      </div>
      {children}
    </>
  );
}
