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
      crime_map_locations: {
        Row: {
          case_id: number | null
          created_at: string | null
          crime_type: string
          description: string | null
          id: string
          latitude: number
          longitude: number
          title: string
          updated_at: string | null
        }
        Insert: {
          case_id?: number | null
          created_at?: string | null
          crime_type: string
          description?: string | null
          id?: string
          latitude: number
          longitude: number
          title: string
          updated_at?: string | null
        }
        Update: {
          case_id?: number | null
          created_at?: string | null
          crime_type?: string
          description?: string | null
          id?: string
          latitude?: number
          longitude?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crime_map_locations_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["case_id"]
          },
        ]
      }
      crime_report_analysis: {
        Row: {
          confidence: number
          created_at: string
          crime_type: string
          description: string
          id: string
          model_version: string | null
          report_id: string | null
        }
        Insert: {
          confidence: number
          created_at?: string
          crime_type: string
          description: string
          id?: string
          model_version?: string | null
          report_id?: string | null
        }
        Update: {
          confidence?: number
          created_at?: string
          crime_type?: string
          description?: string
          id?: string
          model_version?: string | null
          report_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crime_report_analysis_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: true
            referencedRelation: "crime_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      crime_reports: {
        Row: {
          description: string | null
          detailed_location: string | null
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
          detailed_location?: string | null
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
          detailed_location?: string | null
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
      evidence_views: {
        Row: {
          evidence_id: string | null
          id: string
          officer_id: string | null
          view_complete: boolean
          view_date: string
        }
        Insert: {
          evidence_id?: string | null
          id?: string
          officer_id?: string | null
          view_complete?: boolean
          view_date?: string
        }
        Update: {
          evidence_id?: string | null
          id?: string
          officer_id?: string | null
          view_complete?: boolean
          view_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_views_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "evidence"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_documents: {
        Row: {
          created_at: string | null
          document_type: string
          document_url: string
          extracted_data: Json | null
          id: string
          verification_id: number | null
        }
        Insert: {
          created_at?: string | null
          document_type: string
          document_url: string
          extracted_data?: Json | null
          id?: string
          verification_id?: number | null
        }
        Update: {
          created_at?: string | null
          document_type?: string
          document_url?: string
          extracted_data?: Json | null
          id?: string
          verification_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kyc_documents_verification_id_fkey"
            columns: ["verification_id"]
            isOneToOne: false
            referencedRelation: "kyc_verifications"
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
      pdf_downloads: {
        Row: {
          download_date: string
          filename: string
          id: string
          officer_id: string | null
          report_id: string | null
          success: boolean
        }
        Insert: {
          download_date?: string
          filename: string
          id?: string
          officer_id?: string | null
          report_id?: string | null
          success?: boolean
        }
        Update: {
          download_date?: string
          filename?: string
          id?: string
          officer_id?: string | null
          report_id?: string | null
          success?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "pdf_downloads_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "crime_reports"
            referencedColumns: ["id"]
          },
        ]
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
      report_pdfs: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          is_official: boolean | null
          report_id: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          is_official?: boolean | null
          report_id?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          is_official?: boolean | null
          report_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_pdfs_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "crime_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      report_shares: {
        Row: {
          id: string
          report_id: string
          share_type: string
          shared_at: string
          shared_to: string
        }
        Insert: {
          id?: string
          report_id: string
          share_type: string
          shared_at?: string
          shared_to: string
        }
        Update: {
          id?: string
          report_id?: string
          share_type?: string
          shared_at?: string
          shared_to?: string
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
          map_redirect_url: string | null
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
          map_redirect_url?: string | null
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
          map_redirect_url?: string | null
          message?: string | null
          reported_by?: string
          reported_time?: string
          status?: string | null
          urgency_level?: string | null
          voice_recording?: string | null
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          notification_type: string
          report_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          notification_type: string
          report_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string
          report_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "crime_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      video_analysis_queue: {
        Row: {
          created_at: string
          evidence_id: string | null
          id: string
          processed_at: string | null
          report_id: string | null
          status: string | null
          video_url: string
        }
        Insert: {
          created_at?: string
          evidence_id?: string | null
          id?: string
          processed_at?: string | null
          report_id?: string | null
          status?: string | null
          video_url: string
        }
        Update: {
          created_at?: string
          evidence_id?: string | null
          id?: string
          processed_at?: string | null
          report_id?: string | null
          status?: string | null
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_analysis_queue_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "evidence"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_analysis_queue_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "crime_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_recordings: {
        Row: {
          alert_id: string | null
          created_at: string | null
          id: string
          recording_url: string
        }
        Insert: {
          alert_id?: string | null
          created_at?: string | null
          id?: string
          recording_url: string
        }
        Update: {
          alert_id?: string | null
          created_at?: string | null
          id?: string
          recording_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_recordings_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "sos_alerts"
            referencedColumns: ["alert_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      register_officer: {
        Args: {
          full_name: string
          badge_number: string
          department: string
          department_email: string
          phone_number: string
          password: string
          confirm_password: string
        }
        Returns: Json
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
