import { supabase } from './supabase';

export const db = {
  users: {
    async create(userData) {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async getById(id) {
      const { data, error } = await supabase
        .from('users')
        .select(
          `
          *,
          saved_lawyers(
            lawyer:lawyers(*)
          )
        `
        )
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },

    async update(id, updates) {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  },

  lawyers: {
    async create(lawyerData) {
      const { data, error } = await supabase
        .from('lawyers')
        .insert([lawyerData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async getAll() {
      const { data, error } = await supabase.from('lawyers').select(`
          *,
          user:users(*),
          reviews(*)
        `);

      if (error) throw error;
      return data;
    },

    async getById(id) {
      const { data, error } = await supabase
        .from('lawyers')
        .select(
          `
          *,
          user:users(*),
          reviews(*),
          documents(*)
        `
        )
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },

    async update(id, updates) {
      const { data, error } = await supabase
        .from('lawyers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  },

  settings: {
    async get(key) {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', key)
        .single();

      if (error) throw error;
      return data?.value;
    },

    async set(key, value) {
      const { data, error } = await supabase
        .from('app_settings')
        .upsert({ key, value })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  },
};
