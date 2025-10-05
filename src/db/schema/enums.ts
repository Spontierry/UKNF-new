import { pgEnum } from "drizzle-orm/pg-core";
import { USER_TYPE } from "@/schemas/auth";
import { REQUEST_STATUS, REQUEST_TYPE } from "@/schemas/request";

export const UserType = pgEnum("user_type", USER_TYPE);

export const RequestStatus = pgEnum("request_status", REQUEST_STATUS);

export const RequestType = pgEnum("request_type", REQUEST_TYPE);
