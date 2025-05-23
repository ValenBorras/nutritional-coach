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
      users: {
        Row: {
          id: string
          name: string | null
          email: string | null
          email_verified: string | null
          password: string | null
          image: string | null
          role: 'patient' | 'nutritionist'
          nutritionist_key: string | null
          nutritionist_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          email?: string | null
          email_verified?: string | null
          password?: string | null
          image?: string | null
          role?: 'patient' | 'nutritionist'
          nutritionist_key?: string | null
          nutritionist_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          email_verified?: string | null
          password?: string | null
          image?: string | null
          role?: 'patient' | 'nutritionist'
          nutritionist_key?: string | null
          nutritionist_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_nutritionist_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          first_name: string | null
          last_name: string | null
          phone_number: string | null
          birth_date: string | null
          gender: 'male' | 'female' | 'other' | null
          height: number | null
          weight: number | null
          activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null
          goals: string[] | null
          allergies: string[] | null
          dietary_restrictions: string[] | null
          medical_conditions: string[] | null
          preferences: Json | null
          specializations: string[] | null
          education: string | null
          experience: number | null
          certifications: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name?: string | null
          last_name?: string | null
          phone_number?: string | null
          birth_date?: string | null
          gender?: 'male' | 'female' | 'other' | null
          height?: number | null
          weight?: number | null
          activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null
          goals?: string[] | null
          allergies?: string[] | null
          dietary_restrictions?: string[] | null
          medical_conditions?: string[] | null
          preferences?: Json | null
          specializations?: string[] | null
          education?: string | null
          experience?: number | null
          certifications?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string | null
          last_name?: string | null
          phone_number?: string | null
          birth_date?: string | null
          gender?: 'male' | 'female' | 'other' | null
          height?: number | null
          weight?: number | null
          activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null
          goals?: string[] | null
          allergies?: string[] | null
          dietary_restrictions?: string[] | null
          medical_conditions?: string[] | null
          preferences?: Json | null
          specializations?: string[] | null
          education?: string | null
          experience?: number | null
          certifications?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      ai_rules: {
        Row: {
          id: string
          user_id: string
          diet_philosophy: string
          general_guidelines: string[] | null
          response_style: string
          special_instructions: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          diet_philosophy: string
          general_guidelines?: string[] | null
          response_style: string
          special_instructions?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          diet_philosophy?: string
          general_guidelines?: string[] | null
          response_style?: string
          special_instructions?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_rules_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      patient_keys: {
        Row: {
          id: string
          nutritionist_id: string
          key: string
          patient_id: string | null
          used: boolean
          used_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nutritionist_id: string
          key: string
          patient_id?: string | null
          used?: boolean
          used_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nutritionist_id?: string
          key?: string
          patient_id?: string | null
          used?: boolean
          used_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_keys_nutritionist_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_keys_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          type: string
          provider: string
          provider_account_id: string
          refresh_token: string | null
          access_token: string | null
          expires_at: number | null
          token_type: string | null
          scope: string | null
          id_token: string | null
          session_state: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          provider: string
          provider_account_id: string
          refresh_token?: string | null
          access_token?: string | null
          expires_at?: number | null
          token_type?: string | null
          scope?: string | null
          id_token?: string | null
          session_state?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          provider?: string
          provider_account_id?: string
          refresh_token?: string | null
          access_token?: string | null
          expires_at?: number | null
          token_type?: string | null
          scope?: string | null
          id_token?: string | null
          session_state?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      sessions: {
        Row: {
          id: string
          session_token: string
          user_id: string
          expires: string
        }
        Insert: {
          id?: string
          session_token: string
          user_id: string
          expires: string
        }
        Update: {
          id?: string
          session_token?: string
          user_id?: string
          expires?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      verification_tokens: {
        Row: {
          identifier: string
          token: string
          expires: string
        }
        Insert: {
          identifier: string
          token: string
          expires: string
        }
        Update: {
          identifier?: string
          token?: string
          expires?: string
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
      user_role: 'patient' | 'nutritionist'
      gender_type: 'male' | 'female' | 'other'
      activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 