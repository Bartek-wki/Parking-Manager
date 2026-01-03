import { z } from "zod";

// Query Params dla GET /bookings
export const listBookingsQuerySchema = z.object({
  location_id: z.string().uuid(),
  start_date: z.string().date(), // YYYY-MM-DD
  end_date: z.string().date(),
});

// Body dla POST /bookings/preview
export const previewBookingSchema = z
  .object({
    location_id: z.string().uuid(),
    spot_id: z.string().uuid(),
    start_date: z.string().date(),
    end_date: z.string().date().optional(), // Nullable dla 'permanent'
    type: z.enum(["permanent", "periodic"]),
    exclude_booking_id: z.string().uuid().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "periodic" && !data.end_date) return false;
      if (data.end_date && new Date(data.end_date) < new Date(data.start_date)) return false;
      return true;
    },
    { message: "Invalid date range or missing end_date for periodic type" }
  );

// Body dla POST /bookings (Create)
// Rozszerza preview o client_id
export const createBookingSchema = previewBookingSchema.and(
  z.object({
    client_id: z.string().uuid(),
  })
);

// Body dla PATCH /bookings/:id
export const updateBookingSchema = z.object({
  payment_status: z.enum(["oplacone", "nieoplacone"]).optional(),
  status: z.enum(["aktywna", "zakonczona", "zalegla"]).optional(),
  start_date: z.string().date().optional(),
  end_date: z.string().date().optional(),
  cost: z.number().optional(),
  type: z.enum(["permanent", "periodic"]).optional(),
});

// Parametry ścieżki dla DELETE /bookings/:id
export const deleteBookingIdSchema = z.string().uuid();
