import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Video } from 'lucide-react';
import { useAuditions } from '@/hooks/useAuditions';
import { Badge } from '@/components/ui/badge';

interface UploadAuditionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  roleId?: string;
  defaultRoleDescription?: string;
}

const ROLE_TEMPLATES = [
  { label: 'Hero', value: 'Confident, charismatic leader with courage and determination. Shows bravery and leadership qualities.' },
  { label: 'Villain', value: 'Compelling antagonist with charm and menace. Intimidating and manipulative with powerful presence.' },
  { label: 'Romantic Lead', value: 'Charming and empathetic character with vulnerability and passion. Shows emotional depth and warmth.' },
  { label: 'Comedic', value: 'Energetic and expressive performer with great timing and humor. Brings lightness and joy to scenes.' },
  { label: 'Dramatic', value: 'Intense and emotionally deep actor with authenticity and range. Conveys complex emotions powerfully.' },
  { label: 'Supporting', value: 'Reliable and consistent performer with versatility and dependability. Solid foundation for any scene.' },
];

export const UploadAuditionDialog = ({
  open,
  onOpenChange,
  projectId,
  roleId,
  defaultRoleDescription = '',
}: UploadAuditionDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [roleDescription, setRoleDescription] = useState(defaultRoleDescription);
  const [emotionalKeywords, setEmotionalKeywords] = useState('');
  const { uploadAudition, isUploading } = useAuditions();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'image/jpeg', 'image/png', 'image/gif'];
      
      if (!validTypes.includes(selectedFile.type)) {
        alert('Please upload a valid video (MP4, MOV, AVI) or image (JPG, PNG, GIF) file');
        return;
      }

      if (selectedFile.size > 50 * 1024 * 1024) { // 50MB limit
        alert('File size must be less than 50MB');
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !roleDescription) return;

    const keywords = emotionalKeywords
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    const success = await uploadAudition(file, projectId, roleDescription, keywords, roleId);
    
    if (success) {
      setFile(null);
      setRoleDescription('');
      setEmotionalKeywords('');
      onOpenChange(false);
    }
  };

  const applyTemplate = (template: string) => {
    setRoleDescription(template);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Audition</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Templates */}
          <div className="space-y-2">
            <Label>Quick Templates</Label>
            <div className="flex flex-wrap gap-2">
              {ROLE_TEMPLATES.map((template) => (
                <Badge
                  key={template.label}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => applyTemplate(template.value)}
                >
                  {template.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Role Description */}
          <div className="space-y-2">
            <Label htmlFor="roleDescription">
              Role Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="roleDescription"
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
              placeholder="Describe the role requirements, character traits, and emotional range needed..."
              rows={5}
              required
            />
          </div>

          {/* Emotional Keywords */}
          <div className="space-y-2">
            <Label htmlFor="emotionalKeywords">
              Emotional Keywords (Optional)
            </Label>
            <Input
              id="emotionalKeywords"
              value={emotionalKeywords}
              onChange={(e) => setEmotionalKeywords(e.target.value)}
              placeholder="e.g., confident, vulnerable, intense (comma-separated)"
            />
            <p className="text-sm text-muted-foreground">
              Add specific emotional traits to look for in the audition
            </p>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">
              Audition Video/Image <span className="text-destructive">*</span>
            </Label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
              <input
                type="file"
                id="file"
                onChange={handleFileChange}
                accept="video/mp4,video/quicktime,video/x-msvideo,image/jpeg,image/png,image/gif"
                className="hidden"
                required
              />
              <label htmlFor="file" className="cursor-pointer">
                {file ? (
                  <div className="flex items-center justify-center gap-2">
                    <Video className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      MP4, MOV, AVI, JPG, PNG, GIF (max 50MB)
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading || !file || !roleDescription}>
              {isUploading ? 'Uploading...' : 'Upload & Analyze'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
