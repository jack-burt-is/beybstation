import { Hono } from "hono";
import type { AppEnv } from "../types.js";
import { signAdminToken } from "../lib/auth.js";
import type { AuthResponse } from "@beybstation/shared";

const router = new Hono<AppEnv>();

router.post("/login", async (c) => {
  const body = await c.req.json<{ password?: string }>();
  const adminPassword = process.env["ADMIN_PASSWORD"];

  if (!adminPassword) {
    return c.json({ error: "Server misconfigured" }, 500);
  }

  if (!body.password || body.password !== adminPassword) {
    return c.json({ error: "Wrong password" }, 401);
  }

  const token = await signAdminToken();
  return c.json<AuthResponse>({ token });
});

export default router;
