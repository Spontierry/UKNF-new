import { Profile } from "@/db/schema";
import { User } from "better-auth";

export type UserWithProfile = {
  user: User;
  profile: Profile;
};
