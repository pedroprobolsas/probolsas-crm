import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { Quote, QuoteItem } from '../types';

export function useQuotes(clientId?: string) {
  const queryClient = useQueryClient();

  const quotesQuery = useQuery({
    queryKey: ['quotes', clientId],
    queryFn: async () => {
      let query = supabase
        .from('quote_summaries')
        .select('*')
        .order('created_at', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
  });

  const quoteDetailsQuery = useQuery({
    queryKey: ['quote-details', clientId],
    queryFn: async () => {
      const { data: quotes, error: quotesError } = await supabase
        .from('quotes')
        .select(`
          *,
          items:quote_items(*)
        `)
        .eq('client_id', clientId);

      if (quotesError) throw quotesError;
      return quotes;
    },
    enabled: !!clientId,
  });

  const createQuote = useMutation({
    mutationFn: async (quote: Omit<Quote, 'id' | 'created_at'>) => {
      console.log('Creando cotización con datos:', quote); // ✅ Ahora `quote` está dentro del scope correcto
      // First create the quote
      const { data: newQuote, error: quoteError } = await supabase
        .from('quotes')
        .insert({
          quote_number: quote.quote_number,
          client_id: quote.client_id,
          agent_id: (await supabase.auth.getUser()).data.user?.id,
          status: quote.status,
          total_amount: quote.total_amount,
          valid_until: quote.valid_until,
          terms: quote.terms,
          notes: quote.notes
        })
        .select()
        .single();

      if (quoteError) throw quoteError;

      // Then create the quote items
      if (quote.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('quote_items')
          .insert(
            quote.items.map(item => ({
              quote_id: newQuote.id,
              ...item
            }))
          );

        if (itemsError) throw itemsError;
      }

      return newQuote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quote-details'] });
    },
  });

  const updateQuoteStatus = useMutation({
    mutationFn: async ({ quoteId, newStatus }: { quoteId: string; newStatus: Quote['status'] }) => {
      const { data, error } = await supabase
        .from('quotes')
        .update({ status: newStatus })
        .eq('id', quoteId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quote-details'] });
    },
  });

  return {
    quotes: quotesQuery.data || [],
    quoteDetails: quoteDetailsQuery.data || [],
    isLoading: quotesQuery.isLoading || quoteDetailsQuery.isLoading,
    error: quotesQuery.error || quoteDetailsQuery.error,
    createQuote: createQuote.mutate,
    updateQuoteStatus: updateQuoteStatus.mutate,
    isCreating: createQuote.isPending,
    isUpdating: updateQuoteStatus.isPending,
  };
}

