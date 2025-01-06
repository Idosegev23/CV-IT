export interface CVFormatData {
  template: string;
  style?: {
    colors?: {
      primary?: string;
      secondary?: string;
      background?: string;
    };
    font?: {
      family?: string;
      size?: string;
    };
  };
}

export interface CVContentData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    linkedin?: string;
  };
  professionalSummary?: string;
  experience: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
    achievements?: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    graduationYear: string;
    description: string;
  }>;
  military?: {
    role: string;
    unit: string;
    period: string;
    description: string;
    achievements?: string[];
  };
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
  };
  recommendations?: Array<{
    name: string;
    role: string;
    company: string;
    text: string;
  }>;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      chat_messages: {
        Row: {
          id: string
          session_id: string
          created_at: string
          role: string
          content: string
          language: string
        }
        Insert: {
          id?: string
          session_id: string
          created_at?: string
          role: string
          content: string
          language: string
        }
        Update: {
          id?: string
          session_id?: string
          created_at?: string
          role?: string
          content?: string
          language?: string
        }
      }
      cv_data: {
        Row: {
          id: string
          session_id: string
          content: CVContentData
          language: string
          last_updated: string
          format_cv: CVFormatData
          status: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          content: CVContentData
          language: string
          last_updated?: string
          format_cv?: CVFormatData
          status?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          content?: CVContentData
          language?: string
          last_updated?: string
          format_cv?: CVFormatData
          status?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          created_at: string
          status: string
          template_id: string
          language: string
          metadata: Json
          current_step: string
          expires_at: string
          is_paid: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          status?: string
          template_id: string
          language: string
          metadata?: Json
          current_step?: string
          expires_at?: string
          is_paid?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          status?: string
          template_id?: string
          language?: string
          metadata?: Json
          current_step?: string
          expires_at?: string
          is_paid?: boolean
        }
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
  }
} 