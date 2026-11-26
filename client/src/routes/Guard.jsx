import { Navigate, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";
import ErrorPage from "../pages/ErrorPage";

export default function Guard({ children, role }) {

    const { user, loading, error, isAuthenticated } = useAuth();
    const location = useLocation();

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error && !user) {
        return <ErrorPage status="session" />;
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
        return <Navigate to="/forbidden" replace />;
    }

    return children;
}
