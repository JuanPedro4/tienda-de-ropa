const { defineConfig } = require("@medusajs/utils");
const { modules } = require("./src/modules");

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseSchema: "public",
    redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
    http: {
      storeCors: process.env.STORE_CORS ?? "http://localhost:3000",
      adminCors: process.env.ADMIN_CORS ?? "http://localhost:5173",
      authCors: process.env.AUTH_CORS ?? "http://localhost:3000",
      jwtSecret: process.env.MEDUSA_JWT_SECRET ?? "default-jwt-secret-change-in-production",
      cookieSecret: process.env.COOKIE_SECRET ?? "default-cookie-secret-change-in-production",
    },
  },
  admin: {
    disable: process.env.DISABLE_ADMIN === "true",
  },
  modules,
});
