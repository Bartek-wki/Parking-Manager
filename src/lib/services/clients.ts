import type { SupabaseClient } from "../../db/supabase.client";
import type { ClientDTO, CreateClientCmd, UpdateClientCmd } from "../../types";

export async function listClients(
  supabase: SupabaseClient,
  userId: string,
  search?: string | null
): Promise<ClientDTO[]> {
  let query = supabase
    .from("clients")
    .select("id, first_name, last_name, email, phone")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("last_name", { ascending: true });

  if (search) {
    // Basic search implementation - can be improved with text search
    query = query.or(`first_name.ilike.${search}%,last_name.ilike.${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createClient(
  supabase: SupabaseClient,
  userId: string,
  clientData: CreateClientCmd
): Promise<ClientDTO> {
  const { data, error } = await supabase
    .from("clients")
    .insert({
      ...clientData,
      user_id: userId,
    })
    .select("id, first_name, last_name, email, phone")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateClient(
  supabase: SupabaseClient,
  clientId: string,
  clientData: UpdateClientCmd,
  userId?: string
): Promise<ClientDTO> {
  // We don't strictly need to filter by user_id if RLS is enabled,
  // but it's good practice to ensure we only update what belongs to the user context implicitly or explicitly.

  let query = supabase.from("clients").update(clientData).eq("id", clientId);

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query.select("id, first_name, last_name, email, phone").single();

  if (error) {
    // If no rows updated (e.g. ID doesn't exist or RLS blocked), Supabase might return error PGRST116 (JSON object requested, multiple (or no) rows returned) if .single() is used.
    throw error;
  }

  return data;
}
