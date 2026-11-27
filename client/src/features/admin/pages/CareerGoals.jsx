import { useEffect, useState } from "react";
import { faBullseye, faCode, faPenToSquare, faPlus } from "@fortawesome/free-solid-svg-icons";
import { Header, Icon } from "../../../components/ui/SharedUi";
import { createCareerGoal, listCareerGoals, updateCareerGoal } from "../../services/careerGoalService";

export default function CareerGoals() {
  const [goals, setGoals] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [draft, setDraft] = useState(null);
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
    setDraft(null);
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
      const data = { name, description: fields.get("description").trim(), icon };
      const goal = draft.id ? await updateCareerGoal(draft.id, data) : await createCareerGoal(data);
      setGoals((previous) => [...previous.filter((item) => item.id !== goal.id), goal]
        .sort((a, b) => a.name.localeCompare(b.name)));
      setSearch("");
      closeForm();
      setNotice(draft.id ? "Career goal updated." : "Career goal added.");
    } catch (failure) {
      const data = failure.response?.data;
      setError(Object.values(data?.errors ?? {})[0]?.[0]
        ?? (failure.response?.status < 500 ? data?.message : null)
        ?? "Unable to save the career goal. Try again.");
    } finally {
      setSaving(false);
    }
  }

  const filter = search.trim().toLowerCase();
  const visibleGoals = goals?.filter((goal) => `${goal.name} ${goal.description ?? ""}`.toLowerCase().includes(filter));

  return (
    <>
      <Header title={<><Icon icon={faBullseye} /> Career goals</>} action={
        <button className="btn btn-primary" type="button" onClick={() => setDraft({})} disabled={!goals || Boolean(draft)}>
          <Icon icon={faPlus} /> Add career goal
        </button>
      }>
        Organize the career outcomes available to learners.
      </Header>
      {notice && <p className="sp-notice" role="status">{notice}</p>}
      {draft && (
        <form className="sp-panel sp-form" onSubmit={handleSubmit} aria-labelledby="career-goal-form-title">
          <h2 id="career-goal-form-title">{draft.id ? "Edit career goal" : "Add career goal"}</h2>
          <label>Name <input name="name" defaultValue={draft.name ?? ""} maxLength={100} required disabled={saving} /></label>
          <label>Description <textarea name="description" defaultValue={draft.description ?? ""} disabled={saving} /></label>
          {draft.icon_url && (
            <p className="career-goal-name"><img className="career-goal-icon" src={draft.icon_url} alt="" /> Current icon</p>
          )}
          <label>
            {draft.icon_url ? "Replace icon (optional)" : "Career goal icon (optional)"}
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
                <thead><tr><th scope="col">Name</th><th scope="col">Description</th><th scope="col">Actions</th></tr></thead>
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
                      <td>
                        <button type="button" disabled={Boolean(draft)} aria-label={`Edit ${goal.name}`}
                          onClick={() => { setNotice(""); setDraft(goal); }}>
                          <Icon icon={faPenToSquare} /> Edit
                        </button>
                      </td>
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
