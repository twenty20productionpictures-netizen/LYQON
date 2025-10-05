import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Play, Star, Clock, Sparkles } from "lucide-react";

export function AIVirtualBoothSection() {
  const selfTapes = [
    { id: 1, title: "Commercial Audition - Tech Product", date: "2 days ago", aiScore: 94, duration: "1:45" },
    { id: 2, title: "Drama Scene - Hospital Scene", date: "1 week ago", aiScore: 89, duration: "3:20" },
    { id: 3, title: "Comedy Sketch - Office Worker", date: "2 weeks ago", aiScore: 91, duration: "2:15" },
  ];

  return (
    <div className="space-y-6">
      {/* Record New Self-Tape */}
      <Card className="bg-gradient-card border-border shadow-elegant">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-accent" />
            AI Virtual Audition Booth
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Record self-tapes with real-time AI coaching and direction
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="aspect-video bg-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center">
            <div className="text-center space-y-4">
              <Video className="h-16 w-16 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Start Your Virtual Audition</h3>
                <p className="text-sm text-muted-foreground">AI-powered coaching and real-time feedback</p>
              </div>
              <Button variant="hero" size="lg">
                <Video className="mr-2 h-5 w-5" />
                Start Recording
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">AI</div>
              <div className="text-xs text-muted-foreground">Real-time Coaching</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">HD</div>
              <div className="text-xs text-muted-foreground">High Quality</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">∞</div>
              <div className="text-xs text-muted-foreground">Unlimited Takes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Self-Tape Library */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Self-Tape Library
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            All your recorded and uploaded self-tapes with AI analysis
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {selfTapes.map((tape) => (
            <Card key={tape.id} className="bg-card border-border hover:shadow-ai transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-32 h-20 bg-muted rounded-lg border border-border relative overflow-hidden group">
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="h-8 w-8 text-foreground" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{tape.title}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {tape.duration}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{tape.date}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 text-accent" />
                      <span className="text-xl font-bold text-primary">{tape.aiScore}%</span>
                    </div>
                    <span className="text-xs text-muted-foreground">AI Score</span>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
