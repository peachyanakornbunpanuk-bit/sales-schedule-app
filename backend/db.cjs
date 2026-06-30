const path = require('path');
const { createClient } = require('@libsql/client');

async function getDbConnection() {
  let db;
  
  if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    
    // Create an adapter to match the sqlite package API
    db = {
      run: async (sql, params = []) => client.execute({ sql, args: params }),
      get: async (sql, params = []) => {
        const res = await client.execute({ sql, args: params });
        return res.rows[0];
      },
      all: async (sql, params = []) => {
        const res = await client.execute({ sql, args: params });
        return res.rows;
      },
      exec: async (sql) => client.executeMultiple(sql),
    };
    console.log("Connected to Turso Cloud Database");
  } else {
    const sqlite3 = require('sqlite3').verbose();
    const { open } = require('sqlite');
    db = await open({
      filename: path.join(__dirname, 'database.sqlite'),
      driver: sqlite3.Database
    });
    console.log("Connected to Local SQLite Database");
  }

  // Create tables if they don't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS locations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      locationId TEXT NOT NULL,
      date TEXT NOT NULL,
      startTime TEXT NOT NULL,
      endTime TEXT NOT NULL,
      shiftType TEXT NOT NULL,
      jobDescription TEXT,
      notes TEXT,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (locationId) REFERENCES locations(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      channel TEXT NOT NULL,
      status TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      payload TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      details TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    );
  `);

  try {
    await db.exec(`ALTER TABLE users ADD COLUMN lineUserId TEXT;`);
  } catch (e) {
    // Column already exists, ignore error
  }

  try {
    await db.exec(`ALTER TABLE users ADD COLUMN phone TEXT;`);
  } catch (e) {}
  
  try {
    await db.exec(`ALTER TABLE requests ADD COLUMN targetShiftId TEXT;`);
  } catch (e) {}

  try {
    await db.exec(`ALTER TABLE requests ADD COLUMN targetUserId TEXT;`);
  } catch (e) {}

  return db;
}

module.exports = { getDbConnection };
