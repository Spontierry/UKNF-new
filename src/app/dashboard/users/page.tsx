import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Edit, Trash2, UserCheck } from "lucide-react";

// Mock data - replace with actual API calls later
const mockUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@company.com",
    role: "admin",
    organization: "ABC Financial Corp",
    lastActive: "2 hours ago",
    status: "active",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@company.com",
    role: "employee",
    organization: "ABC Financial Corp",
    lastActive: "1 day ago",
    status: "active",
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike.johnson@company.com",
    role: "employee",
    organization: "XYZ Ltd",
    lastActive: "3 days ago",
    status: "inactive",
  },
  {
    id: "4",
    name: "Sarah Wilson",
    email: "sarah.wilson@company.com",
    role: "admin",
    organization: "DEF Bank",
    lastActive: "1 hour ago",
    status: "active",
  },
];

export default async function UsersPage() {
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
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>User Management</h1>
          <p className='text-gray-600 mt-2'>
            Manage users and their permissions
          </p>
        </div>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          Add User
        </Button>
      </div>

      <div className='flex items-center space-x-4'>
        <div className='flex-1'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='text'
              placeholder='Search users...'
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
        {mockUsers.map((user) => (
          <Card key={user.id} className='hover:shadow-md transition-shadow'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-4'>
                  <div className='w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center'>
                    <UserCheck className='h-5 w-5 text-purple-600' />
                  </div>
                  <div>
                    <h3 className='font-medium text-lg'>{user.name}</h3>
                    <p className='text-sm text-gray-600'>{user.email}</p>
                    <p className='text-xs text-gray-500'>
                      {user.organization} • Last active: {user.lastActive}
                    </p>
                  </div>
                </div>
                <div className='flex items-center space-x-3'>
                  <Badge
                    variant={user.role === "admin" ? "default" : "secondary"}
                  >
                    {user.role}
                  </Badge>
                  <Badge
                    variant={user.status === "active" ? "default" : "outline"}
                  >
                    {user.status}
                  </Badge>
                  <Button size='sm' variant='outline'>
                    <Edit className='h-4 w-4 mr-1' />
                    Edit
                  </Button>
                  <Button size='sm' variant='destructive'>
                    <Trash2 className='h-4 w-4' />
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
