import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Hasło musi mieć co najmniej 8 znaków")
  .regex(/[a-z]/, "Hasło musi zawierać co najmniej jedną małą literę")
  .regex(/[A-Z]/, "Hasło musi zawierać co najmniej jedną wielką literę")
  .regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę")
  .regex(/[^a-zA-Z0-9]/, "Hasło musi zawierać co najmniej jeden znak specjalny");

export const registerSchema = z
  .object({
    email: z.string().email("Nieprawidłowy adres email"),
    password: passwordSchema,
    confirmPassword: z.string().min(8, "Potwierdź hasło"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła muszą być identyczne",
    path: ["confirmPassword"],
  });

export const registerBackendSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
  password: passwordSchema,
});
