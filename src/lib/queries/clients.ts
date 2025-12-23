import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClientApi, listClients, updateClientApi } from "../api/clients";
import type { CreateClientCmd, UpdateClientCmd } from "@/types";

export const CLIENT_KEYS = {
  all: ["clients"] as const,
  list: (search?: string) => [...CLIENT_KEYS.all, { search }] as const,
};

export function useClients(search?: string) {
  return useQuery({
    queryKey: CLIENT_KEYS.list(search),
    queryFn: () => listClients(search),
    placeholderData: keepPreviousData,
  });
}

export function useCreateClientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClientCmd) => createClientApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENT_KEYS.all });
    },
  });
}

export function useUpdateClientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClientCmd }) => updateClientApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENT_KEYS.all });
    },
  });
}
