import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Save,
  Bell,
  Shield,
  Database,
  Mail,
  FileText,
} from "lucide-react";

// Mock data - replace with actual API calls later
const mockSettings = [
  {
    id: "email-notifications",
    title: "Email Notifications",
    description: "Configure email notification preferences",
    icon: Bell,
    status: "enabled",
    lastModified: "2 days ago",
  },
  {
    id: "security-settings",
    title: "Security Settings",
    description: "Manage security policies and access controls",
    icon: Shield,
    status: "enabled",
    lastModified: "1 week ago",
  },
  {
    id: "database-config",
    title: "Database Configuration",
    description: "Configure database connection and backup settings",
    icon: Database,
    status: "disabled",
    lastModified: "3 days ago",
  },
  {
    id: "file-upload",
    title: "File Upload Limits",
    description: "Set maximum file size and allowed file types",
    icon: FileText,
    status: "enabled",
    lastModified: "5 days ago",
  },
  {
    id: "email-config",
    title: "Email Configuration",
    description: "Configure SMTP settings and email templates",
    icon: Mail,
    status: "enabled",
    lastModified: "1 day ago",
  },
];

export default async function SettingsPage() {
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

  // Check if user is admin
  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>System Settings</h1>
        <p className='text-gray-600 mt-2'>
          Configure system parameters and preferences
        </p>
      </div>

      <div className='grid gap-6'>
        {mockSettings.map((setting) => (
          <Card key={setting.id} className='hover:shadow-md transition-shadow'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-4'>
                  <div className='w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center'>
                    <setting.icon className='h-5 w-5 text-gray-600' />
                  </div>
                  <div>
                    <h3 className='font-medium text-lg'>{setting.title}</h3>
                    <p className='text-sm text-gray-600'>
                      {setting.description}
                    </p>
                    <p className='text-xs text-gray-500'>
                      Last modified: {setting.lastModified}
                    </p>
                  </div>
                </div>
                <div className='flex items-center space-x-3'>
                  <Badge
                    variant={
                      setting.status === "enabled" ? "default" : "secondary"
                    }
                  >
                    {setting.status}
                  </Badge>
                  <Button size='sm' variant='outline'>
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className='flex justify-end space-x-4'>
        <Button variant='outline'>Reset to Defaults</Button>
        <Button>
          <Save className='mr-2 h-4 w-4' />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
