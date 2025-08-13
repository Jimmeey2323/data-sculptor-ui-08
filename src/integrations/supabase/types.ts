export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      Auth: {
        Row: {
          cookie: string | null
          created_at: string
          id: number
        }
        Insert: {
          cookie?: string | null
          created_at?: string
          id?: number
        }
        Update: {
          cookie?: string | null
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      Bookings: {
        Row: {
          Cancelled: string | null
          "Class Date": string | null
          "Class Name": string | null
          "Customer Email": string
          "Home location": string | null
          "Late Cancelled": string | null
          Location: string | null
          "Membership used": string | null
          "No Show": string | null
          "Payment Method": string | null
          Refunded: string | null
          "Sale Date": string | null
          "Sale Value": string | null
          "Sales tax": string | null
          "Sold by": string | null
          Teacher: string | null
        }
        Insert: {
          Cancelled?: string | null
          "Class Date"?: string | null
          "Class Name"?: string | null
          "Customer Email": string
          "Home location"?: string | null
          "Late Cancelled"?: string | null
          Location?: string | null
          "Membership used"?: string | null
          "No Show"?: string | null
          "Payment Method"?: string | null
          Refunded?: string | null
          "Sale Date"?: string | null
          "Sale Value"?: string | null
          "Sales tax"?: string | null
          "Sold by"?: string | null
          Teacher?: string | null
        }
        Update: {
          Cancelled?: string | null
          "Class Date"?: string | null
          "Class Name"?: string | null
          "Customer Email"?: string
          "Home location"?: string | null
          "Late Cancelled"?: string | null
          Location?: string | null
          "Membership used"?: string | null
          "No Show"?: string | null
          "Payment Method"?: string | null
          Refunded?: string | null
          "Sale Date"?: string | null
          "Sale Value"?: string | null
          "Sales tax"?: string | null
          "Sold by"?: string | null
          Teacher?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      FAQ: {
        Row: {
          Category: string | null
          Question: string
          Response: string | null
          "Side Note": string | null
          Variations: string | null
        }
        Insert: {
          Category?: string | null
          Question: string
          Response?: string | null
          "Side Note"?: string | null
          Variations?: string | null
        }
        Update: {
          Category?: string | null
          Question?: string
          Response?: string | null
          "Side Note"?: string | null
          Variations?: string | null
        }
        Relationships: []
      }
      fitness_classes: {
        Row: {
          checkins: number
          class_average: number
          class_name: string
          day_of_week: string
          id: string
          occurrences: number
          time: string
        }
        Insert: {
          checkins?: number
          class_average?: number
          class_name: string
          day_of_week: string
          id: string
          occurrences?: number
          time: string
        }
        Update: {
          checkins?: number
          class_average?: number
          class_name?: string
          day_of_week?: string
          id?: string
          occurrences?: number
          time?: string
        }
        Relationships: []
      }
      Leads: {
        Row: {
          Associate: string | null
          Center: string | null
          Channel: string | null
          "Class Type": string | null
          "Conversion Status": string | null
          "Converted To Customer At": string | null
          "Created At": string | null
          Email: string | null
          "Follow Up 1 Date": string | null
          "Follow Up 2 Date": string | null
          "Follow Up 3 Date": string | null
          "Follow Up 4 Date": string | null
          "Follow Up Comments (1)": string | null
          "Follow Up Comments (2)": string | null
          "Follow Up Comments (3)": string | null
          "Follow Up Comments (4)": string | null
          "Full Name": string | null
          "Host ID": string | null
          ID: number
          LTV: string | null
          "Member ID": string | null
          Period: string | null
          "Phone Number": string | null
          "Purchases Made": string | null
          Remarks: string | null
          "Retention Status": string | null
          Source: string | null
          "Source ID": string | null
          Stage: string | null
          Status: string | null
          "Trial Status": string | null
          Visits: string | null
        }
        Insert: {
          Associate?: string | null
          Center?: string | null
          Channel?: string | null
          "Class Type"?: string | null
          "Conversion Status"?: string | null
          "Converted To Customer At"?: string | null
          "Created At"?: string | null
          Email?: string | null
          "Follow Up 1 Date"?: string | null
          "Follow Up 2 Date"?: string | null
          "Follow Up 3 Date"?: string | null
          "Follow Up 4 Date"?: string | null
          "Follow Up Comments (1)"?: string | null
          "Follow Up Comments (2)"?: string | null
          "Follow Up Comments (3)"?: string | null
          "Follow Up Comments (4)"?: string | null
          "Full Name"?: string | null
          "Host ID"?: string | null
          ID: number
          LTV?: string | null
          "Member ID"?: string | null
          Period?: string | null
          "Phone Number"?: string | null
          "Purchases Made"?: string | null
          Remarks?: string | null
          "Retention Status"?: string | null
          Source?: string | null
          "Source ID"?: string | null
          Stage?: string | null
          Status?: string | null
          "Trial Status"?: string | null
          Visits?: string | null
        }
        Update: {
          Associate?: string | null
          Center?: string | null
          Channel?: string | null
          "Class Type"?: string | null
          "Conversion Status"?: string | null
          "Converted To Customer At"?: string | null
          "Created At"?: string | null
          Email?: string | null
          "Follow Up 1 Date"?: string | null
          "Follow Up 2 Date"?: string | null
          "Follow Up 3 Date"?: string | null
          "Follow Up 4 Date"?: string | null
          "Follow Up Comments (1)"?: string | null
          "Follow Up Comments (2)"?: string | null
          "Follow Up Comments (3)"?: string | null
          "Follow Up Comments (4)"?: string | null
          "Full Name"?: string | null
          "Host ID"?: string | null
          ID?: number
          LTV?: string | null
          "Member ID"?: string | null
          Period?: string | null
          "Phone Number"?: string | null
          "Purchases Made"?: string | null
          Remarks?: string | null
          "Retention Status"?: string | null
          Source?: string | null
          "Source ID"?: string | null
          Stage?: string | null
          Status?: string | null
          "Trial Status"?: string | null
          Visits?: string | null
        }
        Relationships: []
      }
      nods_page: {
        Row: {
          checksum: string | null
          id: number
          meta: Json | null
          parent_page_id: number | null
          path: string
          source: string | null
          type: string | null
        }
        Insert: {
          checksum?: string | null
          id?: number
          meta?: Json | null
          parent_page_id?: number | null
          path: string
          source?: string | null
          type?: string | null
        }
        Update: {
          checksum?: string | null
          id?: number
          meta?: Json | null
          parent_page_id?: number | null
          path?: string
          source?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nods_page_parent_page_id_fkey"
            columns: ["parent_page_id"]
            isOneToOne: false
            referencedRelation: "nods_page"
            referencedColumns: ["id"]
          },
        ]
      }
      nods_page_section: {
        Row: {
          content: string | null
          embedding: string | null
          heading: string | null
          id: number
          page_id: number
          slug: string | null
          token_count: number | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          heading?: string | null
          id?: number
          page_id: number
          slug?: string | null
          token_count?: number | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          heading?: string | null
          id?: number
          page_id?: number
          slug?: string | null
          token_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nods_page_section_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "nods_page"
            referencedColumns: ["id"]
          },
        ]
      }
      "Product Info": {
        Row: {
          "Freeze Duration": string | null
          "Host Id": number | null
          id: number
          Name: string | null
          "No of Freeze Attempts": string | null
          "No of Sessions": string | null
          "Price Post Tax": string | null
          "Price Pre Tax": string | null
          "Product Type": string | null
          "Purchase Link": string | null
          "Suggested Audience": string | null
          "Tax Percentage": string | null
          "Valid For": string | null
        }
        Insert: {
          "Freeze Duration"?: string | null
          "Host Id"?: number | null
          id: number
          Name?: string | null
          "No of Freeze Attempts"?: string | null
          "No of Sessions"?: string | null
          "Price Post Tax"?: string | null
          "Price Pre Tax"?: string | null
          "Product Type"?: string | null
          "Purchase Link"?: string | null
          "Suggested Audience"?: string | null
          "Tax Percentage"?: string | null
          "Valid For"?: string | null
        }
        Update: {
          "Freeze Duration"?: string | null
          "Host Id"?: number | null
          id?: number
          Name?: string | null
          "No of Freeze Attempts"?: string | null
          "No of Sessions"?: string | null
          "Price Post Tax"?: string | null
          "Price Pre Tax"?: string | null
          "Product Type"?: string | null
          "Purchase Link"?: string | null
          "Suggested Audience"?: string | null
          "Tax Percentage"?: string | null
          "Valid For"?: string | null
        }
        Relationships: []
      }
      Products: {
        Row: {
          "Freeze Duration": string | null
          "Host Id": number | null
          id: number
          Name: string | null
          "No of Freeze Attempts": number | null
          "No of Sessions": string | null
          "Price Post Tax": number | null
          "Price Pre Tax": number | null
          "Product Type": string | null
          "Purchase Link": string | null
          "Suggested Audience": string | null
          "Tax Percentage": string | null
          "Valid For": string | null
        }
        Insert: {
          "Freeze Duration"?: string | null
          "Host Id"?: number | null
          id: number
          Name?: string | null
          "No of Freeze Attempts"?: number | null
          "No of Sessions"?: string | null
          "Price Post Tax"?: number | null
          "Price Pre Tax"?: number | null
          "Product Type"?: string | null
          "Purchase Link"?: string | null
          "Suggested Audience"?: string | null
          "Tax Percentage"?: string | null
          "Valid For"?: string | null
        }
        Update: {
          "Freeze Duration"?: string | null
          "Host Id"?: number | null
          id?: number
          Name?: string | null
          "No of Freeze Attempts"?: number | null
          "No of Sessions"?: string | null
          "Price Post Tax"?: number | null
          "Price Pre Tax"?: number | null
          "Product Type"?: string | null
          "Purchase Link"?: string | null
          "Suggested Audience"?: string | null
          "Tax Percentage"?: string | null
          "Valid For"?: string | null
        }
        Relationships: []
      }
      "schedule-n8n": {
        Row: {
          capacity: number | null
          checkins: number | null
          description: string | null
          embed: string | null
          id: number
          ID: number
          location: string | null
          name: string | null
          startsAt: string | null
          teacherFirstName: string | null
          teacherLastName: string | null
        }
        Insert: {
          capacity?: number | null
          checkins?: number | null
          description?: string | null
          embed?: string | null
          id?: number
          ID: number
          location?: string | null
          name?: string | null
          startsAt?: string | null
          teacherFirstName?: string | null
          teacherLastName?: string | null
        }
        Update: {
          capacity?: number | null
          checkins?: number | null
          description?: string | null
          embed?: string | null
          id?: number
          ID?: number
          location?: string | null
          name?: string | null
          startsAt?: string | null
          teacherFirstName?: string | null
          teacherLastName?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: number
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
        }
        Relationships: []
      }
      "Whatsapp Agent": {
        Row: {
          created_at: string
          id: number
          memory: string | null
          sessionID: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          memory?: string | null
          sessionID?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          memory?: string | null
          sessionID?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      get_page_parents: {
        Args: { page_id: number }
        Returns: {
          id: number
          parent_page_id: number
          path: string
          meta: Json
        }[]
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      match_documents: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_page_sections: {
        Args: {
          embedding: string
          match_threshold: number
          match_count: number
          min_content_length: number
        }
        Returns: {
          id: number
          page_id: number
          slug: string
          heading: string
          content: string
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
