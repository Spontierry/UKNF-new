import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploadZone } from "@/components/file-upload/file-upload-zone";
import { FileList } from "@/components/file-upload/file-list";
import { Upload, FileText, Settings } from "lucide-react";

export default async function DocumentsPage() {
  //const user = await getCurrentUser();
  const user = {
    id: "1",
    email: "jan.kowalski@uknf.gov.pl",
    organizationId: "1",
    organizationType: "uknf",
    name: "Jan Kowalski",
    organizationName: "UKNF - Polish Financial Supervision Authority",
    role: "admin",
  };

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
        <p className="text-gray-600 mt-2">
          Manage your files and documents with secure upload and storage
        </p>
      </div>

      <Tabs defaultValue="files" className="space-y-6">
        <TabsList>
          <TabsTrigger value="files" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>My Files</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Upload</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-6">
          <FileList />
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploadZone
                maxFiles={10}
                maxSize={100 * 1024 * 1024} // 100MB
                allowedTypes={[
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
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>File Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Storage Information</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Files are stored securely in S3-compatible storage</p>
                    <p>• Maximum file size: 100MB</p>
                    <p>
                      • Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX,
                      TXT, CSV, JPG, PNG, GIF, ZIP
                    </p>
                    <p>• All uploads are encrypted and access-controlled</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Security Features</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Role-based access control</p>
                    <p>• Audit logging for all file operations</p>
                    <p>• Presigned URLs for secure downloads</p>
                    <p>• Automatic cleanup of expired files</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
