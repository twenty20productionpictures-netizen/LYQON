import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Video, Award, Settings, Upload, Film, Mic, Camera, Trophy } from "lucide-react";
import { MediaPortfolio } from "./talent/MediaPortfolio";
import { AIVirtualBoothSection } from "./talent/AIVirtualBoothSection";
import { PhysicalIdentitySection } from "./talent/PhysicalIdentitySection";
import { SkillsSection } from "./talent/SkillsSection";
import { ProfessionalVitalsSection } from "./talent/ProfessionalVitalsSection";
import { SelectedProjectsSection } from "./talent/SelectedProjectsSection";

type TalentProfileViewProps = {
  userId?: string;
};

export function TalentProfileView({ userId }: TalentProfileViewProps) {
  const [activeTab, setActiveTab] = useState("portfolio");
  const isOwnProfile = !userId;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isOwnProfile ? "My Profile" : "Talent Profile"}
          </h1>
          <p className="text-muted-foreground">
            {isOwnProfile ? "Your professional portfolio & AI data engine" : "Professional portfolio & credentials"}
          </p>
        </div>
        {isOwnProfile && (
          <Button variant="hero">
            <Upload className="mr-2 h-4 w-4" />
            Export Resume
          </Button>
        )}
      </div>

      {/* Profile Completion Card */}
      <Card className="bg-gradient-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Profile Completion</h3>
              <p className="text-sm text-muted-foreground">Complete your profile to improve AI matching</p>
            </div>
            <div className="text-3xl font-bold text-primary">78%</div>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div className="bg-gradient-primary h-3 rounded-full" style={{ width: "78%" }}></div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
          <TabsTrigger value="portfolio" className="gap-2">
            <Camera className="h-4 w-4" />
            <span className="hidden sm:inline">Portfolio</span>
          </TabsTrigger>
          <TabsTrigger value="selected" className="gap-2">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Selected</span>
          </TabsTrigger>
          <TabsTrigger value="audition-booth" className="gap-2">
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">AI Booth</span>
          </TabsTrigger>
          <TabsTrigger value="physical" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Physical</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="gap-2">
            <Award className="h-4 w-4" />
            <span className="hidden sm:inline">Skills</span>
          </TabsTrigger>
          <TabsTrigger value="professional" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Professional</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-6">
          <MediaPortfolio />
        </TabsContent>

        <TabsContent value="selected" className="space-y-6">
          <SelectedProjectsSection />
        </TabsContent>

        <TabsContent value="audition-booth" className="space-y-6">
          <AIVirtualBoothSection />
        </TabsContent>

        <TabsContent value="physical" className="space-y-6">
          <PhysicalIdentitySection userId={userId} />
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <SkillsSection />
        </TabsContent>

        <TabsContent value="professional" className="space-y-6">
          <ProfessionalVitalsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
