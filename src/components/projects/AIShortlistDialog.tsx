import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Download, CheckCircle2, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ShortlistedApplicant {
  applicationId: string;
  matchScore: number;
  strengths: string[];
  concerns: string[];
  recommendation: string;
  talentName: string;
  talentAvatar?: string;
  talentId: string;
  application: any;
}

interface AIShortlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shortlistedApplicants: ShortlistedApplicant[];
  projectId: string;
  projectTitle: string;
}

export function AIShortlistDialog({
  open,
  onOpenChange,
  shortlistedApplicants,
  projectId,
  projectTitle,
}: AIShortlistDialogProps) {
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

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
    doc.text('AI Shortlisted Applicants', 14, 20);

    // Add project info
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Project: ${projectTitle}`, 14, 28);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 35);

    // Prepare table data
    const tableData = shortlistedApplicants.map(app => [
      app.talentName,
      `${app.matchScore}%`,
      app.strengths.slice(0, 2).join('; '),
      app.recommendation.substring(0, 60) + '...'
    ]);

    // Add table
    autoTable(doc, {
      startY: 42,
      head: [['Name', 'Match Score', 'Key Strengths', 'Recommendation']],
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
      }
    });

    doc.save(`ai-shortlist-${projectTitle.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: "Success",
      description: "Shortlist PDF downloaded successfully",
    });
  };

  const handleSelectAndFinalize = async () => {
    if (!selectedApplicantId) {
      toast({
        title: "No Selection",
        description: "Please select an applicant to proceed",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const selectedApplicant = shortlistedApplicants.find(
        app => app.applicationId === selectedApplicantId
      );

      if (!selectedApplicant) throw new Error("Selected applicant not found");

      // Fetch full project details
      const { data: projectData, error: projectFetchError } = await supabase
        .from('projects')
        .select('*, director_profiles!projects_director_id_fkey(user_id)')
        .eq('id', projectId)
        .single();

      if (projectFetchError) throw projectFetchError;

      // Fetch director profile
      const { data: directorProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', projectData.director_id)
        .single();

      // Update selected application to 'accepted'
      const { error: acceptError } = await supabase
        .from('applications')
        .update({ status: 'accepted' })
        .eq('id', selectedApplicantId);

      if (acceptError) throw acceptError;

      // Update all other applications to 'rejected'
      const otherApplicationIds = shortlistedApplicants
        .filter(app => app.applicationId !== selectedApplicantId)
        .map(app => app.applicationId);

      if (otherApplicationIds.length > 0) {
        const { error: rejectError } = await supabase
          .from('applications')
          .update({ status: 'rejected' })
          .in('id', otherApplicationIds);

        if (rejectError) throw rejectError;
      }

      // Update project status to 'completed' and set selected_talent_id
      const { error: projectError } = await supabase
        .from('projects')
        .update({ 
          status: 'completed',
          selected_talent_id: selectedApplicant.talentId 
        })
        .eq('id', projectId);

      if (projectError) throw projectError;

      // Save to director's completed projects
      const { error: completedProjectError } = await supabase
        .from('completed_projects')
        .insert({
          project_id: projectId,
          director_id: projectData.director_id,
          selected_talent_id: selectedApplicant.talentId,
          project_title: projectTitle,
          project_type: projectData.project_type,
          production_company: projectData.production_company,
          shortlist_data: shortlistedApplicants.map(app => ({
            name: app.talentName,
            matchScore: app.matchScore,
            strengths: app.strengths,
            concerns: app.concerns,
            recommendation: app.recommendation,
            selected: app.applicationId === selectedApplicantId
          }))
        });

      if (completedProjectError) throw completedProjectError;

      // Add to selected talent's portfolio
      const { error: portfolioError } = await supabase
        .from('talent_portfolio_projects')
        .insert({
          talent_id: selectedApplicant.talentId,
          project_id: projectId,
          project_title: projectTitle,
          project_type: projectData.project_type,
          production_company: projectData.production_company,
          director_name: directorProfile?.full_name || 'Unknown Director',
          match_score: selectedApplicant.matchScore,
          ai_evaluation: {
            strengths: selectedApplicant.strengths,
            concerns: selectedApplicant.concerns,
            recommendation: selectedApplicant.recommendation
          }
        });

      if (portfolioError && portfolioError.code !== '23505') { // Ignore duplicate errors
        console.error('Portfolio insert error:', portfolioError);
      }

      // Send notification to selected talent
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: selectedApplicant.talentId,
          type: 'selection',
          title: 'Congratulations! You\'ve been selected!',
          content: `You have been selected for the project "${projectTitle}". The director will contact you with next steps.`,
          link: '/projects',
        });

      if (notificationError) throw notificationError;

      toast({
        title: "Success!",
        description: `${selectedApplicant.talentName} has been selected and added to portfolios`,
      });

      onOpenChange(false);
      
      // Refresh the page to show updated project status
      window.location.reload();

    } catch (error: any) {
      console.error("Error finalizing selection:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to finalize selection",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            AI Shortlisted Applicants ({shortlistedApplicants.length})
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh]">
          <div className="space-y-4 pr-4">
            {shortlistedApplicants.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No applicants met the minimum 50% match score threshold.
              </div>
            ) : (
              shortlistedApplicants.map((applicant) => (
                <Card
                  key={applicant.applicationId}
                  className={`cursor-pointer transition-all ${
                    selectedApplicantId === applicant.applicationId
                      ? 'ring-2 ring-primary bg-primary/5'
                      : 'hover:bg-accent/50'
                  }`}
                  onClick={() => setSelectedApplicantId(applicant.applicationId)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={applicant.talentAvatar} />
                        <AvatarFallback>
                          {applicant.talentName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">{applicant.talentName}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-base">
                              <Star className="h-4 w-4 mr-1 fill-primary text-primary" />
                              {applicant.matchScore}% Match
                            </Badge>
                            {selectedApplicantId === applicant.applicationId && (
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">
                              Key Strengths
                            </h4>
                            <ul className="list-disc list-inside space-y-1">
                              {applicant.strengths.map((strength, idx) => (
                                <li key={idx} className="text-sm">{strength}</li>
                              ))}
                            </ul>
                          </div>

                          {applicant.concerns.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                                Considerations
                              </h4>
                              <ul className="list-disc list-inside space-y-1">
                                {applicant.concerns.map((concern, idx) => (
                                  <li key={idx} className="text-sm text-muted-foreground">
                                    {concern}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">
                              AI Recommendation
                            </h4>
                            <p className="text-sm">{applicant.recommendation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>

          <Button
            onClick={handleSelectAndFinalize}
            disabled={!selectedApplicantId || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Select & Finalize
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
