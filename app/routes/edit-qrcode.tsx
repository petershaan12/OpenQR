import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import DashboardLayout from "~/components/DashboardLayout";
import QRCodeForm from "~/components/shared/QRCodeForm";

export default function EditQRCode() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const cachedUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;

  const [user, setUser] = useState<any>(cachedUser);
  const [themes, setThemes] = useState<any[]>([]);
  const [qrcode, setQrcode] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(!!cachedUser);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success?: boolean; error?: string } | null>(null);

  useEffect(() => {
    if (!cachedUser) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      const API_URL = import.meta.env.VITE_API_URL || "/php-backend/api.php";

      try {
        // Fetch themes and QR code in parallel
        const [themesRes, qrcodeRes] = await Promise.all([
          fetch(`${API_URL}?path=/themes`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }),
          fetch(`${API_URL}?path=/qrcodes/${id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }),
        ]);

        if (themesRes.ok) {
          setThemes(await themesRes.json());
        }

        if (qrcodeRes.ok) {
          setQrcode(await qrcodeRes.json());
        } else if (qrcodeRes.status === 404) {
          navigate('/dashboard');
          return;
        }

        setLoading(false);

      } catch (error) {
        console.error("Error loading data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id, cachedUser, navigate]);

  const handleSubmit = async (formData: any) => {
    setSubmitting(true);
    setSubmitResult(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "/php-backend/api.php";

      const response = await fetch(`${API_URL}?path=/qrcodes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update QR code");
      }

      setSubmitResult({ success: true });
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      console.error("Error updating QR code:", error);
      setSubmitResult({ error: "Failed to update QR code" });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardLayout
      title="Edit QR Code"
      subtitle="Update your digital assets"
      user={user}
      notifications={[]}
    >
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="loading loading-spinner loading-lg text-red-600"></span>
        </div>
      ) : (
      <QRCodeForm
        mode="edit"
        themes={themes}
        initialQRCode={qrcode}
        user={user}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitResult={submitResult}
      />
      )}
    </DashboardLayout>
  );
}
