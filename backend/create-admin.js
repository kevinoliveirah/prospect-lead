import sqlite3 from 'sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const dbPath = path.resolve(process.cwd(), 'mapa_b2b.sqlite');
const db = new sqlite3.Database(dbPath);

async function createUser() {
  const name = 'Administrador';
  const email = 'admin@prospect.com';
  const password = 'prospect123';
  const id = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(password, 10);

  db.run(
    'INSERT OR REPLACE INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)',
    [id, name, email, passwordHash],
    (err) => {
      if (err) {
        console.error('Error creating user:', err);
      } else {
        console.log('User admin@prospect.com created successfully with password prospect123');
      }
      db.close();
    }
  );
}

createUser();
