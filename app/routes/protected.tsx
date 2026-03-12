import { Outlet, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ProtectedLayout() {
    const navigate = useNavigate();
    // Check localStorage immediately - no waiting
    const cachedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!cachedUser);

    useEffect(() => {
        // No cached user = redirect immediately
        if (!cachedUser) {
            return;
        }

        // Background validation - non-blocking
        const API_URL = import.meta.env.VITE_API_URL || "/php-backend/api.php";

        fetch(`${API_URL}?path=/auth/me`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        }).then(res => {
            if (!res.ok) {
                // Session expired
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                setIsAuthenticated(false);
                navigate('/login', { replace: true });
            }
        }).catch(() => {
            // Network error - keep using cached data
        });
    }, [cachedUser, navigate]);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
