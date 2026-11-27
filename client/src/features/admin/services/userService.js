import api from "../../services/api";
import { getCsrfCookie } from "../../services/authService";

export async function listUsers(params, signal) {
  const response = await api.get("/api/admin/users", { params, signal });
  return response.data;
}

export async function updateUser(id, changes) {
  await getCsrfCookie();
  const response = await api.patch(`/api/admin/users/${id}`, changes);
  return response.data;
}
