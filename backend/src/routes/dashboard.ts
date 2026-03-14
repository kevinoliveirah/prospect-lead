import { Router } from "express";
import { pool } from "../db/pool";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/summary", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user?.id ?? "";
    const totalResult = await pool.query(
      "SELECT COUNT(*) AS total FROM leads WHERE user_id = $1",
      [userId]
    );

    const byStatusResult = await pool.query(
      "SELECT status, COUNT(*) AS count FROM leads WHERE user_id = $1 GROUP BY status ORDER BY count DESC",
      [userId]
    );

    const recentResult = await pool.query(
      "SELECT id, company_name, status, updated_at FROM leads WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 5",
      [userId]
    );

    return res.json({
      total: totalResult.rows[0]?.total ?? 0,
      by_status: byStatusResult.rows,
      recent: recentResult.rows
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
