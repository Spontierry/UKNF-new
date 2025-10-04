"use server";

import { CreateUserSchema } from "@/schemas/auth";
import { zfd } from "zod-form-data";
import { actionClient } from "@/lib/safe-action";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { profile, user as userSchema } from "@/db/schema";
import { auth } from "@/lib/auth";
import { generateId } from "better-auth";
import { redirect } from "next/navigation";
import { z } from "zod";

const RegisterFormSchema = zfd.formData({
  email: zfd.text(CreateUserSchema.shape.email),
  firstName: zfd.text(CreateUserSchema.shape.firstName),
  lastName: zfd.text(CreateUserSchema.shape.lastName),
  pesel: zfd.text(CreateUserSchema.shape.pesel),
  phone: zfd.text(CreateUserSchema.shape.phone),
  userType: zfd.text(CreateUserSchema.shape.userType),
});

export const register = actionClient
  .inputSchema(RegisterFormSchema)
  .action(async ({ parsedInput }) => {
    const { email, firstName, lastName, pesel, phone, userType } = parsedInput;

    // Check if user already exists
    const existingUser = await db.query.user.findFirst({
      where: eq(userSchema.email, email),
    });

    if (existingUser) {
      return { error: "User already exists" };
    }

    const { user } = await auth.api.signUpEmail({
      body: {
        email,
        name: `${firstName} ${lastName}`,
        password: "12312awsdasd123",
      },
    });

    await db.insert(profile).values({
      id: generateId(),
      userId: user.id,
      userType,
    });

    await auth.api.sendVerificationEmail({
      body: {
        email: user.email,
        callbackURL: "/",
      },
    });
  });

const LoginFormSchema = zfd.formData({
  email: zfd.text(CreateUserSchema.shape.email),
  password: zfd.text(z.string()),
});

export const login = actionClient
  .inputSchema(LoginFormSchema)
  .action(async ({ parsedInput }) => {
    const { email, password } = parsedInput;

    const { user } = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    if (!user) {
      return { error: "Invalid credentials" };
    }

    return redirect("/dashboard");
  });
