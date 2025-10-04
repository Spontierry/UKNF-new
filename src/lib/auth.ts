import { db } from "@/db";
import { sendEmail } from "@/services/mailing";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
  }),
  emailAndPassword: {
    enabled: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, token, url }) => {
      await sendEmail(
        user.email,
        "Verify your email",
        `Click <a href="${url}">here</a> to verify your email`
      );
    },
    sendOnSignUp: false,
    expiresIn: 60 * 60, // 1 hour
    autoSignInAfterVerification: false,
  },
  plugins: [nextCookies()],
});
