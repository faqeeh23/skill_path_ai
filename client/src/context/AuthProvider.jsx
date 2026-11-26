import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import * as authService from "../features/services/authService";
export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check authentication when the application starts
    useEffect(() => {
        let ignore = false;

        authService.getUser()
            .then((data) => {
                if (!ignore) {
                    setUser(data);
                }
            })
            .catch((err) => {
                if (!ignore) {
                    setUser(null);

                    if (err.response?.status !== 401) {
                        setError(err);
                    }
                }
            })
            .finally(() => {
                if (!ignore) {
                    setLoading(false);
                }
            });

        return () => {
            ignore = true;
        };
    }, []);

    // Refresh authenticated user
    async function refreshUser() {
        try {
            setError(null);

            const data = await authService.getUser();

            setUser(data);

            return data;

        } catch (err) {
            if (err.response?.status === 401) {
                setUser(null);
                return null;
            }

            setError(err);
            throw err;
        }
    }

    // Login
    async function login(payload) {
        await authService.login(payload);

        return await refreshUser();
    }

    // Register
    async function register(payload) {
        await authService.register(payload);

        return await refreshUser();
    }

    // Logout
    async function logout() {
        await authService.logout();

        setUser(null);
        setError(null);
    }

    return (
    <AuthContext.Provider
        value={{
            user,
            loading,
            error,
            isAuthenticated: !!user,
            login,
            register,
            logout,
            refreshUser
        }}
    >
        {children}
    </AuthContext.Provider>
);
}