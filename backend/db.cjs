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
    if (process.env.RENDER) {
      console.error("FATAL ERROR: You are running on Render but forgot to add TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in the Render Environment Variables tab!");
      process.exit(1);
    }
    
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
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      adminId TEXT NOT NULL,
      action TEXT NOT NULL,
      targetId TEXT NOT NULL,
      details TEXT,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (adminId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS in_app_notifications (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      isRead INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      token TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      expiresAt TEXT NOT NULL,
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

  try {
    await db.exec(`ALTER TABLE schedules ADD COLUMN status TEXT DEFAULT 'published';`);
  } catch (e) {}

  // Update existing schedules to published if status is null
  await db.exec(`UPDATE schedules SET status = 'published' WHERE status IS NULL;`);

  try {
    await db.exec(`ALTER TABLE audit_logs ADD COLUMN ipAddress TEXT;`);
  } catch (e) {}

  try {
    await db.exec(`ALTER TABLE schedules ADD COLUMN recurrence TEXT DEFAULT 'none';`);
  } catch (e) {}

  return db;
}

module.exports = { getDbConnection };
