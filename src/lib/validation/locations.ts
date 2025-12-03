import { z } from "zod";

export const createLocationSchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana"),
  daily_rate: z.number().min(0, "Stawka dzienna musi być większa lub równa 0"),
  monthly_rate: z.number().min(0, "Stawka miesięczna musi być większa lub równa 0"),
});

export const updateLocationSchema = createLocationSchema.partial();
