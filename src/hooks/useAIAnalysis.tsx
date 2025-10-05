import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface MatchResult {
  matchScore: number;
  strengths: string[];
  concerns: string[];
  recommendation: string;
}

interface ProfileAnalysis {
  overallScore: number;
  completeness: number;
  marketability: number;
  strengths: string[];
  improvements: string[];
  priorityActions: string[];
  summary: string;
}

interface CandidateRecommendation {
  talentId: string;
  matchScore: number;
  reasoning: string;
  keyStrengths: string[];
}

interface AuditionEvaluation {
  overall_match_score: number;
  recommendation: 'strong_yes' | 'yes' | 'maybe' | 'probably_not' | 'no';
  emotions_detected: Record<string, number>;
  strengths: string[];
  improvements: string[];
  technical_notes: string[];
  detailed_analysis: {
    emotional_intensity: 'low' | 'medium' | 'high';
    face_quality_score: number;
    technical_quality_score: number;
    emotion_match_score: number;
    archetype_match: string;
    summary: string;
  };
}

export const useAIAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const matchTalentToRole = async (
    talentProfile: any,
    projectRole: any
  ): Promise<MatchResult | null> => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-match-talent', {
        body: { talentProfile, projectRole },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error matching talent to role:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Unable to calculate AI match score',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeProfile = async (
    talentProfile: any,
    mediaCount: number
  ): Promise<ProfileAnalysis | null> => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-analyze-profile', {
        body: { talentProfile, mediaCount },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error analyzing profile:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Unable to analyze profile',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const recommendCandidates = async (
    projectId: string,
    roleId?: string,
    limit: number = 10
  ): Promise<CandidateRecommendation[] | null> => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-recommend-candidates', {
        body: { projectId, roleId, limit },
      });

      if (error) throw error;
      return data.recommendations;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      toast({
        title: 'Recommendation Failed',
        description: 'Unable to get AI candidate recommendations',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const evaluateAudition = async (auditionId: string): Promise<AuditionEvaluation | null> => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-evaluate-audition', {
        body: { auditionId },
      });

      if (error) throw error;
      
      toast({
        title: 'Evaluation Complete',
        description: 'Audition has been analyzed successfully',
      });
      
      return data.evaluation;
    } catch (error) {
      console.error('Error evaluating audition:', error);
      toast({
        title: 'Evaluation Failed',
        description: 'Unable to evaluate audition',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const shortlistApplicants = async (projectId: string): Promise<any[] | null> => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-shortlist-applicants', {
        body: { projectId },
      });

      if (error) throw error;
      
      toast({
        title: 'AI Shortlisting Complete',
        description: `${data.shortlistedApplicants.length} applicants meet the criteria`,
      });
      
      return data.shortlistedApplicants;
    } catch (error) {
      console.error('Error shortlisting applicants:', error);
      toast({
        title: 'Shortlisting Failed',
        description: 'Unable to analyze applicants',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    matchTalentToRole,
    analyzeProfile,
    recommendCandidates,
    evaluateAudition,
    shortlistApplicants,
  };
};
