import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, MapPin, Users, FileText } from "lucide-react";

export function ProfessionalVitalsSection() {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Professional Vitals
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Standard professional vetting and filter criteria
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="union-status">Union Status</Label>
              <Input id="union-status" placeholder="e.g., SAG-AFTRA, Non-Union" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Location
              </Label>
              <Input id="location" placeholder="e.g., Los Angeles, CA" />
            </div>
          </div>

          {/* Agent Information */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Agent Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agent-name">Agent Name</Label>
                <Input id="agent-name" placeholder="Agent's full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent-contact">Agent Contact</Label>
                <Input id="agent-contact" type="email" placeholder="agent@agency.com" />
              </div>
            </div>
          </div>

          {/* Manager Information */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Manager Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manager-name">Manager Name</Label>
                <Input id="manager-name" placeholder="Manager's full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manager-contact">Manager Contact</Label>
                <Input id="manager-contact" type="email" placeholder="manager@management.com" />
              </div>
            </div>
          </div>

          {/* Resume/Credits */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Resume & Credits
            </h3>
            
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-foreground">Acting Credits</h4>
                    <p className="text-sm text-muted-foreground">3 credits added</p>
                  </div>
                  <Button variant="outline" size="sm">Add Credit</Button>
                </div>
                
                <div className="space-y-3">
                  {[
                    { title: "Breaking Point", role: "Detective", type: "Feature Film", year: 2023 },
                    { title: "City Life", role: "Guest Star", type: "TV Series", year: 2022 },
                    { title: "The Stage", role: "Lead", type: "Theater", year: 2021 },
                  ].map((credit, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <h5 className="font-semibold text-foreground">{credit.title}</h5>
                        <p className="text-sm text-muted-foreground">
                          {credit.role} • {credit.type} • {credit.year}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="resume-url">Resume PDF Link</Label>
              <Input id="resume-url" type="url" placeholder="https://..." />
              <p className="text-xs text-muted-foreground">Upload your full acting resume</p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button variant="hero">Save Professional Info</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
