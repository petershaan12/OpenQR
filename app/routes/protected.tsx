import { Outlet, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ProtectedLayout() {
    const navigate = useNavigate();
    const location = useLocation();
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
                return;
            }
            return res.json().then(me => {
                // Keep the cached must_change_password flag in sync with the server session
                const user = JSON.parse(localStorage.getItem('user') || 'null');
                if (user && !!user.must_change_password !== !!me.must_change_password) {
                    localStorage.setItem('user', JSON.stringify({ ...user, must_change_password: !!me.must_change_password }));
                    if (me.must_change_password) navigate('/account', { replace: true });
                }
            });
        }).catch(() => {
            // Network error - keep using cached data
        });
    }, [cachedUser, navigate]);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (JSON.parse(cachedUser || 'null')?.must_change_password && location.pathname !== '/account') {
        return <Navigate to="/account" replace />;
    }

    return <Outlet />;
}
