import { create } from 'zustand';
import { supabase } from '@/lib/supabase/client';
import { Profile, ProfileUpdate } from '@/types/database';

// Type for social links array from the form
type SocialLink = {
  value: string;
};

// Extended profile type for form data
interface ProfileFormData {
  name: string;
  bio: string;
  photo: string;
  sports: string[];
  socialLinks: SocialLink[];
}

interface ProfileStore {
  // State
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  saving: boolean;

  // Actions
  setProfile: (profile: Profile | null) => void;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (userId: string, profileData: ProfileFormData) => Promise<void>;
  clearError: () => void;
}

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
  updateProfile: async (userId: string, profileData: ProfileFormData) => {
    console.log('💾 Updating profile for user:', userId);
    console.log('📋 Form data received:', profileData);
    set({ saving: true, error: null });

    try {
      // Transform form data to database format
      const updateData: ProfileUpdate = {
        full_name: profileData.name,
        bio: profileData.bio,
        avatar_url: profileData.photo || null,
        sports: profileData.sports.length > 0 ? profileData.sports : null,
        social_links: profileData.socialLinks.filter(link => link.value.trim() !== ''),
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