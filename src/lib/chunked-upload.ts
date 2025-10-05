/**
 * Chunked Upload Manager
 * Handles multipart file uploads with progress tracking and error recovery
 */

export interface UploadChunk {
  partNumber: number;
  data: ArrayBuffer | Promise<ArrayBuffer>;
  etag?: string;
  uploaded?: boolean;
}

export interface UploadProgress {
  fileId: string;
  uploadedBytes: number;
  totalBytes: number;
  percentage: number;
  chunkProgress: Record<number, boolean>;
  isComplete: boolean;
  error?: string;
}

export interface ChunkedUploadOptions {
  file: File;
  fileId: string;
  chunkSize?: number; // Default 5MB
  maxRetries?: number; // Default 3
  onProgress?: (progress: UploadProgress) => void;
  onError?: (error: Error) => void;
  onComplete?: (etag: string) => void;
}

export class ChunkedUploadManager {
  private file: File;
  private fileId: string;
  private chunkSize: number;
  private maxRetries: number;
  private chunks: UploadChunk[] = [];
  private uploadedParts: Array<{ partNumber: number; etag: string }> = [];
  private isUploading = false;
  private isPaused = false;
  private isCancelled = false;
  private currentChunkIndex = 0;
  private retryCount = 0;

  private onProgress?: (progress: UploadProgress) => void;
  private onError?: (error: Error) => void;
  private onComplete?: (etag: string) => void;

  constructor(options: ChunkedUploadOptions) {
    this.file = options.file;
    this.fileId = options.fileId;
    this.chunkSize = options.chunkSize || 5 * 1024 * 1024; // 5MB default
    this.maxRetries = options.maxRetries || 3;
    this.onProgress = options.onProgress;
    this.onError = options.onError;
    this.onComplete = options.onComplete;

    this.initializeChunks();
  }

  private initializeChunks() {
    const totalChunks = Math.ceil(this.file.size / this.chunkSize);
    this.chunks = [];

    for (let i = 0; i < totalChunks; i++) {
      const start = i * this.chunkSize;
      const end = Math.min(start + this.chunkSize, this.file.size);

      this.chunks.push({
        partNumber: i + 1,
        data: this.file.slice(start, end).arrayBuffer(),
        uploaded: false,
      });
    }
  }

  /**
   * Start the chunked upload process
   */
  async start(): Promise<string> {
    if (this.isUploading) {
      throw new Error("Upload already in progress");
    }

    this.isUploading = true;
    this.isCancelled = false;
    this.isPaused = false;

    try {
      // Upload chunks sequentially
      for (let i = this.currentChunkIndex; i < this.chunks.length; i++) {
        if (this.isCancelled) {
          throw new Error("Upload cancelled");
        }

        if (this.isPaused) {
          this.currentChunkIndex = i;
          return ""; // Upload paused
        }

        await this.uploadChunk(i);
        this.updateProgress();
      }

      // Complete the multipart upload
      const etag = await this.completeUpload();

      this.onComplete?.(etag);
      return etag;
    } catch (error) {
      this.onError?.(error as Error);
      throw error;
    } finally {
      this.isUploading = false;
    }
  }

  /**
   * Pause the upload
   */
  pause() {
    this.isPaused = true;
  }

  /**
   * Resume the upload
   */
  resume() {
    if (!this.isPaused) return;

    this.isPaused = false;
    this.start();
  }

  /**
   * Cancel the upload
   */
  cancel() {
    this.isCancelled = true;
    this.isUploading = false;
    this.isPaused = false;
  }

  /**
   * Get current upload progress
   */
  getProgress(): UploadProgress {
    const uploadedBytes = this.uploadedParts.reduce(
      (total, part) => total + this.getChunkSize(part.partNumber),
      0
    );

    const chunkProgress: Record<number, boolean> = {};
    this.chunks.forEach((chunk, index) => {
      chunkProgress[index] = chunk.uploaded || false;
    });

    return {
      fileId: this.fileId,
      uploadedBytes,
      totalBytes: this.file.size,
      percentage: Math.round((uploadedBytes / this.file.size) * 100),
      chunkProgress,
      isComplete: uploadedBytes === this.file.size,
    };
  }

  /**
   * Upload a single chunk
   */
  private async uploadChunk(chunkIndex: number): Promise<void> {
    const chunk = this.chunks[chunkIndex];
    if (!chunk || chunk.uploaded) return;

    let retries = 0;

    while (retries < this.maxRetries) {
      try {
        // Get presigned URL for this chunk
        const response = await fetch("/api/file/multipart-part-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileId: this.fileId,
            partNumber: chunk.partNumber,
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to get presigned URL: ${response.statusText}`
          );
        }

        const { data } = await response.json();
        const { presignedUrl } = data;

        // Upload chunk to S3
        const chunkData = await chunk.data;
        const uploadResponse = await fetch(presignedUrl, {
          method: "PUT",
          body: chunkData,
          headers: {
            "Content-Type": this.file.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed: ${uploadResponse.statusText}`);
        }

        const etag = uploadResponse.headers.get("ETag");
        if (!etag) {
          throw new Error("No ETag received from upload");
        }

        chunk.etag = etag.replace(/"/g, ""); // Remove quotes from ETag
        chunk.uploaded = true;

        // Add to uploaded parts
        this.uploadedParts.push({
          partNumber: chunk.partNumber,
          etag: chunk.etag,
        });

        this.retryCount = 0; // Reset retry count on success
        return;
      } catch (error) {
        retries++;
        this.retryCount = retries;

        if (retries >= this.maxRetries) {
          throw new Error(
            `Failed to upload chunk ${chunk.partNumber} after ${this.maxRetries} retries: ${error}`
          );
        }

        // Wait before retrying (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, retries) * 1000)
        );
      }
    }
  }

  /**
   * Complete the multipart upload
   */
  private async completeUpload(): Promise<string> {
    const response = await fetch("/api/file/complete-multipart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileId: this.fileId,
        uploadId: await this.getUploadId(),
        parts: this.uploadedParts,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to complete upload: ${response.statusText}`);
    }

    const { data } = await response.json();
    return data.etag;
  }

  /**
   * Get upload ID from server
   */
  private async getUploadId(): Promise<string> {
    // This would typically be stored when the upload is initiated
    // For now, we'll make a request to get it
    const response = await fetch(`/api/file/${this.fileId}/upload-id`);

    if (!response.ok) {
      throw new Error("Failed to get upload ID");
    }

    const { uploadId } = await response.json();
    return uploadId;
  }

  /**
   * Get size of a specific chunk
   */
  private getChunkSize(partNumber: number): number {
    const chunkIndex = partNumber - 1;
    if (chunkIndex >= this.chunks.length) return 0;

    const chunk = this.chunks[chunkIndex];
    if (!chunk) return 0;

    return chunk.data instanceof ArrayBuffer
      ? chunk.data.byteLength
      : this.chunkSize;
  }

  /**
   * Update progress and notify listeners
   */
  private updateProgress() {
    const progress = this.getProgress();
    this.onProgress?.(progress);
  }

  /**
   * Retry failed chunks
   */
  async retryFailedChunks(): Promise<void> {
    const failedChunks = this.chunks.filter((chunk) => !chunk.uploaded);

    for (const chunk of failedChunks) {
      const chunkIndex = this.chunks.indexOf(chunk);
      await this.uploadChunk(chunkIndex);
    }

    this.updateProgress();
  }
}

/**
 * Utility function to create a chunked upload manager
 */
export function createChunkedUpload(
  options: ChunkedUploadOptions
): ChunkedUploadManager {
  return new ChunkedUploadManager(options);
}

// React hooks for chunked uploads should be implemented in the component files that use them
