import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { Agent, AgentDB } from '../types';

// Utility functions to transform between DB and UI formats
function toUIFormat(agent: AgentDB): Agent {
  return {
    id: agent.id,
    name: agent.name,
    email: agent.email,
    whatsappNumber: agent.whatsapp_number,
    avatar: agent.avatar,
    role: agent.role,
    status: agent.status,
    lastActive: agent.last_active,
    activeChats: agent.active_chats,
    satisfactionScore: agent.satisfaction_score,
    createdAt: agent.created_at,
    updatedAt: agent.updated_at,
  };
}

function toDBFormat(agent: Partial<Agent>): Partial<AgentDB> {
  const dbAgent: Partial<AgentDB> = {};

  if (agent.name !== undefined) dbAgent.name = agent.name;
  if (agent.email !== undefined) dbAgent.email = agent.email;
  if (agent.whatsappNumber !== undefined) dbAgent.whatsapp_number = agent.whatsappNumber;
  if (agent.avatar !== undefined) dbAgent.avatar = agent.avatar;
  if (agent.role !== undefined) dbAgent.role = agent.role;
  if (agent.status !== undefined) dbAgent.status = agent.status;
  if (agent.lastActive !== undefined) dbAgent.last_active = agent.lastActive;
  if (agent.activeChats !== undefined) dbAgent.active_chats = agent.activeChats;
  if (agent.satisfactionScore !== undefined) dbAgent.satisfaction_score = agent.satisfactionScore;

  return dbAgent;
}

export function useAgents() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('name');

      if (error) throw error;
      return (data as AgentDB[]).map(toUIFormat);
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newAgent: Omit<Agent, 'id'>) => {
      const { data, error } = await supabase
        .from('agents')
        .insert(toDBFormat(newAgent))
        .select()
        .single();

      if (error) throw error;
      return toUIFormat(data as AgentDB);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Agent> & { id: string }) => {
      const { data, error } = await supabase
        .from('agents')
        .update(toDBFormat(updates))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return toUIFormat(data as AgentDB);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });

  return {
    agents: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createAgent: createMutation.mutate,
    updateAgent: updateMutation.mutate,
    deleteAgent: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}