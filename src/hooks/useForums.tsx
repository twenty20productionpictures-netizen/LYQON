import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface ForumThread {
  id: string;
  user_id: string;
  title: string;
  category: string;
  tags: string[];
  is_pinned: boolean;
  is_moderated: boolean;
  views: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    user_type: string;
    avatar_url?: string;
  };
  forum_posts?: { count: number }[];
}

export interface ForumPost {
  id: string;
  thread_id: string;
  user_id: string;
  content: string;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    user_type: string;
    avatar_url?: string;
  };
  forum_attachments?: ForumAttachment[];
}

export interface ForumAttachment {
  id: string;
  post_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export const useForums = () => {
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchThreads = async (category?: string) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('forum_threads')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data: threadsData, error: threadsError } = await query;
      if (threadsError) throw threadsError;

      // Fetch profiles and post counts separately
      const userIds = [...new Set(threadsData?.map(t => t.user_id) || [])];
      const threadIds = threadsData?.map(t => t.id) || [];

      const [profilesResult, postsResult] = await Promise.all([
        supabase.from('public_profiles').select('user_id, full_name, user_type, avatar_url').in('user_id', userIds),
        supabase.from('forum_posts').select('thread_id').in('thread_id', threadIds)
      ]);

      const profilesMap = new Map(profilesResult.data?.map(p => [p.user_id, p]) || []);
      const postCountsMap = new Map<string, number>();
      postsResult.data?.forEach(post => {
        postCountsMap.set(post.thread_id, (postCountsMap.get(post.thread_id) || 0) + 1);
      });

      const enrichedThreads = threadsData?.map(thread => ({
        ...thread,
        profiles: profilesMap.get(thread.user_id),
        forum_posts: [{ count: postCountsMap.get(thread.id) || 0 }]
      })) || [];

      setThreads(enrichedThreads as any);
    } catch (error) {
      console.error('Error fetching threads:', error);
      toast({
        title: 'Error',
        description: 'Failed to load forum threads',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchThreadPosts = async (threadId: string): Promise<ForumPost[]> => {
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('forum_posts')
        .select('*, forum_attachments(*)')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (postsError) throw postsError;

      // Fetch profiles separately
      const userIds = [...new Set(postsData?.map(p => p.user_id) || [])];
      const { data: profilesData } = await supabase
        .from('public_profiles')
        .select('user_id, full_name, user_type, avatar_url')
        .in('user_id', userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);

      const enrichedPosts = postsData?.map(post => ({
        ...post,
        profiles: profilesMap.get(post.user_id)
      })) || [];

      return enrichedPosts as any;
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load posts',
        variant: 'destructive',
      });
      return [];
    }
  };

  const incrementViews = async (threadId: string) => {
    try {
      const { data: thread } = await supabase
        .from('forum_threads')
        .select('views')
        .eq('id', threadId)
        .single();

      if (thread) {
        await supabase
          .from('forum_threads')
          .update({ views: (thread.views || 0) + 1 })
          .eq('id', threadId);
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const createPost = async (threadId: string, content: string, files: File[]) => {
    try {
      if (!content.trim()) {
        toast({
          title: 'Empty content',
          description: 'Please enter a message',
          variant: 'destructive',
        });
        return null;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: post, error: postError } = await supabase
        .from('forum_posts')
        .insert({
          thread_id: threadId,
          user_id: user.id,
          content: content.trim(),
        })
        .select()
        .single();

      if (postError) throw postError;

      if (files.length > 0) {
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}-${Math.random()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('forum-attachments')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('forum-attachments')
            .getPublicUrl(fileName);

          await supabase.from('forum_attachments').insert({
            post_id: post.id,
            file_name: file.name,
            file_url: publicUrl,
            file_type: file.type,
            file_size: file.size,
          });
        }
      }

      toast({
        title: 'Reply posted',
        description: 'Your reply has been added successfully',
      });

      return post;
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to post reply',
        variant: 'destructive',
      });
      return null;
    }
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  return {
    threads,
    isLoading,
    fetchThreads,
    fetchThreadPosts,
    incrementViews,
    createPost,
  };
};
