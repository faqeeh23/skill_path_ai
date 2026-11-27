import api from "./api";
import { getCsrfCookie } from "./authService";

export async function listCareerGoals(signal) {
    const response = await api.get("/api/admin/career-goals", { signal });
    return response.data;
}

export async function createCareerGoal(data) {
    return saveCareerGoal("/api/admin/career-goals", data);
}

export async function updateCareerGoal(id, data) {
    return saveCareerGoal(`/api/admin/career-goals/${id}`, data, "PUT");
}

async function saveCareerGoal(url, data, method) {
    const formData = new FormData();

    if (method) {
        formData.append("_method", method);
    }

    formData.append("name", data.name);
    formData.append("description", data.description ?? "");
    formData.append("icon_mode", data.icon ? "upload" : "keep");

    if (data.icon) {
        formData.append("icon", data.icon);
    }

    await getCsrfCookie();
    const response = await api.post(
        url,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
}
