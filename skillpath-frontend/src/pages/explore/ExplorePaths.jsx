import { useSearchParams } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCompass,
  faRoute,
  faBoxOpen,
  faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import { useDemo } from "../../features/demo/store";
import { skillById } from "../../features/demo/catalog";
import PathCard from "../../pages/explore/PathCard";
import PathFilters from "../../pages/explore/PathFilters";
import "../../styles/explorePaths.css";

export default function ExplorePaths({ basePath = "/paths" }) {
  const { state } = useDemo();
  const learningPaths = state.catalog
    .filter(
      (path) =>
        path.status !== "archived" &&
        state.goals.some(
          (goal) => goal.id === path.goalId && goal.status !== "archived",
        ),
    )
    .map((path) => ({
      ...path,
      category:
        state.goals.find((goal) => goal.id === path.goalId)?.title ??
        "Learning path",
      durationWeeks: path.weeks,
      skills: path.roots.map((id) => skillById[id].title),
    }));
  const categories = ["All", ...new Set(learningPaths.map((p) => p.category))];
  const levels = ["All", ...new Set(learningPaths.map((p) => p.level))];
  const [params, setParams] = useSearchParams();
  const search = params.get("q") ?? "";
  const category = categories.includes(params.get("category"))
    ? params.get("category")
    : "All";
  const level = levels.includes(params.get("level"))
    ? params.get("level")
    : "All";
  const sort = params.get("sort") ?? "default";
  function updateFilter(name, value, fallback) {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value === fallback) next.delete(name);
        else next.set(name, value);
        return next;
      },
      { replace: true },
    );
  }

  const query = search.trim().toLowerCase();
  const filteredPaths = learningPaths
    .filter((path) => {
      const matchesSearch =
        path.title.toLowerCase().includes(query) ||
        path.description.toLowerCase().includes(query) ||
        path.skills.some((skill) => skill.toLowerCase().includes(query));
      return (
        matchesSearch &&
        (category === "All" || path.category === category) &&
        (level === "All" || path.level === level)
      );
    })
    .sort((a, b) => {
      if (sort === "name") return a.title.localeCompare(b.title);
      if (sort === "shortest") return a.durationWeeks - b.durationWeeks;
      if (sort === "longest") return b.durationWeeks - a.durationWeeks;
      return 0;
    });

  function resetFilters() {
    setParams({});
  }

  return (
    <div className="explore-page paths-catalog">
      <section className="container explore-heading">
        <span className="eyebrow">
          <FontAwesomeIcon icon={faCompass} className="eyebrow-icon" />
          Discover your next skill
        </span>
        <h1>Explore learning paths</h1>
        <p>
          Find a learning journey that aligns with your goals, interests, and
          future.
        </p>
      </section>

      <section
        className="container explore-content"
        aria-label="Explore learning paths"
      >
        <PathFilters
          search={search}
          onSearchChange={(value) => updateFilter("q", value, "")}
          category={category}
          categories={categories}
          onCategoryChange={(value) => updateFilter("category", value, "All")}
          level={level}
          levels={levels}
          onLevelChange={(value) => updateFilter("level", value, "All")}
          sort={sort}
          onSortChange={(value) => updateFilter("sort", value, "default")}
        >
          <div className="explore-results-header">
            <h2>
              <FontAwesomeIcon icon={faRoute} className="results-header-icon" />
              <span>Available paths</span>
            </h2>
            <span role="status">
              {filteredPaths.length}{" "}
              {filteredPaths.length === 1 ? "path" : "paths"} found
            </span>
          </div>

          {filteredPaths.length > 0 ? (
            <div className="explore-grid">
              {filteredPaths.map((path) => (
                <PathCard key={path.id} path={path} basePath={basePath} />
              ))}
            </div>
          ) : (
            <div className="explore-empty">
              <FontAwesomeIcon icon={faBoxOpen} className="empty-icon" />
              <h3>No paths found</h3>
              <p>Try changing your search or filters.</p>
              <button
                className="btn btn-primary"
                type="button"
                onClick={resetFilters}
              >
                <FontAwesomeIcon icon={faRotateLeft} className="btn-icon" />
                <span>Reset filters</span>
              </button>
            </div>
          )}
        </PathFilters>
      </section>
    </div>
  );
}
