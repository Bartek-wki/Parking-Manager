import { z } from "zod";

export const createPricingExceptionSchema = z
  .object({
    start_date: z.string().date("Nieprawidłowy format daty początkowej"),
    end_date: z.string().date("Nieprawidłowy format daty końcowej"),
    percentage_change: z
      .number()
      .min(-100, "Zmiana procentowa nie może być mniejsza niż -100")
      .max(500, "Zmiana procentowa nie może być większa niż 500"),
    description: z.string().optional(),
  })
  .refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
    message: "Data końcowa musi być późniejsza lub równa dacie początkowej",
    path: ["end_date"],
  });

export type CreatePricingExceptionSchema = z.infer<typeof createPricingExceptionSchema>;
