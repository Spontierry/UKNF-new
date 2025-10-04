import { pgEnum } from "drizzle-orm/pg-core";
import { USER_TYPE } from "@/schemas/auth";

export const UserType = pgEnum("user_type", USER_TYPE);
