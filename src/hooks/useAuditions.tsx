import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface AuditionEvaluation {
  id: string;
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

interface Audition {
  id: string;
  project_id: string;
  role_id?: string;
  talent_id: string;
  video_url: string;
  role_description: string;
  emotional_keywords?: string[];
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  evaluation?: AuditionEvaluation;
}

export const useAuditions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadAudition = async (
    file: File,
    projectId: string,
    roleDescription: string,
    emotionalKeywords: string[] = [],
    roleId?: string
  ): Promise<string | null> => {
    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload video to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('audition-videos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Create audition record
      const { data: audition, error: auditionError } = await supabase
        .from('auditions')
        .insert({
          project_id: projectId,
          role_id: roleId,
          talent_id: user.id,
          video_url: fileName,
          role_description: roleDescription,
          emotional_keywords: emotionalKeywords,
          status: 'pending',
        })
        .select()
        .single();

      if (auditionError) throw auditionError;

      toast({
        title: 'Audition Uploaded',
        description: 'Your audition is being analyzed by AI...',
      });

      // Trigger AI evaluation
      await evaluateAudition(audition.id);

      return audition.id;
    } catch (error) {
      console.error('Error uploading audition:', error);
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload audition',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const evaluateAudition = async (auditionId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.functions.invoke('ai-evaluate-audition', {
        body: { auditionId },
      });

      if (error) throw error;

      toast({
        title: 'Analysis Complete',
        description: 'Your audition has been evaluated',
      });

      return true;
    } catch (error) {
      console.error('Error evaluating audition:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Unable to analyze audition',
        variant: 'destructive',
      });
      return false;
    }
  };

  const getAudition = async (auditionId: string): Promise<Audition | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('auditions')
        .select(`
          *,
          evaluation:audition_evaluations(*)
        `)
        .eq('id', auditionId)
        .single();

      if (error) throw error;

      const evaluation = Array.isArray(data.evaluation) && data.evaluation.length > 0
        ? data.evaluation[0]
        : undefined;

      return {
        id: data.id,
        project_id: data.project_id,
        role_id: data.role_id,
        talent_id: data.talent_id,
        video_url: data.video_url,
        role_description: data.role_description,
        emotional_keywords: data.emotional_keywords,
        status: data.status as 'pending' | 'analyzing' | 'completed' | 'failed',
        created_at: data.created_at,
        updated_at: data.updated_at,
        evaluation: evaluation ? {
          id: evaluation.id,
          overall_match_score: evaluation.overall_match_score,
          recommendation: evaluation.recommendation as 'strong_yes' | 'yes' | 'maybe' | 'probably_not' | 'no',
          emotions_detected: evaluation.emotions_detected as Record<string, number>,
          strengths: evaluation.strengths,
          improvements: evaluation.improvements,
          technical_notes: evaluation.technical_notes,
          detailed_analysis: evaluation.detailed_analysis as any,
        } : undefined,
      };
    } catch (error) {
      console.error('Error fetching audition:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getProjectAuditions = async (projectId: string): Promise<Audition[]> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('auditions')
        .select(`
          *,
          evaluation:audition_evaluations(*),
          talent:profiles!auditions_talent_id_fkey(full_name, avatar_url)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map((audition: any) => {
        const evaluation = Array.isArray(audition.evaluation) && audition.evaluation.length > 0
          ? audition.evaluation[0]
          : undefined;
        
        return {
          id: audition.id,
          project_id: audition.project_id,
          role_id: audition.role_id,
          talent_id: audition.talent_id,
          video_url: audition.video_url,
          role_description: audition.role_description,
          emotional_keywords: audition.emotional_keywords,
          status: audition.status as 'pending' | 'analyzing' | 'completed' | 'failed',
          created_at: audition.created_at,
          updated_at: audition.updated_at,
          evaluation: evaluation ? {
            id: evaluation.id,
            overall_match_score: evaluation.overall_match_score,
            recommendation: evaluation.recommendation as 'strong_yes' | 'yes' | 'maybe' | 'probably_not' | 'no',
            emotions_detected: evaluation.emotions_detected as Record<string, number>,
            strengths: evaluation.strengths,
            improvements: evaluation.improvements,
            technical_notes: evaluation.technical_notes,
            detailed_analysis: evaluation.detailed_analysis as any,
          } : undefined,
        };
      });
    } catch (error) {
      console.error('Error fetching project auditions:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getMyAuditions = async (): Promise<Audition[]> => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('auditions')
        .select(`
          *,
          evaluation:audition_evaluations(*),
          project:projects(title)
        `)
        .eq('talent_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map((audition: any) => {
        const evaluation = Array.isArray(audition.evaluation) && audition.evaluation.length > 0
          ? audition.evaluation[0]
          : undefined;
        
        return {
          id: audition.id,
          project_id: audition.project_id,
          role_id: audition.role_id,
          talent_id: audition.talent_id,
          video_url: audition.video_url,
          role_description: audition.role_description,
          emotional_keywords: audition.emotional_keywords,
          status: audition.status as 'pending' | 'analyzing' | 'completed' | 'failed',
          created_at: audition.created_at,
          updated_at: audition.updated_at,
          evaluation: evaluation ? {
            id: evaluation.id,
            overall_match_score: evaluation.overall_match_score,
            recommendation: evaluation.recommendation as 'strong_yes' | 'yes' | 'maybe' | 'probably_not' | 'no',
            emotions_detected: evaluation.emotions_detected as Record<string, number>,
            strengths: evaluation.strengths,
            improvements: evaluation.improvements,
            technical_notes: evaluation.technical_notes,
            detailed_analysis: evaluation.detailed_analysis as any,
          } : undefined,
        };
      });
    } catch (error) {
      console.error('Error fetching my auditions:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    isUploading,
    uploadAudition,
    evaluateAudition,
    getAudition,
    getProjectAuditions,
    getMyAuditions,
  };
};
