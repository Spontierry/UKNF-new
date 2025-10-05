"use server";

import { auth } from "@/lib/auth";
import { FileService } from "@/services/file";
import { S3Service } from "@/services/s3";
import { actionClient } from "@/lib/safe-action";
import { z } from "zod";
import { headers } from "next/headers";

// Schema for initiating file upload
const initiateUploadSchema = z.object({
  originalName: z.string().min(1, "File name is required"),
  mimeType: z.string().min(1, "MIME type is required"),
  size: z.number().positive("File size must be positive"),
  chunked: z.boolean().default(false),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Schema for completing file upload
const completeUploadSchema = z.object({
  fileId: z.string().uuid("Invalid file ID"),
  etag: z.string().optional(),
});

// Schema for multipart upload completion
const completeMultipartUploadSchema = z.object({
  fileId: z.string().uuid("Invalid file ID"),
  uploadId: z.string().min(1, "Upload ID is required"),
  parts: z.array(
    z.object({
      partNumber: z.number().positive(),
      etag: z.string().min(1),
    })
  ),
});

// Schema for file deletion
const deleteFileSchema = z.object({
  fileId: z.string().uuid("Invalid file ID"),
});

// Schema for granting file access
const grantFileAccessSchema = z.object({
  fileId: z.string().uuid("Invalid file ID"),
  userId: z.string().min(1, "User ID is required"),
  action: z.enum(["read", "write", "delete"]),
  expiresAt: z.date().optional(),
});

// Allowed file types for security
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/zip",
  "application/x-zip-compressed",
];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

/**
 * Initiate file upload process
 */
export const initiateFileUpload = actionClient
  .inputSchema(initiateUploadSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    try {
      // Validate file
      const validation = S3Service.validateFile(
        parsedInput.mimeType,
        parsedInput.size,
        ALLOWED_MIME_TYPES,
        MAX_FILE_SIZE
      );

      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      // Generate unique file key
      const key = S3Service.generateFileKey(
        session.user.id,
        parsedInput.originalName,
        "uploads"
      );

      let uploadId: string | undefined;
      let presignedUrl: string;

      if (parsedInput.chunked && parsedInput.size > 5 * 1024 * 1024) {
        // Use multipart upload for large files
        uploadId = await S3Service.createMultipartUpload(
          key,
          parsedInput.mimeType,
          parsedInput.metadata as Record<string, string>
        );

        // Get presigned URL for first part
        presignedUrl = await S3Service.generatePresignedUploadPartUrl(
          key,
          uploadId,
          1
        );
      } else {
        // Use direct upload for smaller files
        presignedUrl = await S3Service.generatePresignedUploadUrl(
          key,
          parsedInput.mimeType
        );
      }

      // Create database record
      const fileRecord = await FileService.createFileUpload(
        {
          userId: session.user.id,
          originalName: parsedInput.originalName,
          mimeType: parsedInput.mimeType,
          size: parsedInput.size,
          metadata: parsedInput.metadata as Record<string, string>,
        },
        key,
        uploadId
      );

      // Log upload initiation
      await FileService.logFileAccess({
        fileId: fileRecord.id,
        userId: session.user.id,
        action: "upload_initiated",
        metadata: {
          originalName: parsedInput.originalName,
          size: parsedInput.size,
          mimeType: parsedInput.mimeType,
          chunked: parsedInput.chunked,
        },
      });

      return {
        fileId: fileRecord.id,
        presignedUrl,
        key,
        uploadId,
        chunked: parsedInput.chunked,
      };
    } catch (error) {
      console.error("File upload initiation failed:", error);
      return {
        error: "Failed to initiate file upload",
      };
    }
  });

/**
 * Complete direct file upload
 */
export const completeFileUpload = actionClient
  .inputSchema(completeUploadSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    try {
      const file = await FileService.getFileUpload(parsedInput.fileId);
      if (!file) {
        return {
          success: false,
          error: "File not found",
        };
      }

      if (file.userId !== session.user.id) {
        return {
          success: false,
          error: "Access denied",
        };
      }

      await FileService.completeFileUpload(
        parsedInput.fileId,
        parsedInput.etag || "direct-upload"
      );

      return {
        success: true,
        data: { fileId: parsedInput.fileId },
      };
    } catch (error) {
      console.error("File upload completion failed:", error);
      return {
        success: false,
        error: "Failed to complete file upload",
      };
    }
  });

/**
 * Complete multipart file upload
 */
export const completeMultipartUpload = actionClient
  .inputSchema(completeMultipartUploadSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    try {
      const file = await FileService.getFileUpload(parsedInput.fileId);
      if (!file) {
        return {
          success: false,
          error: "File not found",
        };
      }

      if (file.userId !== session.user.id) {
        return {
          success: false,
          error: "Access denied",
        };
      }

      // Complete multipart upload in S3
      const etag = await S3Service.completeMultipartUpload(
        file.key,
        parsedInput.uploadId,
        parsedInput.parts
      );

      // Update database record
      await FileService.completeFileUpload(parsedInput.fileId, etag);

      return {
        success: true,
        data: { fileId: parsedInput.fileId, etag },
      };
    } catch (error) {
      console.error("Multipart upload completion failed:", error);
      return {
        success: false,
        error: "Failed to complete multipart upload",
      };
    }
  });

/**
 * Get presigned URL for multipart upload part
 */
export const getMultipartUploadPartUrl = actionClient
  .inputSchema(
    z.object({
      fileId: z.string().uuid("Invalid file ID"),
      partNumber: z.number().positive("Part number must be positive"),
    })
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    try {
      const file = await FileService.getFileUpload(parsedInput.fileId);
      if (!file) {
        return {
          success: false,
          error: "File not found",
        };
      }

      if (file.userId !== session.user.id) {
        return {
          success: false,
          error: "Access denied",
        };
      }

      if (!file.uploadId) {
        return {
          success: false,
          error: "File is not a multipart upload",
        };
      }

      const presignedUrl = await S3Service.generatePresignedUploadPartUrl(
        file.key,
        file.uploadId,
        parsedInput.partNumber
      );

      return {
        success: true,
        data: { presignedUrl, partNumber: parsedInput.partNumber },
      };
    } catch (error) {
      console.error("Failed to get multipart upload part URL:", error);
      return {
        success: false,
        error: "Failed to get upload part URL",
      };
    }
  });

/**
 * Delete file
 */
export const deleteFile = actionClient
  .inputSchema(deleteFileSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    try {
      await FileService.deleteFile(parsedInput.fileId, session.user.id);

      return {
        success: true,
        data: { fileId: parsedInput.fileId },
      };
    } catch (error) {
      console.error("File deletion failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete file",
      };
    }
  });

/**
 * Get file download URL
 */
export const getFileDownloadUrl = actionClient
  .inputSchema(
    z.object({
      fileId: z.string().uuid("Invalid file ID"),
      expiresIn: z.number().positive().max(86400).default(3600), // Max 24 hours
    })
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    try {
      const result = await FileService.getDownloadUrl(
        parsedInput.fileId,
        session.user.id,
        parsedInput.expiresIn
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error("Failed to get download URL:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get download URL",
      };
    }
  });

/**
 * Get user's files
 */
export const getUserFiles = actionClient
  .inputSchema(
    z.object({
      limit: z.number().positive().max(100).default(50),
      offset: z.number().nonnegative().default(0),
    })
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    try {
      const files = await FileService.getUserFiles(
        session.user.id,
        parsedInput.limit,
        parsedInput.offset
      );

      return {
        success: true,
        data: files,
      };
    } catch (error) {
      console.error("Failed to get user files:", error);
      return {
        success: false,
        error: "Failed to get files",
      };
    }
  });

/**
 * Grant file access to another user
 */
export const grantFileAccess = actionClient
  .inputSchema(grantFileAccessSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    try {
      // Check if current user owns the file
      const file = await FileService.getFileUpload(parsedInput.fileId);
      if (!file || file.userId !== session.user.id) {
        return {
          success: false,
          error: "Access denied",
        };
      }

      const access = await FileService.grantFileAccess({
        fileId: parsedInput.fileId,
        userId: parsedInput.userId,
        action: parsedInput.action,
        grantedBy: session.user.id,
        expiresAt: parsedInput.expiresAt,
      });

      // Log the access grant
      await FileService.logFileAccess({
        fileId: parsedInput.fileId,
        userId: session.user.id,
        action: "access_granted",
        metadata: {
          grantedTo: parsedInput.userId,
          action: parsedInput.action,
          expiresAt: parsedInput.expiresAt?.toISOString(),
        },
      });

      return {
        success: true,
        data: access,
      };
    } catch (error) {
      console.error("Failed to grant file access:", error);
      return {
        success: false,
        error: "Failed to grant file access",
      };
    }
  });
