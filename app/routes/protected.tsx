import { Outlet, redirect } from "react-router";

export async function loader({ request }: { request: Request }) {
    // Check if user is authenticated by checking for token in localStorage
    const token = localStorage.getItem('token');
    if (!token) {
        return redirect("/login");
    }
    
    // Optionally verify the token with the backend
    try {
        const API_URL = import.meta.env.VITE_API_URL || "/php-backend/api.php";
        const response = await fetch(`${API_URL}?path=/auth/me`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        
        if (!response.ok) {
            localStorage.removeItem('token');
            return redirect("/login");
        }
    } catch (error) {
        localStorage.removeItem('token');
        return redirect("/login");
    }
    
    return null;
}

export default function ProtectedLayout() {
    return <Outlet />;
}
