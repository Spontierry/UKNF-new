import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    <div className='min-h-screen bg-gray-50'>
      <DashboardHeader user={user} />
      <div className='flex'>
        <DashboardSidebar user={user} />
        <main className='flex-1 p-6'>{children}</main>
      </div>
    </div>
  );
}
