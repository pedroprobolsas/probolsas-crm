import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { Client, ClientInsert, ClientUpdate, ClientFilters } from '../types';

export function useClients(filters?: ClientFilters) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['clients', filters],
    queryFn: async () => {
      let query = supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,company.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.stage) {
        query = query.eq('current_stage', filters.stage);
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newClient: ClientInsert) => {
      // Asegurar que packaging_types sea un array válido
      const packaging_types = newClient.packaging_types?.map(type => ({
        code: type.code,
        type: type.type,
        monthly_volume: type.monthly_volume,
        unit: type.unit,
        features: type.features || {},
        material: type.material || '',
        thickness: type.thickness || '',
        width: type.width || 0,
        processes: type.processes || [],
        certifications: type.certifications || []
      })) || [];

      const { data, error } = await supabase
        .from('clients')
        .insert({
          ...newClient,
          packaging_types,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: ClientUpdate & { id: string }) => {
      // Asegurar que packaging_types sea un array válido si está presente
      const packaging_types = updates.packaging_types?.map(type => ({
        code: type.code,
        type: type.type,
        monthly_volume: type.monthly_volume,
        unit: type.unit,
        features: type.features || {},
        material: type.material || '',
        thickness: type.thickness || '',
        width: type.width || 0,
        processes: type.processes || [],
        certifications: type.certifications || []
      }));

      const { data, error } = await supabase
        .from('clients')
        .update({
          ...updates,
          packaging_types: packaging_types || updates.packaging_types,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  return {
    clients: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createClient: createMutation.mutate,
    updateClient: updateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}