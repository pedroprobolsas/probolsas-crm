import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { Conversation, ConversationInsert, ConversationUpdate } from '../types';

export function useConversations() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newConversation: ConversationInsert) => {
      const { data, error } = await supabase
        .from('conversations')
        .insert(newConversation)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: ConversationUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('conversations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  return {
    conversations: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createConversation: createMutation.mutate,
    updateConversation: updateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}