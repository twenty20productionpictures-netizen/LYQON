import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, Video, Clock, Sparkles, FileText } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAIAnalysis } from "@/hooks/useAIAnalysis";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function TalentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { analyzeProfile, isAnalyzing } = useAIAnalysis();
  const [profileAnalysis, setProfileAnalysis] = useState<any>(null);
  const [talentProfile, setTalentProfile] = useState<any>(null);
  const [openProjects, setOpenProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchProfileAndAnalyze = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from('talent_profiles')
        .select(`
          *,
          profiles(full_name),
          talent_media(count)
        `)
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setTalentProfile(profile);
        
        const analysis = await analyzeProfile(
          profile,
          profile.talent_media?.[0]?.count || 0
        );
        setProfileAnalysis(analysis);
      }
    };

    fetchProfileAndAnalyze();
  }, [user]);

  useEffect(() => {
    const fetchOpenProjects = async () => {
      if (!user) return;
      
      setLoadingProjects(true);
      try {
        const { data: projects, error } = await supabase
          .from('projects')
          .select(`
            *,
            project_roles(*)
          `)
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(6);
        
        // Fetch director profiles separately
        let enrichedProjects: any[] = [];
        if (projects && projects.length > 0) {
          const directorIds = projects.map(p => p.director_id);
          const { data: profiles } = await supabase
            .from('public_profiles')
            .select('user_id, full_name')
            .in('user_id', directorIds);
          
          // Merge profiles into projects
          enrichedProjects = projects.map(project => ({
            ...project,
            profiles: profiles?.find(p => p.user_id === project.director_id)
          }));
        }

        if (error) throw error;
        setOpenProjects(enrichedProjects || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoadingProjects(false);
      }
    };

    const fetchNotifications = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      setNotifications(data || []);
    };

    fetchOpenProjects();
    fetchNotifications();
  }, [user]);

  const handleApply = (projectId: string, projectTitle: string) => {
    navigate(`/projects?apply=${projectId}`);
    toast({
      title: "Ready to Apply",
      description: `Opening application for "${projectTitle}"`,
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const matchScore = isAnalyzing ? 0 : profileAnalysis?.overallScore || talentProfile?.ai_match_score || 87;

  return (
    <DashboardLayout userType="talent">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center animate-fadeInDown">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Talent Dashboard</h1>
            <p className="text-muted-foreground">Your AI-powered casting journey</p>
          </div>
        </div>

        {/* AI Match Score - Top Center */}
        <Card className="bg-gradient-card border-border shadow-elegant hover-lift animate-fadeInUp delay-100">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-foreground flex items-center justify-center gap-2">
              <Star className="h-6 w-6 text-accent animate-glow" />
              Your LYQON AI Match Rating
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="relative">
              <div className="text-6xl font-bold text-primary">
                {isAnalyzing ? '...' : `${matchScore}%`}
              </div>
              <div className="absolute -top-2 -right-2">
                <div className="w-4 h-4 bg-accent rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="text-muted-foreground">Based on your portfolio, experience, and AI analysis</p>
            {profileAnalysis && (
              <div className="mt-4 p-4 bg-accent/5 rounded-lg border border-accent/20">
                <div className="flex items-start gap-2 text-left">
                  <Sparkles className="h-5 w-5 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-sm mb-1">AI Insights</h3>
                    <p className="text-sm text-muted-foreground">{profileAnalysis.summary}</p>
                    {profileAnalysis.priorityActions?.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium mb-1">Priority Actions:</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {profileAnalysis.priorityActions.map((action: string, i: number) => (
                            <li key={i}>• {action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-center gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-semibold text-accent">12</div>
                <div className="text-sm text-muted-foreground">Active Applications</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-primary">3</div>
                <div className="text-sm text-muted-foreground">Callbacks This Week</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-foreground">45</div>
                <div className="text-sm text-muted-foreground">Profile Views</div>
              </div>
            </div>
            <Button variant="ai" className="mt-4" onClick={() => navigate('/profile')}>
              <FileText className="mr-2 h-4 w-4" />
              Complete Your Profile
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Your Next Audition Feed */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Open Opportunities</h2>
            </div>
            
            {loadingProjects ? (
              <Card className="p-8 text-center bg-gradient-card border-border">
                <Sparkles className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
                <p className="text-muted-foreground">Loading opportunities...</p>
              </Card>
            ) : openProjects.length === 0 ? (
              <Card className="p-8 text-center bg-gradient-card border-border">
                <p className="text-muted-foreground">
                  No open projects available at the moment. Check back soon!
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {openProjects.map((project, index) => (
                  <Card key={project.id} className="bg-gradient-card border-border hover:shadow-ai transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 animate-fadeInUp" style={{ animationDelay: `${index * 100 + 300}ms` }}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground text-lg">{project.title}</h3>
                          <p className="text-muted-foreground">{project.profiles?.full_name || 'Director'}</p>
                          <Badge variant="secondary" className="mt-2">{project.project_type}</Badge>
                          {project.production_company && (
                            <p className="text-sm text-muted-foreground mt-1">{project.production_company}</p>
                          )}
                        </div>
                        <div className="text-right">
                          {project.project_roles && project.project_roles.length > 0 && (
                            <div className="text-sm text-muted-foreground mb-2">
                              {project.project_roles.length} {project.project_roles.length === 1 ? 'role' : 'roles'}
                            </div>
                          )}
                          {project.deadline && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {getTimeAgo(project.deadline)}
                            </div>
                          )}
                        </div>
                      </div>
                      {project.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
                      )}
                      <div className="flex gap-2">
                        <Button 
                          variant="hero" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleApply(project.id, project.title)}
                        >
                          Apply Now
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/projects?view=${project.id}`)}>
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Quick Stats & Actions */}
          <div className="space-y-4">
            {notifications.length > 0 && (
              <Card className="bg-gradient-card border-border hover-lift animate-fadeInUp delay-400">
                <CardHeader>
                  <CardTitle className="text-foreground">Recent Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {notifications.map((notification, index) => (
                    <div key={notification.id} className="text-sm">
                      <div className="font-medium text-foreground">{notification.title}</div>
                      <div className="text-muted-foreground">{notification.content}</div>
                      <div className="text-xs text-muted-foreground">{getTimeAgo(notification.created_at)}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card className="bg-gradient-card border-border hover-lift animate-fadeInUp delay-500">
              <CardHeader>
                <CardTitle className="text-foreground">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="dashboard" 
                  className="w-full justify-start"
                  onClick={() => navigate('/profile')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Edit My Profile
                </Button>
                <Button 
                  variant="dashboard" 
                  className="w-full justify-start"
                  onClick={() => navigate('/projects')}
                >
                  <Star className="mr-2 h-4 w-4" />
                  Browse All Projects
                </Button>
                <Button 
                  variant="dashboard" 
                  className="w-full justify-start"
                  onClick={() => navigate('/discovery')}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Connect with Directors
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}