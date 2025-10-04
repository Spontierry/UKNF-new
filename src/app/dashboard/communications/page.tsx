import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus, Search, Filter } from "lucide-react";

// Mock data - replace with actual API calls later
const mockConversations = [
  {
    id: "1",
    title: "Financial Report Discussion",
    lastMessage: "2 hours ago",
    status: "active",
    participants: ["ABC Corp", "UKNF Team"],
    unreadCount: 2,
  },
  {
    id: "2",
    title: "Compliance Update",
    lastMessage: "1 day ago",
    status: "pending",
    participants: ["XYZ Ltd", "UKNF Team"],
    unreadCount: 0,
  },
  {
    id: "3",
    title: "Document Submission Query",
    lastMessage: "3 days ago",
    status: "closed",
    participants: ["DEF Bank", "UKNF Team"],
    unreadCount: 0,
  },
];

export default async function CommunicationsPage() {
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
          <h1 className='text-3xl font-bold text-gray-900'>Communications</h1>
          <p className='text-gray-600 mt-2'>
            Manage your messages and conversations
          </p>
        </div>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          New Conversation
        </Button>
      </div>

      <div className='flex items-center space-x-4'>
        <div className='flex-1'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='text'
              placeholder='Search conversations...'
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
        {mockConversations.map((conversation) => (
          <Card
            key={conversation.id}
            className='hover:shadow-md transition-shadow'
          >
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-4'>
                  <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                    <MessageSquare className='h-5 w-5 text-blue-600' />
                  </div>
                  <div>
                    <h3 className='font-medium text-lg'>
                      {conversation.title}
                    </h3>
                    <p className='text-sm text-gray-600'>
                      {conversation.participants.join(" • ")}
                    </p>
                    <p className='text-xs text-gray-500'>
                      Last message: {conversation.lastMessage}
                    </p>
                  </div>
                </div>
                <div className='flex items-center space-x-3'>
                  {conversation.unreadCount > 0 && (
                    <Badge variant='destructive'>
                      {conversation.unreadCount}
                    </Badge>
                  )}
                  <Badge
                    variant={
                      conversation.status === "active"
                        ? "default"
                        : conversation.status === "pending"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {conversation.status}
                  </Badge>
                  <Button size='sm' variant='outline'>
                    View
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
