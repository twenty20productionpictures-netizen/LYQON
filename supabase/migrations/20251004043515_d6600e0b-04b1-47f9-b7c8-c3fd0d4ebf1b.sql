-- Fix the conversation_participants RLS policy to allow proper conversation creation
-- Drop the existing policy
DROP POLICY IF EXISTS "Users can add participants to new conversations" ON public.conversation_participants;

-- Create a better policy that allows:
-- 1. Users to add themselves to a conversation
-- 2. Users to add others when they are also being added (for new conversation creation)
-- 3. Existing participants to add new participants
CREATE POLICY "Users can add participants properly"
ON public.conversation_participants
FOR INSERT
TO authenticated
WITH CHECK (
  -- User can add themselves
  user_id = auth.uid()
  OR
  -- User can add others if they are already a participant
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = conversation_participants.conversation_id
    AND user_id = auth.uid()
  )
  OR
  -- Allow adding to brand new conversations (no participants yet)
  NOT EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversation_participants.conversation_id
  )
);

-- Also ensure the conversations INSERT policy is correct
DROP POLICY IF EXISTS "Allow authenticated users to create conversations" ON public.conversations;

CREATE POLICY "Authenticated users can create conversations"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Ensure conversations SELECT policy is correct
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;

CREATE POLICY "Users can view their own conversations"
ON public.conversations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.conversation_participants
    WHERE conversation_participants.conversation_id = conversations.id
    AND conversation_participants.user_id = auth.uid()
  )
);