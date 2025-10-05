-- Drop all existing policies on conversations table
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Allow authenticated users to create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;

-- Create simple, permissive policies for conversations
CREATE POLICY "enable_insert_for_authenticated_users"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "enable_select_for_participants"
ON public.conversations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_participants.conversation_id = conversations.id
    AND conversation_participants.user_id = auth.uid()
  )
);

-- Simplify conversation_participants policies
DROP POLICY IF EXISTS "Users can add participants properly" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can add participants to new conversations" ON public.conversation_participants;

CREATE POLICY "enable_insert_for_authenticated_users"
ON public.conversation_participants
FOR INSERT
TO authenticated
WITH CHECK (
  -- Users can add themselves
  user_id = auth.uid()
  OR
  -- Or they can add others to conversations where they're already a participant
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversation_participants.conversation_id
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "enable_select_for_participants"
ON public.conversation_participants
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversation_participants.conversation_id
    AND cp.user_id = auth.uid()
  )
);