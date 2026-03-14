import sqlite3 from "sqlite3";
import path from "path";
import { env } from "../config/env.js";

const dbPath = path.resolve(process.cwd(), "mapa_b2b.sqlite");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price_cents INTEGER NOT NULL,
      max_searches_per_day INTEGER,
      max_leads INTEGER,
      features TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      company TEXT,
      plan_id TEXT REFERENCES plans(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT,
      phone TEXT,
      website TEXT,
      email TEXT,
      category TEXT,
      city TEXT,
      latitude REAL,
      longitude REAL,
      rating REAL,
      size TEXT,
      revenue_estimate TEXT,
      business_type TEXT, -- 'B2B', 'B2C', 'Both'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS search_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      query TEXT NOT NULL,
      city TEXT,
      radius_km REAL,
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      company_id TEXT REFERENCES companies(id) ON DELETE SET NULL,
      company_name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      website TEXT,
      status TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS lead_notes (
      id TEXT PRIMARY KEY,
      lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      note TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
});

// Polyfill query method to work like pg
export const pool = {
  query: (text: string, params: any[] = []): Promise<any> => {
    return new Promise((resolve, reject) => {
      // In PostgreSQL, parameters are $1, $2. In SQLite, they are ?.
      const sqliteQuery = text.replace(/\$\d+/g, "?").replace(/RETURNING.*/g, "");
      
      const isSelect = sqliteQuery.trim().toUpperCase().startsWith("SELECT");
      
      if (isSelect || sqliteQuery.includes("RETURNING")) {
        db.all(sqliteQuery, params, function (err, rows) {
          if (err) return reject(err);
          resolve({ rows: rows || [], rowCount: rows?.length || 0 });
        });
      } else {
         db.run(sqliteQuery, params, function (err) {
            if (err) return reject(err);
            
            // if it was an insert and had RETURNING logic we simulate by returning the id conceptually OR we just return empty for non-selects
            // To properly simulate returning *, we'd need more logic, but for insert usually returning id is what happens. 
            // the auth route expects users[0] on insert.
            if (text.toUpperCase().includes("RETURNING")) {
                const normalizedText = text.trim().toUpperCase();
                const isInsertUser = normalizedText.startsWith("INSERT INTO USERS");
                if (isInsertUser && params.length >= 3) {
                   resolve({
                     rows: [{
                       id: params[0],
                       name: params[1],
                       email: params[2],
                       company: params[4] ?? null
                     }],
                     rowCount: 1
                   });
                   return;
                }
            }
            resolve({ rows: [], rowCount: this.changes || 0 });
         });
      }
    });
  }
};
