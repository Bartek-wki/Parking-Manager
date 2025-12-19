import type { Database } from "./db/database.types";

/**
 * Helpers to extract Supabase types
 */
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Inserts<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type Updates<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T];

// --- Enums ---

export type PaymentStatus = Enums<"payment_status">;
export type ReservationStatus = Enums<"reservation_status">;
export type ReservationType = Enums<"reservation_type">;

// --- Locations ---

/**
 * Represents a parking location in the system.
 * Source: /locations (GET)
 */
export type LocationDTO = Pick<Tables<"locations">, "id" | "name" | "daily_rate" | "monthly_rate">;

/**
 * Payload for creating a new location.
 * Source: /locations (POST)
 */
export type CreateLocationCmd = Pick<Inserts<"locations">, "name" | "daily_rate" | "monthly_rate">;

/**
 * Payload for updating a location.
 * Source: /locations/:id (PUT)
 */
export type UpdateLocationCmd = Pick<Updates<"locations">, "name" | "daily_rate" | "monthly_rate">;

// --- Spots ---

/**
 * Represents a parking spot within a location.
 * Source: /locations/:location_id/spots (GET)
 */
export type SpotDTO = Pick<Tables<"spots">, "id" | "spot_number" | "is_active">;

/**
 * Payload for creating a spot.
 * Source: /locations/:location_id/spots (POST)
 */
export type CreateSpotCmd = Pick<Inserts<"spots">, "spot_number">;

/**
 * Payload for updating a spot.
 * Source: /spots/:id (PATCH)
 */
export type UpdateSpotCmd = Pick<Updates<"spots">, "is_active" | "spot_number">;

// --- Clients ---

/**
 * Represents a customer/client.
 * Source: /clients (GET)
 */
export type ClientDTO = Pick<
  Tables<"clients">,
  "id" | "first_name" | "last_name" | "email" | "phone"
>;

/**
 * Payload for creating a client.
 * Source: /clients (POST)
 */
export type CreateClientCmd = Pick<
  Inserts<"clients">,
  "first_name" | "last_name" | "email" | "phone"
>;

/**
 * Payload for updating a client.
 * Source: /clients/:id (PUT)
 */
export type UpdateClientCmd = Pick<
  Updates<"clients">,
  "first_name" | "last_name" | "email" | "phone"
>;

// --- Bookings ---

/**
 * Represents a booking/reservation for the calendar view.
 * Source: /bookings (GET)
 */
export type BookingDTO = Pick<
  Tables<"bookings">,
  "id" | "spot_id" | "client_id" | "start_date" | "end_date" | "status" | "payment_status"
>;

/**
 * Detailed booking view, usually including related client data.
 * Source: /bookings/:id (GET)
 */
export type BookingDetailDTO = Tables<"bookings"> & {
  client?: ClientDTO | null;
  spot?: SpotDTO | null;
  location?: LocationDTO | null;
};

/**
 * Payload for creating a new booking.
 * Source: /bookings (POST)
 */
export type CreateBookingCmd = Pick<
  Inserts<"bookings">,
  "client_id" | "spot_id" | "location_id" | "start_date" | "end_date" | "type"
>;

/**
 * Payload for updating an existing booking.
 * Source: /bookings/:id (PATCH)
 */
export type UpdateBookingCmd = Pick<
  Updates<"bookings">,
  "payment_status" | "status" | "end_date" | "start_date"
>;

/**
 * Payload for calculating booking cost and availability preview.
 * Source: /bookings/preview (POST)
 */
export type PreviewBookingCmd = Pick<
  Inserts<"bookings">,
  "location_id" | "spot_id" | "start_date" | "end_date" | "type"
> & {
  exclude_booking_id?: string;
};

/**
 * Response structure for the booking preview calculation.
 * This is not a DB entity, but a computed response.
 */
export interface PreviewBookingResponse {
  available: boolean;
  total_cost: number;
  calculation_details: {
    date: string;
    rate: number;
    exception: string | null;
  }[];
}

// --- Pricing Exceptions ---

/**
 * Represents a temporary price change rule.
 * Source: price_exceptions table (implicit usage in logic)
 */
export type PricingExceptionDTO = Tables<"price_exceptions">;

/**
 * Payload for creating a pricing exception.
 * Source: /locations/:location_id/pricing (POST)
 */
export type CreatePricingExceptionCmd = Pick<
  Inserts<"price_exceptions">,
  "start_date" | "end_date" | "percentage_change" | "description"
>;

// --- Logs & History ---

/**
 * Audit trail for payment status changes.
 * Source: /bookings/:id/history (GET)
 */
export type PaymentHistoryDTO = Tables<"payment_history">;

/**
 * System logs for sent emails.
 * Source: /logs/emails (GET)
 */
export type EmailLogDTO = Tables<"email_logs">;
