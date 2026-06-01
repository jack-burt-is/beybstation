import { api } from "./api.js";

export const web = new sst.aws.StaticSite("BeybstationWeb", {
  path: "packages/web",
  build: {
    command: "pnpm build",
    output: "dist",
  },
  domain: $app.stage === "prod"
    ? { name: "beybstation.com", redirects: ["www.beybstation.com"] }
    : undefined,
  environment: {
    VITE_API_URL: api.url,
  },
  errorPage: "index.html",
  dev: {
    command: "pnpm dev",
    autostart: true,
    url: "http://localhost:5173",
  },
});
