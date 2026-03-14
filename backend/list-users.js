import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'mapa_b2b.sqlite');
const db = new sqlite3.Database(dbPath);

db.all('SELECT id, name, email FROM users', (err, rows) => {
  if (err) {
    console.error('Error fetching users:', err);
  } else {
    console.log('Users in database:', rows);
  }
  db.close();
});
