import { z } from "zod";

export const createClientSchema = z.object({
  first_name: z.string().min(1, "Imię jest wymagane"),
  last_name: z.string().min(1, "Nazwisko jest wymagane"),
  email: z.union([z.string().email("Nieprawidłowy adres email"), z.literal(null)]),
  phone: z.union([z.string(), z.literal(null)]),
});

export const updateClientSchema = createClientSchema.partial();
