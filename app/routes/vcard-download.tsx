import { useEffect } from "react";
import { useParams } from "react-router-dom";

export default function VCardDownload() {
    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        if (id) {
            // Redirect to the PHP backend to handle the vCard download
            // This allows the backend to increment scan counts and generate the vCard
            window.location.href = `/php-backend/api.php?path=/qrcodes/${id}/vcard`;
        } else {
            // If no ID is provided, redirect back to home
            window.location.href = "/";
        }
    }, [id]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                <p className="mt-4">Preparing vCard download...</p>
            </div>
        </div>
    );
}
