import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useForums, ForumPost } from "@/hooks/useForums";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  MessageSquare, 
  Eye, 
  Clock,
  Upload,
  X,
  Loader2,
  Download
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function ForumThreadPage() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const { userType } = useAuth();
  const { fetchThreadPosts, incrementViews, createPost } = useForums();
  const [thread, setThread] = useState<any>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [replyContent, setReplyContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (threadId) {
      loadThread();
      incrementViews(threadId);
    }
  }, [threadId]);

  const loadThread = async () => {
    if (!threadId) return;
    
    setIsLoading(true);
    try {
      const { data: threadData, error: threadError } = await supabase
        .from('forum_threads')
        .select('*')
        .eq('id', threadId)
        .single();

      if (threadError) throw threadError;

      // Fetch profile separately
      if (threadData) {
        const { data: profileData } = await supabase
          .from('public_profiles')
          .select('user_id, full_name, user_type, avatar_url')
          .eq('user_id', threadData.user_id)
          .single();

        setThread({
          ...threadData,
          profiles: profileData
        });
      }

      const postsData = await fetchThreadPosts(threadId);
      setPosts(postsData);
    } catch (error) {
      console.error('Error loading thread:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (files.length + newFiles.length > 5) {
        return;
      }
      setFiles([...files, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmitReply = async () => {
    if (!threadId || !replyContent.trim()) return;

    setIsSubmitting(true);
    const result = await createPost(threadId, replyContent, files);
    
    if (result) {
      setReplyContent("");
      setFiles([]);
      loadThread();
    }
    setIsSubmitting(false);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      casting: "Casting & Auditions",
      technology: "Technology & AI",
      filmmaking: "Filmmaking & Production",
      news: "Industry News",
    };
    return labels[category] || category;
  };

  if (isLoading) {
    return (
      <DashboardLayout userType={userType || "talent"}>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!thread) {
    return (
      <DashboardLayout userType={userType || "talent"}>
        <div className="p-6">
          <Button variant="ghost" onClick={() => navigate('/forums')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Forums
          </Button>
          <p className="text-center text-muted-foreground mt-8">Thread not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType={userType || "talent"}>
      <div className="p-6 space-y-6">
        <Button variant="ghost" onClick={() => navigate('/forums')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Forums
        </Button>

        {/* Thread Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start gap-2 flex-wrap">
                {thread.is_pinned && (
                  <Badge variant="secondary">Pinned</Badge>
                )}
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {getCategoryLabel(thread.category)}
                </Badge>
              </div>

              <h1 className="text-3xl font-bold text-foreground">{thread.title}</h1>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={thread.profiles?.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {thread.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{thread.profiles?.full_name || 'Anonymous'}</span>
                  <Badge variant="secondary" className="text-xs">
                    {thread.profiles?.user_type === 'talent' ? 'Talent' : 'Director'}
                  </Badge>
                </div>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date(thread.created_at).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {thread.views} views
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {posts.length} replies
                </span>
              </div>

              {thread.tags && thread.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {thread.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Posts */}
        <div className="space-y-4">
          {posts.map((post, index) => (
            <Card key={post.id}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.profiles?.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {post.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {post.profiles?.full_name || 'Anonymous'}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {post.profiles?.user_type === 'talent' ? 'Talent' : 'Director'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(post.created_at).toLocaleString()}
                      </span>
                      {post.is_edited && (
                        <Badge variant="outline" className="text-xs">Edited</Badge>
                      )}
                      {index === 0 && (
                        <Badge className="text-xs bg-accent/10 text-accent">Original Post</Badge>
                      )}
                    </div>

                    <p className="text-foreground whitespace-pre-wrap">{post.content}</p>

                    {post.forum_attachments && post.forum_attachments.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
                        {post.forum_attachments.map((attachment) => (
                          <a
                            key={attachment.id}
                            href={attachment.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors flex items-center gap-2"
                          >
                            {attachment.file_type.startsWith('image/') ? (
                              <img
                                src={attachment.file_url}
                                alt={attachment.file_name}
                                className="w-full h-32 object-cover rounded"
                              />
                            ) : (
                              <>
                                <Download className="h-4 w-4 text-primary" />
                                <span className="text-sm truncate">{attachment.file_name}</span>
                              </>
                            )}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reply Section */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-foreground">Post a Reply</h3>
            
            <Textarea
              placeholder="Write your reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={4}
              maxLength={5000}
            />
            <p className="text-xs text-muted-foreground">{replyContent.length}/5000</p>

            <div className="space-y-2">
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                <Input
                  id="reply-files"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,video/*,.pdf,.doc,.docx"
                />
                <label htmlFor="reply-files" className="cursor-pointer">
                  <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Attach files (optional, max 5)
                  </p>
                </label>
              </div>
              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <span className="text-sm truncate flex-1">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button 
              onClick={handleSubmitReply} 
              disabled={isSubmitting || !replyContent.trim()}
              className="w-full"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Post Reply
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
