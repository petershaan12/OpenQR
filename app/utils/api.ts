import { compressImage } from './imageUtils';

const API_URL = import.meta.env.VITE_API_URL || "/php-backend/api.php";

export async function uploadMedia(base64Data: string): Promise<string> {
  // If it's already a URL (not base64), return as-is
  if (!base64Data.startsWith('data:')) {
    return base64Data;
  }

  const isVideo = base64Data.startsWith('data:video');
  let dataToUpload = base64Data;

  // Only compress images, not videos
  if (!isVideo && base64Data.startsWith('data:image')) {
    dataToUpload = await compressImage(base64Data, 800, 0.8);
  }

  const response = await fetch(`${API_URL}?path=/upload/base64`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
    credentials: "include",
    body: JSON.stringify({ image: dataToUpload }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error || 'Failed to upload file');
  }

  const data = await response.json();
  return data.url;
}

// Alias for backward compatibility
export const uploadImage = uploadMedia;

export async function createQRCode(formData: any): Promise<any> {
  // Upload image first if it's base64
  let profileImageUrl = formData.profile_image;
  if (profileImageUrl && profileImageUrl.startsWith('data:image')) {
    profileImageUrl = await uploadImage(profileImageUrl);
  }

  const response = await fetch(`${API_URL}?path=/qrcodes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
    credentials: "include",
    body: JSON.stringify({
      ...formData,
      profile_image: profileImageUrl,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create QR code' }));
    throw new Error(error.error || 'Failed to create QR code');
  }

  return response.json();
}

export async function updateQRCode(id: string, formData: any): Promise<any> {
  // Upload image first if it's base64
  let profileImageUrl = formData.profile_image;
  if (profileImageUrl && profileImageUrl.startsWith('data:image')) {
    profileImageUrl = await uploadImage(profileImageUrl);
  }

  const response = await fetch(`${API_URL}?path=/qrcodes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
    credentials: "include",
    body: JSON.stringify({
      ...formData,
      profile_image: profileImageUrl,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to update QR code' }));
    throw new Error(error.error || 'Failed to update QR code');
  }

  return response.json();
}
