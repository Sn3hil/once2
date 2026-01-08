import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@once/database";
import { config } from "dotenv";
import { user, session, account, verification } from "@once/database";

config({ path: "../../../../.env" });

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: { user, session, account, verification }
    }),
    emailAndPassword: {
        enabled: true
    },
    trustedOrigins: [
        "http://localhost:3000"
    ]
    // socialProviders: {
    //     google: {
    //         clientId: process.env.GOOGLE_CLIENT_ID!,
    //         clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    //     },
    //     github: {
    //         clientId: process.env.GITHUB_CLIENT_ID!,
    //         clientSecret: process.env.GITHUB_CLIENT_SECRET!
    //     }
    // }
})