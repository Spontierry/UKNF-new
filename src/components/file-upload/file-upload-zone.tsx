"use client";

import { useState, useCallback, useRef } from "react";
import {
  Upload,
  File,
  X,
  CheckCircle,
  AlertCircle,
  Pause,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { initiateFileUpload, completeFileUpload } from "@/actions/file-simple";
import { ChunkedUploadManager, UploadProgress } from "@/lib/chunked-upload";

interface FileUploadZoneProps {
  onUploadComplete?: (fileId: string) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  className?: string;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: UploadProgress;
  status: "pending" | "uploading" | "completed" | "failed" | "paused";
  error?: string;
  manager?: ChunkedUploadManager;
}

export function FileUploadZone({
  onUploadComplete,
  onUploadError,
  maxFiles = 10,
  maxSize = 100 * 1024 * 1024, // 100MB
  allowedTypes = [
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
  ],
  className,
}: FileUploadZoneProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): { valid: boolean; error?: string } => {
      if (file.size > maxSize) {
        return {
          valid: false,
          error: `File size exceeds maximum allowed size of ${Math.round(
            maxSize / 1024 / 1024
          )}MB`,
        };
      }

      if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        return {
          valid: false,
          error: `File type ${file.type} is not allowed`,
        };
      }

      return { valid: true };
    },
    [maxSize, allowedTypes]
  );

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const validFiles: File[] = [];

      // Validate files
      for (const file of fileArray) {
        const validation = validateFile(file);
        if (validation.valid) {
          validFiles.push(file);
        } else {
          onUploadError?.(`${file.name}: ${validation.error}`);
        }
      }

      // Check max files limit
      if (uploadingFiles.length + validFiles.length > maxFiles) {
        onUploadError?.(
          `Maximum ${maxFiles} files allowed. Currently uploading ${uploadingFiles.length} files.`
        );
        return;
      }

      // Start uploads
      for (const file of validFiles) {
        await startUpload(file);
      }
    },
    [uploadingFiles.length, maxFiles, validateFile, onUploadError]
  );

  const startUpload = useCallback(
    async (file: File) => {
      const tempId = crypto.randomUUID();

      // Add file to uploading list
      const uploadingFile: UploadingFile = {
        id: tempId,
        file,
        progress: {
          fileId: tempId,
          uploadedBytes: 0,
          totalBytes: file.size,
          percentage: 0,
          chunkProgress: {},
          isComplete: false,
        },
        status: "pending",
      };

      setUploadingFiles((prev) => [...prev, uploadingFile]);

      try {
        // Initiate upload
        const result = await initiateFileUpload({
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          chunked: file.size > 5 * 1024 * 1024, // Use chunked upload for files > 5MB
        });

        if (result?.serverError) {
          throw new Error(
            result.serverError.errorMessage || "Server error occurred"
          );
        }

        if (result?.validationErrors) {
          throw new Error(
            "Validation failed: " + JSON.stringify(result.validationErrors)
          );
        }

        const { fileId, presignedUrl, chunked } = result.data!;

        if (chunked) {
          // Use chunked upload for large files
          const manager = new ChunkedUploadManager({
            file,
            fileId,
            onProgress: (progress) => {
              setUploadingFiles((prev) =>
                prev.map((f) =>
                  f.id === tempId
                    ? { ...f, progress, status: "uploading" as const }
                    : f
                )
              );
            },
            onError: (error) => {
              setUploadingFiles((prev) =>
                prev.map((f) =>
                  f.id === tempId
                    ? { ...f, status: "failed" as const, error: error.message }
                    : f
                )
              );
              onUploadError?.(error.message);
            },
            onComplete: (etag) => {
              setUploadingFiles((prev) =>
                prev.map((f) =>
                  f.id === tempId
                    ? {
                        ...f,
                        status: "completed" as const,
                        progress: {
                          ...f.progress,
                          isComplete: true,
                          percentage: 100,
                        },
                      }
                    : f
                )
              );
              onUploadComplete?.(fileId);
            },
          });

          setUploadingFiles((prev) =>
            prev.map((f) => (f.id === tempId ? { ...f, manager, fileId } : f))
          );

          await manager.start();
        } else {
          // Direct upload for smaller files
          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.id === tempId
                ? { ...f, status: "uploading" as const, fileId }
                : f
            )
          );

          // Upload directly to S3
          const uploadResponse = await fetch(presignedUrl, {
            method: "PUT",
            body: file,
            headers: {
              "Content-Type": file.type,
            },
          });

          if (!uploadResponse.ok) {
            throw new Error(`Upload failed: ${uploadResponse.statusText}`);
          }

          const etag = uploadResponse.headers.get("ETag");

          // Complete upload
          const completeResult = await completeFileUpload({
            fileId,
            etag: etag?.replace(/"/g, ""),
          });

          if (completeResult?.serverError) {
            throw new Error(
              completeResult.serverError.errorMessage || "Server error occurred"
            );
          }

          if (completeResult?.validationErrors) {
            throw new Error(
              "Validation failed: " +
                JSON.stringify(completeResult.validationErrors)
            );
          }

          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.id === tempId
                ? {
                    ...f,
                    status: "completed" as const,
                    progress: {
                      ...f.progress,
                      isComplete: true,
                      percentage: 100,
                    },
                  }
                : f
            )
          );

          onUploadComplete?.(fileId);
        }
      } catch (error) {
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.id === tempId
              ? {
                  ...f,
                  status: "failed" as const,
                  error: (error as Error).message,
                }
              : f
          )
        );
        onUploadError?.((error as Error).message);
      }
    },
    [onUploadComplete, onUploadError]
  );

  const removeFile = useCallback((id: string) => {
    setUploadingFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      file?.manager?.cancel();
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const pauseResumeUpload = useCallback((id: string) => {
    setUploadingFiles((prev) =>
      prev.map((f) => {
        if (f.id === id && f.manager) {
          if (f.status === "uploading") {
            f.manager.pause();
            return { ...f, status: "paused" as const };
          } else if (f.status === "paused") {
            f.manager.resume();
            return { ...f, status: "uploading" as const };
          }
        }
        return f;
      })
    );
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFiles(files);
      }
    },
    [handleFiles]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFiles(files);
      }
      // Reset input value
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleFiles]
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusIcon = (status: UploadingFile["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "paused":
        return <Pause className="h-4 w-4 text-yellow-500" />;
      default:
        return <Upload className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: UploadingFile["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "uploading":
        return <Badge variant="default">Uploading</Badge>;
      case "completed":
        return (
          <Badge variant="default" className="bg-green-500">
            Completed
          </Badge>
        );
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "paused":
        return (
          <Badge variant="secondary" className="bg-yellow-500">
            Paused
          </Badge>
        );
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Upload Zone */}
      <Card
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          isDragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <Upload className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Drop files here or click to browse
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Maximum file size: {formatFileSize(maxSize)}
          </p>
          <p className="text-xs text-gray-400">
            Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV,
            JPG, PNG, GIF, ZIP
          </p>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
        accept={allowedTypes.join(",")}
      />

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="mt-6 space-y-4">
          <h4 className="text-lg font-semibold">Uploading Files</h4>
          {uploadingFiles.map((file) => (
            <Card key={file.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <File className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-sm">{file.file.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(file.status)}
                  {getStatusBadge(file.status)}
                  {file.status === "uploading" || file.status === "paused" ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        pauseResumeUpload(file.id);
                      }}
                    >
                      {file.status === "uploading" ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {file.status === "uploading" || file.status === "paused" ? (
                <div className="space-y-2">
                  <Progress value={file.progress.percentage} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>
                      {formatFileSize(file.progress.uploadedBytes)} /{" "}
                      {formatFileSize(file.progress.totalBytes)}
                    </span>
                    <span>{file.progress.percentage}%</span>
                  </div>
                </div>
              ) : file.status === "failed" ? (
                <div className="text-sm text-red-600">Error: {file.error}</div>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
