-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL, -- 'message', 'application', 'match', 'casting_call', 'system'
  title text NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  link text, -- Optional link to related content
  metadata jsonb, -- Additional data
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create index for performance
CREATE INDEX idx_notifications_user ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_read ON public.notifications(user_id, read);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;