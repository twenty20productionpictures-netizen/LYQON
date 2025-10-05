-- Drop the existing public SELECT policy on profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a new SELECT policy that only allows users to view their own full profile (including email)
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Create a view for public profile information (excluding sensitive data like email)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  user_id,
  full_name,
  user_type,
  avatar_url,
  bio,
  created_at,
  updated_at
FROM public.profiles;

-- Grant SELECT access on the view to authenticated and anon users
GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- Add comment to document the purpose
COMMENT ON VIEW public.public_profiles IS 'Public view of profiles excluding sensitive information like email addresses';