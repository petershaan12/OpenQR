import { useNavigate, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import DashboardLayout from "~/components/DashboardLayout";
import QRCodeForm from "~/components/shared/QRCodeForm";
import { createQRCode } from "~/utils/api";

export default function CreateQRCode() {
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('user') || 'null');
    }
    return null;
  });

  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(!!user);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success?: boolean; error?: string } | null>(null);

  useEffect(() => {
    if (!user) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      const API_URL = import.meta.env.VITE_API_URL || "/php-backend/api.php";

      try {
        // Fetch themes
        const themesResponse = await fetch(`${API_URL}?path=/themes`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (themesResponse.ok) {
          const themesData = await themesResponse.json();
          if (themesData.length === 0) {
            navigate("/theme?error=no_themes");
            return;
          }
          setThemes(themesData);
        }

        setLoading(false);

        // Background: validate session
        fetch(`${API_URL}?path=/auth/me`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }).then(res => {
          if (!res.ok) {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setIsAuthenticated(false);
          } else {
            res.json().then(userData => {
              setUser(userData);
              localStorage.setItem('user', JSON.stringify(userData));
            });
          }
        }).catch(() => {});

      } catch (error) {
        console.error("Error loading themes:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (formData: any) => {
    setSubmitting(true);
    setSubmitResult(null);

    try {
      const qr = await createQRCode({ ...formData, status: "draft" });
      navigate(`/edit-qrcode/${qr.id}?step=2`);
    } catch (error: any) {
      console.error("Error creating QR code:", error);
      setSubmitResult({ error: error.message || "Failed to create QR code" });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardLayout
      title="Create QR Code"
      subtitle="Build your digital identity"
      user={user}
      notifications={[]}
    >
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="loading loading-spinner loading-lg text-red-600"></span>
        </div>
      ) : (
      <QRCodeForm
        mode="create"
        themes={themes}
        user={user}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitResult={submitResult}
      />
      )}
    </DashboardLayout>
  );
}
