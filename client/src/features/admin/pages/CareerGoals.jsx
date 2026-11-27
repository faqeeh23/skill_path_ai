import { useEffect, useState } from "react";
import { faBullseye, faCode, faPlus } from "@fortawesome/free-solid-svg-icons";
import { Header, Icon } from "../../../components/ui/SharedUi";
import { createCareerGoal, listCareerGoals } from "../../services/careerGoalService";

export default function CareerGoals() {
  const [goals, setGoals] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [adding, setAdding] = useState(false);
  const [icon, setIcon] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    listCareerGoals(controller.signal)
      .then((records) => {
        if (!controller.signal.aborted) setGoals(records);
      })
      .catch((failure) => {
        if (!controller.signal.aborted) {
          setLoadError(failure.response?.data?.message ?? "Unable to load career goals.");
        }
      });
    return () => controller.abort();
  }, [attempt]);

  function retryLoad() {
    setLoadError("");
    setAttempt((previous) => previous + 1);
  }

  function closeForm() {
    setAdding(false);
    setIcon(null);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;
    setError("");
    setNotice("");

    const fields = new FormData(event.currentTarget);
    const name = fields.get("name").trim();
    if (!name) {
      setError("Enter a career goal name.");
      return;
    }

    setSaving(true);
    try {
      const goal = await createCareerGoal({ name, description: fields.get("description").trim(), icon });
      setGoals((previous) => [...previous, goal].sort((a, b) => a.name.localeCompare(b.name)));
      setSearch("");
      closeForm();
      setNotice("Career goal added.");
    } catch (failure) {
      const data = failure.response?.data;
      setError(Object.values(data?.errors ?? {})[0]?.[0] ?? data?.message ?? "Unable to add the career goal.");
    } finally {
      setSaving(false);
    }
  }

  const filter = search.trim().toLowerCase();
  const visibleGoals = goals?.filter((goal) => `${goal.name} ${goal.description ?? ""}`.toLowerCase().includes(filter));

  return (
    <>
      <Header title={<><Icon icon={faBullseye} /> Career goals</>} action={
        <button className="btn btn-primary" type="button" onClick={() => setAdding(true)} disabled={!goals || adding}>
          <Icon icon={faPlus} /> Add career goal
        </button>
      }>
        Organize the career outcomes available to learners.
      </Header>
      {notice && <p className="sp-notice" role="status">{notice}</p>}
      {adding && (
        <form className="sp-panel sp-form" onSubmit={handleSubmit} aria-labelledby="add-career-goal">
          <h2 id="add-career-goal">Add career goal</h2>
          <label>Name <input name="name" maxLength={100} required disabled={saving} /></label>
          <label>Description <textarea name="description" disabled={saving} /></label>
          <label>
            Career goal icon <span>(optional)</span>
            <input name="icon" type="file" accept="image/png,image/jpeg,image/webp"
              onChange={(event) => setIcon(event.target.files?.[0] ?? null)} disabled={saving}
              aria-describedby="career-goal-icon-help" />
          </label>
          <p id="career-goal-icon-help">PNG, JPEG, or WebP. Up to 1 MB.</p>
          {error && <p className="sp-notice error" role="alert">{error}</p>}
          <div className="sp-actions">
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Save career goal"}</button>
            <button className="btn btn-outline" type="button" disabled={saving} onClick={closeForm}>Cancel</button>
          </div>
        </form>
      )}
      {loadError ? (
        <div className="admin-overview-panel admin-empty">
          <p role="alert">{loadError}</p>
          <button className="btn btn-outline" type="button" onClick={retryLoad}>Try again</button>
        </div>
      ) : !visibleGoals ? <p role="status">Loading career goals…</p> : (
        <>
          <div className="sp-toolbar admin-record-toolbar">
            <label>Search <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
          </div>
          {visibleGoals.length ? (
            <div className="sp-panel sp-table-scroll">
              <table>
                <caption>Career goals · {visibleGoals.length} of {goals.length}</caption>
                <thead><tr><th scope="col">Name</th><th scope="col">Description</th></tr></thead>
                <tbody>
                  {visibleGoals.map((goal) => (
                    <tr key={goal.id}>
                      <th scope="row">
                        <span className="career-goal-name">
                          {goal.icon_url ? <img className="career-goal-icon" src={goal.icon_url} alt="" /> : <Icon icon={faCode} />}
                          {goal.name}
                        </span>
                      </th>
                      <td>{goal.description || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p>{filter ? "No career goals match your search." : "No career goals yet."}</p>}
        </>
      )}
    </>
  );
}
