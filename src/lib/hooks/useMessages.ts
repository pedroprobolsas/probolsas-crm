import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { Message } from '../types';

export function useMessages(conversationId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!conversationId,
  });

  const sendMessage = useMutation({
    mutationFn: async (message: Omit<Message, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('messages')
        .insert(message)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Subscribe to new messages
  const subscribeToMessages = () => {
    if (!conversationId) return;

    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  return {
    messages: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    sendMessage: sendMessage.mutate,
    isSending: sendMessage.isPending,
    subscribeToMessages,
  };
}