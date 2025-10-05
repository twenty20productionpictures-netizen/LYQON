import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, Star, Calendar, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CompletedProject {
  id: string;
  project_title: string;
  project_type: string;
  production_company: string | null;
  completed_at: string;
  shortlist_data: any[];
  selected_talent_id: string;
}

export function CompletedProjectsSection() {
  const [completedProjects, setCompletedProjects] = useState<CompletedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<CompletedProject | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCompletedProjects();
  }, []);

  const fetchCompletedProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('completed_projects')
        .select('*')
        .order('completed_at', { ascending: false });

      if (error) throw error;
      setCompletedProjects((data || []) as CompletedProject[]);
    } catch (error: any) {
      console.error('Error fetching completed projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load completed projects',
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
          <p className="text-center text-muted-foreground">Loading completed projects...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-accent" />
            Completed Projects
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {completedProjects.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No completed projects yet
            </p>
          ) : (
            completedProjects.map((project) => (
              <Card
                key={project.id}
                className="border-border hover:bg-accent/5 transition-colors cursor-pointer"
                onClick={() => setSelectedProject(project)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{project.project_title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {project.production_company || 'Independent'}
                      </p>
                    </div>
                    <Badge variant="secondary">{project.project_type}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(project.completed_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {project.shortlist_data?.length || 0} shortlisted
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Project Details Dialog */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedProject?.project_title}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh]">
            <div className="space-y-4 pr-4">
              <div className="flex gap-2">
                <Badge variant="secondary">{selectedProject?.project_type}</Badge>
                {selectedProject?.production_company && (
                  <Badge variant="outline">{selectedProject.production_company}</Badge>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-2">Shortlisted Candidates</h4>
                <div className="space-y-3">
                  {selectedProject?.shortlist_data?.map((candidate: any, idx: number) => (
                    <Card
                      key={idx}
                      className={`border-border ${
                        candidate.selected ? 'bg-accent/10 border-accent' : ''
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium">{candidate.name}</h5>
                            {candidate.selected && (
                              <Badge variant="default" className="bg-accent">
                                Selected
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-accent fill-accent" />
                            <span className="font-bold">{candidate.matchScore}%</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Strengths
                            </p>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              {candidate.strengths?.map((strength: string, i: number) => (
                                <li key={i}>{strength}</li>
                              ))}
                            </ul>
                          </div>

                          {candidate.concerns?.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                Considerations
                              </p>
                              <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                                {candidate.concerns.map((concern: string, i: number) => (
                                  <li key={i}>{concern}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              AI Recommendation
                            </p>
                            <p className="text-sm">{candidate.recommendation}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
