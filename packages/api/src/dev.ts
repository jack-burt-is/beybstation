import { serve } from "@hono/node-server";
import app from "./app.js";

const port = 3000;
serve({ fetch: app.fetch, port }, () => {
  console.log(`Beybstation API running at http://localhost:${port}`);
});
