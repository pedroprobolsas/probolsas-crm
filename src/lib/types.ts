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
      agents: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          email: string
          whatsapp_number: string
          role: 'admin' | 'agent'
          status: 'online' | 'busy' | 'offline' | 'inactive'
          avatar: string | null
          active_chats: number
          satisfaction_score: number
          last_active: string
          deactivation_reason: string | null
          deactivation_date: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          email: string
          whatsapp_number: string
          role?: 'admin' | 'agent'
          status?: 'online' | 'busy' | 'offline' | 'inactive'
          avatar?: string | null
          active_chats?: number
          satisfaction_score?: number
          last_active?: string
          deactivation_reason?: string | null
          deactivation_date?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          email?: string
          whatsapp_number?: string
          role?: 'admin' | 'agent'
          status?: 'online' | 'busy' | 'offline' | 'inactive'
          avatar?: string | null
          active_chats?: number
          satisfaction_score?: number
          last_active?: string
          deactivation_reason?: string | null
          deactivation_date?: string | null
        }
      }
      clients_agents: {
        Row: {
          id: string
          client_id: string
          agent_id: string
          assigned_at: string
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          agent_id: string
          assigned_at?: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          agent_id?: string
          assigned_at?: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type AgentDB = Database['public']['Tables']['agents']['Row']
export type AgentInsert = Database['public']['Tables']['agents']['Insert']
export type AgentUpdate = Database['public']['Tables']['agents']['Update']

export interface Agent {
  id: string
  name: string
  email: string
  whatsappNumber: string
  role: 'admin' | 'agent'
  status: 'online' | 'busy' | 'offline' | 'inactive'
  avatar: string | null
  activeChats: number
  satisfactionScore: number
  lastActive: string
  createdAt: string
  updatedAt: string
  deactivationReason?: string | null
  deactivationDate?: string | null
}

export interface AssignedClient {
  id: string
  name: string
  company: string
  status: 'active' | 'inactive' | 'at_risk'
  stage: string | null
  lastInteraction: string | null
}

export interface ClientReassignment {
  clientId: string
  fromAgentId: string
  toAgentId: string
  effectiveDate: string
}

export type ClientStatus = 'active' | 'inactive' | 'at_risk';
export type ClientStage = 'communication' | 'quotation' | 'deposit' | 'approval' | 'shipping' | 'post_sale';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  brand?: string;
  status: ClientStatus;
  current_stage?: ClientStage;
  stage_start_date?: string;
  assigned_agent_id: string | null;
  created_at: string;
  updated_at: string;
  description?: string;
  tax_id?: string;
  website?: string;
  sector?: string;
  business_description?: string;
  general_manager_name?: string;
  general_manager_email?: string;
  general_manager_phone?: string;
  general_manager_birthday?: string | null;
  purchasing_manager_name?: string;
  purchasing_manager_email?: string;
  purchasing_manager_phone?: string;
  purchasing_manager_birthday?: string | null;
  quality_manager_name?: string;
  quality_manager_email?: string;
  quality_manager_phone?: string;
  quality_manager_birthday?: string | null;
  is_large_taxpayer?: boolean;
  is_self_withholding?: boolean;
  packaging_types?: Array<{
    type: string;
    monthly_volume: number;
    unit: string;
  }>;
  admin_employees_count?: number;
  plant_employees_count?: number;
  mission?: string;
  vision?: string;
  tags?: string[];
}

export interface ClientInsert {
  name: string;
  email: string;
  phone: string;
  company: string;
  brand?: string;
  status?: ClientStatus;
  current_stage?: ClientStage;
  stage_start_date?: string;
  assigned_agent_id?: string;
  description?: string;
}

export interface ClientUpdate {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  brand?: string;
  status?: ClientStatus;
  current_stage?: ClientStage;
  stage_start_date?: string;
  assigned_agent_id?: string;
  description?: string;
}

export interface ClientFilters {
  search?: string;
  status?: ClientStatus;
  stage?: ClientStage;
  tags?: string[];
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  client_id: string;
  agent_id: string;
  whatsapp_chat_id: string;
  last_message: string;
  last_message_at: string;
  client_name?: string;
  client_company?: string;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  content: string;
  sender: 'agent' | 'client' | 'system';
  sender_id: string;
  created_at: string;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'file' | 'location';
  file_url?: string;
  file_name?: string;
  file_size?: number;
}

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
  status: 'pending' | 'completed' | 'cancelled';
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface ClientInteractionInsert {
  client_id: string;
  agent_id: string;
  type: InteractionType;
  date: string;
  notes: string;
  next_action?: string;
  next_action_date?: string | null;
  priority: InteractionPriority;
  status: 'pending' | 'completed' | 'cancelled';
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
}

export type InteractionType = 'call' | 'email' | 'visit' | 'consultation';
export type InteractionPriority = 'low' | 'medium' | 'high';
