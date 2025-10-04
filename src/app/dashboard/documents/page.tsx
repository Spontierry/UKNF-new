import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Upload,
  Download,
  Search,
  Filter,
  MoreVertical,
} from "lucide-react";

// Mock data - replace with actual API calls later
const mockDocuments = [
  {
    id: "1",
    name: "Q4 Financial Report.pdf",
    size: "2.4 MB",
    uploadedAt: "3 days ago",
    type: "pdf",
    status: "active",
    downloads: 15,
  },
  {
    id: "2",
    name: "Compliance Checklist.xlsx",
    size: "1.2 MB",
    uploadedAt: "1 week ago",
    type: "excel",
    status: "active",
    downloads: 8,
  },
  {
    id: "3",
    name: "Annual Report 2023.pdf",
    size: "5.8 MB",
    uploadedAt: "2 weeks ago",
    type: "pdf",
    status: "archived",
    downloads: 23,
  },
  {
    id: "4",
    name: "Meeting Notes.docx",
    size: "0.8 MB",
    uploadedAt: "1 month ago",
    type: "word",
    status: "active",
    downloads: 3,
  },
];

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
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Documents</h1>
          <p className='text-gray-600 mt-2'>Manage your files and documents</p>
        </div>
        <Button>
          <Upload className='mr-2 h-4 w-4' />
          Upload Document
        </Button>
      </div>

      <div className='flex items-center space-x-4'>
        <div className='flex-1'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='text'
              placeholder='Search documents...'
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
        </div>
        <Button variant='outline'>
          <Filter className='mr-2 h-4 w-4' />
          Filter
        </Button>
      </div>

      <div className='grid gap-4'>
        {mockDocuments.map((document) => (
          <Card key={document.id} className='hover:shadow-md transition-shadow'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-4'>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      document.type === "pdf"
                        ? "bg-red-100"
                        : document.type === "excel"
                        ? "bg-green-100"
                        : "bg-blue-100"
                    }`}
                  >
                    <FileText
                      className={`h-5 w-5 ${
                        document.type === "pdf"
                          ? "text-red-600"
                          : document.type === "excel"
                          ? "text-green-600"
                          : "text-blue-600"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className='font-medium text-lg'>{document.name}</h3>
                    <p className='text-sm text-gray-600'>
                      {document.size} • Uploaded {document.uploadedAt}
                    </p>
                    <p className='text-xs text-gray-500'>
                      {document.downloads} downloads
                    </p>
                  </div>
                </div>
                <div className='flex items-center space-x-3'>
                  <Badge
                    variant={
                      document.status === "active"
                        ? "default"
                        : document.status === "archived"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {document.status}
                  </Badge>
                  <Button size='sm' variant='outline'>
                    <Download className='h-4 w-4 mr-1' />
                    Download
                  </Button>
                  <Button size='sm' variant='ghost'>
                    <MoreVertical className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
