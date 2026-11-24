const API_URL = import.meta.env.VITE_API_URL

export function loginWithGoogle() {
    if (!API_URL) {
        throw new Error("Google authentication is not configured yet.")
    }

    const backendUrl = API_URL.replace(/\+$/, "");
    window.location.assign(`${backendUrl}/auth/google/redirect`)
}