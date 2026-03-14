import "dotenv/config";
console.log("[DEBUG] Starting server - environment loaded");
import express from "express"; // Restarted at 2026-03-13 20:47
console.log("[DEBUG] Express imported");
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.js";
import companiesRoutes from "./routes/companies.js";
import leadsRoutes from "./routes/leads.js";
import dashboardRoutes from "./routes/dashboard.js";
import aiRoutes from "./routes/ai.js";
import { errorHandler } from "./middleware/error.js";

const app = express();

// Global request logger for debugging
app.use((req, _res, next) => {
  console.log(`[DEBUG] Incoming ${req.method} request to ${req.url} from ${req.headers.origin}`);
  next();
});

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all origins for local development to ensure it "just works"
      // When credentials are true, origin cannot be "*"
      callback(null, true);
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10000 // High limit for debugging
  })
);

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "mapa-b2b-api" });
});

app.use("/auth", authRoutes);
app.use("/companies", companiesRoutes);
app.use("/leads", leadsRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/ai", aiRoutes);

app.use(errorHandler);

const port = Number(env.PORT) || 4000;
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
