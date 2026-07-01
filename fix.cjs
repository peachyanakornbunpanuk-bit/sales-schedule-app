require('dotenv').config({ path: 'backend/.env' });
const { createClient } = require('@libsql/client');

async function fix() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const res = await client.execute("UPDATE users SET role = 'sales' WHERE role = 'Sales Employee'");
  console.log('Fixed', res.rowsAffected, 'users');
}
fix().catch(console.error);
