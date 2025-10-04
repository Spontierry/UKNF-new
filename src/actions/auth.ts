"use server";

import z from "zod";

const CreateUserSchema = z.object({
  name: z.string(),
  email: z.email(),
});

export async function register(formData: FormData) {
  try {
    const raw = Object.fromEntries(formData);

    const { name, email } = CreateUserSchema.parse(raw);

    console.log({ name, email });
  } catch (error) {
    console.error(error);
  }
}
