import type { SupabaseClient } from "../../db/supabase.client";
import type { CreatePricingExceptionCmd, PricingExceptionDTO } from "../../types";

export const getPricingExceptionsByLocationId = async (
  supabase: SupabaseClient,
  locationId: string,
  userId: string
): Promise<PricingExceptionDTO[]> => {
  const { data, error } = await supabase
    .from("price_exceptions")
    .select("*")
    .eq("location_id", locationId)
    .eq("user_id", userId)
    .order("start_date", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
};

export const createPricingException = async (
  supabase: SupabaseClient,
  data: CreatePricingExceptionCmd & { location_id: string; user_id: string }
): Promise<PricingExceptionDTO> => {
  const { data: created, error } = await supabase
    .from("price_exceptions")
    .insert(data)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return created;
};

export const updatePricingException = async (
  supabase: SupabaseClient,
  id: string,
  data: CreatePricingExceptionCmd & { user_id: string }
): Promise<PricingExceptionDTO> => {
  const { data: updated, error } = await supabase
    .from("price_exceptions")
    .update(data)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return updated;
};

export const deletePricingException = async (
  supabase: SupabaseClient,
  id: string
): Promise<void> => {
  const { error } = await supabase.from("price_exceptions").delete().eq("id", id);

  if (error) {
    throw error;
  }
};
