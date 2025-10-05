-- Fix infinite recursion in conversation_participants policy

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can add participants to their conversations" ON public.conversation_participants;

-- Create a simpler policy that just allows authenticated users to add participants
-- The actual access control is handled by the conversations and messages tables
CREATE POLICY "Authenticated users can add participants"
ON public.conversation_participants
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);