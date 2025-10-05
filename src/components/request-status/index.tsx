import { Request } from "@/db/schema";
import { REQUEST_DATA_SCHEMA, REQUEST_STATUS } from "@/schemas/request";
import { z } from "zod";
import { CompleteRegistrationForm } from "../complete-registration-form";
import { redirect } from "next/navigation";

type Props = {
  request: Request & {
    data: z.infer<(typeof REQUEST_DATA_SCHEMA)["add_user"]>;
  };
};
export function RequestStatus({ request }: Props) {
  if (request.status === REQUEST_STATUS.CREATED) {
    return <CompleteRegistrationForm requestId={request.id} />;
  }

  if (request.status === REQUEST_STATUS.DRAFT) {
    return redirect("/dashboard");
  }
}
