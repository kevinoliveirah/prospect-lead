import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().optional(),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  CORS_ORIGIN: z.string().optional()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
