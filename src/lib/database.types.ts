export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      trainers: {
        Row: {
          id: string;
          auth_user_id: string;
          name: string;
          email: string;
          center_name: string | null;
          phone: string | null;
          onboarding_completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          name: string;
          email: string;
          center_name?: string | null;
          phone?: string | null;
          onboarding_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string;
          name?: string;
          email?: string;
          center_name?: string | null;
          phone?: string | null;
          onboarding_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      members: {
        Row: {
          id: string;
          trainer_id: string;
          name: string;
          email: string | null;
          phone: string;
          age: number;
          goal: string;
          status: "active" | "inactive" | "paused";
          joined_at: string;
          last_workout_at: string | null;
          auth_user_id: string | null;
          privacy_consent_at: string | null;
          terms_consent_at: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trainer_id: string;
          name: string;
          email?: string | null;
          phone: string;
          age: number;
          goal: string;
          status?: "active" | "inactive" | "paused";
          joined_at?: string;
          last_workout_at?: string | null;
          auth_user_id?: string | null;
          privacy_consent_at?: string | null;
          terms_consent_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trainer_id?: string;
          name?: string;
          email?: string | null;
          phone?: string;
          age?: number;
          goal?: string;
          status?: "active" | "inactive" | "paused";
          joined_at?: string;
          last_workout_at?: string | null;
          auth_user_id?: string | null;
          privacy_consent_at?: string | null;
          terms_consent_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "members_trainer_id_fkey";
            columns: ["trainer_id"];
            isOneToOne: false;
            referencedRelation: "trainers";
            referencedColumns: ["id"];
          },
        ];
      };
      workout_records: {
        Row: {
          id: string;
          member_id: string;
          trainer_id: string;
          record_date: string;
          content: string | null;
          title: string | null;
          duration: number | null;
          exercises: string[] | null;
          note: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          trainer_id: string;
          record_date: string;
          content?: string | null;
          title?: string | null;
          duration?: number | null;
          exercises?: string[] | null;
          note?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          trainer_id?: string;
          record_date?: string;
          content?: string | null;
          title?: string | null;
          duration?: number | null;
          exercises?: string[] | null;
          note?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workout_records_member_id_fkey";
            columns: ["member_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workout_records_trainer_id_fkey";
            columns: ["trainer_id"];
            isOneToOne: false;
            referencedRelation: "trainers";
            referencedColumns: ["id"];
          },
        ];
      };
      workout_record_media: {
        Row: {
          id: string;
          workout_record_id: string;
          trainer_id: string;
          storage_path: string;
          media_type: "image" | "video";
          file_name: string | null;
          mime_type: string | null;
          file_size: number | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          workout_record_id: string;
          trainer_id: string;
          storage_path: string;
          media_type: "image" | "video";
          file_name?: string | null;
          mime_type?: string | null;
          file_size?: number | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          workout_record_id?: string;
          trainer_id?: string;
          storage_path?: string;
          media_type?: "image" | "video";
          file_name?: string | null;
          mime_type?: string | null;
          file_size?: number | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workout_record_media_workout_record_id_fkey";
            columns: ["workout_record_id"];
            isOneToOne: false;
            referencedRelation: "workout_records";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workout_record_media_trainer_id_fkey";
            columns: ["trainer_id"];
            isOneToOne: false;
            referencedRelation: "trainers";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          id: string;
          member_id: string;
          trainer_id: string;
          sender: "trainer" | "member";
          content: string;
          sent_at: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          trainer_id: string;
          sender: "trainer" | "member";
          content: string;
          sent_at?: string;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          trainer_id?: string;
          sender?: "trainer" | "member";
          content?: string;
          sent_at?: string;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_member_id_fkey";
            columns: ["member_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_trainer_id_fkey";
            columns: ["trainer_id"];
            isOneToOne: false;
            referencedRelation: "trainers";
            referencedColumns: ["id"];
          },
        ];
      };
      schedules: {
        Row: {
          id: string;
          member_id: string;
          trainer_id: string;
          schedule_date: string;
          schedule_time: string;
          status: "confirmed" | "pending";
          deleted_at: string | null;
          cancelled_at: string | null;
          attended_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          trainer_id: string;
          schedule_date: string;
          schedule_time: string;
          status?: "confirmed" | "pending";
          deleted_at?: string | null;
          cancelled_at?: string | null;
          attended_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          trainer_id?: string;
          schedule_date?: string;
          schedule_time?: string;
          status?: "confirmed" | "pending";
          deleted_at?: string | null;
          cancelled_at?: string | null;
          attended_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "schedules_member_id_fkey";
            columns: ["member_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "schedules_trainer_id_fkey";
            columns: ["trainer_id"];
            isOneToOne: false;
            referencedRelation: "trainers";
            referencedColumns: ["id"];
          },
        ];
      };
      member_invites: {
        Row: {
          id: string;
          member_id: string;
          trainer_id: string;
          token: string;
          expires_at: string;
          used_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          trainer_id: string;
          token?: string;
          expires_at?: string;
          used_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          trainer_id?: string;
          token?: string;
          expires_at?: string;
          used_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      session_packages: {
        Row: {
          id: string;
          member_id: string;
          trainer_id: string;
          total_sessions: number;
          remaining_sessions: number;
          price: number | null;
          payment_method: "card" | "cash" | "transfer" | null;
          paid_at: string | null;
          note: string | null;
          started_at: string;
          expires_at: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          trainer_id: string;
          total_sessions: number;
          remaining_sessions: number;
          price?: number | null;
          payment_method?: "card" | "cash" | "transfer" | null;
          paid_at?: string | null;
          note?: string | null;
          started_at?: string;
          expires_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          trainer_id?: string;
          total_sessions?: number;
          remaining_sessions?: number;
          price?: number | null;
          payment_method?: "card" | "cash" | "transfer" | null;
          paid_at?: string | null;
          note?: string | null;
          started_at?: string;
          expires_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "session_packages_member_id_fkey";
            columns: ["member_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };
      body_records: {
        Row: {
          id: string;
          member_id: string;
          trainer_id: string;
          recorded_at: string;
          weight: number | null;
          muscle_mass: number | null;
          body_fat_percent: number | null;
          bmi: number | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          trainer_id: string;
          recorded_at?: string;
          weight?: number | null;
          muscle_mass?: number | null;
          body_fat_percent?: number | null;
          bmi?: number | null;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          trainer_id?: string;
          recorded_at?: string;
          weight?: number | null;
          muscle_mass?: number | null;
          body_fat_percent?: number | null;
          bmi?: number | null;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "body_records_member_id_fkey";
            columns: ["member_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };
      workout_templates: {
        Row: {
          id: string;
          trainer_id: string;
          name: string;
          body_parts: string[] | null;
          duration: number | null;
          content: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          trainer_id: string;
          name: string;
          body_parts?: string[] | null;
          duration?: number | null;
          content?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          trainer_id?: string;
          name?: string;
          body_parts?: string[] | null;
          duration?: number | null;
          content?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      data_requests: {
        Row: {
          id: string;
          requester_role: "trainer" | "member";
          requester_auth_id: string;
          member_id: string | null;
          trainer_id: string | null;
          request_type: "export" | "deletion";
          status: "pending" | "processing" | "completed" | "rejected";
          notes: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          requester_role: "trainer" | "member";
          requester_auth_id: string;
          member_id?: string | null;
          trainer_id?: string | null;
          request_type: "export" | "deletion";
          status?: "pending" | "processing" | "completed" | "rejected";
          notes?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          requester_role?: "trainer" | "member";
          requester_auth_id?: string;
          member_id?: string | null;
          trainer_id?: string | null;
          request_type?: "export" | "deletion";
          status?: "pending" | "processing" | "completed" | "rejected";
          notes?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      deduct_session_on_attend: {
        Args: { p_schedule_id: string };
        Returns: undefined;
      };
      current_trainer_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      current_member_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      create_schedule_with_message: {
        Args: {
          p_member_id: string;
          p_trainer_id: string;
          p_schedule_date: string;
          p_schedule_time: string;
          p_message_content: string;
        };
        Returns: string;
      };
      get_trainer_chat_previews: {
        Args: Record<PropertyKey, never>;
        Returns: {
          member_id: string;
          member_name: string;
          preview: string;
          sent_at: string | null;
          unread_count: number;
        }[];
      };
      get_member_invite_by_token: {
        Args: { p_token: string };
        Returns: {
          member_id: string;
          member_name: string;
          member_email: string | null;
          member_phone: string;
        }[];
      };
      complete_member_invite: {
        Args: { p_token: string };
        Returns: undefined;
      };
      request_member_schedule: {
        Args: {
          p_schedule_date: string;
          p_schedule_time: string;
        };
        Returns: string;
      };
      cancel_member_schedule: {
        Args: { p_schedule_id: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
