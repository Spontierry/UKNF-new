import { db } from "@/db";
import {
  fileUpload,
  fileAccess,
  fileAuditLog,
  NewFileUpload,
  NewFileAccess,
  NewFileAuditLog,
} from "@/db/schema";
import { eq, and, desc, gt, lt } from "drizzle-orm";
import { S3Service } from "./s3";

export interface FileUploadRequest {
  userId: string;
  originalName: string;
  mimeType: string;
  size: number;
  metadata?: Record<string, any>;
}

export interface FileAccessRequest {
  fileId: string;
  userId: string;
  action: "read" | "write" | "delete";
  grantedBy: string;
  expiresAt?: Date;
}

export interface AuditLogEntry {
  fileId: string;
  userId: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export class FileService {
  /**
   * Create a new file upload record
   */
  static async createFileUpload(
    request: FileUploadRequest,
    key: string,
    uploadId?: string
  ) {
    const fileRecord: NewFileUpload = {
      id: crypto.randomUUID(),
      userId: request.userId,
      originalName: request.originalName,
      fileName: key,
      mimeType: request.mimeType,
      size: request.size,
      key,
      status: "pending",
      uploadId,
      metadata: request.metadata ? JSON.stringify(request.metadata) : null,
    };

    const [result] = await db.insert(fileUpload).values(fileRecord).returning();
    return result;
  }

  /**
   * Update file upload status
   */
  static async updateFileUploadStatus(
    fileId: string,
    status: "pending" | "uploading" | "completed" | "failed",
    etag?: string,
    version?: string
  ) {
    await db
      .update(fileUpload)
      .set({
        status,
        etag,
        version,
        updatedAt: new Date(),
      })
      .where(eq(fileUpload.id, fileId));
  }

  /**
   * Get file upload by ID
   */
  static async getFileUpload(fileId: string) {
    const [result] = await db
      .select()
      .from(fileUpload)
      .where(eq(fileUpload.id, fileId))
      .limit(1);

    return result;
  }

  /**
   * Get file upload by key
   */
  static async getFileUploadByKey(key: string) {
    const [result] = await db
      .select()
      .from(fileUpload)
      .where(eq(fileUpload.key, key))
      .limit(1);

    return result;
  }

  /**
   * Get user's files
   */
  static async getUserFiles(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ) {
    return db
      .select()
      .from(fileUpload)
      .where(eq(fileUpload.userId, userId))
      .orderBy(desc(fileUpload.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Delete file upload record
   */
  static async deleteFileUpload(fileId: string) {
    await db.delete(fileUpload).where(eq(fileUpload.id, fileId));
  }

  /**
   * Grant file access to a user
   */
  static async grantFileAccess(request: FileAccessRequest) {
    const accessRecord: NewFileAccess = {
      id: crypto.randomUUID(),
      fileId: request.fileId,
      userId: request.userId,
      action: request.action,
      grantedBy: request.grantedBy,
      expiresAt: request.expiresAt,
    };

    const [result] = await db
      .insert(fileAccess)
      .values(accessRecord)
      .returning();
    return result;
  }

  /**
   * Check if user has access to a file
   */
  static async hasFileAccess(
    fileId: string,
    userId: string,
    action: "read" | "write" | "delete"
  ): Promise<boolean> {
    // Check if user is the owner
    const file = await this.getFileUpload(fileId);
    if (file?.userId === userId) {
      return true;
    }

    // Check explicit access grants
    const access = await db
      .select()
      .from(fileAccess)
      .where(
        and(
          eq(fileAccess.fileId, fileId),
          eq(fileAccess.userId, userId),
          eq(fileAccess.action, action),
          // Check if access hasn't expired
          fileAccess.expiresAt
            ? gt(fileAccess.expiresAt, new Date())
            : undefined
        )
      )
      .limit(1);

    return access.length > 0;
  }

  /**
   * Revoke file access
   */
  static async revokeFileAccess(
    fileId: string,
    userId: string,
    action: string
  ) {
    await db
      .delete(fileAccess)
      .where(
        and(
          eq(fileAccess.fileId, fileId),
          eq(fileAccess.userId, userId),
          eq(fileAccess.action, action)
        )
      );
  }

  /**
   * Log file access for audit purposes
   */
  static async logFileAccess(entry: AuditLogEntry) {
    const logRecord: NewFileAuditLog = {
      id: crypto.randomUUID(),
      fileId: entry.fileId,
      userId: entry.userId,
      action: entry.action,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
      metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
    };

    await db.insert(fileAuditLog).values(logRecord);
  }

  /**
   * Get file audit logs
   */
  static async getFileAuditLogs(fileId: string, limit: number = 100) {
    return db
      .select()
      .from(fileAuditLog)
      .where(eq(fileAuditLog.fileId, fileId))
      .orderBy(desc(fileAuditLog.createdAt))
      .limit(limit);
  }

  /**
   * Complete file upload process
   */
  static async completeFileUpload(
    fileId: string,
    etag: string,
    version?: string
  ) {
    await this.updateFileUploadStatus(fileId, "completed", etag, version);

    // Log the upload completion
    const file = await this.getFileUpload(fileId);
    if (file) {
      await this.logFileAccess({
        fileId,
        userId: file.userId,
        action: "upload_completed",
        metadata: { etag, version },
      });
    }
  }

  /**
   * Delete file and all related data
   */
  static async deleteFile(fileId: string, userId: string) {
    const file = await this.getFileUpload(fileId);
    if (!file) {
      throw new Error("File not found");
    }

    // Check if user has delete access
    const hasAccess = await this.hasFileAccess(fileId, userId, "delete");
    if (!hasAccess) {
      throw new Error("Access denied");
    }

    // Delete from S3
    await S3Service.deleteFile(file.key);

    // Delete access records
    await db.delete(fileAccess).where(eq(fileAccess.fileId, fileId));

    // Delete audit logs
    await db.delete(fileAuditLog).where(eq(fileAuditLog.fileId, fileId));

    // Delete file record
    await this.deleteFileUpload(fileId);

    // Log the deletion
    await this.logFileAccess({
      fileId,
      userId,
      action: "delete",
      metadata: { originalName: file.originalName, size: file.size },
    });
  }

  /**
   * Get download URL for a file
   */
  static async getDownloadUrl(
    fileId: string,
    userId: string,
    expiresIn: number = 3600
  ) {
    const file = await this.getFileUpload(fileId);
    if (!file) {
      throw new Error("File not found");
    }

    // Check if user has read access
    const hasAccess = await this.hasFileAccess(fileId, userId, "read");
    if (!hasAccess) {
      throw new Error("Access denied");
    }

    // Generate presigned URL
    const url = await S3Service.generatePresignedDownloadUrl(
      file.key,
      expiresIn
    );

    // Log the download access
    await this.logFileAccess({
      fileId,
      userId,
      action: "download",
      metadata: { expiresIn },
    });

    return {
      url,
      fileName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
    };
  }

  /**
   * Clean up expired files
   */
  static async cleanupExpiredFiles() {
    const expiredFiles = await db
      .select()
      .from(fileUpload)
      .where(
        and(
          eq(fileUpload.status, "pending"),
          lt(fileUpload.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000)) // 24 hours ago
        )
      );

    for (const file of expiredFiles) {
      try {
        // Delete from S3 if it exists
        if (file.uploadId) {
          await S3Service.abortMultipartUpload(file.key, file.uploadId);
        }

        // Delete database record
        await this.deleteFileUpload(file.id);
      } catch (error) {
        console.error(`Failed to cleanup expired file ${file.id}:`, error);
      }
    }

    return expiredFiles.length;
  }
}

export default FileService;
