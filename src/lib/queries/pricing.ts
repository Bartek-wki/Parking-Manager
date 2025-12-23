import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPricingException,
  deletePricingException,
  fetchPricingExceptions,
  updatePricingException,
} from "../api/pricing";
import type { CreatePricingExceptionCmd } from "@/types";

export const PRICING_KEYS = {
  all: ["pricing-exceptions"] as const,
  byLocation: (locationId: string) => [...PRICING_KEYS.all, locationId] as const,
};

export function usePricingExceptions(locationId: string) {
  return useQuery({
    queryKey: PRICING_KEYS.byLocation(locationId),
    queryFn: () => fetchPricingExceptions(locationId),
    enabled: !!locationId,
  });
}

export function useCreatePricingExceptionMutation(locationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePricingExceptionCmd) => createPricingException(locationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRICING_KEYS.byLocation(locationId) });
    },
  });
}

export function useUpdatePricingExceptionMutation(locationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      exceptionId,
      data,
    }: {
      exceptionId: string;
      data: Partial<CreatePricingExceptionCmd>;
    }) => updatePricingException(locationId, exceptionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRICING_KEYS.byLocation(locationId) });
    },
  });
}

export function useDeletePricingExceptionMutation(locationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (exceptionId: string) => deletePricingException(locationId, exceptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRICING_KEYS.byLocation(locationId) });
    },
  });
}
