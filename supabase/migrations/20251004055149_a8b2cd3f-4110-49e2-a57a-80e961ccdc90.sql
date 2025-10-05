-- Fix participant addition by allowing users to add others to conversations they're part of

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can join conversations" ON public.conversation_participants;

-- Create a new policy that allows:
-- 1. Adding yourself to any conversation
-- 2. Adding others to conversations where you're already a participant
CREATE POLICY "Users can add participants to their conversations"
ON public.conversation_participants
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    -- You can always add yourself
    auth.uid() = user_id
    OR
    -- You can add others if you're already a participant in this conversation
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_participants.conversation_id
      AND cp.user_id = auth.uid()
    )
  )
);