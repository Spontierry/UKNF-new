import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Plus,
  Search,
  Filter,
  Edit,
  Users,
  Settings,
} from "lucide-react";

// Mock data - replace with actual API calls later
const mockOrganizations = [
  {
    id: "1",
    name: "ABC Financial Corp",
    type: "client",
    users: 15,
    status: "active",
    lastActivity: "2 hours ago",
    sector: "Banking",
  },
  {
    id: "2",
    name: "XYZ Insurance Ltd",
    type: "client",
    users: 8,
    status: "active",
    lastActivity: "1 day ago",
    sector: "Insurance",
  },
  {
    id: "3",
    name: "DEF Investment Group",
    type: "client",
    users: 12,
    status: "pending",
    lastActivity: "3 days ago",
    sector: "Investment",
  },
  {
    id: "4",
    name: "GHI Credit Union",
    type: "client",
    users: 6,
    status: "active",
    lastActivity: "5 hours ago",
    sector: "Banking",
  },
];

export default async function OrganizationsPage() {
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
          <h1 className='text-3xl font-bold text-gray-900'>Organizations</h1>
          <p className='text-gray-600 mt-2'>Manage client organizations</p>
        </div>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          Add Organization
        </Button>
      </div>

      <div className='flex items-center space-x-4'>
        <div className='flex-1'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='text'
              placeholder='Search organizations...'
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
        {mockOrganizations.map((organization) => (
          <Card
            key={organization.id}
            className='hover:shadow-md transition-shadow'
          >
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-4'>
                  <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                    <Building2 className='h-5 w-5 text-blue-600' />
                  </div>
                  <div>
                    <h3 className='font-medium text-lg'>{organization.name}</h3>
                    <p className='text-sm text-gray-600'>
                      {organization.sector} • {organization.users} users
                    </p>
                    <p className='text-xs text-gray-500'>
                      Last activity: {organization.lastActivity}
                    </p>
                  </div>
                </div>
                <div className='flex items-center space-x-3'>
                  <Badge
                    variant={
                      organization.status === "active"
                        ? "default"
                        : organization.status === "pending"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {organization.status}
                  </Badge>
                  <Button size='sm' variant='outline'>
                    <Users className='h-4 w-4 mr-1' />
                    Users
                  </Button>
                  <Button size='sm' variant='outline'>
                    <Edit className='h-4 w-4 mr-1' />
                    Edit
                  </Button>
                  <Button size='sm' variant='outline'>
                    <Settings className='h-4 w-4' />
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
