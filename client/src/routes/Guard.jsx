import { Navigate, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";

export default function Guard({ children, role }) {

    const { user, loading, error, isAuthenticated } = useAuth();
    const location = useLocation();

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error && !user) {
        return <p>Unable to verify your session.</p>;
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                state={{ from: location }}
                replace
            />
        );
    }

    if (role && user.role !== role) {
        return <Navigate to="/" replace />;
    }

    return children;
}