import type { SupabaseClient } from "../../db/supabase.client";
import type { CreateLocationCmd, UpdateLocationCmd, LocationDTO } from "../../types";

export const getLocationList = async (
  supabase: SupabaseClient,
  userId: string
): Promise<LocationDTO[]> => {
  const { data, error } = await supabase
    .from("locations")
    .select("id, name, daily_rate, monthly_rate")
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return data;
};

export const createLocation = async (
  supabase: SupabaseClient,
  location: CreateLocationCmd,
  userId: string
): Promise<LocationDTO> => {
  const { data, error } = await supabase
    .from("locations")
    .insert({ ...location, user_id: userId })
    .select("id, name, daily_rate, monthly_rate")
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateLocation = async (
  supabase: SupabaseClient,
  id: string,
  location: UpdateLocationCmd,
  userId: string
): Promise<LocationDTO> => {
  const { data, error } = await supabase
    .from("locations")
    .update(location)
    .eq("id", id)
    .eq("user_id", userId)
    .select("id, name, daily_rate, monthly_rate")
    .single();

  if (error) {
    throw error;
  }

  return data;
};
