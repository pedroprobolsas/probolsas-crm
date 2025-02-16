import { create } from 'zustand';
import { supabase } from '../supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  signIn: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null });
  },
  checkAuth: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      set({ user, isLoading: false });
    } catch (error) {
      set({ user: null, isLoading: false });
    }
  },
}));