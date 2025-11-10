-- Add profile fields for username, avatar, and bio
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS daily_calorie_goal INTEGER,
ADD COLUMN IF NOT EXISTS allergies TEXT[];

-- Create index for username lookup
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
