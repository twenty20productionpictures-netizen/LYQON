import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, AlertCircle, Smile, Frown, Angry, Zap } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface AuditionEvaluationCardProps {
  evaluation: {
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
  };
}

const RECOMMENDATION_CONFIG = {
  strong_yes: {
    label: 'Strong Yes',
    icon: CheckCircle2,
    variant: 'default' as const,
    color: 'text-green-600',
  },
  yes: {
    label: 'Yes',
    icon: CheckCircle2,
    variant: 'secondary' as const,
    color: 'text-green-500',
  },
  maybe: {
    label: 'Maybe',
    icon: AlertCircle,
    variant: 'outline' as const,
    color: 'text-yellow-600',
  },
  probably_not: {
    label: 'Probably Not',
    icon: XCircle,
    variant: 'outline' as const,
    color: 'text-orange-600',
  },
  no: {
    label: 'No',
    icon: XCircle,
    variant: 'destructive' as const,
    color: 'text-red-600',
  },
};

const EMOTION_ICONS: Record<string, any> = {
  happy: Smile,
  sad: Frown,
  angry: Angry,
  surprise: Zap,
};

export const AuditionEvaluationCard = ({ evaluation }: AuditionEvaluationCardProps) => {
  const recommendationConfig = RECOMMENDATION_CONFIG[evaluation.recommendation];
  const RecommendationIcon = recommendationConfig.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>AI Evaluation Results</CardTitle>
          <Badge variant={recommendationConfig.variant} className="text-base px-4 py-1">
            <RecommendationIcon className={`h-4 w-4 mr-2 ${recommendationConfig.color}`} />
            {recommendationConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Match Score */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Overall Match Score</span>
            <span className="font-bold">{evaluation.overall_match_score.toFixed(1)}%</span>
          </div>
          <Progress value={evaluation.overall_match_score} className="h-3" />
        </div>

        {/* Summary */}
        <div className="space-y-2">
          <h4 className="font-semibold">Summary</h4>
          <p className="text-sm text-muted-foreground">
            {evaluation.detailed_analysis.summary}
          </p>
        </div>

        <Separator />

        {/* Emotions Detected */}
        <div className="space-y-3">
          <h4 className="font-semibold">Emotions Detected</h4>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(evaluation.emotions_detected)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 4)
              .map(([emotion, confidence]) => {
                const Icon = EMOTION_ICONS[emotion] || Smile;
                return (
                  <div key={emotion} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 capitalize">
                        <Icon className="h-4 w-4" />
                        {emotion}
                      </span>
                      <span className="font-medium">{(confidence * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={confidence * 100} className="h-2" />
                  </div>
                );
              })}
          </div>
        </div>

        <Separator />

        {/* Strengths */}
        {evaluation.strengths.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-green-700 dark:text-green-400">Strengths</h4>
            <ul className="space-y-1">
              {evaluation.strengths.map((strength, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Areas for Improvement */}
        {evaluation.improvements.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-orange-700 dark:text-orange-400">Areas for Improvement</h4>
            <ul className="space-y-1">
              {evaluation.improvements.map((improvement, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 text-orange-600 flex-shrink-0" />
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Technical Notes */}
        {evaluation.technical_notes.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold">Technical Notes</h4>
            <ul className="space-y-1">
              {evaluation.technical_notes.map((note, idx) => (
                <li key={idx} className="text-sm text-muted-foreground">
                  • {note}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Separator />

        {/* Detailed Scores */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Emotion Match</p>
            <p className="text-lg font-bold">{evaluation.detailed_analysis.emotion_match_score}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Face Quality</p>
            <p className="text-lg font-bold">{evaluation.detailed_analysis.face_quality_score}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Technical Quality</p>
            <p className="text-lg font-bold">{evaluation.detailed_analysis.technical_quality_score}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Intensity</p>
            <p className="text-lg font-bold capitalize">{evaluation.detailed_analysis.emotional_intensity}</p>
          </div>
        </div>

        {/* Archetype Match */}
        <div className="pt-2">
          <Badge variant="secondary" className="text-sm">
            Best Fit: {evaluation.detailed_analysis.archetype_match.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
