import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function hashPasswords() {
  const [users] = await db.execute("SELECT id, username, password FROM users");

  for (const user of users) {
    // Only hash if not already hashed
    if (!user.password.startsWith('$2b$')) {
      const hashed = await bcrypt.hash(user.password, 10);
      await db.execute("UPDATE users SET password = ? WHERE id = ?", [hashed, user.id]);
      console.log(`✅ Hashed password for user: ${user.username}`);
    }
  }

  console.log("🎉 All user passwords hashed!");
  await db.end();
}

hashPasswords().catch(console.error);
