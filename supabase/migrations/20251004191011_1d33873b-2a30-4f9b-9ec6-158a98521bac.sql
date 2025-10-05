-- Drop and recreate the view with proper security settings
DROP VIEW IF EXISTS public.public_profiles;

-- Create the view with SECURITY INVOKER (this is the default but we're being explicit)
-- This ensures RLS policies are checked for the querying user, not the view creator
CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
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
COMMENT ON VIEW public.public_profiles IS 'Public view of profiles excluding sensitive information like email addresses. Uses security invoker to enforce RLS of the querying user.';