import { handleResponse } from "./client-utils";
import type {
  BookingCalendarDTO,
  BookingDetailDTO,
  CreateBookingCmd,
  PreviewBookingCmd,
  PreviewBookingResponse,
  UpdateBookingCmd,
} from "@/types";

export interface GetBookingsParams {
  location_id: string;
  start_date: string;
  end_date: string;
}

export async function getBookings(params: GetBookingsParams) {
  const searchParams = new URLSearchParams({
    location_id: params.location_id,
    start_date: params.start_date,
    end_date: params.end_date,
  });
  const res = await fetch(`/api/bookings?${searchParams.toString()}`);
  return handleResponse<BookingCalendarDTO[]>(res);
}

export async function getBooking(id: string) {
  const res = await fetch(`/api/bookings/${id}`);
  return handleResponse<BookingDetailDTO>(res);
}

export async function createBooking(data: CreateBookingCmd) {
  const res = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<{ id: string }>(res);
}

export async function updateBooking(id: string, data: UpdateBookingCmd) {
  const res = await fetch(`/api/bookings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  await handleResponse(res);
}

export async function previewBooking(data: PreviewBookingCmd) {
  const res = await fetch("/api/bookings/preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<PreviewBookingResponse>(res);
}

export async function deleteBooking(id: string) {
  const res = await fetch(`/api/bookings/${id}`, {
    method: "DELETE",
  });
  await handleResponse(res);
}
