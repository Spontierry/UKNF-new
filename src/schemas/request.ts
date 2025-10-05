import z from "zod";
import { USER_TYPE } from "./auth";

export const REQUEST_STATUS = {
  CREATED: "created",
  DRAFT: "draft",
  ACCEPTED: "accepted",
  UPDATED: "updated",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
} as const;

export type RequestStatus =
  (typeof REQUEST_STATUS)[keyof typeof REQUEST_STATUS];

export const REQUEST_TYPE = {
  ADD_USER: "add_user",
} as const;

export type RequestType = (typeof REQUEST_TYPE)[keyof typeof REQUEST_TYPE];

export const REQUEST_DATA_SCHEMA = {
  [REQUEST_TYPE.ADD_USER]: z.object({
    pesel: z.string(),
    phone: z.string(),
    userType: z.enum(USER_TYPE),
  }),
} as const satisfies Record<RequestType, z.ZodSchema>;
