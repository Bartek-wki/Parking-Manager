import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  previewBooking,
  type GetBookingsParams,
} from "../api/bookings";
import type { CreateBookingCmd, UpdateBookingCmd, PreviewBookingCmd } from "@/types";
import { mapBookingToCalendarEvent } from "../utils/calendar-mapper";

export const BOOKING_KEYS = {
  all: ["bookings"] as const,
  list: (params: GetBookingsParams) => [...BOOKING_KEYS.all, "list", params] as const,
  detail: (id: string) => [...BOOKING_KEYS.all, "detail", id] as const,
  preview: (cmd: PreviewBookingCmd) => [...BOOKING_KEYS.all, "preview", cmd] as const,
};

export function useCalendarBookings(params: GetBookingsParams) {
  return useQuery({
    queryKey: BOOKING_KEYS.list(params),
    queryFn: async () => {
      const bookings = await getBookings(params);
      return bookings.map(mapBookingToCalendarEvent);
    },
    // Only fetch when we have valid parameters
    enabled: !!params.location_id && !!params.start_date && !!params.end_date,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useBooking(id: string | null) {
  return useQuery({
    queryKey: BOOKING_KEYS.detail(id!),
    queryFn: () => getBooking(id!),
    enabled: !!id,
  });
}

export function useCreateBookingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBookingCmd) => createBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKING_KEYS.all });
    },
  });
}

export function useUpdateBookingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBookingCmd }) => updateBooking(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: BOOKING_KEYS.all });
      queryClient.invalidateQueries({ queryKey: BOOKING_KEYS.detail(id) });
    },
  });
}

export function useBookingPreview(cmd: PreviewBookingCmd) {
  const isValid = !!cmd.location_id && !!cmd.spot_id && !!cmd.start_date;

  return useQuery({
    queryKey: BOOKING_KEYS.preview(cmd),
    queryFn: () => previewBooking(cmd),
    enabled: isValid,
    staleTime: 60 * 1000, // 1 min cache
    retry: false, // Don't retry on 409/422
  });
}

export function useDeleteBookingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKING_KEYS.all });
    },
  });
}
