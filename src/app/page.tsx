import { Landing } from "@/components/landing";
import { RequestStatus } from "@/components/request-status";
import { getUserRequests, getUserRequestsOfType } from "@/dal/requests";
import { auth } from "@/lib/auth";
import { REQUEST_TYPE } from "@/schemas/request";
import { headers } from "next/headers";

export default async function Home() {
  const user = await auth.api.getSession({
    headers: await headers(),
  });

  if (!user) {
    return <Landing />;
  }

  const userRequest = (
    await getUserRequestsOfType(user.user.id, REQUEST_TYPE.ADD_USER)
  )[0];

  return <RequestStatus request={userRequest} />;
}
