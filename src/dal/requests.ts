import { db } from "@/db";
import { request } from "@/db/schema/request";
import {
  REQUEST_DATA_SCHEMA,
  RequestStatus,
  RequestType,
} from "@/schemas/request";
import { generateId } from "better-auth";
import { and, eq } from "drizzle-orm";

export async function createRequest({
  data,
  type,
  status,
  userId,
}: Omit<typeof request.$inferInsert, "id" | "createdAt" | "updatedAt">) {
  return await db.insert(request).values({
    id: generateId(),
    data: JSON.stringify(data),
    type,
    status,
    userId,
  });
}

export async function getUserRequests(userId: string) {
  return db.query.request.findMany({
    where: eq(request.userId, userId),
  });
}

export async function getUserRequestsOfType<T extends RequestType>(
  userId: string,
  type: T
) {
  const requests = await db.query.request.findMany({
    where: and(eq(request.userId, userId), eq(request.type, type)),
  });

  const schema = REQUEST_DATA_SCHEMA[type];

  return requests.map((request) => ({
    ...request,
    data: schema.parse(request.data),
  }));
}

export async function changeRequestStatus(
  requestId: string,
  status: RequestStatus
) {
  return db.update(request).set({ status }).where(eq(request.id, requestId));
}
