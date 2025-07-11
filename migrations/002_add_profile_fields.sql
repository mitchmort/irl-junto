-- Migration: Add profile fields for enhanced user profiles
-- Description: Adds bio, sports, and social_links columns to profiles table

-- Add bio column for user descriptions
ALTER TABLE profiles 
ADD COLUMN bio TEXT;

-- Add sports column to store array of sport preferences
ALTER TABLE profiles 
ADD COLUMN sports TEXT[];

-- Add social_links column to store JSON array of social media links
ALTER TABLE profiles 
ADD COLUMN social_links JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN profiles.bio IS 'User biography/description text';
COMMENT ON COLUMN profiles.sports IS 'Array of sport IDs that user is interested in';
COMMENT ON COLUMN profiles.social_links IS 'JSON array of social media links with format [{"value": "url"}]';