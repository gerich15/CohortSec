-- Add subscription_tier column to users table (for password check limits)
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'free';
