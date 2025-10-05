-- Fix infinite recursion by using security definer function approach

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can join conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "enable_insert_for_authenticated_users" ON public.conversations;

-- Create security definer function to check conversation participation
CREATE OR REPLACE FUNCTION public.user_conversations(_user_id uuid)
RETURNS TABLE(conversation_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT conversation_id
  FROM conversation_participants
  WHERE user_id = _user_id
$$;

-- Simple policies using the security definer function
CREATE POLICY "Users can view their own conversations"
ON public.conversations
FOR SELECT
USING (id IN (SELECT user_conversations(auth.uid())));

CREATE POLICY "Users can create conversations"
ON public.conversations
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view participants in their conversations"
ON public.conversation_participants
FOR SELECT
USING (conversation_id IN (SELECT user_conversations(auth.uid())));

CREATE POLICY "Users can join conversations"
ON public.conversation_participants
FOR INSERT
WITH CHECK (auth.uid() = user_id);