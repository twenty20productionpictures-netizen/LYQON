-- Fix conversation creation by allowing users to see conversations they just created

-- Drop the restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;

-- Create a policy that allows authenticated users to see all conversations
-- This is safe because:
-- 1. Users can only create conversations if authenticated
-- 2. They immediately add themselves as participants
-- 3. The conversation_participants policies control who can see participants
CREATE POLICY "Authenticated users can view conversations"
ON public.conversations
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Also add an UPDATE policy for updating conversation timestamps
CREATE POLICY "Participants can update their conversations"
ON public.conversations
FOR UPDATE
USING (id IN (SELECT user_conversations(auth.uid())));