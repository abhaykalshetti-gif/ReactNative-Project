
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("appointments.db");

export const initDB = async () => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      date TEXT,
      time TEXT,
      description TEXT,
      createdAt TEXT
    );
  `);
};

export const insertAppointment = async (
  name: string,
  date: string,
  time: string,
  description: string
) => {
  const createdAt = new Date().toISOString();
  await db.runAsync(
    "INSERT INTO appointments (name, date, time, description, createdAt) VALUES (?, ?, ?, ?, ?)",
    [name, date, time, description, createdAt]
  );
};

// ✅ Fetch appointments by date (async version)
export const fetchAppointmentsByDate = async (date: string): Promise<any[]> => {
  const result = await db.getAllAsync(
    "SELECT * FROM appointments WHERE date = ?",
    [date]
  );
  return result; // already an array of rows
};

export const deleteAppointment = async (id: number) => {
  await db.runAsync("DELETE FROM appointments WHERE id = ?", [id]);
};
