import { DEFAULT_USER_ID, type SupabaseClient } from "../../db/supabase.client";
import type { SpotDTO, CreateSpotCmd, UpdateSpotCmd } from "../../types";

export const listSpots = async (
  supabase: SupabaseClient,
  locationId: string,
  activeOnly?: boolean,
  userId: string = DEFAULT_USER_ID
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
  userId: string = DEFAULT_USER_ID
): Promise<SpotDTO> => {
  const { data, error } = await supabase
    .from("spots")
    .insert({
      ...spot,
      location_id: locationId,
      user_id: userId,
      is_active: true, // Default to true as per typical flow, or let DB default? Plan implies payload doesn't have it.
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
  userId: string = DEFAULT_USER_ID
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
