export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  graphql_public: {
    Tables: Record<never, never>;
    Views: Record<never, never>;
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
  public: {
    Tables: {
      bookings: {
        Row: {
          client_id: string;
          cost: number | null;
          created_at: string;
          end_date: string | null;
          id: string;
          location_id: string;
          payment_status: Database["public"]["Enums"]["payment_status"];
          spot_id: string;
          start_date: string;
          status: Database["public"]["Enums"]["reservation_status"];
          type: Database["public"]["Enums"]["reservation_type"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          client_id: string;
          cost?: number | null;
          created_at?: string;
          end_date?: string | null;
          id?: string;
          location_id: string;
          payment_status?: Database["public"]["Enums"]["payment_status"];
          spot_id: string;
          start_date: string;
          status?: Database["public"]["Enums"]["reservation_status"];
          type: Database["public"]["Enums"]["reservation_type"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          client_id?: string;
          cost?: number | null;
          created_at?: string;
          end_date?: string | null;
          id?: string;
          location_id?: string;
          payment_status?: Database["public"]["Enums"]["payment_status"];
          spot_id?: string;
          start_date?: string;
          status?: Database["public"]["Enums"]["reservation_status"];
          type?: Database["public"]["Enums"]["reservation_type"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_client_id_user_id_fkey";
            columns: ["client_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "bookings_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_location_id_user_id_fkey";
            columns: ["location_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "bookings_spot_id_fkey";
            columns: ["spot_id"];
            isOneToOne: false;
            referencedRelation: "spots";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_spot_id_location_id_fkey";
            columns: ["spot_id", "location_id"];
            isOneToOne: false;
            referencedRelation: "spots";
            referencedColumns: ["id", "location_id"];
          },
          {
            foreignKeyName: "bookings_spot_id_user_id_fkey";
            columns: ["spot_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "spots";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      clients: {
        Row: {
          created_at: string;
          deleted_at: string | null;
          email: string | null;
          first_name: string;
          id: string;
          last_name: string;
          phone: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          deleted_at?: string | null;
          email?: string | null;
          first_name: string;
          id?: string;
          last_name: string;
          phone?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          deleted_at?: string | null;
          email?: string | null;
          first_name?: string;
          id?: string;
          last_name?: string;
          phone?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      email_logs: {
        Row: {
          booking_id: string | null;
          created_at: string;
          error_message: string | null;
          id: string;
          metadata: Json;
          recipients: Json;
          status: string;
          type: string;
          user_id: string;
        };
        Insert: {
          booking_id?: string | null;
          created_at?: string;
          error_message?: string | null;
          id?: string;
          metadata?: Json;
          recipients: Json;
          status: string;
          type: string;
          user_id: string;
        };
        Update: {
          booking_id?: string | null;
          created_at?: string;
          error_message?: string | null;
          id?: string;
          metadata?: Json;
          recipients?: Json;
          status?: string;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "email_logs_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "email_logs_booking_id_user_id_fkey";
            columns: ["booking_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      locations: {
        Row: {
          created_at: string;
          daily_rate: number;
          id: string;
          monthly_rate: number;
          name: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          daily_rate: number;
          id?: string;
          monthly_rate: number;
          name: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          daily_rate?: number;
          id?: string;
          monthly_rate?: number;
          name?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      payment_history: {
        Row: {
          booking_id: string;
          changed_at: string;
          changed_by: string;
          id: string;
          new_status: Database["public"]["Enums"]["payment_status"];
          previous_status: Database["public"]["Enums"]["payment_status"];
          user_id: string;
        };
        Insert: {
          booking_id: string;
          changed_at?: string;
          changed_by: string;
          id?: string;
          new_status: Database["public"]["Enums"]["payment_status"];
          previous_status: Database["public"]["Enums"]["payment_status"];
          user_id: string;
        };
        Update: {
          booking_id?: string;
          changed_at?: string;
          changed_by?: string;
          id?: string;
          new_status?: Database["public"]["Enums"]["payment_status"];
          previous_status?: Database["public"]["Enums"]["payment_status"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payment_history_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payment_history_booking_id_user_id_fkey";
            columns: ["booking_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      price_exceptions: {
        Row: {
          created_at: string;
          description: string | null;
          end_date: string;
          id: string;
          location_id: string;
          percentage_change: number;
          start_date: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          end_date: string;
          id?: string;
          location_id: string;
          percentage_change: number;
          start_date: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          end_date?: string;
          id?: string;
          location_id?: string;
          percentage_change?: number;
          start_date?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "price_exceptions_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "price_exceptions_location_id_user_id_fkey";
            columns: ["location_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      spots: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          location_id: string;
          spot_number: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          location_id: string;
          spot_number: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          location_id?: string;
          spot_number?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "spots_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "spots_location_id_user_id_fkey";
            columns: ["location_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      payment_status: "oplacone" | "nieoplacone";
      reservation_status: "aktywna" | "zakonczona" | "zalegla";
      reservation_type: "permanent" | "periodic";
    };
    CompositeTypes: Record<never, never>;
  };
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      payment_status: ["oplacone", "nieoplacone"],
      reservation_status: ["aktywna", "zakonczona", "zalegla"],
      reservation_type: ["permanent", "periodic"],
    },
  },
} as const;
