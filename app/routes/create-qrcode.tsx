import { useLoaderData, redirect } from "react-router";
import DashboardLayout from "~/components/DashboardLayout";
import QRCodeForm from "~/components/shared/QRCodeForm";

export async function loader({ request }: { request: Request }) {
  // Check if user is authenticated
  const token = localStorage.getItem('token');
  if (!token) {
    return redirect("/login");
  }

  try {
    // Get user data from PHP backend
    const API_URL = import.meta.env.VITE_API_URL || "/php-backend/api.php";
    
    const userResponse = await fetch(`${API_URL}?path=/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    if (!userResponse.ok) {
      localStorage.removeItem('token');
      return redirect("/login");
    }
    
    const user = await userResponse.json();

    // Get themes from PHP backend
    const themesResponse = await fetch(`${API_URL}?path=/themes`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    if (!themesResponse.ok) {
      throw new Error("Failed to load themes");
    }
    
    const themes = await themesResponse.json();

    if (themes.length === 0) {
      return redirect("/theme?error=no_themes");
    }

    // Get notifications from PHP backend (if available)
    // Note: You may need to implement this in your PHP backend
    const notifications = []; // Placeholder - implement as needed

    return { themes, user, notifications };
  } catch (error) {
    console.error("Error loading create-qrcode data:", error);
    return redirect("/login");
  }
}

export async function action({ request }: { request: Request }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return redirect("/login");
  }

  const formData = await request.formData();
  const _action = formData.get("_action");
  if (_action !== "create_qrcode") return null;

  const name = formData.get("name") as string;
  const surname = formData.get("surname") as string;
  const title = formData.get("title") as string;
  const social = formData.get("social_network") as string;
  const themeId = formData.get("theme_id") as string;
  const profileImage = formData.get("profile_image_data") as string;
  const phones = formData.getAll("phones[]") as string[];
  const emails = formData.getAll("emails[]") as string[];

  try {
    const API_URL = import.meta.env.VITE_API_URL || "/php-backend/api.php";
    
    const response = await fetch(`${API_URL}?path=/qrcodes`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        surname,
        title,
        email: emails[0] || "",
        profile_image: profileImage,
        social_network: social,
        theme_id: parseInt(themeId),
        status: "draft",
        phones,
      }),
    });
    
    if (!response.ok) {
      throw new Error("Failed to create QR code");
    }
    
    const qr = await response.json();
    
    return redirect(`/edit-qrcode/${qr.id}?step=2`);
  } catch (error) {
    console.error("Error creating QR code:", error);
    return { error: "Failed to create QR code" };
  }
}

export default function CreateQRCode() {
  const { themes, user, notifications } = useLoaderData<any>();

  return (
    <DashboardLayout
      title="Create QR Code"
      subtitle="Build your digital identity"
      user={user as any}
      notifications={notifications}
    >
      <QRCodeForm 
        mode="create" 
        themes={themes} 
        user={user} 
      />
    </DashboardLayout>
  );
}
