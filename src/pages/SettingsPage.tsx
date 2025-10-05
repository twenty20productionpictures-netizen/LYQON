import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  CreditCard,
  Shield,
  Bell,
  Plug,
  Sliders,
  Lock,
  Mail,
  Smartphone,
  Eye,
  Link as LinkIcon,
  Crown,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { userType, user } = useAuth();
  const [matchingSensitivity, setMatchingSensitivity] = useState([50]);
  const [aiAnonymization, setAiAnonymization] = useState(false);
  const [biasTracking, setBiasTracking] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppAlerts, setInAppAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleSaveProfile = () => {
    toast.success("Profile settings saved successfully");
  };

  const handleSaveAIPreferences = () => {
    toast.success("AI matching preferences updated");
  };

  const handleSaveNotifications = () => {
    toast.success("Notification preferences saved");
  };

  return (
    <DashboardLayout userType={userType || "talent"}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account, AI preferences, and notification settings
          </p>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full h-auto gap-2 bg-muted/30 p-2">
            <TabsTrigger
              value="account"
              className="px-4 py-2.5 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <User className="h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger
              value="ai"
              className="px-4 py-2.5 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <Sliders className="h-4 w-4" />
              AI & Matching
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="px-4 py-2.5 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="integrations"
              className="px-4 py-2.5 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <Plug className="h-4 w-4" />
              Integrations
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            {/* User Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <User className="h-5 w-5" />
                  User Details
                </CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" placeholder="Enter your full name" defaultValue={user?.user_metadata?.full_name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="your.email@example.com" defaultValue={user?.email} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input id="password" type="password" placeholder="Enter new password" />
                </div>
                <Button onClick={handleSaveProfile} className="w-full sm:w-auto">
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            {/* Subscription & Billing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <CreditCard className="h-5 w-5" />
                  Subscription & Billing
                </CardTitle>
                <CardDescription>Manage your subscription and view payment history</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-semibold text-foreground">Current Plan</p>
                    <p className="text-sm text-muted-foreground">Professional Plan</p>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Next billing date</span>
                    <span className="font-medium text-foreground">January 15, 2026</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium text-foreground">$29.99/month</span>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="accent" className="flex-1 gap-2">
                    <Crown className="h-4 w-4" />
                    Upgrade to Premium
                  </Button>
                  <Button variant="outline" className="flex-1">
                    View Payment History
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Shield className="h-5 w-5" />
                  Security
                </CardTitle>
                <CardDescription>Manage security settings and active sessions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-base">Active Sessions</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded">
                          <Smartphone className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Current Session</p>
                          <p className="text-xs text-muted-foreground">Chrome on MacOS • Los Angeles, CA</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Active Now</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI & Matching Preferences Tab */}
          <TabsContent value="ai" className="space-y-6">
            {/* Matching Sensitivity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Sliders className="h-5 w-5" />
                  AI Matching Sensitivity
                </CardTitle>
                <CardDescription>
                  Adjust how strictly the AI matches your profile to opportunities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current Setting</span>
                    <span className="font-semibold text-primary">
                      {matchingSensitivity[0] < 33
                        ? "Flexible (Show stretch opportunities)"
                        : matchingSensitivity[0] < 67
                        ? "Balanced (Show good fits)"
                        : "Strict (Perfect fits only)"}
                    </span>
                  </div>
                  <Slider
                    value={matchingSensitivity}
                    onValueChange={setMatchingSensitivity}
                    max={100}
                    step={1}
                    className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Flexible</span>
                    <span>Balanced</span>
                    <span>Strict</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  {userType === "talent"
                    ? "Flexible: See roles that might be a stretch for your experience. Strict: Only see roles that perfectly match your profile."
                    : "Flexible: See candidates who meet most criteria. Strict: Only see candidates who meet all required criteria."}
                </p>

                <Button onClick={handleSaveAIPreferences} className="w-full sm:w-auto">
                  Save Preferences
                </Button>
              </CardContent>
            </Card>

            {/* Data Privacy Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Lock className="h-5 w-5" />
                  Data Privacy Controls
                </CardTitle>
                <CardDescription>Control how the AI uses your data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 flex-1 pr-4">
                    <Label className="text-base">Anonymize Profile Data</Label>
                    <p className="text-sm text-muted-foreground">
                      Hide personal identifiers when sharing anonymized statistics with casting directors
                    </p>
                  </div>
                  <Switch checked={aiAnonymization} onCheckedChange={setAiAnonymization} />
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-base">AI Learning Preferences</Label>
                  <Select defaultValue="personalized">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="personalized">
                        Personalized - Use my activity to improve matches
                      </SelectItem>
                      <SelectItem value="minimal">
                        Minimal - Only use profile data for matching
                      </SelectItem>
                      <SelectItem value="disabled">Disabled - No AI learning from my activity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSaveAIPreferences} className="w-full sm:w-auto">
                  Save Privacy Settings
                </Button>
              </CardContent>
            </Card>

            {/* AI Bias Tracking (Directors Only) */}
            {userType === "director" && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Eye className="h-5 w-5" />
                    AI Bias Tracking
                  </CardTitle>
                  <CardDescription>
                    Monitor potential demographic bias in AI candidate rankings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 flex-1 pr-4">
                      <Label className="text-base">Enable Bias Insights</Label>
                      <p className="text-sm text-muted-foreground">
                        View demographic distribution reports in your candidate feeds to ensure fair representation
                      </p>
                    </div>
                    <Switch checked={biasTracking} onCheckedChange={setBiasTracking} />
                  </div>

                  {biasTracking && (
                    <div className="p-3 bg-background/50 rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground">
                        Bias insights will appear in your Discovery feed, showing demographic breakdowns of AI-ranked
                        candidates to help ensure fair and diverse casting decisions.
                      </p>
                    </div>
                  )}

                  <Button onClick={handleSaveAIPreferences} className="w-full sm:w-auto">
                    Save Tracking Preferences
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Bell className="h-5 w-5" />
                  Alert Preferences
                </CardTitle>
                <CardDescription>Choose how and when you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-0.5">
                      <Label className="text-base">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">New messages, match updates, audition requests</p>
                    </div>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded">
                      <Bell className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-0.5">
                      <Label className="text-base">In-App Alerts</Label>
                      <p className="text-sm text-muted-foreground">Real-time notifications within LYQON</p>
                    </div>
                  </div>
                  <Switch checked={inAppAlerts} onCheckedChange={setInAppAlerts} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded">
                      <Smartphone className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-0.5">
                      <Label className="text-base">SMS Alerts</Label>
                      <p className="text-sm text-muted-foreground">Urgent audition requests and time-sensitive updates</p>
                    </div>
                  </div>
                  <Switch checked={smsAlerts} onCheckedChange={setSmsAlerts} />
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-base">Notification Frequency</Label>
                  <Select defaultValue="instant">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="instant">Instant - Notify me immediately</SelectItem>
                      <SelectItem value="hourly">Hourly Digest - Bundle hourly updates</SelectItem>
                      <SelectItem value="daily">Daily Digest - Once per day summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSaveNotifications} className="w-full sm:w-auto">
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Plug className="h-5 w-5" />
                  External Service Integrations
                </CardTitle>
                <CardDescription>Connect LYQON with industry-standard tools and platforms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* IMDb Integration */}
                <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-card/80 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent/10 rounded-lg">
                      <LinkIcon className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">IMDb</p>
                      <p className="text-sm text-muted-foreground">Import credits and maintain profile sync</p>
                    </div>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>

                {/* Actors Access */}
                <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-card/80 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent/10 rounded-lg">
                      <LinkIcon className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Actors Access</p>
                      <p className="text-sm text-muted-foreground">Sync audition submissions and bookings</p>
                    </div>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>

                {/* Casting Networks */}
                <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-card/80 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent/10 rounded-lg">
                      <LinkIcon className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Casting Networks</p>
                      <p className="text-sm text-muted-foreground">Share profile and receive casting notices</p>
                    </div>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>

                {/* Google Calendar */}
                <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-card/80 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <LinkIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Google Calendar</p>
                      <p className="text-sm text-muted-foreground">Sync audition schedules automatically</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Connected</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
