import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
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
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>
          Welcome back, {user.name}
        </h1>
        <p className='text-gray-600 mt-2'>
          {user.organizationName} •{" "}
          {user.role === "admin" ? "Administrator" : "Employee"}
        </p>
      </div>

      <DashboardTabs user={user} />
    </div>
  );
}
