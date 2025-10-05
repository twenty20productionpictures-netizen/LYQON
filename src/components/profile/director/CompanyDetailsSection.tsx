import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building, Globe, Upload, Image } from "lucide-react";

export function CompanyDetailsSection() {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Company/Agency Details
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Professional credentials for actor vetting and platform trust
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Company Logo */}
          <div className="space-y-3">
            <Label>Company Logo</Label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                <Image className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Logo
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Recommended: 500x500px, PNG or JPG
                </p>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name *</Label>
              <Input id="company-name" placeholder="e.g., Sunset Studios" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry-role">Industry Role *</Label>
              <Input id="industry-role" placeholder="e.g., Casting Director, Producer" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="website" className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                Website
              </Label>
              <Input id="website" type="url" placeholder="https://yourcompany.com" />
            </div>
          </div>

          {/* Professional Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea
              id="bio"
              placeholder="Share your company's story, accomplishments, and what makes you unique..."
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              This bio will be visible to talent viewing your projects
            </p>
          </div>

          {/* Company Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">12</div>
              <div className="text-xs text-muted-foreground">Years in Business</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">150+</div>
              <div className="text-xs text-muted-foreground">Projects Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">4.8</div>
              <div className="text-xs text-muted-foreground">Platform Rating</div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button variant="hero">Save Company Details</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
