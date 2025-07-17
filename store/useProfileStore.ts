import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import { uploadProfileAvatar, isValidImageFile } from '@/lib/supabase/storage'
import { Profile, ProfileUpdate } from '@/types/database'
import { useQueryClient } from '@tanstack/react-query'

export interface ProfileFormData {
  name: string
  bio: string
  photo?: string
  sports?: string[]
  socialLinks?: { value: string }[]
}

interface ProfileStore {
  profile: Profile | null
  loading: boolean
  error: string | null
  saving: boolean
  setProfile: (profile: Profile | null) => void
  fetchProfile: (userId: string) => Promise<void>
  updateProfile: (userId: string, profileData: ProfileFormData, avatarFile?: File) => Promise<void>
  clearError: () => void
}

// Global query client reference for cache invalidation
let globalQueryClient: any = null;

export const setQueryClient = (queryClient: any) => {
  globalQueryClient = queryClient;
};

export const useProfileStore = create<ProfileStore>((set, get) => ({
  // Initial state
  profile: null,
  loading: false,
  error: null,
  saving: false,

  // Set profile data
  setProfile: (profile) => {
    set({ profile });
  },

  // Fetch profile from database
  fetchProfile: async (userId: string) => {
    console.log('🔄 Fetching profile for user:', userId);
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Supabase error fetching profile:', error);
        throw error;
      }

      console.log('✅ Profile fetched successfully:', data);
      set({ profile: data, loading: false });
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch profile',
        loading: false 
      });
    }
  },

  // Update profile in database
  updateProfile: async (userId: string, profileData: ProfileFormData, avatarFile?: File) => {
    console.log('💾 Updating profile for user:', userId);
    console.log('📋 Form data received:', profileData);
    console.log('📎 Avatar file:', avatarFile);
    set({ saving: true, error: null });

    try {
      let avatarUrl = profileData.photo || null;

      // Handle avatar file upload if provided
      if (avatarFile && isValidImageFile(avatarFile)) {
        console.log('📤 Uploading avatar file to Supabase Storage...');
        
        const { data: uploadData, error: uploadError } = await uploadProfileAvatar(userId, avatarFile);
        
        if (uploadError) {
          console.error('❌ Avatar upload failed:', uploadError);
          throw new Error(`Failed to upload avatar: ${uploadError.message}`);
        }
        
        if (uploadData?.publicUrl) {
          avatarUrl = uploadData.publicUrl;
          console.log('✅ Avatar uploaded successfully:', avatarUrl);
        }
      }

      // Transform form data to database format
      const updateData: ProfileUpdate = {
        full_name: profileData.name,
        bio: profileData.bio,
        avatar_url: avatarUrl,
        sports: profileData.sports && profileData.sports.length > 0 ? profileData.sports : null,
        social_links: profileData.socialLinks
          ? profileData.socialLinks
              .filter(link => link.value.trim() !== '')
              .map(link => ({ value: link.value.trim() }))
          : null,
        updated_at: new Date().toISOString(),
      };

      console.log('🔄 Transformed data for database:', updateData);

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase error updating profile:', error);
        throw error;
      }

      console.log('✅ Profile updated successfully in database:', data);
      
      // Update local state with the returned data
      set({ profile: data, saving: false });
      
      // Invalidate React Query caches to refresh all profile data
      if (globalQueryClient) {
        console.log('🔄 Invalidating React Query cache for profile data...');
        await globalQueryClient.invalidateQueries({ 
          queryKey: ['profile-data', userId] 
        });
        await globalQueryClient.invalidateQueries({ 
          queryKey: ['profile', userId] 
        });
        console.log('✅ Cache invalidated successfully');
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      set({ 
        error: errorMessage,
        saving: false 
      });
      return Promise.reject(new Error(errorMessage));
    }
  },

  // Clear error state
  clearError: () => {
    set({ error: null });
  },
}));