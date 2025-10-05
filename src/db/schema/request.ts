import { RequestStatus, RequestType } from "@/db/schema/enums";
import { relations } from "drizzle-orm";
import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const request = pgTable("request", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  status: RequestStatus("status").notNull(),
  type: RequestType("type").notNull(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const requestRelations = relations(request, ({ one }) => ({
  user: one(user, {
    fields: [request.userId],
    references: [user.id],
  }),
}));

export type Request = typeof request.$inferSelect;
