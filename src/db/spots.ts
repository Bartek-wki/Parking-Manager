import type { SupabaseClient } from "../../db/supabase.client";
import type { SpotDTO, CreateSpotCmd, UpdateSpotCmd } from "../../types";

export const listSpots = async (
  supabase: SupabaseClient,
  locationId: string,
  userId: string,
  activeOnly?: boolean
): Promise<SpotDTO[]> => {
  let query = supabase
    .from("spots")
    .select("id, spot_number, is_active")
    .eq("location_id", locationId)
    .eq("user_id", userId);

  if (activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
};

export const createSpot = async (
  supabase: SupabaseClient,
  locationId: string,
  spot: CreateSpotCmd,
  userId: string
): Promise<SpotDTO> => {
  const { data, error } = await supabase
    .from("spots")
    .insert({
      ...spot,
      location_id: locationId,
      user_id: userId,
      is_active: true,
    })
    .select("id, spot_number, is_active")
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateSpot = async (
  supabase: SupabaseClient,
  id: string,
  spot: UpdateSpotCmd,
  userId: string
): Promise<SpotDTO> => {
  const { data, error } = await supabase
    .from("spots")
    .update(spot)
    .eq("id", id)
    .eq("user_id", userId)
    .select("id, spot_number, is_active")
    .single();

  if (error) {
    throw error;
  }

  return data;
};
