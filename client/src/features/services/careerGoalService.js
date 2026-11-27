import api from "./api";
import { getCsrfCookie } from "./authService";

export async function listCareerGoals(signal) {
    const response = await api.get("/api/admin/career-goals", { signal });
    return response.data;
}

export async function createCareerGoal(data) {

    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("description", data.description ?? "");

    if (data.icon) {
        formData.append("icon", data.icon);
    }

    await getCsrfCookie();
    const response = await api.post(
        "/api/admin/career-goals",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
}
