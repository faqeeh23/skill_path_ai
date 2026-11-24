const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/,"");

export async function requestPasswordReset(email) {
    if (!API_URL) {
        return {
            demo: true,
            message: "Demo mode: no email was sent."

        }
    }

    const response = await fetch(`${API_URL}/forgot-password`, {
        method:"POST",
        headers: {"Content-Type": "application/json",Accept:"application/json"},
        credentials:"include",
        body: JSON.stringify({email})
    })

    if (!response.ok) throw new Error("Unable to process your request. Please try again")
    
    return {
        demo: false,
        message: "If an account exists for this email, you will receive a reset link."
    }
}

export async function resetPassword(payload) {
    if (!API_URL) {
        return {
            demo: true,
            message: "Demo mode: your password was not changed."
        }
    }

    const response = await fetch(`${API_URL}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "include",
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("The reset link is invalid or expired.");

    return { demo: false, message: "Your password has been reset successfully." };

}

export async function resendVerificationEmail() {
    if (!API_URL) {
        return {
            demo:true,
            message:"Demo mode: no verification email was sent."
        }
    }

    const response = await fetch(`${API_URL}/email/verification-notification`,{
        method : "POST",
        credentials: "include",
        headers: {Accept: "application/json"}
    })
    if (!response.ok) throw new Error("Unable to send verification email")
    return {demo: false, message: "Verification email requested"}
}