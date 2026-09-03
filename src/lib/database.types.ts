export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      executions: {
        Row: {
          account_id: number
          commission: number
          created_at: string
          currency: string
          executed_at: string
          fees: number
          id: number
          instrument_id: number
          liquidity: string | null
          order_id: number | null
          owner_id: string
          price: number
          quantity: number
          side: string
          source_execution_id: string
          source_record_id: number | null
        }
        Insert: {
          account_id: number
          commission?: number
          created_at?: string
          currency?: string
          executed_at: string
          fees?: number
          id?: never
          instrument_id: number
          liquidity?: string | null
          order_id?: number | null
          owner_id: string
          price: number
          quantity: number
          side: string
          source_execution_id: string
          source_record_id?: number | null
        }
        Update: {
          account_id?: number
          commission?: number
          created_at?: string
          currency?: string
          executed_at?: string
          fees?: number
          id?: never
          instrument_id?: number
          liquidity?: string | null
          order_id?: number | null
          owner_id?: string
          price?: number
          quantity?: number
          side?: string
          source_execution_id?: string
          source_record_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "executions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "executions_instrument_id_fkey"
            columns: ["instrument_id"]
            isOneToOne: false
            referencedRelation: "instruments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "executions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "executions_source_record_id_fkey"
            columns: ["source_record_id"]
            isOneToOne: false
            referencedRelation: "source_records"
            referencedColumns: ["id"]
          },
        ]
      }
      import_jobs: {
        Row: {
          account_id: number | null
          connector: string
          created_at: string
          cursor_after: string | null
          cursor_before: string | null
          diagnostics: Json
          finished_at: string | null
          id: number
          owner_id: string
          records_accepted: number
          records_seen: number
          started_at: string | null
          status: string
        }
        Insert: {
          account_id?: number | null
          connector: string
          created_at?: string
          cursor_after?: string | null
          cursor_before?: string | null
          diagnostics?: Json
          finished_at?: string | null
          id?: never
          owner_id: string
          records_accepted?: number
          records_seen?: number
          started_at?: string | null
          status?: string
        }
        Update: {
          account_id?: number | null
          connector?: string
          created_at?: string
          cursor_after?: string | null
          cursor_before?: string | null
          diagnostics?: Json
          finished_at?: string | null
          id?: never
          owner_id?: string
          records_accepted?: number
          records_seen?: number
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "import_jobs_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      instruments: {
        Row: {
          asset_class: string
          canonical_symbol: string
          contract_multiplier: number
          created_at: string
          currency: string
          description: string | null
          exchange: string | null
          expiry_date: string | null
          id: number
          metadata: Json
          option_right: string | null
          strike: number | null
          tick_size: number | null
          tick_value: number | null
          underlying_instrument_id: number | null
        }
        Insert: {
          asset_class: string
          canonical_symbol: string
          contract_multiplier?: number
          created_at?: string
          currency?: string
          description?: string | null
          exchange?: string | null
          expiry_date?: string | null
          id?: never
          metadata?: Json
          option_right?: string | null
          strike?: number | null
          tick_size?: number | null
          tick_value?: number | null
          underlying_instrument_id?: number | null
        }
        Update: {
          asset_class?: string
          canonical_symbol?: string
          contract_multiplier?: number
          created_at?: string
          currency?: string
          description?: string | null
          exchange?: string | null
          expiry_date?: string | null
          id?: never
          metadata?: Json
          option_right?: string | null
          strike?: number | null
          tick_size?: number | null
          tick_value?: number | null
          underlying_instrument_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "instruments_underlying_instrument_id_fkey"
            columns: ["underlying_instrument_id"]
            isOneToOne: false
            referencedRelation: "instruments"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          account_id: number
          id: number
          instrument_id: number
          limit_price: number | null
          order_type: string | null
          owner_id: string
          parent_source_order_id: string | null
          requested_quantity: number
          side: string
          source_order_id: string
          source_record_id: number | null
          status: string | null
          stop_price: number | null
          submitted_at: string | null
          time_in_force: string | null
          updated_at: string
        }
        Insert: {
          account_id: number
          id?: never
          instrument_id: number
          limit_price?: number | null
          order_type?: string | null
          owner_id: string
          parent_source_order_id?: string | null
          requested_quantity: number
          side: string
          source_order_id: string
          source_record_id?: number | null
          status?: string | null
          stop_price?: number | null
          submitted_at?: string | null
          time_in_force?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: number
          id?: never
          instrument_id?: number
          limit_price?: number | null
          order_type?: string | null
          owner_id?: string
          parent_source_order_id?: string | null
          requested_quantity?: number
          side?: string
          source_order_id?: string
          source_record_id?: number | null
          status?: string | null
          stop_price?: number | null
          submitted_at?: string | null
          time_in_force?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_instrument_id_fkey"
            columns: ["instrument_id"]
            isOneToOne: false
            referencedRelation: "instruments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_source_record_id_fkey"
            columns: ["source_record_id"]
            isOneToOne: false
            referencedRelation: "source_records"
            referencedColumns: ["id"]
          },
        ]
      }
      period_reviews: {
        Row: {
          commitments: Json
          created_at: string
          id: number
          metrics: Json
          narrative: string | null
          owner_id: string
          period_end: string
          period_start: string
          period_type: string
          status: string
          strengths: Json
          updated_at: string
          weaknesses: Json
        }
        Insert: {
          commitments?: Json
          created_at?: string
          id?: never
          metrics?: Json
          narrative?: string | null
          owner_id: string
          period_end: string
          period_start: string
          period_type: string
          status?: string
          strengths?: Json
          updated_at?: string
          weaknesses?: Json
        }
        Update: {
          commitments?: Json
          created_at?: string
          id?: never
          metrics?: Json
          narrative?: string | null
          owner_id?: string
          period_end?: string
          period_start?: string
          period_type?: string
          status?: string
          strengths?: Json
          updated_at?: string
          weaknesses?: Json
        }
        Relationships: []
      }
      plan_trade_links: {
        Row: {
          confidence: number | null
          confirmed_at: string | null
          created_at: string
          id: number
          link_method: string
          owner_id: string
          plan_id: number
          trade_id: number
        }
        Insert: {
          confidence?: number | null
          confirmed_at?: string | null
          created_at?: string
          id?: never
          link_method: string
          owner_id: string
          plan_id: number
          trade_id: number
        }
        Update: {
          confidence?: number | null
          confirmed_at?: string | null
          created_at?: string
          id?: never
          link_method?: string
          owner_id?: string
          plan_id?: number
          trade_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "plan_trade_links_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "trade_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_trade_links_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "reconstructed_trades"
            referencedColumns: ["id"]
          },
        ]
      }
      position_snapshots: {
        Row: {
          account_id: number
          average_price: number | null
          captured_at: string
          created_at: string
          id: number
          instrument_id: number
          market_price: number | null
          owner_id: string
          quantity: number
          source_record_id: number | null
          unrealized_pnl: number | null
        }
        Insert: {
          account_id: number
          average_price?: number | null
          captured_at: string
          created_at?: string
          id?: never
          instrument_id: number
          market_price?: number | null
          owner_id: string
          quantity: number
          source_record_id?: number | null
          unrealized_pnl?: number | null
        }
        Update: {
          account_id?: number
          average_price?: number | null
          captured_at?: string
          created_at?: string
          id?: never
          instrument_id?: number
          market_price?: number | null
          owner_id?: string
          quantity?: number
          source_record_id?: number | null
          unrealized_pnl?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "position_snapshots_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "position_snapshots_instrument_id_fkey"
            columns: ["instrument_id"]
            isOneToOne: false
            referencedRelation: "instruments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "position_snapshots_source_record_id_fkey"
            columns: ["source_record_id"]
            isOneToOne: false
            referencedRelation: "source_records"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          base_currency: string
          created_at: string
          display_name: string | null
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          base_currency?: string
          created_at?: string
          display_name?: string | null
          timezone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          base_currency?: string
          created_at?: string
          display_name?: string | null
          timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reconstructed_trades: {
        Row: {
          account_id: number
          average_entry: number
          average_exit: number | null
          closed_at: string | null
          closed_quantity: number
          commissions: number
          created_at: string
          direction: string
          fees: number
          gross_pnl: number | null
          id: number
          instrument_id: number
          mae: number | null
          metadata: Json
          mfe: number | null
          net_pnl: number | null
          opened_at: string
          opened_quantity: number
          owner_id: string
          reconstruction_run_id: number
          status: string
          strategy_group_key: string | null
        }
        Insert: {
          account_id: number
          average_entry: number
          average_exit?: number | null
          closed_at?: string | null
          closed_quantity?: number
          commissions?: number
          created_at?: string
          direction: string
          fees?: number
          gross_pnl?: number | null
          id?: never
          instrument_id: number
          mae?: number | null
          metadata?: Json
          mfe?: number | null
          net_pnl?: number | null
          opened_at: string
          opened_quantity: number
          owner_id: string
          reconstruction_run_id: number
          status: string
          strategy_group_key?: string | null
        }
        Update: {
          account_id?: number
          average_entry?: number
          average_exit?: number | null
          closed_at?: string | null
          closed_quantity?: number
          commissions?: number
          created_at?: string
          direction?: string
          fees?: number
          gross_pnl?: number | null
          id?: never
          instrument_id?: number
          mae?: number | null
          metadata?: Json
          mfe?: number | null
          net_pnl?: number | null
          opened_at?: string
          opened_quantity?: number
          owner_id?: string
          reconstruction_run_id?: number
          status?: string
          strategy_group_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reconstructed_trades_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reconstructed_trades_instrument_id_fkey"
            columns: ["instrument_id"]
            isOneToOne: false
            referencedRelation: "instruments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reconstructed_trades_reconstruction_run_id_fkey"
            columns: ["reconstruction_run_id"]
            isOneToOne: false
            referencedRelation: "reconstruction_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      reconstruction_runs: {
        Row: {
          account_id: number | null
          algorithm_version: string
          created_at: string
          diagnostics: Json
          finished_at: string | null
          id: number
          input_end_at: string | null
          input_start_at: string | null
          matching_method: string
          owner_id: string
          started_at: string | null
          status: string
        }
        Insert: {
          account_id?: number | null
          algorithm_version: string
          created_at?: string
          diagnostics?: Json
          finished_at?: string | null
          id?: never
          input_end_at?: string | null
          input_start_at?: string | null
          matching_method?: string
          owner_id: string
          started_at?: string | null
          status?: string
        }
        Update: {
          account_id?: number | null
          algorithm_version?: string
          created_at?: string
          diagnostics?: Json
          finished_at?: string | null
          id?: never
          input_end_at?: string | null
          input_start_at?: string | null
          matching_method?: string
          owner_id?: string
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reconstruction_runs_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      source_records: {
        Row: {
          account_id: number | null
          id: number
          import_job_id: number | null
          ingested_at: string
          owner_id: string
          payload: Json
          payload_hash: string
          record_kind: string
          source_observed_at: string | null
          source_record_id: string
          source_system: string
        }
        Insert: {
          account_id?: number | null
          id?: never
          import_job_id?: number | null
          ingested_at?: string
          owner_id: string
          payload: Json
          payload_hash: string
          record_kind: string
          source_observed_at?: string | null
          source_record_id: string
          source_system: string
        }
        Update: {
          account_id?: number | null
          id?: never
          import_job_id?: number | null
          ingested_at?: string
          owner_id?: string
          payload?: Json
          payload_hash?: string
          record_kind?: string
          source_observed_at?: string | null
          source_record_id?: string
          source_system?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_records_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_records_import_job_id_fkey"
            columns: ["import_job_id"]
            isOneToOne: false
            referencedRelation: "import_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_execution_allocations: {
        Row: {
          allocated_quantity: number
          allocation_role: string
          execution_id: number
          id: number
          owner_id: string
          realized_pnl: number | null
          trade_id: number
        }
        Insert: {
          allocated_quantity: number
          allocation_role: string
          execution_id: number
          id?: never
          owner_id: string
          realized_pnl?: number | null
          trade_id: number
        }
        Update: {
          allocated_quantity?: number
          allocation_role?: string
          execution_id?: number
          id?: never
          owner_id?: string
          realized_pnl?: number | null
          trade_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "trade_execution_allocations_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "executions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_execution_allocations_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "reconstructed_trades"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_plan_versions: {
        Row: {
          created_at: string
          id: number
          owner_id: string
          plan_id: number
          snapshot: Json
          snapshot_hash: string
          version_number: number
        }
        Insert: {
          created_at?: string
          id?: never
          owner_id: string
          plan_id: number
          snapshot: Json
          snapshot_hash: string
          version_number: number
        }
        Update: {
          created_at?: string
          id?: never
          owner_id?: string
          plan_id?: number
          snapshot?: Json
          snapshot_hash?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "trade_plan_versions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "trade_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_plans: {
        Row: {
          account_id: number | null
          created_at: string
          current_version: number
          direction: string
          hard_stop: number | null
          id: number
          instrument_id: number | null
          locked_at: string | null
          max_risk_amount: number | null
          owner_id: string
          planned_entry: number | null
          planned_for: string | null
          planned_quantity: number | null
          primary_target: number | null
          risk_currency: string
          session_name: string | null
          status: string
          thesis: string
          title: string
          updated_at: string
        }
        Insert: {
          account_id?: number | null
          created_at?: string
          current_version?: number
          direction: string
          hard_stop?: number | null
          id?: never
          instrument_id?: number | null
          locked_at?: string | null
          max_risk_amount?: number | null
          owner_id: string
          planned_entry?: number | null
          planned_for?: string | null
          planned_quantity?: number | null
          primary_target?: number | null
          risk_currency?: string
          session_name?: string | null
          status?: string
          thesis: string
          title: string
          updated_at?: string
        }
        Update: {
          account_id?: number | null
          created_at?: string
          current_version?: number
          direction?: string
          hard_stop?: number | null
          id?: never
          instrument_id?: number | null
          locked_at?: string | null
          max_risk_amount?: number | null
          owner_id?: string
          planned_entry?: number | null
          planned_for?: string | null
          planned_quantity?: number | null
          primary_target?: number | null
          risk_currency?: string
          session_name?: string | null
          status?: string
          thesis?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_plans_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_plans_instrument_id_fkey"
            columns: ["instrument_id"]
            isOneToOne: false
            referencedRelation: "instruments"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_reviews: {
        Row: {
          created_at: string
          discipline_grade: number | null
          emotional_state: string | null
          execution_grade: number | null
          followed_plan: boolean | null
          id: number
          lessons: string | null
          owner_id: string
          plan_id: number | null
          risk_grade: number | null
          rule_violations: Json
          tags: string[]
          trade_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          discipline_grade?: number | null
          emotional_state?: string | null
          execution_grade?: number | null
          followed_plan?: boolean | null
          id?: never
          lessons?: string | null
          owner_id: string
          plan_id?: number | null
          risk_grade?: number | null
          rule_violations?: Json
          tags?: string[]
          trade_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          discipline_grade?: number | null
          emotional_state?: string | null
          execution_grade?: number | null
          followed_plan?: boolean | null
          id?: never
          lessons?: string | null
          owner_id?: string
          plan_id?: number | null
          risk_grade?: number | null
          rule_violations?: Json
          tags?: string[]
          trade_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_reviews_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "trade_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_reviews_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: true
            referencedRelation: "reconstructed_trades"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_accounts: {
        Row: {
          base_currency: string
          created_at: string
          display_name: string
          external_account_id: string
          id: number
          is_active: boolean
          metadata: Json
          owner_id: string
          source_system: string
          updated_at: string
        }
        Insert: {
          base_currency?: string
          created_at?: string
          display_name: string
          external_account_id: string
          id?: never
          is_active?: boolean
          metadata?: Json
          owner_id: string
          source_system: string
          updated_at?: string
        }
        Update: {
          base_currency?: string
          created_at?: string
          display_name?: string
          external_account_id?: string
          id?: never
          is_active?: boolean
          metadata?: Json
          owner_id?: string
          source_system?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
