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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          name: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string;
          name?: string;
          email?: string;
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
    };
    Views: Record<string, never>;
    Functions: {
      current_trainer_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
