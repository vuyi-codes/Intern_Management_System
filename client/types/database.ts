/**
 * Hand-maintained Supabase types aligned with supabase/migrations.
 * Regenerate with the CLI when the live schema changes (see SUPABASE_SETUP.md).
 */

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
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string
          title: string
          department: string
          avatar_url: string | null
          role: "admin" | "supervisor" | "intern"
          capacity: number | null
          supervisor_status: "Active" | "On leave" | "Inactive" | null
          supervisor_start_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string
          email?: string
          phone?: string
          title?: string
          department?: string
          avatar_url?: string | null
          role?: "admin" | "supervisor" | "intern"
          capacity?: number | null
          supervisor_status?: "Active" | "On leave" | "Inactive" | null
          supervisor_start_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone?: string
          title?: string
          department?: string
          avatar_url?: string | null
          role?: "admin" | "supervisor" | "intern"
          capacity?: number | null
          supervisor_status?: "Active" | "On leave" | "Inactive" | null
          supervisor_start_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      programmes: {
        Row: {
          id: string
          name: string
          cohort: string
          description: string
          lead_supervisor_id: string | null
          start_date: string | null
          end_date: string | null
          capacity: number
          status: "Active" | "Upcoming" | "Completed" | "Paused"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          cohort?: string
          description?: string
          lead_supervisor_id?: string | null
          start_date?: string | null
          end_date?: string | null
          capacity?: number
          status?: "Active" | "Upcoming" | "Completed" | "Paused"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          cohort?: string
          description?: string
          lead_supervisor_id?: string | null
          start_date?: string | null
          end_date?: string | null
          capacity?: number
          status?: "Active" | "Upcoming" | "Completed" | "Paused"
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "programmes_lead_supervisor_id_fkey"
            columns: ["lead_supervisor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      supervisor_programmes: {
        Row: {
          supervisor_id: string
          programme_id: string
        }
        Insert: {
          supervisor_id: string
          programme_id: string
        }
        Update: {
          supervisor_id?: string
          programme_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supervisor_programmes_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supervisor_programmes_programme_id_fkey"
            columns: ["programme_id"]
            isOneToOne: false
            referencedRelation: "programmes"
            referencedColumns: ["id"]
          },
        ]
      }
      interns: {
        Row: {
          id: string
          programme_id: string | null
          supervisor_id: string | null
          start_date: string | null
          end_date: string | null
          progress: number
          status: "Active" | "Onboarding" | "Paused" | "Completed"
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          programme_id?: string | null
          supervisor_id?: string | null
          start_date?: string | null
          end_date?: string | null
          progress?: number
          status?: "Active" | "Onboarding" | "Paused" | "Completed"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          programme_id?: string | null
          supervisor_id?: string | null
          start_date?: string | null
          end_date?: string | null
          progress?: number
          status?: "Active" | "Onboarding" | "Paused" | "Completed"
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interns_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interns_programme_id_fkey"
            columns: ["programme_id"]
            isOneToOne: false
            referencedRelation: "programmes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interns_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string
          intern_id: string
          assigned_by: string | null
          due_date: string | null
          priority: "High" | "Medium" | "Low"
          status: "In progress" | "Review" | "Overdue" | "Done"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          intern_id: string
          assigned_by?: string | null
          due_date?: string | null
          priority?: "High" | "Medium" | "Low"
          status?: "In progress" | "Review" | "Overdue" | "Done"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          intern_id?: string
          assigned_by?: string | null
          due_date?: string | null
          priority?: "High" | "Medium" | "Low"
          status?: "In progress" | "Review" | "Overdue" | "Done"
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_intern_id_fkey"
            columns: ["intern_id"]
            isOneToOne: false
            referencedRelation: "interns"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_logs: {
        Row: {
          id: string
          intern_id: string
          log_date: string
          hours: number
          summary: string
          blockers: string
          tomorrow: string
          status: "Submitted" | "Reviewed" | "Flagged"
          mentor_note: string
          reviewed_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          intern_id: string
          log_date: string
          hours?: number
          summary?: string
          blockers?: string
          tomorrow?: string
          status?: "Submitted" | "Reviewed" | "Flagged"
          mentor_note?: string
          reviewed_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          intern_id?: string
          log_date?: string
          hours?: number
          summary?: string
          blockers?: string
          tomorrow?: string
          status?: "Submitted" | "Reviewed" | "Flagged"
          mentor_note?: string
          reviewed_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_logs_intern_id_fkey"
            columns: ["intern_id"]
            isOneToOne: false
            referencedRelation: "interns"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          id: string
          title: string
          summary: string
          intern_id: string
          reviewer_id: string | null
          type: "Task" | "Daily log" | "Mid-programme" | "Final"
          submitted_at: string | null
          due_date: string | null
          status: "Pending" | "In progress" | "Completed"
          outcome: "Approved" | "Needs changes" | "Pending"
          feedback: string
          task_id: string | null
          daily_log_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          summary?: string
          intern_id: string
          reviewer_id?: string | null
          type: "Task" | "Daily log" | "Mid-programme" | "Final"
          submitted_at?: string | null
          due_date?: string | null
          status?: "Pending" | "In progress" | "Completed"
          outcome?: "Approved" | "Needs changes" | "Pending"
          feedback?: string
          task_id?: string | null
          daily_log_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          summary?: string
          intern_id?: string
          reviewer_id?: string | null
          type?: "Task" | "Daily log" | "Mid-programme" | "Final"
          submitted_at?: string | null
          due_date?: string | null
          status?: "Pending" | "In progress" | "Completed"
          outcome?: "Approved" | "Needs changes" | "Pending"
          feedback?: string
          task_id?: string | null
          daily_log_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_intern_id_fkey"
            columns: ["intern_id"]
            isOneToOne: false
            referencedRelation: "interns"
            referencedColumns: ["id"]
          },
        ]
      }
      programme_modules: {
        Row: {
          id: string
          intern_id: string
          title: string
          description: string
          progress: number
          status: "Completed" | "In progress" | "Upcoming" | "Blocked"
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          intern_id: string
          title: string
          description?: string
          progress?: number
          status?: "Completed" | "In progress" | "Upcoming" | "Blocked"
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          intern_id?: string
          title?: string
          description?: string
          progress?: number
          status?: "Completed" | "In progress" | "Upcoming" | "Blocked"
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "programme_modules_intern_id_fkey"
            columns: ["intern_id"]
            isOneToOne: false
            referencedRelation: "interns"
            referencedColumns: ["id"]
          },
        ]
      }
      intern_profiles: {
        Row: {
          user_id: string
          bio: string
          skills: string[]
          location: string
          university: string
          linkedin: string
          github: string
          emergency_name: string
          emergency_phone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          bio?: string
          skills?: string[]
          location?: string
          university?: string
          linkedin?: string
          github?: string
          emergency_name?: string
          emergency_phone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          bio?: string
          skills?: string[]
          location?: string
          university?: string
          linkedin?: string
          github?: string
          emergency_name?: string
          emergency_phone?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "intern_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          user_id: string
          notifications: Json
          preferences: Json
          privacy: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          notifications?: Json
          preferences?: Json
          privacy?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          notifications?: Json
          preferences?: Json
          privacy?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      org_settings: {
        Row: {
          id: boolean
          organisation_name: string
          default_intern_capacity: number
          require_enrolment_approval: boolean
          log_reminder_hour: number
          report_retention_days: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: boolean
          organisation_name?: string
          default_intern_capacity?: number
          require_enrolment_approval?: boolean
          log_reminder_hour?: number
          report_retention_days?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: boolean
          organisation_name?: string
          default_intern_capacity?: number
          require_enrolment_approval?: boolean
          log_reminder_hour?: number
          report_retention_days?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          conversation_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          conversation_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          body: string
          attachment_name: string | null
          attachment_size: number | null
          reactions: string[]
          edited_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          body?: string
          attachment_name?: string | null
          attachment_size?: number | null
          reactions?: string[]
          edited_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          body?: string
          attachment_name?: string | null
          attachment_size?: number | null
          reactions?: string[]
          edited_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          detail: string
          href: string
          icon_key: "bell" | "task" | "log" | "review"
          unread: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          detail?: string
          href?: string
          icon_key?: "bell" | "task" | "log" | "review"
          unread?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          detail?: string
          href?: string
          icon_key?: "bell" | "task" | "log" | "review"
          unread?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      current_role: { Args: Record<string, never>; Returns: string }
      is_admin: { Args: Record<string, never>; Returns: boolean }
      is_supervisor_of: {
        Args: { p_intern_id: string }
        Returns: boolean
      }
      is_conversation_participant: {
        Args: { p_conversation_id: string }
        Returns: boolean
      }
      create_or_get_dm: {
        Args: { p_other_user_id: string }
        Returns: string
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]
