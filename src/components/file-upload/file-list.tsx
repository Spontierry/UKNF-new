"use client";

import { useState, useEffect } from "react";
import {
  Download,
  Trash2,
  Eye,
  Share,
  Calendar,
  File,
  FileText,
  Image,
  Archive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getUserFiles,
  getFileDownloadUrl,
  deleteFile,
} from "@/actions/file-simple";
import { FileUpload } from "@/db/schema";

interface FileListProps {
  className?: string;
}

interface FileWithActions extends FileUpload {
  downloadUrl?: string;
  isDownloading?: boolean;
  isDeleting?: boolean;
}

export function FileList({ className }: FileListProps) {
  const [files, setFiles] = useState<FileWithActions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const result = await getUserFiles({ limit: 100, offset: 0 });

      if (result?.serverError) {
        setError(result.serverError.errorMessage || "Server error occurred");
      } else if (result?.validationErrors) {
        setError(
          "Validation failed: " + JSON.stringify(result.validationErrors)
        );
      } else if (result?.data?.files) {
        setFiles(result.data.files);
      } else {
        setError("Failed to load files");
      }
    } catch (err) {
      setError("Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleDownload = async (file: FileWithActions) => {
    try {
      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, isDownloading: true } : f))
      );

      const result = await getFileDownloadUrl({ fileId: file.id });

      if (result?.serverError) {
        setError(result.serverError.errorMessage || "Server error occurred");
      } else if (result?.validationErrors) {
        setError(
          "Validation failed: " + JSON.stringify(result.validationErrors)
        );
      } else if (result?.data && "url" in result.data) {
        // Create a temporary link to download the file
        const link = document.createElement("a");
        link.href = result.data.url;
        link.download = result.data.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setError("Failed to get download URL");
      }
    } catch (err) {
      setError("Failed to download file");
    } finally {
      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, isDownloading: false } : f))
      );
    }
  };

  const handleDelete = async (file: FileWithActions) => {
    if (!confirm(`Are you sure you want to delete "${file.originalName}"?`)) {
      return;
    }

    try {
      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, isDeleting: true } : f))
      );

      const result = await deleteFile({ fileId: file.id });

      if (result?.serverError) {
        setError(result.serverError.errorMessage || "Server error occurred");
      } else if (result?.validationErrors) {
        setError(
          "Validation failed: " + JSON.stringify(result.validationErrors)
        );
      } else {
        setFiles((prev) => prev.filter((f) => f.id !== file.id));
      }
    } catch (err) {
      setError("Failed to delete file");
    } finally {
      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, isDeleting: false } : f))
      );
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return <Image className="h-5 w-5 text-blue-500" />;
    } else if (mimeType.includes("pdf")) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (mimeType.includes("zip") || mimeType.includes("archive")) {
      return <Archive className="h-5 w-5 text-purple-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="bg-green-500">
            Completed
          </Badge>
        );
      case "uploading":
        return (
          <Badge variant="default" className="bg-blue-500">
            Uploading
          </Badge>
        );
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading files...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <Button variant="outline" onClick={loadFiles} className="mt-2">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (files.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <File className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No files uploaded yet</p>
            <p className="text-sm">Upload your first file to get started.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Your Files ({files.length})</span>
          <Button variant="outline" size="sm" onClick={loadFiles}>
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {files.map((file) => (
            <div
              key={file.id}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getFileIcon(file.mimeType)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {file.originalName}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(file.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {getStatusBadge(file.status)}

                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(file)}
                      disabled={
                        file.isDownloading || file.status !== "completed"
                      }
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={file.isDeleting}
                      title="Delete"
                      onClick={() => handleDelete(file)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
