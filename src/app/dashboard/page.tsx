import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { user } =
    (await auth.api.getSession({
      headers: await headers(),
    })) ?? {};

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.name}
        </h1>
        <p className="text-gray-600 mt-2">
          {/* {user.role === "admin" ? "Administrator" : "Employee"} */}
        </p>
      </div>

      {/* <DashboardTabs user={user} /> */}
    </div>
  );
}
