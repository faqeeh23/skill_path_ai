import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCompass,
  faRoute,
  faBoxOpen,
  faRotateLeft
} from "@fortawesome/free-solid-svg-icons";
import { learningPaths } from "../../data/learningPaths";
import PathCard from "../../pages/explore/PathCard";
import PathFilters from "../../pages/explore/PathFilters";
import "../../styles/explorePaths.css";

const categories = ["All", ...new Set(learningPaths.map(p => p.category))];
const levels = ["All", ...new Set(learningPaths.map(p => p.level))];

export default function ExplorePaths() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [sort, setSort] = useState("default");
  const rootRef = useRef(null);

  const query = search.trim().toLowerCase();
  const filteredPaths = learningPaths
    .filter(path => {
      const matchesSearch =
        path.title.toLowerCase().includes(query) ||
        path.description.toLowerCase().includes(query) ||
        path.skills.some(skill => skill.toLowerCase().includes(query));
      return matchesSearch &&
        (category === "All" || path.category === category) &&
        (level === "All" || path.level === level);
    })
    .sort((a, b) => {
      if (sort === "name") return a.title.localeCompare(b.title);
      if (sort === "shortest") return a.durationWeeks - b.durationWeeks;
      if (sort === "longest") return b.durationWeeks - a.durationWeeks;
      return 0;
    });

  function resetFilters() {
    setSearch(""); setCategory("All"); setLevel("All"); setSort("default");
  }

  // Pointer-following light on [data-glow] cards
  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function handleMove(event) {
      if (!(event.target instanceof Element)) return;
      const card = event.target.closest("[data-glow]");
      if (!card || !root.contains(card)) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    }
    root.addEventListener("pointermove", handleMove);
    return () => root.removeEventListener("pointermove", handleMove);
  }, []);

  return (
    <div className="explore-page" ref={rootRef}>
      <div className="explore-aurora" aria-hidden="true" />

      <section className="container explore-heading">
        <span className="eyebrow">
          <FontAwesomeIcon icon={faCompass} className="eyebrow-icon" />
          Discover your next skill
        </span>
        <h1>Explore learning paths</h1>
        <p>Find a learning journey that aligns with your goals, interests, and future.</p>
      </section>

      <section className="container explore-content" aria-label="Explore learning paths">
        <PathFilters
          search={search} onSearchChange={setSearch}
          category={category} categories={categories} onCategoryChange={setCategory}
          level={level} levels={levels} onLevelChange={setLevel}
          sort={sort} onSortChange={setSort}
        >
          <div className="explore-results-header">
            <h2>
              <FontAwesomeIcon icon={faRoute} className="results-header-icon" />
              <span>Available paths</span>
            </h2>
            <span>{filteredPaths.length} {filteredPaths.length === 1 ? "path" : "paths"} found</span>
          </div>

          {filteredPaths.length > 0 ? (
            <div className="explore-grid">
              {filteredPaths.map((path, i) => <PathCard key={path.id} path={path} index={i} />)}
            </div>
          ) : (
            <div className="explore-empty glass-card">
              <FontAwesomeIcon icon={faBoxOpen} className="empty-icon" />
              <h3>No paths found</h3>
              <p>Try changing your search or filters.</p>
              <button className="btn btn-primary" type="button" onClick={resetFilters}>
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