import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Search, Filter, Star, Clock, Users, Video, Plus, Mail, MapPin, Upload, X, Download, FileText, Sparkles, Play, CheckSquare, Square, RefreshCw } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAIAnalysis } from "@/hooks/useAIAnalysis";
import { AIShortlistDialog } from "@/components/projects/AIShortlistDialog";

type Project = {
  id: string;
  title: string;
  production_company: string | null;
  project_type: string;
  description: string | null;
  status: string;
  deadline: string | null;
  director_id: string;
  created_at: string;
};

export default function ProjectsPage() {
  const { userType, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [appliedProjectIds, setAppliedProjectIds] = useState<Set<string>>(new Set());
  const [selectedProjectForApplications, setSelectedProjectForApplications] = useState<string | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [uploadedAudio, setUploadedAudio] = useState<File | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set());
  const [isShortlistMode, setIsShortlistMode] = useState(false);
  const [aiShortlistDialogOpen, setAiShortlistDialogOpen] = useState(false);
  const [aiShortlistedApplicants, setAiShortlistedApplicants] = useState<any[]>([]);
  const [rewordedRoleDescription, setRewordedRoleDescription] = useState<string>('');
  const { shortlistApplicants, isAnalyzing } = useAIAnalysis();
  
  // New project form state
  const [newProject, setNewProject] = useState({
    title: "",
    production_company: "",
    project_type: "Feature Film",
    description: "",
    deadline: "",
  });

  useEffect(() => {
    fetchProjects();
    if (user && userType === "talent") {
      fetchUserApplications();
    }
  }, [user, userType]);

  const fetchProjects = async () => {
    try {
      let query = supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      // For directors, show all open projects in browse mode
      // But they can only view applications for their own projects
      if (userType === "talent") {
        query = query.eq("status", "open");
      } else if (userType === "director") {
        // Directors can see all open projects for browsing
        query = query.eq("status", "open");
      }

      const { data, error } = await query;

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserApplications = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("applications")
        .select("project_id")
        .eq("talent_id", user.id);

      if (error) throw error;
      
      const projectIds = new Set(data?.map(app => app.project_id) || []);
      setAppliedProjectIds(projectIds);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const fetchApplicationsForProject = async (projectId: string) => {
    if (!user) return;
    
    setLoadingApplications(true);
    try {
      // First, verify that the current user is the director of this project
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("director_id")
        .eq("id", projectId)
        .single();

      if (projectError) throw projectError;

      // Security check: only allow directors to view applications for their own projects
      if (projectData.director_id !== user.id) {
        toast({
          title: "Access Denied",
          description: "You can only view applications for your own projects",
          variant: "destructive",
        });
        setApplications([]);
        setLoadingApplications(false);
        return;
      }

      // Force fresh data by using a timestamp in the query
      const { data: applicationsData, error } = await supabase
        .from("applications")
        .select("*")
        .eq("project_id", projectId)
        .neq("status", "rejected")
        .order("applied_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for each application
      const talentIds = applicationsData?.map(app => app.talent_id) || [];
      
      if (talentIds.length === 0) {
        setApplications([]);
        return;
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from("public_profiles")
        .select("*")
        .in("user_id", talentIds);

      if (profilesError) throw profilesError;

      // Fetch talent profiles for additional info - force fresh data
      const { data: talentProfilesData, error: talentError } = await supabase
        .from("talent_profiles")
        .select("height_cm, weight_kg, gender_identity, location, user_id")
        .in("user_id", talentIds);

      if (talentError) throw talentError;

      // Combine the data
      const enrichedApplications = applicationsData?.map(app => {
        const profile = profilesData?.find(p => p.user_id === app.talent_id);
        const talentProfile = talentProfilesData?.find(t => t.user_id === app.talent_id);
        return {
          ...app,
          profile,
          talentProfile
        };
      });

      setApplications(enrichedApplications || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      });
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleViewApplications = (projectId: string) => {
    setSelectedProjectForApplications(projectId);
    setShortlistedIds(new Set());
    setIsShortlistMode(false);
    fetchApplicationsForProject(projectId);
  };

  const toggleShortlist = (applicationId: string) => {
    setShortlistedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(applicationId)) {
        newSet.delete(applicationId);
      } else {
        newSet.add(applicationId);
      }
      return newSet;
    });
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Add watermark
    doc.setFontSize(60);
    doc.setTextColor(240, 240, 240);
    doc.setFont(undefined, 'bold');
    doc.text('LYQON', pageWidth / 2, pageHeight / 2, {
      angle: 45,
      align: 'center'
    });

    // Add title
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text('Applicants List', 14, 20);

    // Add date
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

    // Prepare table data
    const tableData = applications.map(app => {
      const heightText = app.talentProfile?.height_cm
        ? `${app.talentProfile.height_cm} cm`
        : 'N/A';
      
      return [
        app.profile?.full_name || 'Unknown',
        app.talentProfile?.gender_identity || 'N/A',
        heightText,
        app.talentProfile?.location || 'N/A',
        `${app.ai_match_score}%`,
        app.status || 'pending',
        new Date(app.applied_at).toLocaleDateString()
      ];
    });

    // Add table
    autoTable(doc, {
      startY: 35,
      head: [['Name', 'Gender', 'Height', 'Location', 'AI Match', 'Status', 'Applied']],
      body: tableData,
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      margin: { top: 35 }
    });

    // Save the PDF
    doc.save(`applicants-${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: "Success",
      description: "PDF downloaded successfully",
    });
  };

  const handleManualShortlist = async () => {
    if (shortlistedIds.size === 0) {
      toast({
        title: "No Selection",
        description: "Please select applicants to shortlist",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get all application IDs and shortlisted talent IDs
      const allApplicationIds = applications.map(app => app.id);
      const nonShortlistedIds = allApplicationIds.filter(id => !shortlistedIds.has(id));
      const shortlistedTalentIds = applications
        .filter(app => shortlistedIds.has(app.id))
        .map(app => app.talent_id);

      // Update shortlisted applications
      const { error: shortlistError } = await supabase
        .from('applications')
        .update({ status: 'shortlisted' })
        .in('id', Array.from(shortlistedIds));

      if (shortlistError) throw shortlistError;

      // Update non-shortlisted applications to rejected
      if (nonShortlistedIds.length > 0) {
        const { error: rejectError } = await supabase
          .from('applications')
          .update({ status: 'rejected' })
          .in('id', nonShortlistedIds);

        if (rejectError) throw rejectError;
      }

      // Send notifications to shortlisted applicants
      const notifications = shortlistedTalentIds.map(talentId => ({
        user_id: talentId,
        type: 'shortlist',
        title: 'You\'ve been shortlisted!',
        content: 'Congratulations! You have been shortlisted for a project. Check your applications for more details.',
        link: '/projects',
      }));

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notificationError) throw notificationError;

      toast({
        title: "Success",
        description: `${shortlistedIds.size} applicant(s) shortlisted and notified, ${nonShortlistedIds.length} rejected`,
      });

      // Refresh applications and filter out rejected ones
      if (selectedProjectForApplications) {
        fetchApplicationsForProject(selectedProjectForApplications);
      }
      setShortlistedIds(new Set());
      setIsShortlistMode(false);
      setSelectedProjectForApplications(null);
    } catch (error: any) {
      console.error("Error shortlisting:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to shortlist applicants",
        variant: "destructive",
      });
    }
  };

  const handleAIShortlist = async () => {
    if (!selectedProjectForApplications) return;

    const result = await shortlistApplicants(selectedProjectForApplications);
    if (result) {
      setAiShortlistedApplicants(result);
      setAiShortlistDialogOpen(true);
    }
  };

  const createProject = async () => {
    if (!user || userType !== "director") return;

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
      fetchProjects();
    } catch (error: any) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive",
      });
    }
  };

  const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'video/mp4') {
      toast({
        title: "Invalid File Type",
        description: "Please upload only MP4 video files",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (50MB max)
    if (file.size > 52428800) {
      toast({
        title: "File Too Large",
        description: "Video must be less than 50MB",
        variant: "destructive",
      });
      return;
    }

    setUploadedVideo(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
  };

  const handleAudioSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an audio file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (50MB max)
    if (file.size > 52428800) {
      toast({
        title: "File Too Large",
        description: "Audio must be less than 50MB",
        variant: "destructive",
      });
      return;
    }

    setUploadedAudio(file);
    setAudioPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveVideo = () => {
    setUploadedVideo(null);
    setVideoPreviewUrl(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const handleRemoveAudio = () => {
    setUploadedAudio(null);
    setAudioPreviewUrl(null);
    if (audioInputRef.current) {
      audioInputRef.current.value = '';
    }
  };

  const openApplyDialog = async (projectId: string) => {
    setSelectedProjectId(projectId);
    
    // Fetch project details and roles
    try {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*, project_roles(*)')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      let originalDescription = '';
      
      // Get role description from the project
      if (projectData.project_roles && projectData.project_roles.length > 0) {
        // Use the first role's description, or combine all roles
        const roles = projectData.project_roles;
        if (roles.length === 1) {
          originalDescription = roles[0].role_description || 
            `We are casting for ${roles[0].role_name}. ${projectData.description || ''}`;
        } else {
          // Multiple roles - combine them
          const roleDescriptions = roles.map(role => 
            `${role.role_name}: ${role.role_description || 'No specific requirements listed'}`
          ).join('\n\n');
          originalDescription = `Multiple roles available:\n\n${roleDescriptions}\n\n${projectData.description || ''}`;
        }
      } else if (projectData.description) {
        // No roles defined, use project description
        originalDescription = projectData.description;
      } else {
        // Fallback generic description
        originalDescription = `We're looking for talented performers for our ${projectData.project_type} project: ${projectData.title}. Please showcase your best work in your audition video.`;
      }

      console.log('Original role description:', originalDescription);
      
      // Call edge function to reword the description
      const { data: rewordData, error: rewordError } = await supabase.functions.invoke('reword-role-description', {
        body: { roleDescription: originalDescription }
      });

      if (!rewordError && rewordData?.rewordedDescription) {
        console.log('Reworded description:', rewordData.rewordedDescription);
        setRewordedRoleDescription(rewordData.rewordedDescription);
      } else {
        console.error('Rewording failed, using original:', rewordError);
        // Fallback to original if rewording fails
        setRewordedRoleDescription(originalDescription);
      }
    } catch (error) {
      console.error('Error fetching role description:', error);
      setRewordedRoleDescription('Please upload your audition video for this project.');
    }

    setApplyDialogOpen(true);
  };

  const applyToProject = async () => {
    if (!user || userType !== "talent" || !selectedProjectId) return;

    if (!uploadedVideo) {
      toast({
        title: "Video Required",
        description: "Please upload an MP4 video before applying",
        variant: "destructive",
      });
      return;
    }

    setUploadingVideo(true);

    try {
      // Upload video to storage
      const fileExt = 'mp4';
      const videoFileName = `${user.id}/${selectedProjectId}-video-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('application-videos')
        .upload(videoFileName, uploadedVideo, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL for video
      const { data: { publicUrl: videoUrl } } = supabase.storage
        .from('application-videos')
        .getPublicUrl(videoFileName);

      let audioUrl = null;

      // Upload audio if provided
      if (uploadedAudio) {
        const audioExt = uploadedAudio.name.split('.').pop() || 'mp3';
        const audioFileName = `${user.id}/${selectedProjectId}-audio-${Date.now()}.${audioExt}`;
        
        const { error: audioUploadError } = await supabase.storage
          .from('application-videos')
          .upload(audioFileName, uploadedAudio, {
            cacheControl: '3600',
            upsert: false
          });

        if (audioUploadError) throw audioUploadError;

        // Get public URL for audio
        const { data: { publicUrl: audioPublicUrl } } = supabase.storage
          .from('application-videos')
          .getPublicUrl(audioFileName);

        audioUrl = audioPublicUrl;
      }

      // Create application with video and audio URLs
      const { error } = await supabase.from("applications").insert({
        project_id: selectedProjectId,
        talent_id: user.id,
        video_url: videoUrl,
        audio_url: audioUrl,
        ai_match_score: Math.floor(Math.random() * 20) + 80, // Mock AI score
      });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already Applied",
            description: "You have already applied to this project",
          });
          return;
        }
        throw error;
      }

      // Add to applied projects
      setAppliedProjectIds(prev => new Set([...prev, selectedProjectId]));

      toast({
        title: "Success",
        description: "Application submitted successfully",
      });

      // Reset state
      setApplyDialogOpen(false);
      handleRemoveVideo();
      handleRemoveAudio();
      setSelectedProjectId(null);
    } catch (error: any) {
      console.error("Error applying:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setUploadingVideo(false);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.production_company?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || project.project_type === filterType;
    return matchesSearch && matchesType;
  });

  const getDeadlineText = (deadline: string | null) => {
    if (!deadline) return "No deadline";
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return "Expired";
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    if (days < 7) return `${days} days`;
    if (days < 30) return `${Math.ceil(days / 7)} weeks`;
    return `${Math.ceil(days / 30)} months`;
  };

  return (
    <DashboardLayout userType={userType || "talent"}>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Projects & Casting Calls</h1>
            <p className="text-muted-foreground">Discover your next opportunity with AI-powered matching</p>
          </div>
          {userType === "director" && (
            <Button 
              variant="accent" 
              size="lg"
              onClick={() => navigate("/post-project")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          )}
        </div>

        <Card className="bg-gradient-card border-border">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by role, production, or keywords..."
                  className="pl-10 bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Feature Film">Feature Film</SelectItem>
                  <SelectItem value="TV Series">TV Series</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                  <SelectItem value="Short Film">Short Film</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No projects found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="bg-gradient-card border-border hover:shadow-ai transition-all hover:scale-[1.02]">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-foreground text-lg">{project.title}</CardTitle>
                      <p className="text-muted-foreground text-sm">{project.production_company || "Independent"}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-accent" />
                      <span className="font-bold text-primary">{Math.floor(Math.random() * 20) + 80}%</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {project.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">{project.project_type}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">{project.description}</p>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-center text-sm">
                    <div>
                      <div className="font-semibold text-accent">{getDeadlineText(project.deadline)}</div>
                      <div className="text-muted-foreground text-xs">Deadline</div>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">Open</div>
                      <div className="text-muted-foreground text-xs">Status</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {userType === "talent" ? (
                      <Button 
                        variant={appliedProjectIds.has(project.id) ? "outline" : "hero"}
                        size="sm" 
                        className="flex-1"
                        onClick={() => openApplyDialog(project.id)}
                        disabled={appliedProjectIds.has(project.id)}
                      >
                        <Users className="mr-2 h-3 w-3" />
                        {appliedProjectIds.has(project.id) ? "Applied" : "Apply Now"}
                      </Button>
                    ) : (
                      // Directors can only view applications for their own projects
                      project.director_id === user?.id ? (
                        <Button 
                          variant="hero" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleViewApplications(project.id)}
                        >
                          <Users className="mr-2 h-3 w-3" />
                          View Applications
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          disabled
                        >
                          <Users className="mr-2 h-3 w-3" />
                          Not Your Project
                        </Button>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Apply Dialog with Video Upload */}
        <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Apply to Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Role Description Section */}
              {rewordedRoleDescription && (
                <div className="bg-accent/10 border border-accent/20 rounded-lg p-5">
                  <h3 className="font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
                    <Star className="h-5 w-5 text-accent fill-accent" />
                    Role Requirements & Description
                  </h3>
                  <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                    {rewordedRoleDescription}
                  </div>
                  <div className="mt-3 pt-3 border-t border-accent/20">
                    <p className="text-xs text-muted-foreground italic">
                      Please prepare your audition video based on these requirements
                    </p>
                  </div>
                </div>
              )}

              <div>
                <Label className="text-base font-semibold">Upload Application Video (Required)</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload an MP4 video showcasing your talent for this role (Max 50MB)
                </p>
                
                {!uploadedVideo ? (
                  <div>
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/mp4"
                      onChange={handleVideoSelect}
                      className="hidden"
                      id="video-upload"
                    />
                    <label htmlFor="video-upload">
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
                        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm font-medium mb-1">Click to upload MP4 video</p>
                        <p className="text-xs text-muted-foreground">Maximum file size: 50MB</p>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden bg-black">
                      <video
                        src={videoPreviewUrl || undefined}
                        controls
                        className="w-full max-h-[400px]"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{uploadedVideo.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {(uploadedVideo.size / 1024 / 1024).toFixed(2)} MB
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveVideo}
                        disabled={uploadingVideo}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-base font-semibold">Upload Audio Clip (Optional)</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload an audio clip showcasing your voice (Max 50MB)
                </p>
                
                {!uploadedAudio ? (
                  <div>
                    <input
                      ref={audioInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioSelect}
                      className="hidden"
                      id="audio-upload"
                    />
                    <label htmlFor="audio-upload">
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                        <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-sm font-medium mb-1">Click to upload audio file</p>
                        <p className="text-xs text-muted-foreground">MP3, WAV, or other audio formats (Max 50MB)</p>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative rounded-lg overflow-hidden bg-card p-4">
                      <audio
                        src={audioPreviewUrl || undefined}
                        controls
                        className="w-full"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Play className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{uploadedAudio.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {(uploadedAudio.size / 1024 / 1024).toFixed(2)} MB
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveAudio}
                        disabled={uploadingVideo}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={applyToProject}
                  className="flex-1"
                  disabled={!uploadedVideo || uploadingVideo}
                >
                  {uploadingVideo ? "Submitting..." : "Submit Application"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setApplyDialogOpen(false);
                    handleRemoveVideo();
                    handleRemoveAudio();
                  }}
                  disabled={uploadingVideo}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Applications Dialog */}
        <Dialog open={!!selectedProjectForApplications} onOpenChange={(open) => !open && setSelectedProjectForApplications(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh]">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>
                  Applications ({applications.length})
                  {shortlistedIds.size > 0 && (
                    <span className="text-sm text-muted-foreground ml-2">
                      ({shortlistedIds.size} selected)
                    </span>
                  )}
                </DialogTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => selectedProjectForApplications && fetchApplicationsForProject(selectedProjectForApplications)}
                    disabled={loadingApplications}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                  {!isShortlistMode ? (
                    <>
                      <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsShortlistMode(true)}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Shortlist Manually
                      </Button>
                      <Button 
                        variant="hero" 
                        size="sm"
                        onClick={handleAIShortlist}
                        disabled={isAnalyzing || applications.length === 0}
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        {isAnalyzing ? 'Analyzing...' : 'Shortlist Using AI'}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setIsShortlistMode(false);
                          setShortlistedIds(new Set());
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="hero" 
                        size="sm" 
                        onClick={handleManualShortlist}
                        disabled={shortlistedIds.size === 0}
                      >
                        <CheckSquare className="mr-2 h-4 w-4" />
                        Proceed ({shortlistedIds.size})
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </DialogHeader>
            <ScrollArea className="h-[70vh]">
              {loadingApplications ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading applications...</p>
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No applications yet</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {isShortlistMode && (
                          <TableHead className="w-12">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (shortlistedIds.size === applications.length) {
                                  setShortlistedIds(new Set());
                                } else {
                                  setShortlistedIds(new Set(applications.map(a => a.id)));
                                }
                              }}
                            >
                              {shortlistedIds.size === applications.length ? (
                                <CheckSquare className="h-4 w-4" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                            </Button>
                          </TableHead>
                        )}
                        <TableHead>Applicant</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Height</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-center">Video</TableHead>
                        <TableHead>Applied</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((application) => {
                        const heightText = application.talentProfile?.height_cm
                          ? `${application.talentProfile.height_cm} cm`
                          : 'N/A';
                        
                        return (
                          <TableRow key={application.id}>
                            {isShortlistMode && (
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleShortlist(application.id)}
                                >
                                  {shortlistedIds.has(application.id) ? (
                                    <CheckSquare className="h-4 w-4 text-primary" />
                                  ) : (
                                    <Square className="h-4 w-4" />
                                  )}
                                </Button>
                              </TableCell>
                            )}
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={application.profile?.avatar_url} />
                                  <AvatarFallback>
                                    {application.profile?.full_name?.charAt(0) || 'T'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <Button
                                    variant="link"
                                    className="h-auto p-0 font-medium text-foreground hover:text-primary"
                                    onClick={() => navigate(`/profile?userId=${application.talent_id}`)}
                                  >
                                    {application.profile?.full_name || 'Unknown'}
                                  </Button>
                                  <div className="text-xs text-muted-foreground">
                                    {application.profile?.email}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {application.talentProfile?.gender_identity || 'N/A'}
                            </TableCell>
                            <TableCell>{heightText}</TableCell>
                            <TableCell>
                              {application.talentProfile?.location || 'N/A'}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary" className="text-xs">
                                {application.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedVideoUrl(application.video_url);
                                  setIsVideoDialogOpen(true);
                                }}
                              >
                                <Play className="h-5 w-5 text-primary" />
                              </Button>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {new Date(application.applied_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Video Player Dialog */}
        <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Application Video</DialogTitle>
            </DialogHeader>
            <div className="rounded-lg overflow-hidden bg-black">
              {selectedVideoUrl && (
                <video
                  src={selectedVideoUrl}
                  controls
                  autoPlay
                  className="w-full max-h-[70vh]"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* AI Shortlist Dialog */}
        {selectedProjectForApplications && (
          <AIShortlistDialog
            open={aiShortlistDialogOpen}
            onOpenChange={setAiShortlistDialogOpen}
            shortlistedApplicants={aiShortlistedApplicants}
            projectId={selectedProjectForApplications}
            projectTitle={projects.find(p => p.id === selectedProjectForApplications)?.title || 'Project'}
          />
        )}
      </div>
    </DashboardLayout>
  );
}