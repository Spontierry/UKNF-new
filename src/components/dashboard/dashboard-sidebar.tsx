"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  FileText,
  Users,
  Settings,
  BarChart3,
  Shield,
  Building2,
  Bell,
  Calendar,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserWithProfile } from "@/types/user";
import { USER_TYPE } from "@/schemas/auth";

type Prop = {
  userData: UserWithProfile;
};

export function DashboardSidebar({ userData }: Prop) {
  const pathname = usePathname();
  const { user, profile } = userData;
  const isAdmin =
    profile.userType === USER_TYPE.SUPERVISED_ENTITY_ADMINISTRATOR;
  const isUKNF = profile.userType === USER_TYPE.SUPERVISED_ENTITY_EMPLOYEE;

  const getNavigationItems = () => {
    const baseItems = [
      {
        href: "/dashboard",
        label: "Overview",
        icon: BarChart3,
        description: "Dashboard overview",
      },
      {
        href: "/dashboard/request-status",
        label: "Request Status",
        icon: ClipboardList,
        description: "Track user creation requests",
      },
      {
        href: "/dashboard/communications",
        label: "Communications",
        icon: MessageSquare,
        description: "Messages and conversations",
        badge: "3",
      },
      {
        href: "/dashboard/documents",
        label: "Documents",
        icon: FileText,
        description: "File management",
      },
    ];

    if (isAdmin) {
      baseItems.push(
        {
          href: "/dashboard/users",
          label: "Users",
          icon: Users,
          description: "User management",
        },
        {
          href: "/dashboard/organizations",
          label: "Organizations",
          icon: Building2,
          description: "Organization management",
        },
        {
          href: "/dashboard/settings",
          label: "Settings",
          icon: Settings,
          description: "System configuration",
        }
      );
    }

    if (isUKNF && isAdmin) {
      baseItems.push({
        href: "/dashboard/monitoring",
        label: "Monitoring",
        icon: Shield,
        description: "System monitoring",
      });
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className="w-full h-auto p-3"
                >
                  <div className="flex items-center gap-3 w-full">
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-start">
                        <span className="text-sm font-medium truncate">
                          {item.label}
                        </span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs truncate">{item.description}</p>
                    </div>
                  </div>
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start h-auto p-3">
              <div className="flex items-center space-x-3 w-full">
                <Bell className="h-4 w-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium">Notifications</span>
                  <p className="text-xs text-muted-foreground">
                    View all alerts
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  5
                </Badge>
              </div>
            </Button>

            <Button variant="ghost" className="w-full justify-start h-auto p-3">
              <div className="flex items-center space-x-3 w-full">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium">Calendar</span>
                  <p className="text-xs text-muted-foreground">
                    Upcoming events
                  </p>
                </div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
