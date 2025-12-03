import { DEFAULT_USER_ID, type SupabaseClient } from "../../db/supabase.client";
import type { CreateLocationCmd, UpdateLocationCmd, LocationDTO } from "../../types";

export const getLocationList = async (supabase: SupabaseClient): Promise<LocationDTO[]> => {
  const { data, error } = await supabase
    .from("locations")
    .select("id, name, daily_rate, monthly_rate")
    .eq("user_id", DEFAULT_USER_ID);

  if (error) {
    throw error;
  }

  return data;
};

export const createLocation = async (supabase: SupabaseClient, location: CreateLocationCmd): Promise<LocationDTO> => {
  const { data, error } = await supabase
    .from("locations")
    .insert({ ...location, user_id: DEFAULT_USER_ID })
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
  location: UpdateLocationCmd
): Promise<LocationDTO> => {
  const { data, error } = await supabase
    .from("locations")
    .update(location)
    .eq("id", id)
    .eq("user_id", DEFAULT_USER_ID)
    .select("id, name, daily_rate, monthly_rate")
    .single();

  if (error) {
    throw error;
  }

  return data;
};
