import mysql from "mysql2/promise";

let pool: mysql.Pool;

export function getDb() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "Indonesia77",
      database: process.env.DB_NAME || "army_qrcode",
      waitForConnections: true,
      connectionLimit: 10,
    });
  }
  return pool;
}
