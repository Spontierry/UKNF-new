import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  text,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const fileUpload = pgTable("file_upload", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  originalName: text("original_name").notNull(),
  fileName: text("file_name").notNull(), // Generated unique filename
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  bucket: text("bucket").notNull().default("uknf-files"),
  key: text("key").notNull(), // S3 object key
  status: text("status").notNull().default("pending"), // pending, uploading, completed, failed
  uploadId: text("upload_id"), // For multipart uploads
  etag: text("etag"),
  version: text("version"), // S3 version ID
  metadata: text("metadata"), // JSON string of additional metadata
  isPublic: boolean("is_public").default(false),
  expiresAt: timestamp("expires_at"), // For temporary files
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const fileAccess = pgTable("file_access", {
  id: text("id").primaryKey(),
  fileId: text("file_id").notNull(),
  userId: text("user_id").notNull(),
  action: text("action").notNull(), // read, write, delete
  grantedBy: text("granted_by").notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const fileAuditLog = pgTable("file_audit_log", {
  id: text("id").primaryKey(),
  fileId: text("file_id").notNull(),
  userId: text("user_id").notNull(),
  action: text("action").notNull(), // upload, download, delete, share, etc.
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  metadata: text("metadata"), // JSON string of additional audit data
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const fileUploadRelations = relations(fileUpload, ({ one }) => ({
  user: one(user, {
    fields: [fileUpload.userId],
    references: [user.id],
  }),
}));

export const fileAccessRelations = relations(fileAccess, ({ one }) => ({
  file: one(fileUpload, {
    fields: [fileAccess.fileId],
    references: [fileUpload.id],
  }),
  user: one(user, {
    fields: [fileAccess.userId],
    references: [user.id],
  }),
  grantedByUser: one(user, {
    fields: [fileAccess.grantedBy],
    references: [user.id],
  }),
}));

export const fileAuditLogRelations = relations(fileAuditLog, ({ one }) => ({
  file: one(fileUpload, {
    fields: [fileAuditLog.fileId],
    references: [fileUpload.id],
  }),
  user: one(user, {
    fields: [fileAuditLog.userId],
    references: [user.id],
  }),
}));

// Types
export type FileUpload = typeof fileUpload.$inferSelect;
export type FileAccess = typeof fileAccess.$inferSelect;
export type FileAuditLog = typeof fileAuditLog.$inferSelect;

export type NewFileUpload = typeof fileUpload.$inferInsert;
export type NewFileAccess = typeof fileAccess.$inferInsert;
export type NewFileAuditLog = typeof fileAuditLog.$inferInsert;
