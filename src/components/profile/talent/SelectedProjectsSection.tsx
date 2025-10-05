import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Star, Calendar, Building } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SelectedProject {
  id: string;
  project_title: string;
  project_type: string;
  production_company: string | null;
  director_name: string | null;
  selected_at: string;
  match_score: number | null;
  ai_evaluation: any;
  role_description: string | null;
}

export function SelectedProjectsSection() {
  const [selectedProjects, setSelectedProjects] = useState<SelectedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingProject, setViewingProject] = useState<SelectedProject | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSelectedProjects();
  }, []);

  const fetchSelectedProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('talent_portfolio_projects')
        .select('*')
        .order('selected_at', { ascending: false });

      if (error) throw error;
      setSelectedProjects(data || []);
    } catch (error: any) {
      console.error('Error fetching selected projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load selected projects',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-card border-border">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading selected projects...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-accent" />
            Selected Projects
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedProjects.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                No projects selected yet
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Keep applying to opportunities to showcase your work here
              </p>
            </div>
          ) : (
            selectedProjects.map((project) => (
              <Card
                key={project.id}
                className="border-border hover:bg-accent/5 transition-colors cursor-pointer"
                onClick={() => setViewingProject(project)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        {project.project_title}
                        {project.match_score && project.match_score >= 80 && (
                          <Badge variant="default" className="bg-accent text-xs">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            Top Match
                          </Badge>
                        )}
                      </h4>
                      {project.director_name && (
                        <p className="text-sm text-muted-foreground">
                          Directed by {project.director_name}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary">{project.project_type}</Badge>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {project.production_company && (
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {project.production_company}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(project.selected_at).toLocaleDateString()}
                    </div>
                    {project.match_score && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-accent text-accent" />
                        {project.match_score}% match
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Project Details Dialog */}
      <Dialog open={!!viewingProject} onOpenChange={() => setViewingProject(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-accent" />
              {viewingProject?.project_title}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh]">
            <div className="space-y-4 pr-4">
              <div className="flex gap-2">
                <Badge variant="secondary">{viewingProject?.project_type}</Badge>
                {viewingProject?.production_company && (
                  <Badge variant="outline">{viewingProject.production_company}</Badge>
                )}
                {viewingProject?.match_score && (
                  <Badge variant="default" className="bg-accent">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    {viewingProject.match_score}% Match
                  </Badge>
                )}
              </div>

              {viewingProject?.director_name && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Director</p>
                  <p className="text-foreground">{viewingProject.director_name}</p>
                </div>
              )}

              {viewingProject?.role_description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Role</p>
                  <p className="text-sm">{viewingProject.role_description}</p>
                </div>
              )}

              {viewingProject?.ai_evaluation && (
                <Card className="bg-accent/5 border-accent/20">
                  <CardHeader>
                    <CardTitle className="text-base">AI Performance Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {viewingProject.ai_evaluation.strengths?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Key Strengths
                        </p>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {viewingProject.ai_evaluation.strengths.map((strength: string, i: number) => (
                            <li key={i}>{strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {viewingProject.ai_evaluation.concerns?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Areas for Growth
                        </p>
                        <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                          {viewingProject.ai_evaluation.concerns.map((concern: string, i: number) => (
                            <li key={i}>{concern}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {viewingProject.ai_evaluation.recommendation && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Director's Feedback
                        </p>
                        <p className="text-sm">{viewingProject.ai_evaluation.recommendation}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="text-xs text-muted-foreground">
                Selected on {new Date(viewingProject?.selected_at || '').toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
