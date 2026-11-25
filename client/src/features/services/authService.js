import api from "./api"

// CSRF Protection 
export async function getCsrfCookie() {
    await api.get("/sanctum/csrf-cookie");
}

// Register
export async function register(payload) {
    await getCsrfCookie();
    const response = await api.post("/register", payload);
    return response.data;
}

// Login 
export async function login(payload) {
    await getCsrfCookie();
    const response = await api.post("/login", payload);

    return response.data;
}

// Get Authenticated User
export async function getUser() {
    const response = await api.get("/api/user");
    return response.data;
}

// Forgot Password
export async function requestPasswordReset(email ) {
    await getCsrfCookie();
    await api.post("/forgot-password", {email});

    return {
        demo: false,
        message: "If an account exists for this email, you will receive a reset link.",
    }
}

// Reset Password

export async function resetPassword(payload){
    await getCsrfCookie();
    await api.post("/reset-password", payload)
    return {
        demo : false ,
        message : "Your password has been reset successfully ."
    }
}

// Resend Verification Email
export async function resendVerificationEmail(){
    await api.post("/email/verification-notification");

    return {
        demo :false,
        message: "Verification email requested",
    }
}

// Logout
export async function logout() {
    await api.post("/logout");
}