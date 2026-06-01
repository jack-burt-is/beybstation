import { api } from "./api.js";

export const web = new sst.aws.StaticSite("BeybstationWeb", {
  path: "packages/web",
  build: {
    command: "pnpm build",
    output: "dist",
  },
  environment: {
    VITE_API_URL: api.url,
  },
  errorPage: "index.html",
});
