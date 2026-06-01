import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import type { AppEnv } from "./types.js";
import authRoutes from "./routes/auth.js";
import tournamentRoutes from "./routes/tournaments.js";

const app = new Hono<AppEnv>();

const allowedOrigins = process.env["ALLOWED_ORIGINS"]?.split(",") ?? [
  "http://localhost:5173",
];

app.use(
  "*",
  cors({
    origin: allowedOrigins,
    credentials: false,
    allowMethods: ["GET", "POST", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use("*", secureHeaders());

app.get("/health", (c) => c.json({ ok: true, ts: new Date().toISOString() }));

app.route("/auth", authRoutes);
app.route("/tournaments", tournamentRoutes);

export default app;
