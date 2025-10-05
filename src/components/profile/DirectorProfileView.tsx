import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Users, Settings, Briefcase, Trophy } from "lucide-react";
import { CompanyDetailsSection } from "./director/CompanyDetailsSection";
import { TeamManagementSection } from "./director/TeamManagementSection";
import { AIPreferencesSection } from "./director/AIPreferencesSection";
import { CompletedProjectsSection } from "./director/CompletedProjectsSection";

type DirectorProfileViewProps = {
  userId?: string;
};

export function DirectorProfileView({ userId }: DirectorProfileViewProps) {
  const [activeTab, setActiveTab] = useState("company");
  const isOwnProfile = !userId;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isOwnProfile ? "Company Profile" : "Director Profile"}
          </h1>
          <p className="text-muted-foreground">Professional credentials & AI controls</p>
        </div>
        {isOwnProfile && (
          <Button variant="hero">
            <Briefcase className="mr-2 h-4 w-4" />
            View Active Projects
          </Button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-card border-border">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary">5</div>
            <div className="text-sm text-muted-foreground">Active Projects</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card border-border">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-accent">247</div>
            <div className="text-sm text-muted-foreground">Candidates Reviewed</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card border-border">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-foreground">3</div>
            <div className="text-sm text-muted-foreground">Team Members</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="company" className="gap-2">
            <Building className="h-4 w-4" />
            <span className="hidden sm:inline">Company</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Team</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Completed</span>
          </TabsTrigger>
          <TabsTrigger value="ai-settings" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">AI Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-6">
          <CompanyDetailsSection />
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <TeamManagementSection />
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          <CompletedProjectsSection />
        </TabsContent>

        <TabsContent value="ai-settings" className="space-y-6">
          <AIPreferencesSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
