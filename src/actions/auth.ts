"use server";

import { CompleteRegistrationSchema, CreateUserSchema } from "@/schemas/auth";
import { zfd } from "zod-form-data";
import { actionClient } from "@/lib/safe-action";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { profile, user as userSchema } from "@/db/schema";
import { auth } from "@/lib/auth";
import { generateId } from "better-auth";
import { redirect } from "next/navigation";
import { z } from "zod";
import { changeRequestStatus, createRequest } from "@/dal/requests";
import { REQUEST_STATUS, REQUEST_TYPE } from "@/schemas/request";
import { headers } from "next/headers";

const DEFAULT_PASSWORD = "D3F_P4SSWORD_CHANG3" as const;

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
        password: DEFAULT_PASSWORD,
      },
    });

    const profilePromise = db.insert(profile).values({
      id: generateId(),
      userId: user.id,
      userType,
    });

    const requestPromise = createRequest({
      userId: user.id,
      type: REQUEST_TYPE.ADD_USER,
      status: REQUEST_STATUS.CREATED,
      data: {
        pesel,
        phone,
        userType,
      },
    });

    await Promise.all([profilePromise, requestPromise]);

    await auth.api.sendVerificationEmail({
      body: {
        email: user.email,
        callbackURL: "/",
      },
    });

    return redirect("/");
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

const CompleteRegistrationFormSchema = zfd.formData({
  newPassword: zfd.text(CompleteRegistrationSchema.shape.newPassword),
  requestId: zfd.text(z.string()),
});

export const completeRegistration = actionClient
  .inputSchema(CompleteRegistrationFormSchema)
  .action(async ({ parsedInput }) => {
    const { newPassword, requestId } = parsedInput;

    await auth.api.changePassword({
      body: {
        currentPassword: DEFAULT_PASSWORD,
        newPassword,
        revokeOtherSessions: true,
      },
      headers: await headers(),
    });

    await changeRequestStatus(requestId, REQUEST_STATUS.DRAFT);

    return redirect("/dashboard");
  });
