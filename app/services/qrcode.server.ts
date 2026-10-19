import { getDb } from "~/.server/db";
import { v4 as uuidv4 } from "uuid";
import { createNotification } from "./notification.server";
import { type QRCodeData, type PhoneData, type ThemeData } from "~/types";
import { generateUniqueId } from "~/utils/ids";

async function assertThemeAllowed(themeId: number, userId: number) {
  if (!Number.isFinite(themeId)) return;
  const [rows]: any = await getDb().query(
    "SELECT id FROM themes WHERE id = ? AND (user_id = ? OR user_id IS NULL)",
    [themeId, userId],
  );
  if (!rows.length) throw new Response("Invalid theme", { status: 400 });
}

/**
 * Get all QR codes for a user with their main phone
 */
export async function getUserQRCodes(userId: number): Promise<QRCodeData[]> {
  const db = getDb();
  const [qrcodes]: any = await db.query(
    `
    SELECT q.*,
    (SELECT phone FROM qrcode_phones WHERE qrcode_id = q.id LIMIT 1) as main_phone
    FROM qrcodes q
    WHERE q.user_id = ?
    ORDER BY q.created_at DESC
  `,
    [userId],
  );
  return qrcodes;
}

/**
 * Create a new QR code
 */
export async function createQRCode(data: {
  user_id: number;
  name: string;
  surname: string;
  title: string;
  email: string;
  profile_image: string | null;
  social_network: string;
  theme_id: number;
  status: string;
  phones: string[];
  unique_id?: string;
}): Promise<QRCodeData> {
  const db = getDb();
  await assertThemeAllowed(data.theme_id, data.user_id);

  // Generate unique ID or use provided one
  let uniqueId = data.unique_id || generateUniqueId(data.name, data.surname);
  let isUnique = false;
  let attempts = 0;

  // Ensure uniqueness of the ID
  while (!isUnique && attempts < 10) {
    const [existing]: any = await db.query(
      "SELECT id FROM qrcodes WHERE unique_id = ?",
      [uniqueId],
    );
    if (existing.length === 0) {
      isUnique = true;
    } else {
      uniqueId = generateUniqueId(data.name, data.surname);
      attempts++;
    }
  }

  if (!isUnique) {
    throw new Error("Could not generate unique ID after 10 attempts");
  }

  // Insert QR Code
  const [result]: any = await db.query(
    "INSERT INTO qrcodes (user_id, name, surname, title, email, profile_image, social_network, theme_id, status, unique_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      data.user_id,
      data.name,
      data.surname,
      data.title,
      data.email,
      data.profile_image,
      data.social_network,
      data.theme_id,
      data.status,
      uniqueId,
    ],
  );

  const qrId = result.insertId;

  // Insert Phones
  for (const phone of data.phones) {
    if (phone.trim() !== "") {
      await db.query(
        "INSERT INTO qrcode_phones (qrcode_id, phone) VALUES (?, ?)",
        [qrId, phone],
      );
    }
  }

  // Create notification
  await createNotification({
    user_id: data.user_id,
    title: "QR Code Created",
    message: `QR Code for ${data.name} has been successfully created.`,
    type: "success",
  });

  const [qrcodes]: any = await db.query("SELECT * FROM qrcodes WHERE id = ?", [
    qrId,
  ]);
  return qrcodes[0];
}

/**
 * Get QR code by ID (for editing)
 */
export async function getQRCodeById(id: number, userId: number): Promise<any> {
  const db = getDb();
  const [qrcodes]: any = await db.query(
    "SELECT * FROM qrcodes WHERE id = ? AND user_id = ?",
    [id, userId],
  );

  if (qrcodes.length === 0) return null;

  const [phones]: any = await db.query(
    "SELECT id, phone FROM qrcode_phones WHERE qrcode_id = ?",
    [id],
  );

  return { ...qrcodes[0], phones };
}

/**
 * Get QR code by unique ID (for public view)
 */
export async function getQRCodeByUniqueId(uniqueId: string): Promise<any> {
  const db = getDb();
  const [qrcodes]: any = await db.query(
    `
    SELECT q.*, t.primary_color, t.legal_info, t.welcome_screen_time, t.welcome_image, t.welcome_video, t.enable_welcome
    FROM qrcodes q
    LEFT JOIN themes t ON q.theme_id = t.id
    WHERE q.unique_id = ?
  `,
    [uniqueId],
  );

  if (qrcodes.length === 0) return null;

  const [phones]: any = await db.query(
    "SELECT phone as value FROM qrcode_phones WHERE qrcode_id = ?",
    [qrcodes[0].id],
  );

  return { qr: qrcodes[0], phones };
}

/**
 * Increment scan count
 */
export async function incrementScans(uniqueId: string): Promise<void> {
  const db = getDb();
  await db.query("UPDATE qrcodes SET scans = scans + 1 WHERE unique_id = ?", [
    uniqueId,
  ]);
}

/**
 * Update QR code
 */
export async function updateQRCode(
  qrId: number,
  userId: number,
  data: {
    name: string;
    surname: string;
    title: string;
    email: string;
    profile_image: string | null;
    social_network: string;
    theme_id: number;
    status?: string;
    phones: string[];
  },
): Promise<void> {
  const db = getDb();

  const [owned]: any = await db.query(
    "SELECT id FROM qrcodes WHERE id = ? AND user_id = ?",
    [qrId, userId],
  );
  if (!owned.length) throw new Response("Not found", { status: 404 });
  await assertThemeAllowed(data.theme_id, userId);

  if (data.status) {
    await db.query(
      "UPDATE qrcodes SET name = ?, surname = ?, title = ?, email = ?, profile_image = ?, social_network = ?, theme_id = ?, status = ? WHERE id = ? AND user_id = ?",
      [
        data.name,
        data.surname,
        data.title,
        data.email,
        data.profile_image,
        data.social_network,
        data.theme_id,
        data.status,
        qrId,
        userId,
      ],
    );
  } else {
    await db.query(
      "UPDATE qrcodes SET name = ?, surname = ?, title = ?, email = ?, profile_image = ?, social_network = ?, theme_id = ? WHERE id = ? AND user_id = ?",
      [
        data.name,
        data.surname,
        data.title,
        data.email,
        data.profile_image,
        data.social_network,
        data.theme_id,
        qrId,
        userId,
      ],
    );
  }

  // Update phones
  await db.query("DELETE FROM qrcode_phones WHERE qrcode_id = ?", [qrId]);
  for (const phone of data.phones) {
    if (phone.trim() !== "") {
      await db.query(
        "INSERT INTO qrcode_phones (qrcode_id, phone) VALUES (?, ?)",
        [qrId, phone],
      );
    }
  }
}

/**
 * Delete QR code
 */
export async function deleteQRCode(
  qrId: number,
  userId: number,
): Promise<void> {
  const db = getDb();
  await db.query("DELETE FROM qrcodes WHERE id = ? AND user_id = ?", [
    qrId,
    userId,
  ]);
}
