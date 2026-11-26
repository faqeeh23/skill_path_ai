import api from "./api";

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
export async function requestPasswordReset(email) {
    await getCsrfCookie();

    await api.post("/forgot-password", { email });

    return {
        message: "If an account exists for this email, you will receive a reset link.",
    };
}

// Reset Password
export async function resetPassword(payload) {
    await getCsrfCookie();

    await api.post("/reset-password", payload);

    return {
        message: "Your password has been reset successfully.",
    };
}

// Resend Verification Email
export async function resendVerificationEmail() {
    await api.post("/email/verification-notification");

    return {
        message: "A new verification code has been sent to your email.",
    };
}

// Verify Email Code
export async function verifyEmailCode(code) {
    await api.post("/api/email/verification-code", { code });

    return {
        message: "Your email has been verified successfully.",
    };
}

// Logout
export async function logout() {
    await api.post("/logout");
}

// Update Profile Information 
export async function updateProfile(payload) {
    await getCsrfCookie();

    await api.put("/user/profile-information", payload);

    return {
        message: "Your profile has been updated successfully."
    }
}

// Update Password

export async function updatePassword(payload) {
    await getCsrfCookie();

    await api.put("/user/password", payload);

    return {
        message : "Your password has been updated successfully."
    }
}

export async function confirmPassword(password) {
    await getCsrfCookie();

    const response = await api.post("/user/confirm-password", { password });
    return response.data;
}

export async function requestEmailChange(email) {
    const response = await api.post("/api/email/change/request", { email });
    return response.data;
}

export async function verifyEmailChange(code) {
    const response = await api.post("/api/email/change/verify", { code });
    return response.data;
}


export async function getUsers(params = {}) {
    const response = await api.get("/api/admin/users", {
        params,
    });

    return response.data;
}