import { useState } from "react";
import { updateUser } from "../services/userService";

export default function UserEditor({ user, isSelf, onSave, onCancel }) {
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const [active, setActive] = useState(user.is_active);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");

    try {
      const changes = { name: name.trim() };
      if (!isSelf) {
        changes.role = role;
        changes.is_active = active;
      }
      const updatedUser = await updateUser(user.id, changes);
      onSave(updatedUser);
    } catch (failure) {
      const data = failure.response?.data;
      setError(Object.values(data?.errors ?? {})[0]?.[0] ?? data?.message ?? "Unable to save account changes. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="sp-panel sp-form" aria-labelledby="admin-user-editor-title" onSubmit={handleSubmit}>
      <h2 id="admin-user-editor-title">Edit account</h2>
      <p>{user.email}</p>
      <label>
        Display name
        <input value={name} onChange={(event) => setName(event.target.value)} required maxLength={100} disabled={saving} />
      </label>
      <label>
        Role
        <select value={role} onChange={(event) => setRole(event.target.value)} disabled={saving || isSelf}>
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      <label className="sp-check">
        <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} disabled={saving || isSelf} />
        Account active
      </label>
      {isSelf && <p>Your role and account status can only be changed by another admin.</p>}
      {error && <p className="sp-notice error" role="alert">{error}</p>}
      <div className="sp-actions">
        <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
        <button className="btn btn-outline" type="button" onClick={onCancel} disabled={saving}>Cancel</button>
      </div>
    </form>
  );
}
