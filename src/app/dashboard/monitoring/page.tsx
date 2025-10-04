import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  Database,
  Users,
  Activity,
} from "lucide-react";

// Mock data - replace with actual API calls later
const mockSystemStatus = [
  {
    id: "security",
    title: "Security Status",
    status: "healthy",
    description: "All security systems operational",
    lastCheck: "2 minutes ago",
    icon: Shield,
  },
  {
    id: "database",
    title: "Database Performance",
    status: "healthy",
    description: "Database response time: 45ms",
    lastCheck: "1 minute ago",
    icon: Database,
  },
  {
    id: "server",
    title: "Server Resources",
    status: "warning",
    description: "CPU usage: 78% (High)",
    lastCheck: "30 seconds ago",
    icon: Server,
  },
  {
    id: "users",
    title: "Active Users",
    status: "healthy",
    description: "247 users online",
    lastCheck: "1 minute ago",
    icon: Users,
  },
];

const mockAlerts = [
  {
    id: "1",
    title: "High CPU Usage Detected",
    severity: "warning",
    timestamp: "5 minutes ago",
    description: "Server CPU usage has exceeded 75% for the last 10 minutes",
  },
  {
    id: "2",
    title: "Database Connection Pool Exhausted",
    severity: "critical",
    timestamp: "15 minutes ago",
    description: "Database connection pool is at 95% capacity",
  },
  {
    id: "3",
    title: "Security Scan Completed",
    severity: "info",
    timestamp: "1 hour ago",
    description: "Daily security scan completed successfully",
  },
];

export default async function MonitoringPage() {
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

  // Check if user is UKNF admin
  if (user.role !== "admin" || user.organizationType !== "uknf") {
    redirect("/dashboard");
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>System Monitoring</h1>
        <p className='text-gray-600 mt-2'>Monitor system health and security</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {mockSystemStatus.map((status) => (
          <Card key={status.id}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {status.title}
              </CardTitle>
              <status.icon className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {status.status === "healthy" ? (
                  <CheckCircle className='h-8 w-8 text-green-500' />
                ) : status.status === "warning" ? (
                  <AlertTriangle className='h-8 w-8 text-yellow-500' />
                ) : (
                  <AlertTriangle className='h-8 w-8 text-red-500' />
                )}
              </div>
              <p className='text-xs text-muted-foreground mt-2'>
                {status.description}
              </p>
              <p className='text-xs text-gray-500 mt-1'>
                Last check: {status.lastCheck}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>
              Latest system alerts and notifications
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {mockAlerts.map((alert) => (
              <div key={alert.id} className='flex items-start space-x-3'>
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    alert.severity === "critical"
                      ? "bg-red-500"
                      : alert.severity === "warning"
                      ? "bg-yellow-500"
                      : "bg-blue-500"
                  }`}
                />
                <div className='flex-1'>
                  <div className='flex items-center justify-between'>
                    <h4 className='font-medium'>{alert.title}</h4>
                    <Badge
                      variant={
                        alert.severity === "critical"
                          ? "destructive"
                          : alert.severity === "warning"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className='text-sm text-gray-600 mt-1'>
                    {alert.description}
                  </p>
                  <p className='text-xs text-gray-500 mt-1'>
                    {alert.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Activity</CardTitle>
            <CardDescription>
              Real-time system activity and performance
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center space-x-4'>
              <Activity className='h-4 w-4 text-green-500' />
              <div className='flex-1'>
                <p className='text-sm font-medium'>System Status: Online</p>
                <p className='text-xs text-gray-500'>
                  All services operational
                </p>
              </div>
            </div>
            <div className='flex items-center space-x-4'>
              <Clock className='h-4 w-4 text-blue-500' />
              <div className='flex-1'>
                <p className='text-sm font-medium'>Uptime: 99.9%</p>
                <p className='text-xs text-gray-500'>Last 30 days</p>
              </div>
            </div>
            <div className='flex items-center space-x-4'>
              <Users className='h-4 w-4 text-purple-500' />
              <div className='flex-1'>
                <p className='text-sm font-medium'>Active Sessions: 247</p>
                <p className='text-xs text-gray-500'>Peak: 312 (2 hours ago)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
