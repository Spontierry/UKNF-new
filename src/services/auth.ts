"use server";

import { getProfile } from "@/dal/profiles";
import { auth } from "@/lib/auth";
import { UserWithProfile } from "@/types/user";
import { headers } from "next/headers";
import z from "zod";

export async function getCurrentUserWithProfile(): Promise<UserWithProfile | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  const profile = await getProfile(session.user.id);

  if (!profile) {
    return null;
  }

  return { user: session.user, profile };
}
