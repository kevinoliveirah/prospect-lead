import sqlite3 from 'sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.resolve(process.cwd(), 'mapa_b2b.sqlite');
const db = new sqlite3.Database(dbPath);

async function check() {
  const email = 'teste@exemplo.com';
  const password = '123456'; // Assuming this was the password
  
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      console.error('Error:', err);
      return;
    }
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('User found:', user.email);
    const valid = await bcrypt.compare(password, user.password_hash);
    console.log('Password valid:', valid);
    db.close();
  });
}

check();
