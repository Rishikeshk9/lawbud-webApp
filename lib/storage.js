import { supabase } from './supabase';

export const storage = {
  async uploadDocument(file, path) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Authentication required for file upload');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${path}/${session.user.id}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (error) throw error;

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('documents').getPublicUrl(filePath);

      return {
        url: publicUrl,
        path: filePath,
        name: fileName,
        type: file.type,
      };
    } catch (error) {
      console.error('Storage error:', error);
      throw error;
    }
  },

  async deleteDocument(path) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Authentication required for file deletion');
      }

      const { error } = await supabase.storage.from('documents').remove([path]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  },
};
