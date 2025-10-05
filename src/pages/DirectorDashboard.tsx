import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Video, Users, Star, Plus, Eye, Sparkles } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAIAnalysis } from "@/hooks/useAIAnalysis";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function DirectorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { recommendCandidates, isAnalyzing } = useAIAnalysis();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [activeProject, setActiveProject] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    production_company: "",
    project_type: "Feature Film",
    description: "",
    deadline: "",
  });

  useEffect(() => {
    const fetchProjectAndRecommendations = async () => {
      if (!user) return;

      // Fetch only projects owned by this director
      const { data: projects } = await supabase
        .from('projects')
        .select('*, project_roles(*)')
        .eq('director_id', user.id)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(1);

      if (projects && projects.length > 0) {
        const project = projects[0];
        setActiveProject(project);

        const recs = await recommendCandidates(project.id, undefined, 6);
        if (recs) {
          const talentIds = recs.map((r: any) => r.talentId);
          const { data: talents } = await supabase
            .from('talent_profiles')
            .select('*, profiles(full_name, avatar_url)')
            .in('id', talentIds);

          if (talents) {
            const enrichedRecs = recs.map((rec: any) => {
              const talent = talents.find((t: any) => t.id === rec.talentId);
              return { ...rec, talent };
            });
            setRecommendations(enrichedRecs);
          }
        }
      }
    };

    fetchProjectAndRecommendations();
  }, [user]);

  const createProject = async () => {
    if (!user) return;

    try {
      const { error } = await supabase.from("projects").insert({
        ...newProject,
        director_id: user.id,
        deadline: newProject.deadline || null,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project created successfully",
      });

      setIsCreateDialogOpen(false);
      setNewProject({
        title: "",
        production_company: "",
        project_type: "Feature Film",
        description: "",
        deadline: "",
      });
      
      // Refresh the dashboard by reloading
      window.location.reload();
    } catch (error: any) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive",
      });
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks`;
    return `${Math.floor(diffDays / 30)} months`;
  };

  const activeProjectData = activeProject ? {
    title: activeProject.title,
    rolesNeeded: activeProject.project_roles?.length || 0,
    totalCandidates: 0, // This would need to be calculated from applications
    matchedCandidates: recommendations.length,
    deadline: activeProject.deadline ? getTimeAgo(activeProject.deadline) : "No deadline"
  } : null;

  return (
    <DashboardLayout userType="director">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center animate-fadeInDown">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Director Dashboard</h1>
            <p className="text-muted-foreground">AI-powered casting made simple</p>
          </div>
        </div>

        {/* Project Overview - Top Center */}
        {!activeProjectData ? (
          <Card className="bg-gradient-card border-border shadow-elegant hover-lift animate-fadeInUp delay-100">
            <CardContent className="p-8 text-center space-y-4">
              <Video className="h-16 w-16 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No Active Projects</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first casting call to start finding talent
                </p>
                <Button variant="accent" size="lg" onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Project
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-card border-border shadow-elegant hover-lift animate-fadeInUp delay-100">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-foreground flex items-center justify-center gap-2">
                <Video className="h-6 w-6 text-primary" />
                Active Project: {activeProjectData.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-accent">
                    {activeProjectData.rolesNeeded}
                  </div>
                  <div className="text-sm text-muted-foreground">Roles Needed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">{activeProjectData.totalCandidates}</div>
                  <div className="text-sm text-muted-foreground">Total Candidates</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground">
                    {activeProjectData.matchedCandidates}
                  </div>
                  <div className="text-sm text-muted-foreground">AI Matched</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-muted-foreground">{activeProjectData.deadline}</div>
                  <div className="text-sm text-muted-foreground">Deadline</div>
                </div>
              </div>
              
              <div className="flex justify-center gap-4">
                <Button variant="hero" size="lg" onClick={() => navigate('/projects')}>
                  <Eye className="mr-2 h-4 w-4" />
                  View All Candidates
                </Button>
                <Button variant="ai" size="lg" onClick={() => navigate('/projects')}>
                  <Star className="mr-2 h-4 w-4" />
                  AI Recommendations
                </Button>
              </div>

              {activeProjectData.matchedCandidates > 0 && (
                <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 text-center">
                  <div className="text-lg font-semibold text-accent">
                    {Math.round((activeProjectData.matchedCandidates / Math.max(activeProjectData.totalCandidates, 1)) * 100)}% Matched
                  </div>
                  <div className="text-sm text-muted-foreground">AI has found strong matches for your project</div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Top AI Candidates */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">AI-Recommended Candidates</h2>
              </div>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            
            {isAnalyzing ? (
              <Card className="p-8 text-center bg-gradient-card border-border">
                <Sparkles className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
                <p className="text-muted-foreground">Analyzing candidates with AI...</p>
              </Card>
            ) : recommendations.length === 0 ? (
              <Card className="p-8 text-center bg-gradient-card border-border">
                <p className="text-muted-foreground">
                  No AI recommendations available yet. Create a project to get candidate suggestions.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((rec: any, index: number) => (
                  <Card key={index} className="bg-gradient-card border-border hover:shadow-ai transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 animate-fadeInUp" style={{ animationDelay: `${index * 100 + 300}ms` }}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {rec.talent?.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'TC'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">
                            {rec.talent?.profiles?.full_name || 'Anonymous Talent'}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{rec.reasoning}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {rec.keyStrengths?.slice(0, 2).map((strength: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {strength}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-accent" />
                            <span className="font-bold text-primary">{rec.matchScore}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button variant="hero" size="sm" className="flex-1">
                          View Profile
                        </Button>
                        <Button variant="outline" size="sm">
                          <Video className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Project Management */}
          <div className="space-y-4">
            <Card className="bg-gradient-card border-border hover-lift animate-fadeInUp delay-500">
              <CardHeader>
                <CardTitle className="text-foreground">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="dashboard" 
                  className="w-full justify-start"
                  onClick={() => navigate('/discovery')}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Browse Talent Pool
                </Button>
                <Button 
                  variant="dashboard" 
                  className="w-full justify-start"
                  onClick={() => navigate('/projects')}
                >
                  <Star className="mr-2 h-4 w-4" />
                  View All Applications
                </Button>
                <Button 
                  variant="premium" 
                  className="w-full justify-start"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Project
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Create Project Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Casting Call</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  placeholder="Enter project title"
                />
              </div>
              <div>
                <Label htmlFor="company">Production Company</Label>
                <Input
                  id="company"
                  value={newProject.production_company}
                  onChange={(e) => setNewProject({ ...newProject, production_company: e.target.value })}
                  placeholder="Enter production company"
                />
              </div>
              <div>
                <Label htmlFor="type">Project Type</Label>
                <Select
                  value={newProject.project_type}
                  onValueChange={(value) => setNewProject({ ...newProject, project_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Feature Film">Feature Film</SelectItem>
                    <SelectItem value="TV Series">TV Series</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                    <SelectItem value="Short Film">Short Film</SelectItem>
                    <SelectItem value="Music Video">Music Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Project description and requirements"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="deadline">Application Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newProject.deadline}
                  onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={createProject} className="flex-1" disabled={!newProject.title}>
                  Create Project
                </Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}