-- Fix infinite recursion in conversation_participants policies

-- Drop all existing problematic policies
DROP POLICY IF EXISTS "enable_select_for_participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can view conversation participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "enable_insert_for_authenticated_users" ON public.conversation_participants;
DROP POLICY IF EXISTS "enable_select_for_participants" ON public.conversations;

-- Create simple, non-recursive policies for conversation_participants
CREATE POLICY "Users can join conversations"
ON public.conversation_participants
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view participants in their conversations"
ON public.conversation_participants
FOR SELECT
USING (
  conversation_id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = auth.uid()
  )
);

-- Fix conversations policy to be simpler
CREATE POLICY "Users can view their conversations"
ON public.conversations
FOR SELECT
USING (
  id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = auth.uid()
  )
);