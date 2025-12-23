import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSpot, fetchSpots, updateSpot } from "../api/spots";
import type { CreateSpotCmd, UpdateSpotCmd } from "@/types";

export const SPOTS_KEYS = {
  all: ["spots"] as const,
  byLocation: (locationId: string) => [...SPOTS_KEYS.all, locationId] as const,
};

export function useSpots(locationId: string) {
  return useQuery({
    queryKey: SPOTS_KEYS.byLocation(locationId),
    queryFn: () => fetchSpots(locationId),
    enabled: !!locationId,
  });
}

export function useCreateSpotMutation(locationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSpotCmd) => createSpot(locationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SPOTS_KEYS.byLocation(locationId) });
    },
  });
}

export function useUpdateSpotMutation(locationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ spotId, data }: { spotId: string; data: UpdateSpotCmd }) =>
      updateSpot(spotId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SPOTS_KEYS.byLocation(locationId) });
    },
  });
}
