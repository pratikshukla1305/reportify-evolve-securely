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
      advisories: {
        Row: {
          advisory_title: string
          advisory_type: string
          created_at: string | null
          detailed_content: string
          expiry_date: string | null
          id: number
          image_url: string | null
          issue_date: string
          issuing_authority: string
          location: string
          severity_level: string | null
          short_description: string
        }
        Insert: {
          advisory_title: string
          advisory_type: string
          created_at?: string | null
          detailed_content: string
          expiry_date?: string | null
          id?: number
          image_url?: string | null
          issue_date: string
          issuing_authority: string
          location: string
          severity_level?: string | null
          short_description: string
        }
        Update: {
          advisory_title?: string
          advisory_type?: string
          created_at?: string | null
          detailed_content?: string
          expiry_date?: string | null
          id?: number
          image_url?: string | null
          issue_date?: string
          issuing_authority?: string
          location?: string
          severity_level?: string | null
          short_description?: string
        }
        Relationships: []
      }
      cases: {
        Row: {
          address: string
          case_date: string
          case_id: number
          case_number: string
          case_time: string
          case_type: string
          created_at: string | null
          description: string
          latitude: number | null
          longitude: number | null
          region: string
          reporter_id: string | null
          status: string | null
        }
        Insert: {
          address: string
          case_date: string
          case_id?: number
          case_number: string
          case_time: string
          case_type: string
          created_at?: string | null
          description: string
          latitude?: number | null
          longitude?: number | null
          region: string
          reporter_id?: string | null
          status?: string | null
        }
        Update: {
          address?: string
          case_date?: string
          case_id?: number
          case_number?: string
          case_time?: string
          case_type?: string
          created_at?: string | null
          description?: string
          latitude?: number | null
          longitude?: number | null
          region?: string
          reporter_id?: string | null
          status?: string | null
        }
        Relationships: []
      }
      crime_reports: {
        Row: {
          description: string | null
          id: string
          incident_date: string | null
          is_anonymous: boolean
          location: string | null
          officer_notes: string | null
          report_date: string
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          description?: string | null
          id?: string
          incident_date?: string | null
          is_anonymous?: boolean
          location?: string | null
          officer_notes?: string | null
          report_date?: string
          status?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          description?: string | null
          id?: string
          incident_date?: string | null
          is_anonymous?: boolean
          location?: string | null
          officer_notes?: string | null
          report_date?: string
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      criminal_profiles: {
        Row: {
          additional_information: string | null
          age: number | null
          case_number: string
          charges: string
          created_at: string | null
          full_name: string
          height: number | null
          id: number
          last_known_location: string
          photo_url: string | null
          risk_level: string | null
          weight: number | null
        }
        Insert: {
          additional_information?: string | null
          age?: number | null
          case_number: string
          charges: string
          created_at?: string | null
          full_name: string
          height?: number | null
          id?: number
          last_known_location: string
          photo_url?: string | null
          risk_level?: string | null
          weight?: number | null
        }
        Update: {
          additional_information?: string | null
          age?: number | null
          case_number?: string
          charges?: string
          created_at?: string | null
          full_name?: string
          height?: number | null
          id?: number
          last_known_location?: string
          photo_url?: string | null
          risk_level?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      criminal_tips: {
        Row: {
          description: string
          email: string | null
          id: number
          image_url: string | null
          is_anonymous: boolean | null
          location: string | null
          phone: string | null
          status: string | null
          subject: string
          submitter_name: string | null
          tip_date: string | null
        }
        Insert: {
          description: string
          email?: string | null
          id?: number
          image_url?: string | null
          is_anonymous?: boolean | null
          location?: string | null
          phone?: string | null
          status?: string | null
          subject: string
          submitter_name?: string | null
          tip_date?: string | null
        }
        Update: {
          description?: string
          email?: string | null
          id?: number
          image_url?: string | null
          is_anonymous?: boolean | null
          location?: string | null
          phone?: string | null
          status?: string | null
          subject?: string
          submitter_name?: string | null
          tip_date?: string | null
        }
        Relationships: []
      }
      evidence: {
        Row: {
          description: string | null
          id: string
          report_id: string
          storage_path: string | null
          title: string | null
          type: string | null
          uploaded_at: string
          user_id: string
        }
        Insert: {
          description?: string | null
          id?: string
          report_id: string
          storage_path?: string | null
          title?: string | null
          type?: string | null
          uploaded_at?: string
          user_id: string
        }
        Update: {
          description?: string | null
          id?: string
          report_id?: string
          storage_path?: string | null
          title?: string | null
          type?: string | null
          uploaded_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "crime_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_verifications: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: number
          id_back: string | null
          id_front: string | null
          officer_action: string | null
          rejection_reason: string | null
          selfie: string | null
          status: string | null
          submission_date: string
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id?: number
          id_back?: string | null
          id_front?: string | null
          officer_action?: string | null
          rejection_reason?: string | null
          selfie?: string | null
          status?: string | null
          submission_date: string
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: number
          id_back?: string | null
          id_front?: string | null
          officer_action?: string | null
          rejection_reason?: string | null
          selfie?: string | null
          status?: string | null
          submission_date?: string
        }
        Relationships: []
      }
      officer_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          notification_type: string
          report_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          notification_type: string
          report_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          notification_type?: string
          report_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "officer_notifications_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "crime_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      officer_profiles: {
        Row: {
          badge_number: string
          confirm_password: string
          department: string
          department_email: string
          full_name: string
          id: number
          password: string
          phone_number: string
        }
        Insert: {
          badge_number: string
          confirm_password: string
          department: string
          department_email: string
          full_name: string
          id?: number
          password: string
          phone_number: string
        }
        Update: {
          badge_number?: string
          confirm_password?: string
          department?: string
          department_email?: string
          full_name?: string
          id?: number
          password?: string
          phone_number?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      sos_alerts: {
        Row: {
          alert_id: string
          contact_info: string | null
          contact_user: boolean | null
          created_at: string | null
          dispatch_team: string | null
          latitude: number | null
          location: string
          longitude: number | null
          message: string | null
          reported_by: string
          reported_time: string
          status: string | null
          urgency_level: string | null
          voice_recording: string | null
        }
        Insert: {
          alert_id: string
          contact_info?: string | null
          contact_user?: boolean | null
          created_at?: string | null
          dispatch_team?: string | null
          latitude?: number | null
          location: string
          longitude?: number | null
          message?: string | null
          reported_by: string
          reported_time: string
          status?: string | null
          urgency_level?: string | null
          voice_recording?: string | null
        }
        Update: {
          alert_id?: string
          contact_info?: string | null
          contact_user?: boolean | null
          created_at?: string | null
          dispatch_team?: string | null
          latitude?: number | null
          location?: string
          longitude?: number | null
          message?: string | null
          reported_by?: string
          reported_time?: string
          status?: string | null
          urgency_level?: string | null
          voice_recording?: string | null
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
