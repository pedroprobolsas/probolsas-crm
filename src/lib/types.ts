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
      clients: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          email: string
          phone: string
          company: string
          description: string
          brand: string
          status: 'active' | 'inactive' | 'at_risk'
          tags: string[]
          notes: string
          ai_insights: Json
          current_stage: 'communication' | 'quotation' | 'deposit' | 'approval' | 'shipping' | 'post_sale' | null
          stage_start_date: string | null
          assigned_agent_id: string | null
          last_interaction_date: string | null
          next_action: string | null
          next_action_date: string | null
          packaging_types: {
            code: string
            type: string
            monthly_volume: number
            unit: string
            features: Record<string, string>
            material: string
            thickness: string
            width: number
            processes: string[]
            certifications: string[]
          }[] | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          email: string
          phone: string
          company: string
          description: string
          brand: string
          status?: 'active' | 'inactive' | 'at_risk'
          tags?: string[]
          notes?: string
          ai_insights?: Json
          current_stage?: 'communication' | 'quotation' | 'deposit' | 'approval' | 'shipping' | 'post_sale' | null
          stage_start_date?: string | null
          assigned_agent_id?: string | null
          last_interaction_date?: string | null
          next_action?: string | null
          next_action_date?: string | null
          packaging_types?: {
            code: string
            type: string
            monthly_volume: number
            unit: string
            features: Record<string, string>
            material: string
            thickness: string
            width: number
            processes: string[]
            certifications: string[]
          }[] | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          email?: string
          phone?: string
          company?: string
          description?: string
          brand?: string
          status?: 'active' | 'inactive' | 'at_risk'
          tags?: string[]
          notes?: string
          ai_insights?: Json
          current_stage?: 'communication' | 'quotation' | 'deposit' | 'approval' | 'shipping' | 'post_sale' | null
          stage_start_date?: string | null
          assigned_agent_id?: string | null
          last_interaction_date?: string | null
          next_action?: string | null
          next_action_date?: string | null
          packaging_types?: {
            code: string
            type: string
            monthly_volume: number
            unit: string
            features: Record<string, string>
            material: string
            thickness: string
            width: number
            processes: string[]
            certifications: string[]
          }[] | null
        }
      }
    }
  }
}

import { Database } from './types/supabase';

export type InteractionType = 'call' | 'email' | 'visit' | 'consultation';
export type InteractionPriority = 'low' | 'medium' | 'high';
export type InteractionStatus = 'pending' | 'completed' | 'cancelled';

export interface ClientInteraction {
  id: string;
  client_id: string;
  agent_id: string;
  type: InteractionType;
  date: string;
  notes: string;
  next_action?: string;
  next_action_date?: string | null;
  priority: InteractionPriority;
  status: InteractionStatus;
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  created_at: string;
  updated_at: string;
}

export type ClientInteractionInsert = Omit<ClientInteraction, 'id' | 'created_at' | 'updated_at'>;