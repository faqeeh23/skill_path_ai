import { useEffect, useState } from "react";
import { faChalkboardUser, faUsers } from "@fortawesome/free-solid-svg-icons";
import { Header, Icon } from "../../../components/ui/SharedUi";
import { useAuth } from "../../../hooks/useAuth";
import { listUsers } from "../services/userService";
import UserEditor from "./UserEditor";

const emptyFilters = { search: "", role: "", is_active: "" };

export default function UserDirectory({ instructorsOnly = false }) {
  const { user, refreshUser } = useAuth();
  const [draft, setDraft] = useState(emptyFilters);
  const [request, setRequest] = useState({ filters: emptyFilters, page: 1 });
  const [result, setResult] = useState(null);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState("");
  const title = instructorsOnly ? "Instructors" : "Users";
  const current = result?.request === request ? result : null;
  const data = current?.data;

  useEffect(() => {
    const controller = new AbortController();
    const filters = { ...request.filters, page: request.page };
    if (instructorsOnly) filters.role = "instructor";
    const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ""));

    listUsers(params, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        if (request.page > data.last_page) {
          setRequest((previous) => previous === request ? { ...previous, page: data.last_page } : previous);
          return;
        }
        setResult({ request, data });
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setResult({ request, error: error.response?.data?.message ?? "Unable to load accounts. Try again." });
        }
      });

    return () => controller.abort();
  }, [instructorsOnly, request]);

  function applyFilters(event) {
    event.preventDefault();
    setRequest({ filters: { ...draft, search: draft.search.trim() }, page: 1 });
  }

  function clearFilters() {
    setDraft(emptyFilters);
    setRequest({ filters: emptyFilters, page: 1 });
  }

  function handleSave(account) {
    setEditing(null);
    setNotice("Account updated.");
    setRequest((previous) => ({ ...previous }));
    if (account.id === user.id) void refreshUser().catch(() => {});
  }

  return (
    <>
      <Header title={<><Icon icon={instructorsOnly ? faChalkboardUser : faUsers} /> {title}</>}>
        {instructorsOnly ? "Review instructor accounts and manage their access." : "Find accounts and manage roles and access."}
      </Header>

      <form className="sp-toolbar admin-record-toolbar admin-user-filters" onSubmit={applyFilters}>
        <label>
          Search
          <input type="search" placeholder="Search by name or email" maxLength={100} value={draft.search}
            onChange={(event) => setDraft({ ...draft, search: event.target.value })} />
        </label>
        {!instructorsOnly && (
          <label>
            Role
            <select value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value })}>
              <option value="">All roles</option>
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
          </label>
        )}
        <label>
          Account status
          <select value={draft.is_active} onChange={(event) => setDraft({ ...draft, is_active: event.target.value })}>
            <option value="">All statuses</option>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </label>
        <div className="sp-actions">
          <button className="btn btn-primary" type="submit">Apply filters</button>
          <button className="btn btn-outline" type="button" onClick={clearFilters}>Clear</button>
        </div>
      </form>

      {notice && <p className="sp-notice" role="status">{notice}</p>}
      {editing && (
        <UserEditor key={editing.id} user={editing} isSelf={editing.id === user.id}
          onSave={handleSave} onCancel={() => setEditing(null)} />
      )}
      {!current && <p role="status">Loading accounts…</p>}
      {current?.error && (
        <div className="admin-overview-panel admin-empty">
          <p role="alert">{current.error}</p>
          <button type="button" className="btn btn-outline" onClick={() => setRequest({ ...request })}>Try again</button>
        </div>
      )}
      {data && (data.data.length ? (
        <>
          <div className="sp-panel sp-table-scroll">
            <table>
              <caption>{title} · {data.from}–{data.to} of {data.total}</caption>
              <thead>
                <tr>
                  <th scope="col">Name</th><th scope="col">Email</th><th scope="col">Role</th>
                  <th scope="col">Status</th><th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((account) => (
                  <tr key={account.id}>
                    <th scope="row">{account.name}</th>
                    <td>{account.email}</td>
                    <td className="admin-record-status">{account.role}</td>
                    <td>{account.is_active ? "Active" : "Inactive"}</td>
                    <td>
                      <button type="button" aria-label={`Edit ${account.name}`} disabled={Boolean(editing)}
                        onClick={() => { setNotice(""); setEditing(account); }}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.last_page > 1 && (
            <nav className="sp-actions admin-user-pagination" aria-label="Account pages">
              <button type="button" className="btn btn-outline" disabled={request.page <= 1}
                onClick={() => setRequest({ ...request, page: request.page - 1 })}>Previous</button>
              <span>Page {data.current_page} of {data.last_page}</span>
              <button type="button" className="btn btn-outline" disabled={request.page >= data.last_page}
                onClick={() => setRequest({ ...request, page: request.page + 1 })}>Next</button>
            </nav>
          )}
        </>
      ) : (
        <div className="admin-overview-panel admin-empty">
          <h2>No accounts found</h2>
          <p>Try another search or clear the filters.</p>
        </div>
      ))}
    </>
  );
}
