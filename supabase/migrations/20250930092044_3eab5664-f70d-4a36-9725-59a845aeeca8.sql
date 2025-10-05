-- Drop ALL existing policies for conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.conversations;
DROP POLICY IF EXISTS "conversations_insert_policy" ON public.conversations;

-- Recreate the SELECT policy
CREATE POLICY "Users can view their own conversations"
ON public.conversations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = conversations.id
    AND conversation_participants.user_id = auth.uid()
  )
);

-- Create a simple INSERT policy for authenticated users
CREATE POLICY "Allow authenticated users to create conversations"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (true);