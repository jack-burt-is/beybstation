import { secrets } from "./secrets.js";
import { table } from "./database.js";

export const api = new sst.aws.Function("BeybstationApi", {
  handler: "packages/api/src/index.handler",
  runtime: "nodejs22.x",
  memory: "512 MB",
  timeout: "30 seconds",
  url: {
    cors: false,
  },
  environment: {
    NODE_ENV: $app.stage === "prod" ? "production" : "development",
    STAGE: $app.stage,
    ALLOWED_ORIGINS: $app.stage === "prod"
      ? "https://beybstation.co.uk"
      : "http://localhost:5173",
    TABLE_NAME: table.name,
  },
  link: [secrets.adminPassword, secrets.jwtSecret, table],
});
