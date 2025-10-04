"use server";

import z from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user, organization } from "@/db/schema/auth";
import { eq } from "drizzle-orm";

const CreateUserSchema = z.object({
  name: z.string(),
  email: z.email(),
});

export async function register(formData: FormData) {
  try {
    const raw = Object.fromEntries(formData);

    const { name, email } = CreateUserSchema.parse(raw);

    console.log({ name, email });
  } catch (error) {
    console.error(error);
  }
}

export async function getCurrentUser() {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(),
    });

    if (!session?.user) {
      return null;
    }

    const userData = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        organizationName: organization.name,
        organizationType: organization.type,
      })
      .from(user)
      .leftJoin(organization, eq(user.organizationId, organization.id))
      .where(eq(user.id, session.user.id))
      .limit(1);

    return userData[0] || null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}
