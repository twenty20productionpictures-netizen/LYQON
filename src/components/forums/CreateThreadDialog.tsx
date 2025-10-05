import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Upload, X, Loader2 } from "lucide-react";

interface CreateThreadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateThreadDialog({ open, onOpenChange, onSuccess }: CreateThreadDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (files.length + newFiles.length > 5) {
        toast({
          title: "Too many files",
          description: "You can only upload up to 5 files",
          variant: "destructive",
        });
        return;
      }
      setFiles([...files, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!title.trim() || !category || !content.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: thread, error: threadError } = await supabase
        .from('forum_threads')
        .insert({
          user_id: user.id,
          title: title.trim(),
          category,
          tags,
        })
        .select()
        .single();

      if (threadError) throw threadError;

      const { data: post, error: postError } = await supabase
        .from('forum_posts')
        .insert({
          thread_id: thread.id,
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
        title: "Thread created",
        description: "Your discussion has been posted successfully",
      });

      setTitle("");
      setCategory("");
      setContent("");
      setTags([]);
      setFiles([]);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error creating thread:', error);
      toast({
        title: "Error",
        description: "Failed to create thread. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Start a New Discussion</DialogTitle>
          <DialogDescription>
            Share your thoughts, questions, or experiences with the community
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter a descriptive title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">{title.length}/200</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="casting">Casting & Auditions</SelectItem>
                <SelectItem value="technology">Technology & AI</SelectItem>
                <SelectItem value="filmmaking">Filmmaking & Production</SelectItem>
                <SelectItem value="news">Industry News</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              placeholder="Share your thoughts..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              maxLength={5000}
            />
            <p className="text-xs text-muted-foreground">{content.length}/5000</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (optional, max 5)</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                disabled={tags.length >= 5}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                disabled={tags.length >= 5}
              >
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="files">Attachments (optional, max 5 files)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
              <Input
                id="files"
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,video/*,.pdf,.doc,.docx"
              />
              <label htmlFor="files" className="cursor-pointer">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload files
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Images, videos, PDFs, or documents
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Post Discussion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
