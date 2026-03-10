import { v4 as uuidv4 } from "uuid";

/**
 * Generate a unique ID for QR codes
 */
export function generateUniqueId(name?: string, surname?: string): string {
  if (name && surname) {
    const slug = `${name}-${surname}`.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const random = Math.floor(Math.random() * 900) + 100; // 3-digit random
    return `${slug}-${random}`;
  }
  return uuidv4().substring(0, 8); // Fallback to 8-char random
}
