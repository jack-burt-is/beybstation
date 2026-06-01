/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "beybstation",
      removal: input?.stage === "prod" ? "retain" : "remove",
      protect: ["prod"].includes(input?.stage ?? ""),
      home: "aws",
      providers: {
        aws: {
          region: "eu-west-2",
        },
      },
    };
  },
  async run() {
    const { secrets } = await import("./infra/secrets.js");
    const { table } = await import("./infra/database.js");
    const { api } = await import("./infra/api.js");
    const { web } = await import("./infra/web.js");

    return {
      api: api.url,
      web: web.url,
    };
  },
});
