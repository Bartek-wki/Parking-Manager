import { z } from "zod";

export const createClientSchema = z.object({
  first_name: z.string().min(1, "Imię jest wymagane"),
  last_name: z.string().min(1, "Nazwisko jest wymagane"),
  email: z.string().email("Nieprawidłowy adres email").nullable().optional(),
  phone: z.string().nullable().optional(),
});

export const updateClientSchema = createClientSchema.partial();
