import { handleResponse } from "./client-utils";
import type { ClientDTO, CreateClientCmd, UpdateClientCmd } from "@/types";

const BASE_URL = "/api/clients";

export async function listClients(search?: string): Promise<ClientDTO[]> {
  const url = new URL(BASE_URL, window.location.origin);
  if (search) {
    url.searchParams.set("search", search);
  }
  const res = await fetch(url.toString());
  return handleResponse<ClientDTO[]>(res);
}

export async function createClientApi(data: CreateClientCmd): Promise<ClientDTO> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse<ClientDTO>(res);
}

export async function updateClientApi(id: string, data: UpdateClientCmd): Promise<ClientDTO> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse<ClientDTO>(res);
}
