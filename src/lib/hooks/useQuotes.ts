import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../store/authStore';
import type { Quote, QuoteItem } from '../types/index';

export function useQuotes(clientId?: string) {
  const queryClient = useQueryClient();
  const { profile, isAdmin } = useAuthStore();

  const quotesQuery = useQuery({
    queryKey: ['quotes', clientId],
    queryFn: async () => {
      console.log('Fetching quotes for clientId:', clientId);
      
      // Usar la misma tabla para consultas e inserciones
      let query = supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });

      // Si no es admin, solo mostrar cotizaciones del agente
      if (!isAdmin() && profile) {
        query = query.eq('agent_id', profile.id);
      }

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching quotes:', error);
        throw error;
      }

      console.log('Fetched quotes:', data);

      // Obtener los items de cada cotización
      const quotesWithItems = await Promise.all(
        data.map(async (quote) => {
          const { data: items, error: itemsError } = await supabase
            .from('quote_items')
            .select('*')
            .eq('quote_id', quote.id);

          if (itemsError) {
            console.error('Error fetching quote items:', itemsError);
            throw itemsError;
          }

          return {
            ...quote,
            items: items || []
          };
        })
      );

      console.log('Quotes with items:', quotesWithItems);
      return quotesWithItems;
    },
    enabled: !!clientId || isAdmin(),
  });

  const createQuoteMutation = useMutation({
    mutationFn: async (newQuote: Omit<Quote, 'id' | 'created_at'>) => {
      // Verificar permisos
      if (!isAdmin() && profile?.id !== newQuote.agent_id) {
        throw new Error('No tienes permiso para crear cotizaciones para otros asesores');
      }

      const { data, error } = await supabase
        .from('quotes')
        .insert({
          ...newQuote,
          agent_id: profile?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidar todas las consultas relacionadas con cotizaciones
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      
      // Invalidar específicamente la consulta para este cliente
      if (clientId) {
        queryClient.invalidateQueries({ queryKey: ['quotes', clientId] });
      }
    },
  });

  const updateQuoteStatusMutation = useMutation({
    mutationFn: async ({ quoteId, status }: { quoteId: string; status: Quote['status'] }) => {
      // Verificar permisos
      if (!isAdmin()) {
        const { data: quote } = await supabase
          .from('quotes')
          .select('agent_id')
          .eq('id', quoteId)
          .single();

        if (quote?.agent_id !== profile?.id) {
          throw new Error('No tienes permiso para actualizar esta cotización');
        }
      }

      const { data, error } = await supabase
        .from('quotes')
        .update({ status })
        .eq('id', quoteId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidar todas las consultas relacionadas con cotizaciones
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      
      // Invalidar específicamente la consulta para este cliente
      if (clientId) {
        queryClient.invalidateQueries({ queryKey: ['quotes', clientId] });
      }
    },
  });

  // Nueva mutación para actualizar cotizaciones completas
  const updateQuoteMutation = useMutation({
    mutationFn: async (updatedQuote: Omit<Quote, 'created_at'>) => {
      // Verificar permisos
      if (!isAdmin()) {
        const { data: quote } = await supabase
          .from('quotes')
          .select('agent_id')
          .eq('id', updatedQuote.id)
          .single();

        if (quote?.agent_id !== profile?.id) {
          throw new Error('No tienes permiso para actualizar esta cotización');
        }
      }

      // Solo permitir actualizar cotizaciones en estado borrador
      const { data: currentQuote } = await supabase
        .from('quotes')
        .select('status')
        .eq('id', updatedQuote.id)
        .single();

      if (currentQuote?.status !== 'draft') {
        throw new Error('Solo se pueden editar cotizaciones en estado borrador');
      }

      // Actualizar la cotización principal
      const { data, error } = await supabase
        .from('quotes')
        .update({
          quote_number: updatedQuote.quote_number,
          total_amount: updatedQuote.total_amount,
          valid_until: updatedQuote.valid_until,
          terms: updatedQuote.terms,
          notes: updatedQuote.notes,
          status: updatedQuote.status
        })
        .eq('id', updatedQuote.id)
        .select()
        .single();

      if (error) throw error;

      // Eliminar los items existentes
      const { error: deleteError } = await supabase
        .from('quote_items')
        .delete()
        .eq('quote_id', updatedQuote.id);

      if (deleteError) throw deleteError;

      // Insertar los nuevos items
      if (updatedQuote.items && updatedQuote.items.length > 0) {
        const items = updatedQuote.items.map(item => ({
          ...item,
          quote_id: updatedQuote.id
        }));

        const { error: insertError } = await supabase
          .from('quote_items')
          .insert(items);

        if (insertError) throw insertError;
      }

      return data;
    },
    onSuccess: () => {
      // Invalidar todas las consultas relacionadas con cotizaciones
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      
      // Invalidar específicamente la consulta para este cliente
      if (clientId) {
        queryClient.invalidateQueries({ queryKey: ['quotes', clientId] });
      }
    },
  });

  return {
    quotes: quotesQuery.data || [],
    isLoading: quotesQuery.isLoading,
    error: quotesQuery.error,
    createQuote: createQuoteMutation.mutate,
    updateQuote: updateQuoteMutation.mutate,
    updateQuoteStatus: updateQuoteStatusMutation.mutate,
    isCreating: createQuoteMutation.isPending,
    isUpdating: updateQuoteStatusMutation.isPending || updateQuoteMutation.isPending,
  };
}
