import { getDb } from "~/.server/db";
import { type UserData } from "~/types";
import bcrypt from "bcryptjs";

export async function findUserByEmail(email: string): Promise<any | null> {
  const db = getDb();
  const [users]: any = await db.query("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  return users[0] || null;
}

export async function getUserById(id: number): Promise<UserData | null> {
  const db = getDb();
  const [users]: any = await db.query(
    "SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?",
    [id],
  );
  return users[0] || null;
}

export async function getAllUsers(): Promise<UserData[]> {
  const db = getDb();
  const [users]: any = await db.query(
    "SELECT id, name, email, role, avatar, created_at FROM users ORDER BY created_at DESC",
  );
  return users;
}

export async function updateUser(
  id: number,
  data: {
    name?: string;
    email?: string;
    role?: string;
    password?: string;
    avatar?: string | null;
  },
): Promise<void> {
  const db = getDb();
  const fields = [];
  const values = [];

  if (data.name) {
    fields.push("name = ?");
    values.push(data.name);
  }
  if (data.email) {
    fields.push("email = ?");
    values.push(data.email);
  }
  if (data.role) {
    fields.push("role = ?");
    values.push(data.role);
  }
  if (data.password) {
    fields.push("password = ?");
    values.push(bcrypt.hashSync(data.password, 10));
  }
  if (data.avatar !== undefined) {
    fields.push("avatar = ?");
    values.push(data.avatar);
  }

  if (fields.length === 0) return;

  await db.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, [
    ...values,
    id,
  ]);
}

export async function deleteUser(id: number): Promise<void> {
  const db = getDb();
  await db.query("DELETE FROM users WHERE id = ?", [id]);
}

export async function createUser(data: {
  name: string;
  email: string;
  password?: string;
  role?: string;
}): Promise<void> {
  if (!data.password) throw new Response("Password is required", { status: 400 });
  const db = getDb();
  await db.query(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    [
      data.name,
      data.email,
      bcrypt.hashSync(data.password, 10),
      data.role || "user",
    ],
  );
}
