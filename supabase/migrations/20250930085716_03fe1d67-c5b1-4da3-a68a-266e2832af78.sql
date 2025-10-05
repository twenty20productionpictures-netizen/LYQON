-- Drop existing policies
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;

-- Create a more permissive insert policy that explicitly checks auth role
CREATE POLICY "Authenticated users can insert conversations"
ON public.conversations
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Keep the select policy
CREATE POLICY "Users can view their own conversations"
ON public.conversations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_participants.conversation_id = conversations.id
    AND conversation_participants.user_id = auth.uid()
  )
);