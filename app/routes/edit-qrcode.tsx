import { useLoaderData, redirect } from "react-router";
import DashboardLayout from "~/components/DashboardLayout";
import QRCodeForm from "~/components/shared/QRCodeForm";

export async function loader({ params, request }: { params: any; request: Request }) {
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

    // Get QR code from PHP backend
    const qrcodeResponse = await fetch(`${API_URL}?path=/qrcodes/${params.id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    if (!qrcodeResponse.ok) {
      if (qrcodeResponse.status === 404) {
        throw new Response("Not Found", { status: 404 });
      }
      throw new Error("Failed to load QR code");
    }
    
    const qrcode = await qrcodeResponse.json();

    // Get notifications from PHP backend (if available)
    // Note: You may need to implement this in your PHP backend
    const notifications = []; // Placeholder - implement as needed

    return { themes, qrcode, user, notifications };
  } catch (error) {
    console.error("Error loading edit-qrcode data:", error);
    return redirect("/login");
  }
}

export async function action({ params, request }: { params: any; request: Request }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return redirect("/login");
  }

  const formData = await request.formData();
  const _action = formData.get("_action");
  if (_action !== "update_qrcode") return null;

  const name = formData.get("name") as string;
  const surname = formData.get("surname") as string;
  const title = formData.get("title") as string;
  const social = formData.get("social_network") as string;
  const themeId = formData.get("theme_id") as string;
  const status = formData.get("status") as string;
  const profileImage = formData.get("profile_image_data") as string;
  const phones = formData.getAll("phones[]") as string[];
  const emails = formData.getAll("emails[]") as string[];

  try {
    const API_URL = import.meta.env.VITE_API_URL || "/php-backend/api.php";
    
    const response = await fetch(`${API_URL}?path=/qrcodes/${params.id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        surname,
        title,
        status,
        email: emails[0] || "",
        profile_image: profileImage,
        social_network: social,
        theme_id: parseInt(themeId),
        phones,
      }),
    });
    
    if (!response.ok) {
      throw new Error("Failed to update QR code");
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error updating QR code:", error);
    return { error: "Failed to update QR code" };
  }
}

export default function EditQRCode() {
  const { themes, qrcode, user, notifications } = useLoaderData<any>();

  return (
    <DashboardLayout
      title="Edit QR Code"
      subtitle="Update your digital assets"
      user={user as any}
      notifications={notifications}
    >
      <QRCodeForm
        mode="edit"
        themes={themes}
        initialQRCode={qrcode}
        user={user}
      />
    </DashboardLayout>
  );
}