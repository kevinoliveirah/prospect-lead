import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { pool } from "../db/pool.js";
import { env } from "../config/env.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  company: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

router.post("/register", async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
      data.email
    ]);

    if (existing.rowCount) {
      return res.status(409).json({ error: "email_in_use" });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const id = crypto.randomUUID();
    const result = await pool.query(
      `INSERT INTO users (id, name, email, password_hash, company)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, company, created_at`,
      [id, data.name, data.email, passwordHash, data.company ?? null]
    );

    const user = result.rows[0];
    if (!user) {
      console.log(`[AUTH] Registration failed: No user returned after insert for email ${data.email}`);
      return res.status(500).json({ error: "internal_server_error" });
    }

    console.log(`[AUTH] Registration successful for email ${data.email}`);

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({ user, token });
  } catch (err) {
    console.error(`[AUTH] Registration error for email ${req.body?.email}:`, err);
    return next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await pool.query(
      "SELECT id, name, email, password_hash, company FROM users WHERE email = $1",
      [data.email]
    );

    const user = result.rows[0];
    if (!user) {
      console.log(`[AUTH] Login failed: User not found for email ${data.email}`);
      return res.status(401).json({ error: "invalid_credentials" });
    }

    const valid = await bcrypt.compare(data.password, user.password_hash);
    if (!valid) {
      console.log(`[AUTH] Login failed: Invalid password for email ${data.email}`);
      return res.status(401).json({ error: "invalid_credentials" });
    }
    
    console.log(`[AUTH] Login successful for email ${data.email}`);

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company
      },
      token
    });
  } catch (err) {
    return next(err);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, company, created_at FROM users WHERE id = $1",
      [req.user?.id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ error: "not_found" });
    }

    return res.json({ user: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

export default router;
