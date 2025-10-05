import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getCurrentUserWithProfile } from "@/services/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserWithProfile();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader userData={user} />
      <div className="flex">
        <DashboardSidebar userData={user} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
