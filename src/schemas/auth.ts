import z from "zod";

export const USER_TYPE = {
  SUPERVISED_ENTITY_EMPLOYEE: "Supervised Entity Employee",
  SUPERVISED_ENTITY_ADMINISTRATOR: "Supervised Entity Administrator",
} as const;

export type UserType = (typeof USER_TYPE)[keyof typeof USER_TYPE];

export const CreateUserSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  pesel: z.string().length(11, "PESEL must be exactly 11 digits"),
  phone: z.string(),
  userType: z.enum(USER_TYPE),
  email: z.email(),
});

export type CreateUserSchema = z.infer<typeof CreateUserSchema>;

export const CompleteRegistrationSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters long"),
});

export type CompleteRegistrationSchema = z.infer<
  typeof CompleteRegistrationSchema
>;
