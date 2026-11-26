import { Navigate, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";
import ErrorPage from "../pages/ErrorPage";

export default function Guard({
    children,
    role,
    requireVerified = true,
}) {
    const { user, loading, error, isAuthenticated } = useAuth();

    const location = useLocation();

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error && !user) {
        return <ErrorPage status="session" />;
    }

    if (!isAuthenticated || !user) {
        return (
            <Navigate
                to="/login"
                state={{ from: location }}
                replace
            />
        );
    }

    if (requireVerified && !user.email_verified_at) {
        return <Navigate to="/verify-email" replace />;
    }

    if (role && user.role !== role) {
        return <Navigate to="/forbidden" replace />;
    }

    return children;
}