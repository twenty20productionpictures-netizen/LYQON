import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Settings, AlertTriangle, Sparkles } from "lucide-react";

export function AIPreferencesSection() {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            AI Preference Parameters
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Control AI performance and ensure ethical hiring practices
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bias Filters */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-accent" />
              <h3 className="text-base font-semibold text-foreground">Bias Tracking & Mitigation</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Monitor and control AI bias in candidate ranking to ensure fair hiring
            </p>

            <div className="space-y-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="track-ethnicity" className="font-medium">Track Ethnicity Bias</Label>
                  <p className="text-xs text-muted-foreground">Monitor AI decisions for ethnicity-based patterns</p>
                </div>
                <Switch id="track-ethnicity" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="track-gender" className="font-medium">Track Gender Bias</Label>
                  <p className="text-xs text-muted-foreground">Monitor AI decisions for gender-based patterns</p>
                </div>
                <Switch id="track-gender" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="track-age" className="font-medium">Track Age Bias</Label>
                  <p className="text-xs text-muted-foreground">Monitor AI decisions for age-based patterns</p>
                </div>
                <Switch id="track-age" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="anonymize" className="font-medium">Anonymize Initial Screening</Label>
                  <p className="text-xs text-muted-foreground">Hide demographic data during first AI pass</p>
                </div>
                <Switch id="anonymize" />
              </div>
            </div>
          </div>

          {/* Matching Sensitivity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="text-base font-semibold text-foreground">Matching Sensitivity</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Control the strictness of AI matching criteria
            </p>

            <RadioGroup defaultValue="balanced" className="space-y-3">
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="strict" id="strict" />
                <Label htmlFor="strict" className="flex-1 cursor-pointer">
                  <div className="font-medium">Strict</div>
                  <div className="text-xs text-muted-foreground">Only show highly precise matches (90%+ match score)</div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="balanced" id="balanced" />
                <Label htmlFor="balanced" className="flex-1 cursor-pointer">
                  <div className="font-medium">Balanced (Recommended)</div>
                  <div className="text-xs text-muted-foreground">Show strong matches with some flexibility (75%+ match score)</div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="flexible" id="flexible" />
                <Label htmlFor="flexible" className="flex-1 cursor-pointer">
                  <div className="font-medium">Flexible</div>
                  <div className="text-xs text-muted-foreground">Cast a wider net, show more diverse candidates (60%+ match score)</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* AI Prioritization */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">AI Matching Prioritization</h3>
            <p className="text-sm text-muted-foreground">
              Adjust how the AI weighs different criteria (must total 100%)
            </p>

            <div className="space-y-6 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Physical Look & Appearance</Label>
                  <span className="text-sm font-semibold text-primary">50%</span>
                </div>
                <Slider defaultValue={[50]} max={100} step={5} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Skills & Special Abilities</Label>
                  <span className="text-sm font-semibold text-primary">30%</span>
                </div>
                <Slider defaultValue={[30]} max={100} step={5} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Experience & Credits</Label>
                  <span className="text-sm font-semibold text-primary">20%</span>
                </div>
                <Slider defaultValue={[20]} max={100} step={5} />
              </div>

              <div className="p-3 bg-background rounded-lg border border-border">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Weight:</span>
                  <span className="text-lg font-bold text-primary">100%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline">Reset to Defaults</Button>
            <Button variant="hero">Save AI Preferences</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
