import type { CreateSpotCmd, SpotDTO, UpdateSpotCmd } from "@/types";
import { handleResponse } from "./client-utils";

export async function fetchSpots(locationId: string): Promise<SpotDTO[]> {
  const res = await fetch(`/api/locations/${locationId}/spots`);
  return handleResponse<SpotDTO[]>(res);
}

export async function createSpot(locationId: string, data: CreateSpotCmd): Promise<SpotDTO> {
  const res = await fetch(`/api/locations/${locationId}/spots`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse<SpotDTO>(res);
}

export async function updateSpot(spotId: string, data: UpdateSpotCmd): Promise<SpotDTO> {
  const res = await fetch(`/api/spots/${spotId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse<SpotDTO>(res);
}
