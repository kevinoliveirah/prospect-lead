import "dotenv/config";
import { pool } from "./src/db/pool.js";

async function migrate() {
  console.log("Adding missing columns to companies table...");
  try {
    const columns = [
      { name: "email", type: "TEXT" },
      { name: "revenue_estimate", type: "TEXT" },
      { name: "business_type", type: "TEXT" }
    ];

    for (const col of columns) {
      try {
        await pool.query(`ALTER TABLE companies ADD COLUMN ${col.name} ${col.type}`);
        console.log(`Added column: ${col.name}`);
      } catch (err) {
        if (err.message.includes("duplicate column name")) {
          console.log(`Column ${col.name} already exists.`);
        } else {
          throw err;
        }
      }
    }
    console.log("Migration complete!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    process.exit(0);
  }
}

migrate();
