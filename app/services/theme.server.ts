import { getDb } from "~/.server/db";
import { type ThemeData } from "~/types";

export async function getUserThemes(userId: number): Promise<ThemeData[]> {
  const db = getDb();
  const [themes]: any = await db.query(
    "SELECT * FROM themes WHERE user_id = ? OR user_id IS NULL ORDER BY id ASC",
    [userId],
  );
  return themes;
}

export async function createTheme(data: {
  name: string;
  primary_color: string;
  legal_info: string;
  welcome_screen_time?: number;
  welcome_image?: string | null;
  welcome_video?: string | null;
  enable_welcome?: boolean;
  user_id: number;
}): Promise<void> {
  const db = getDb();
  await db.query(
    "INSERT INTO themes (name, primary_color, legal_info, welcome_screen_time, welcome_image, welcome_video, enable_welcome, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      data.name,
      data.primary_color,
      data.legal_info,
      data.welcome_screen_time || 5,
      data.welcome_image || null,
      data.welcome_video || null,
      data.enable_welcome === undefined ? true : data.enable_welcome,
      data.user_id,
    ],
  );
}

export async function updateTheme(
  id: number,
  userId: number,
  data: {
    name: string;
    primary_color: string;
    legal_info: string;
    welcome_screen_time?: number;
    welcome_image?: string | null;
    welcome_video?: string | null;
    enable_welcome?: boolean;
  },
): Promise<void> {
  const db = getDb();
  await db.query(
    "UPDATE themes SET name = ?, primary_color = ?, legal_info = ?, welcome_screen_time = ?, welcome_image = ?, welcome_video = ?, enable_welcome = ? WHERE id = ? AND user_id = ?",
    [
      data.name,
      data.primary_color,
      data.legal_info,
      data.welcome_screen_time || 5,
      data.welcome_image || null,
      data.welcome_video || null,
      data.enable_welcome === undefined ? true : data.enable_welcome,
      id,
      userId,
    ],
  );
}

export async function deleteTheme(id: number, userId: number): Promise<void> {
  const db = getDb();
  await db.query("DELETE FROM themes WHERE id = ? AND user_id = ?", [
    id,
    userId,
  ]);
}
