import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createLocation, fetchLocations, updateLocation } from "../api/locations";
import type { CreateLocationCmd, UpdateLocationCmd } from "@/types";

export const LOCATION_KEYS = {
  all: ["locations"] as const,
};

export function useLocations() {
  return useQuery({
    queryKey: LOCATION_KEYS.all,
    queryFn: fetchLocations,
  });
}

export function useCreateLocationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLocationCmd) => createLocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCATION_KEYS.all });
    },
  });
}

export function useUpdateLocationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLocationCmd }) => updateLocation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCATION_KEYS.all });
    },
  });
}
