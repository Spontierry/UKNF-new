import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  ListPartsCommand,
  HeadObjectCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";
import { randomBytes } from "crypto";

// S3 Client Configuration
const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT || "http://localhost:9000",
  region: process.env.S3_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "uknf_minio_admin",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "uknf_minio_password",
  },
  forcePathStyle: true, // Required for MinIO
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "uknf-files";

// File upload types
export interface UploadPart {
  partNumber: number;
  etag: string;
}

export interface MultipartUpload {
  uploadId: string;
  key: string;
  parts: UploadPart[];
}

export interface FileMetadata {
  originalName: string;
  mimeType: string;
  size: number;
  userId: string;
  metadata?: Record<string, any>;
}

export class S3Service {
  /**
   * Generate a presigned URL for direct file upload
   */
  static async generatePresignedUploadUrl(
    key: string,
    mimeType: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: mimeType,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
  }

  /**
   * Generate a presigned URL for file download
   */
  static async generatePresignedDownloadUrl(
    key: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
  }

  /**
   * Generate a presigned URL for multipart upload part
   */
  static async generatePresignedUploadPartUrl(
    key: string,
    uploadId: string,
    partNumber: number,
    expiresIn: number = 3600
  ): Promise<string> {
    const command = new UploadPartCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
  }

  /**
   * Initiate a multipart upload
   */
  static async createMultipartUpload(
    key: string,
    mimeType: string,
    metadata?: Record<string, string>
  ): Promise<string> {
    const command = new CreateMultipartUploadCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: mimeType,
      Metadata: metadata,
    });

    const response = await s3Client.send(command);
    if (!response.UploadId) {
      throw new Error("Failed to create multipart upload");
    }

    return response.UploadId;
  }

  /**
   * Complete a multipart upload
   */
  static async completeMultipartUpload(
    key: string,
    uploadId: string,
    parts: UploadPart[]
  ): Promise<string> {
    const command = new CompleteMultipartUploadCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.map((part) => ({
          ETag: part.etag,
          PartNumber: part.partNumber,
        })),
      },
    });

    const response = await s3Client.send(command);
    if (!response.ETag) {
      throw new Error("Failed to complete multipart upload");
    }

    return response.ETag;
  }

  /**
   * Abort a multipart upload
   */
  static async abortMultipartUpload(
    key: string,
    uploadId: string
  ): Promise<void> {
    const command = new AbortMultipartUploadCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      UploadId: uploadId,
    });

    await s3Client.send(command);
  }

  /**
   * List parts of a multipart upload
   */
  static async listMultipartUploadParts(
    key: string,
    uploadId: string
  ): Promise<UploadPart[]> {
    const command = new ListPartsCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      UploadId: uploadId,
    });

    const response = await s3Client.send(command);
    return (
      response.Parts?.map((part) => ({
        partNumber: part.PartNumber!,
        etag: part.ETag!,
      })) || []
    );
  }

  /**
   * Upload a file directly (for smaller files)
   */
  static async uploadFile(
    key: string,
    body: Buffer | Uint8Array | string,
    mimeType: string,
    metadata?: Record<string, string>
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: mimeType,
      Metadata: metadata,
    });

    const response = await s3Client.send(command);
    return response.ETag || "";
  }

  /**
   * Download a file
   */
  static async downloadFile(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);
    if (!response.Body) {
      throw new Error("File not found");
    }

    const chunks: Uint8Array[] = [];
    const reader = response.Body.transformToWebStream().getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return Buffer.from(result);
  }

  /**
   * Delete a file
   */
  static async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  }

  /**
   * Check if a file exists
   */
  static async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get file metadata
   */
  static async getFileMetadata(key: string) {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    return s3Client.send(command);
  }

  /**
   * Copy a file to a new location
   */
  static async copyFile(
    sourceKey: string,
    destinationKey: string,
    metadata?: Record<string, string>
  ): Promise<string> {
    const command = new CopyObjectCommand({
      Bucket: BUCKET_NAME,
      Key: destinationKey,
      CopySource: `${BUCKET_NAME}/${sourceKey}`,
      Metadata: metadata,
      MetadataDirective: metadata ? "REPLACE" : "COPY",
    });

    const response = await s3Client.send(command);
    return response.CopyObjectResult?.ETag || "";
  }

  /**
   * Generate a unique file key
   */
  static generateFileKey(
    userId: string,
    originalName: string,
    prefix?: string
  ): string {
    const timestamp = Date.now();
    const random = randomBytes(8).toString("hex");
    const extension = originalName.split(".").pop();
    const sanitizedName = originalName
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .toLowerCase();

    const keyPrefix = prefix ? `${prefix}/` : "";
    return `${keyPrefix}${userId}/${timestamp}-${random}-${sanitizedName}`;
  }

  /**
   * Validate file type and size
   */
  static validateFile(
    mimeType: string,
    size: number,
    allowedTypes: string[] = [],
    maxSize: number = 100 * 1024 * 1024 // 100MB default
  ): { valid: boolean; error?: string } {
    if (size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
      };
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(mimeType)) {
      return {
        valid: false,
        error: `File type ${mimeType} is not allowed`,
      };
    }

    return { valid: true };
  }
}

export default S3Service;
