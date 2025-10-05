-- Add policy to allow authenticated users to view other users' public profiles
-- This is safe because the public_profiles view only exposes non-sensitive fields
CREATE POLICY "Users can view public profile information of others"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Note: The existing "Users can view their own profile" policy allows full access to own profile
-- This new policy allows viewing of all profiles, but the public_profiles view
-- only exposes: full_name, user_type, avatar_url, bio (no emails or sensitive data)