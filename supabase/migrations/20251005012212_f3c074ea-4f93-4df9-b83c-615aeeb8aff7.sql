-- Fix: Restrict projects table access to authenticated users only
-- This prevents competitors from harvesting sensitive business data

-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Projects viewable by everyone" ON public.projects;

-- Create a new policy that requires authentication
CREATE POLICY "Authenticated users can view projects"
ON public.projects
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);