-- Add DELETE policies for conversations and related tables

-- Allow users to delete messages in their conversations
CREATE POLICY "Users can delete messages in their conversations"
ON public.messages
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM conversation_participants
    WHERE conversation_participants.conversation_id = messages.conversation_id
    AND conversation_participants.user_id = auth.uid()
  )
);

-- Allow users to delete conversation participants
CREATE POLICY "Users can delete conversation participants"
ON public.conversation_participants
FOR DELETE
USING (
  conversation_id IN (
    SELECT conversation_id
    FROM conversation_participants
    WHERE user_id = auth.uid()
  )
);

-- Allow users to delete conversations they're part of
CREATE POLICY "Users can delete their conversations"
ON public.conversations
FOR DELETE
USING (
  id IN (
    SELECT conversation_id
    FROM conversation_participants
    WHERE user_id = auth.uid()
  )
);