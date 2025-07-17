-- Migration: Create profiles storage bucket for avatar uploads
-- Description: This migration creates a storage bucket for user profile avatars and sets up proper policies

-- Create the profiles storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'profiles',
    'profiles', 
    true,
    5242880, -- 5MB file size limit
    '{"image/jpeg","image/jpg","image/png","image/gif","image/webp"}'
) ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the profiles bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to upload their own avatar files
CREATE POLICY "Users can upload their own avatar files"
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'profiles' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow users to update their own avatar files  
CREATE POLICY "Users can update their own avatar files"
ON storage.objects FOR UPDATE 
USING (
    bucket_id = 'profiles' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow users to delete their own avatar files
CREATE POLICY "Users can delete their own avatar files"  
ON storage.objects FOR DELETE
USING (
    bucket_id = 'profiles' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow public read access to profile avatars
CREATE POLICY "Public read access to profile avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'profiles');

-- Note: The file path structure will be: avatars/{user_id}_{timestamp}.{ext}
-- This allows users to upload files that start with their user ID in the avatars folder 