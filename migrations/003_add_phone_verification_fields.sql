-- Add phone verification fields to users table
ALTER TABLE users 
ADD COLUMN phone_verified BOOLEAN DEFAULT false,
ADD COLUMN phone_verification_code VARCHAR(6),
ADD COLUMN phone_verification_expires TIMESTAMP WITH TIME ZONE;

-- Add indexes for efficient lookups
CREATE INDEX idx_users_phone_verification_code ON users(phone_verification_code) WHERE phone_verification_code IS NOT NULL;
CREATE INDEX idx_users_phone_verification_expires ON users(phone_verification_expires) WHERE phone_verification_expires IS NOT NULL;