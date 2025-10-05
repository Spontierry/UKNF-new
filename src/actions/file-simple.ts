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

// Schema for file deletion
const deleteFileSchema = z.object({
  fileId: z.string().uuid("Invalid file ID"),
});

// Schema for getting download URL
const getDownloadUrlSchema = z.object({
  fileId: z.string().uuid("Invalid file ID"),
  expiresIn: z.number().positive().max(86400).default(3600),
});

// Schema for getting user files
const getUserFilesSchema = z.object({
  limit: z.number().positive().max(100).default(50),
  offset: z.number().nonnegative().default(0),
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
      throw new Error("Authentication required");
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
        throw new Error(validation.error);
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
          parsedInput.metadata
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
          metadata: parsedInput.metadata,
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
      throw new Error("Failed to initiate file upload");
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
      throw new Error("Authentication required");
    }

    try {
      const file = await FileService.getFileUpload(parsedInput.fileId);
      if (!file) {
        throw new Error("File not found");
      }

      if (file.userId !== session.user.id) {
        throw new Error("Access denied");
      }

      await FileService.completeFileUpload(
        parsedInput.fileId,
        parsedInput.etag || "direct-upload"
      );

      return { fileId: parsedInput.fileId };
    } catch (error) {
      console.error("File upload completion failed:", error);
      throw new Error("Failed to complete file upload");
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
      throw new Error("Authentication required");
    }

    try {
      await FileService.deleteFile(parsedInput.fileId, session.user.id);
      return { fileId: parsedInput.fileId };
    } catch (error) {
      console.error("File deletion failed:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to delete file"
      );
    }
  });

/**
 * Get file download URL
 */
export const getFileDownloadUrl = actionClient
  .inputSchema(getDownloadUrlSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Authentication required");
    }

    try {
      const result = await FileService.getDownloadUrl(
        parsedInput.fileId,
        session.user.id,
        parsedInput.expiresIn
      );

      return result;
    } catch (error) {
      console.error("Failed to get download URL:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to get download URL"
      );
    }
  });

/**
 * Get user's files
 */
export const getUserFiles = actionClient
  .inputSchema(getUserFilesSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Authentication required");
    }

    try {
      const files = await FileService.getUserFiles(
        session.user.id,
        parsedInput.limit,
        parsedInput.offset
      );

      return { files };
    } catch (error) {
      console.error("Failed to get user files:", error);
      throw new Error("Failed to get files");
    }
  });
