import type { CreatePricingExceptionCmd, PricingExceptionDTO } from "@/types";
import { handleResponse } from "./client-utils";

export async function fetchPricingExceptions(locationId: string): Promise<PricingExceptionDTO[]> {
  const res = await fetch(`/api/locations/${locationId}/pricing`);
  return handleResponse<PricingExceptionDTO[]>(res);
}

export async function createPricingException(
  locationId: string,
  data: CreatePricingExceptionCmd
): Promise<PricingExceptionDTO> {
  const res = await fetch(`/api/locations/${locationId}/pricing`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse<PricingExceptionDTO>(res);
}

export async function updatePricingException(
  locationId: string,
  exceptionId: string,
  data: Partial<CreatePricingExceptionCmd>
): Promise<PricingExceptionDTO> {
  const res = await fetch(`/api/locations/${locationId}/pricing/${exceptionId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse<PricingExceptionDTO>(res);
}

export async function deletePricingException(
  locationId: string,
  exceptionId: string
): Promise<void> {
  const res = await fetch(`/api/locations/${locationId}/pricing/${exceptionId}`, {
    method: "DELETE",
  });
  await handleResponse(res);
}
