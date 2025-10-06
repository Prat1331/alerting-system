import fs from "fs";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function initDb() {
  const db = await open({
    filename: "alerts.db",
    driver: sqlite3.Database,
  });

  const schema = fs.readFileSync("./src/db/schema.sql", "utf8");
  await db.exec(schema);
  console.log("✅ Database schema initialized");

  return db;
}
