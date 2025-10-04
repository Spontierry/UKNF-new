import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { UserType } from "./enums";
import { relations } from "drizzle-orm";
import { user } from "./auth";

export const profile = pgTable("profile", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  userType: UserType("user_type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const profileRelations = relations(profile, ({ one }) => ({
  user: one(user, {
    fields: [profile.userId],
    references: [user.id],
  }),
}));
