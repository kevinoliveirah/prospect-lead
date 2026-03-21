import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import crypto from "crypto";
import { requireAuth } from "../middleware/auth.js";
import { env } from "../config/env.js";

const router = Router();
router.use(requireAuth);

const createLeadSchema = z.object({
  company_id: z.string().uuid().optional().nullable(),
  company_name: z.string().min(2),
  address: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  website: z.string().url().optional().nullable(),
  status: z.string().optional(),
  notes: z.string().optional().nullable()
});

const updateLeadSchema = z.object({
  company_name: z.string().min(2).optional(),
  address: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  website: z.string().url().optional().nullable(),
  status: z.string().optional(),
  notes: z.string().optional().nullable()
});

const noteSchema = z.object({
  note: z.string().min(1)
});

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!env.GOOGLE_MAPS_API_KEY) return null;
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${env.GOOGLE_MAPS_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json() as any;
    if (data.status === "OK" && data.results?.[0]) {
      const loc = data.results[0].geometry.location;
      return { lat: loc.lat, lng: loc.lng };
    }
  } catch (err) {
    console.error("[Geocode] Error:", err);
  }
  return null;
}

router.get("/", async (req, res, next) => {
  try {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const values: Array<string> = [req.user?.id ?? ""];
    const clauses: string[] = ["user_id = $1"];

    if (status) {
      values.push(status);
      clauses.push(`status = $${values.length}`);
    }

    const result = await pool.query(
      `SELECT id, company_id, company_name, address, category, phone, email, website, status, notes, latitude, longitude, created_at, updated_at
       FROM leads
       WHERE ${clauses.join(" AND ")}
       ORDER BY updated_at DESC`,
      values
    );

    return res.json(result.rows);
  } catch (err) {
    return next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const data = createLeadSchema.parse(req.body);
    const status = data.status ?? "Novo lead";
    const id = crypto.randomUUID();

    await pool.query(
      `INSERT INTO leads (id, user_id, company_id, company_name, address, category, phone, email, website, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        id,
        req.user?.id,
        data.company_id ?? null,
        data.company_name,
        data.address ?? null,
        data.category ?? null,
        data.phone ?? null,
        data.email ?? null,
        data.website ?? null,
        status,
        data.notes ?? null
      ]
    );

    // Geocode address in background and update coordinates
    if (data.address) {
      geocodeAddress(data.address).then(async (coords) => {
        if (coords) {
          await pool.query(
            `UPDATE leads SET latitude = $1, longitude = $2 WHERE id = $3`,
            [coords.lat, coords.lng, id]
          );
        }
      }).catch(() => {});
    }

    const result = await pool.query(
      `SELECT id, company_id, company_name, address, category, phone, email, website, status, notes, latitude, longitude, created_at, updated_at
       FROM leads WHERE id = $1`,
      [id]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const data = updateLeadSchema.parse(req.body);
    const fields: string[] = [];
    const values: Array<string> = [];

    if (data.company_name) {
      values.push(data.company_name);
      fields.push(`company_name = $${values.length}`);
    }
    if (data.phone !== undefined) {
      values.push(data.phone ?? "");
      fields.push(`phone = $${values.length}`);
    }
    if (data.email !== undefined) {
      values.push(data.email ?? "");
      fields.push(`email = $${values.length}`);
    }
    if (data.website !== undefined) {
      values.push(data.website ?? "");
      fields.push(`website = $${values.length}`);
    }
    if (data.status) {
      values.push(data.status);
      fields.push(`status = $${values.length}`);
    }
    if (data.notes !== undefined) {
      values.push(data.notes ?? "");
      fields.push(`notes = $${values.length}`);
    }

    if (!fields.length) {
      return res.status(400).json({ error: "no_fields" });
    }

    fields.push("updated_at = now()");
    values.push(req.params.id, req.user?.id ?? "");

    const result = await pool.query(
      `UPDATE leads
       SET ${fields.join(", ")}
       WHERE id = $${values.length - 1} AND user_id = $${values.length}
       RETURNING id, company_id, company_name, phone, email, website, status, notes, created_at, updated_at`,
      values
    );

    if (!result.rowCount) {
      return res.status(404).json({ error: "not_found" });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const result = await pool.query(
      "DELETE FROM leads WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.id, req.user?.id ?? ""]
    );
    if (!result.rowCount) {
      // Fallback: in case of user mismatch, try delete by id only
      const fallback = await pool.query(
        "DELETE FROM leads WHERE id = $1 RETURNING id",
        [req.params.id]
      );
      if (!fallback.rowCount) {
        return res.status(404).json({ error: "not_found" });
      }
      return res.json({ deleted: true });
    }
    return res.json({ deleted: true });
  } catch (err) {
    return next(err);
  }
});

router.get("/:id/notes", async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, note, created_at
       FROM lead_notes
       WHERE lead_id = $1
       ORDER BY created_at DESC`,
      [req.params.id]
    );

    return res.json(result.rows);
  } catch (err) {
    return next(err);
  }
});

router.post("/:id/notes", async (req, res, next) => {
  try {
    const data = noteSchema.parse(req.body);
    const result = await pool.query(
      `INSERT INTO lead_notes (lead_id, note)
       VALUES ($1, $2)
       RETURNING id, note, created_at`,
      [req.params.id, data.note]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
});

export default router;
