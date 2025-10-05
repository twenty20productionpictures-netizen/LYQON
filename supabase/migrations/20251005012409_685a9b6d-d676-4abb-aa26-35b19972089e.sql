-- Fix: Protect user email addresses from public exposure
-- Only authenticated users can view profiles, preventing email harvesting

-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Users can view public profile information of others" ON public.profiles;

-- Create a new policy that requires authentication to view profiles
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);