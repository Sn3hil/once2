import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: "../../.env" }); // process.cwd is not correct here , change it

export default defineConfig({
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!
    },
    schema: ["./src/schema.ts", "./src/auth-schema.ts"],
    out: "./drizzle",
});
