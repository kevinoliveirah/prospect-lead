import { pool } from "./src/db/pool.js";
import crypto from "crypto";
import "dotenv/config";

async function test() {
  const id = crypto.randomUUID();
  const text = `INSERT INTO users (id, name, email, password_hash, company)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, company, created_at`;
  const params = [id, "Test", "test4@example.com", "hash", "comp"];
  
  console.log("Starting test insert...");
  try {
    const result = await pool.query(text, params);
    console.log("Result:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("Error during insert:", err);
  }
}
test();
