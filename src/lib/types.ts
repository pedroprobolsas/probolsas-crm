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