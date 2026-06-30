require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { getDbConnection } = require('./db.cjs');

async function seed() {
  const db = await getDbConnection();
  
  // Check if admin exists
  const existingAdmin = await db.get('SELECT * FROM users WHERE email = ?', ['admin@example.com']);
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('123456', 10);
    const id = crypto.randomUUID();
    await db.run(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [id, 'Super Admin', 'admin@example.com', hashedPassword, 'admin']
    );
    console.log('Seeded admin user: admin@example.com / 123456');
  } else {
    console.log('Admin already exists.');
  }

  const existingEmp = await db.get('SELECT * FROM users WHERE email = ?', ['emp001@example.com']);
  if (!existingEmp) {
    const hashedPassword = await bcrypt.hash('123456', 10);
    const id = crypto.randomUUID();
    await db.run(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [id, 'Employee 001', 'emp001@example.com', hashedPassword, 'sales']
    );
    console.log('Seeded employee user: emp001@example.com / 123456');
  }
}

seed().catch(console.error);
