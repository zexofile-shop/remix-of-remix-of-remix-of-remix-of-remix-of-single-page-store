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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      best_selling: {
        Row: {
          id: string
          product_id: string | null
          sort_order: number | null
        }
        Insert: {
          id?: string
          product_id?: string | null
          sort_order?: number | null
        }
        Update: {
          id?: string
          product_id?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "best_selling_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: number | null
          email: string | null
          id: string
          message: string
          name: string
          phone: string | null
          read: boolean | null
        }
        Insert: {
          created_at?: number | null
          email?: string | null
          id?: string
          message: string
          name: string
          phone?: string | null
          read?: boolean | null
        }
        Update: {
          created_at?: number | null
          email?: string | null
          id?: string
          message?: string
          name?: string
          phone?: string | null
          read?: boolean | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: number | null
          discount_type: string | null
          discount_value: number
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_order: number | null
          used_by: Json | null
          used_count: number | null
        }
        Insert: {
          code: string
          created_at?: number | null
          discount_type?: string | null
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order?: number | null
          used_by?: Json | null
          used_count?: number | null
        }
        Update: {
          code?: string
          created_at?: number | null
          discount_type?: string | null
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order?: number | null
          used_by?: Json | null
          used_count?: number | null
        }
        Relationships: []
      }
      custom_projects: {
        Row: {
          admin_notes: string | null
          budget: string | null
          contact: string | null
          created_at: number | null
          description: string | null
          id: string
          status: string | null
          title: string
          type: string | null
          user_email: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          budget?: string | null
          contact?: string | null
          created_at?: number | null
          description?: string | null
          id?: string
          status?: string | null
          title: string
          type?: string | null
          user_email?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          budget?: string | null
          contact?: string | null
          created_at?: number | null
          description?: string | null
          id?: string
          status?: string | null
          title?: string
          type?: string | null
          user_email?: string | null
          user_id?: string
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          created_at: number | null
          id: string
          image: string
          sort_order: number | null
          subtitle: string | null
          title: string | null
        }
        Insert: {
          created_at?: number | null
          id?: string
          image: string
          sort_order?: number | null
          subtitle?: string | null
          title?: string | null
        }
        Update: {
          created_at?: number | null
          id?: string
          image?: string
          sort_order?: number | null
          subtitle?: string | null
          title?: string | null
        }
        Relationships: []
      }
      order_submissions: {
        Row: {
          created_at: number | null
          form_data: Json | null
          id: string
          payment_amount: number | null
          payment_type: string | null
          product_id: string | null
          product_image: string | null
          product_title: string | null
          razorpay_payment_id: string | null
          status: string | null
          user_email: string | null
          user_id: string
          user_name: string | null
        }
        Insert: {
          created_at?: number | null
          form_data?: Json | null
          id?: string
          payment_amount?: number | null
          payment_type?: string | null
          product_id?: string | null
          product_image?: string | null
          product_title?: string | null
          razorpay_payment_id?: string | null
          status?: string | null
          user_email?: string | null
          user_id: string
          user_name?: string | null
        }
        Update: {
          created_at?: number | null
          form_data?: Json | null
          id?: string
          payment_amount?: number | null
          payment_type?: string | null
          product_id?: string | null
          product_image?: string | null
          product_title?: string | null
          razorpay_payment_id?: string | null
          status?: string | null
          user_email?: string | null
          user_id?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_submissions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          allow_customization: boolean | null
          buy_button_label: string | null
          category: string | null
          content: string | null
          created_at: number | null
          delivery_link: string | null
          description: string | null
          display_price_from: string | null
          id: string
          image: string | null
          image_aspect_ratio: string | null
          is_free_resource: boolean | null
          is_out_of_stock: boolean | null
          left_button: Json | null
          original_price: number | null
          preview_link: string | null
          price: number
          razorpay_link: string | null
          right_button: Json | null
          screenshots: string[] | null
          title: string
          type: string
          youtube_url: string | null
        }
        Insert: {
          allow_customization?: boolean | null
          buy_button_label?: string | null
          category?: string | null
          content?: string | null
          created_at?: number | null
          delivery_link?: string | null
          description?: string | null
          display_price_from?: string | null
          id?: string
          image?: string | null
          image_aspect_ratio?: string | null
          is_free_resource?: boolean | null
          is_out_of_stock?: boolean | null
          left_button?: Json | null
          original_price?: number | null
          preview_link?: string | null
          price?: number
          razorpay_link?: string | null
          right_button?: Json | null
          screenshots?: string[] | null
          title: string
          type?: string
          youtube_url?: string | null
        }
        Update: {
          allow_customization?: boolean | null
          buy_button_label?: string | null
          category?: string | null
          content?: string | null
          created_at?: number | null
          delivery_link?: string | null
          description?: string | null
          display_price_from?: string | null
          id?: string
          image?: string | null
          image_aspect_ratio?: string | null
          is_free_resource?: boolean | null
          is_out_of_stock?: boolean | null
          left_button?: Json | null
          original_price?: number | null
          preview_link?: string | null
          price?: number
          razorpay_link?: string | null
          right_button?: Json | null
          screenshots?: string[] | null
          title?: string
          type?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: number | null
          display_name: string | null
          email: string | null
          id: string
          instagram: string | null
          phone: string | null
          profile_pic: string | null
          telegram: string | null
          whatsapp: string | null
        }
        Insert: {
          created_at?: number | null
          display_name?: string | null
          email?: string | null
          id: string
          instagram?: string | null
          phone?: string | null
          profile_pic?: string | null
          telegram?: string | null
          whatsapp?: string | null
        }
        Update: {
          created_at?: number | null
          display_name?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          phone?: string | null
          profile_pic?: string | null
          telegram?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount: number | null
          coupon_code: string | null
          coupon_discount: number | null
          delivery_link: string | null
          id: string
          original_amount: number | null
          product_id: string | null
          product_image: string | null
          product_title: string | null
          product_type: string | null
          purchase_date: number | null
          purchase_type: string | null
          razorpay_payment_id: string | null
          user_email: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          coupon_code?: string | null
          coupon_discount?: number | null
          delivery_link?: string | null
          id?: string
          original_amount?: number | null
          product_id?: string | null
          product_image?: string | null
          product_title?: string | null
          product_type?: string | null
          purchase_date?: number | null
          purchase_type?: string | null
          razorpay_payment_id?: string | null
          user_email?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          coupon_code?: string | null
          coupon_discount?: number | null
          delivery_link?: string | null
          id?: string
          original_amount?: number | null
          product_id?: string | null
          product_image?: string | null
          product_title?: string | null
          product_type?: string | null
          purchase_date?: number | null
          purchase_type?: string | null
          razorpay_payment_id?: string | null
          user_email?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          id: string
          key: string
          value: Json | null
        }
        Insert: {
          id?: string
          key: string
          value?: Json | null
        }
        Update: {
          id?: string
          key?: string
          value?: Json | null
        }
        Relationships: []
      }
      support_channels: {
        Row: {
          id: string
          phone1: string | null
          phone2: string | null
          telegram1: string | null
          telegram2: string | null
          whatsapp1: string | null
          whatsapp2: string | null
        }
        Insert: {
          id?: string
          phone1?: string | null
          phone2?: string | null
          telegram1?: string | null
          telegram2?: string | null
          whatsapp1?: string | null
          whatsapp2?: string | null
        }
        Update: {
          id?: string
          phone1?: string | null
          phone2?: string | null
          telegram1?: string | null
          telegram2?: string | null
          whatsapp1?: string | null
          whatsapp2?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          approved: boolean | null
          created_at: number | null
          id: string
          message: string
          name: string
          rating: number | null
        }
        Insert: {
          approved?: boolean | null
          created_at?: number | null
          id?: string
          message: string
          name: string
          rating?: number | null
        }
        Update: {
          approved?: boolean | null
          created_at?: number | null
          id?: string
          message?: string
          name?: string
          rating?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          access_level: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          permissions: Json | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          access_level?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          access_level?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_admin_permissions: { Args: { _user_id: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
