import { db } from "@/db";
import { profile } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getProfile(userId: string) {
  return db.query.profile.findFirst({
    where: eq(profile.userId, userId),
  });
}
