import { z } from "zod";

export const createSpotSchema = z.object({
  spot_number: z.string().min(1, "Numer miejsca jest wymagany"),
});

export const updateSpotSchema = z.object({
  spot_number: z.string().min(1, "Numer miejsca jest wymagany").optional(),
  is_active: z.boolean().optional(),
});

export const listSpotsQuerySchema = z.object({
  active_only: z.preprocess((val) => {
    if (typeof val === "string") return val === "true";
    if (val === null) return undefined;
    return val;
  }, z.boolean().optional()),
});
