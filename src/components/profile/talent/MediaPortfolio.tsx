import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Film, Image, Mic, Star, Play } from "lucide-react";

export function MediaPortfolio() {
  const [media] = useState([
    { id: 1, type: "headshot", title: "Professional Headshot", category: null, isFeatured: true },
    { id: 2, type: "demo_reel", title: "Drama Reel", category: "Drama", isFeatured: true },
    { id: 3, type: "demo_reel", title: "Comedy Reel", category: "Comedy", isFeatured: false },
    { id: 4, type: "voice_clip", title: "Voice Demo - Commercial", category: null, isFeatured: false },
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case "headshot": return <Image className="h-5 w-5" />;
      case "demo_reel": return <Film className="h-5 w-5" />;
      case "voice_clip": return <Mic className="h-5 w-5" />;
      default: return <Film className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground">Media Portfolio</CardTitle>
            <Button variant="hero">
              <Upload className="mr-2 h-4 w-4" />
              Upload Media
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            High-resolution headshots, demo reels, and voice clips for visual/auditory assessment
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Headshots Section */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Image className="h-5 w-5 text-primary" />
              Headshots
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="relative group">
                  <div className="aspect-[3/4] bg-muted rounded-lg border border-border overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
                  </div>
                  {i === 1 && (
                    <Badge className="absolute top-2 right-2 bg-accent">
                      <Star className="h-3 w-3" />
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary">View</Button>
                    <Button size="sm" variant="outline">Edit</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Demo Reels Section */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Film className="h-5 w-5 text-primary" />
              Demo Reels
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {media.filter(m => m.type === "demo_reel").map((item) => (
                <Card key={item.id} className="bg-card border-border hover:shadow-ai transition-shadow">
                  <CardContent className="p-4">
                    <div className="aspect-video bg-muted rounded-lg border border-border mb-3 relative overflow-hidden group">
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
                      <div className="absolute inset-0 flex items-center justify-center bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="lg" variant="hero" className="rounded-full">
                          <Play className="h-6 w-6" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground">{item.title}</h4>
                        <Badge variant="secondary" className="mt-1">{item.category}</Badge>
                      </div>
                      {item.isFeatured && (
                        <Star className="h-5 w-5 text-accent fill-accent" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Voice Clips Section */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Mic className="h-5 w-5 text-primary" />
              Voice Clips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {media.filter(m => m.type === "voice_clip").map((item) => (
                <Card key={item.id} className="bg-card border-border hover:shadow-ai transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
                        <Mic className="h-8 w-8 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">2:34 duration</p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
