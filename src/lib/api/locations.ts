import type { CreateLocationCmd, LocationDTO, UpdateLocationCmd } from "@/types";

const BASE_URL = "/api/locations";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `API Error ${response.status}: ${response.statusText}`;
    try {
      // Try to parse error as JSON to get a better message
      const errorJson = JSON.parse(errorText);
      if (errorJson.error) {
        errorMessage = errorJson.error;
      } else if (errorJson.errors) {
        errorMessage = JSON.stringify(errorJson.errors);
      }
    } catch {
      // Ignore if not JSON
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export async function fetchLocations(): Promise<LocationDTO[]> {
  const res = await fetch(BASE_URL);
  return handleResponse<LocationDTO[]>(res);
}

export async function createLocation(data: CreateLocationCmd): Promise<LocationDTO> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse<LocationDTO>(res);
}

export async function updateLocation(id: string, data: UpdateLocationCmd): Promise<LocationDTO> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse<LocationDTO>(res);
}
