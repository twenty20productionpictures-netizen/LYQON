-- Create forum_threads table
CREATE TABLE public.forum_threads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('casting', 'technology', 'filmmaking', 'news')),
  tags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT FALSE,
  is_moderated BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum_posts table
CREATE TABLE public.forum_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum_attachments table
CREATE TABLE public.forum_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forum_threads
CREATE POLICY "Anyone can view threads"
  ON public.forum_threads FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create threads"
  ON public.forum_threads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own threads"
  ON public.forum_threads FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own threads"
  ON public.forum_threads FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for forum_posts
CREATE POLICY "Anyone can view posts"
  ON public.forum_posts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON public.forum_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON public.forum_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON public.forum_posts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for forum_attachments
CREATE POLICY "Anyone can view attachments"
  ON public.forum_attachments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create attachments"
  ON public.forum_attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.forum_posts
      WHERE id = forum_attachments.post_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own attachments"
  ON public.forum_attachments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.forum_posts
      WHERE id = forum_attachments.post_id
      AND user_id = auth.uid()
    )
  );

-- Create storage bucket for forum attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('forum-attachments', 'forum-attachments', true);

-- Storage policies for forum attachments
CREATE POLICY "Anyone can view forum attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'forum-attachments');

CREATE POLICY "Authenticated users can upload forum attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'forum-attachments' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own forum attachments"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'forum-attachments' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Trigger for updated_at
CREATE TRIGGER update_forum_threads_updated_at
  BEFORE UPDATE ON public.forum_threads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forum_posts_updated_at
  BEFORE UPDATE ON public.forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_forum_threads_user_id ON public.forum_threads(user_id);
CREATE INDEX idx_forum_threads_category ON public.forum_threads(category);
CREATE INDEX idx_forum_threads_created_at ON public.forum_threads(created_at DESC);
CREATE INDEX idx_forum_posts_thread_id ON public.forum_posts(thread_id);
CREATE INDEX idx_forum_posts_user_id ON public.forum_posts(user_id);
CREATE INDEX idx_forum_attachments_post_id ON public.forum_attachments(post_id);