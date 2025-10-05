import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Plus, X, Copy, Upload } from "lucide-react";

type Role = {
  roleName: string;
  roleDescription: string;
  emotions: string[];
  ageMin: string;
  ageMax: string;
  heightMin: string;
  heightMax: string;
  heightUnit: "cm" | "ft";
  vocalProfile: string[];
  requiredSkills: string[];
};

export default function PostProjectPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userType } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Project details
  const [title, setTitle] = useState("");
  const [productionCompany, setProductionCompany] = useState("");
  const [projectType, setProjectType] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [shootStartDate, setShootStartDate] = useState("");
  const [shootEndDate, setShootEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [remoteAuditionsOnly, setRemoteAuditionsOnly] = useState(false);
  const [moodBoardUrls, setMoodBoardUrls] = useState<string[]>([]);
  const [moodBoardInput, setMoodBoardInput] = useState("");
  const [isDraft, setIsDraft] = useState(false);
  
  const [roles, setRoles] = useState<Role[]>([{ 
    roleName: "", 
    roleDescription: "", 
    emotions: [],
    ageMin: "",
    ageMax: "",
    heightMin: "",
    heightMax: "",
    heightUnit: "cm",
    vocalProfile: [],
    requiredSkills: []
  }]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || userType !== 'director') {
      toast({
        title: "Error",
        description: "Only directors can post casting calls",
        variant: "destructive",
      });
      return;
    }

    if (!shootStartDate || !shootEndDate) {
      toast({
        title: "Error",
        description: "Shoot dates are required",
        variant: "destructive",
      });
      return;
    }

    if (!location && !remoteAuditionsOnly) {
      toast({
        title: "Error",
        description: "Location is required unless remote auditions only",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create project
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          director_id: user.id,
          title,
          production_company: productionCompany,
          project_type: projectType,
          description,
          deadline: deadline || null,
          shoot_start_date: shootStartDate,
          shoot_end_date: shootEndDate,
          location: location || null,
          remote_auditions_only: remoteAuditionsOnly,
          mood_board_urls: moodBoardUrls,
          is_draft: isDraft,
          status: isDraft ? 'draft' : 'open',
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Create roles
      if (roles.length > 0 && roles[0].roleName) {
        const roleInserts = roles
          .filter(r => r.roleName.trim())
          .map(role => ({
            project_id: project.id,
            role_name: role.roleName,
            role_description: role.roleDescription,
            emotions: role.emotions,
            requirements: {
              age_min: role.ageMin ? parseInt(role.ageMin) : null,
              age_max: role.ageMax ? parseInt(role.ageMax) : null,
              height_min: role.heightMin ? parseFloat(role.heightMin) : null,
              height_max: role.heightMax ? parseFloat(role.heightMax) : null,
              height_unit: role.heightUnit,
              vocal_profile: role.vocalProfile,
              required_skills: role.requiredSkills
            }
          }));

        const { error: rolesError } = await supabase
          .from("project_roles")
          .insert(roleInserts);

        if (rolesError) throw rolesError;
      }

      toast({
        title: "Success",
        description: isDraft ? "Project saved as draft" : "Casting call posted successfully!",
      });

      navigate("/projects");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addRole = () => {
    setRoles([...roles, { 
      roleName: "", 
      roleDescription: "", 
      emotions: [],
      ageMin: "",
      ageMax: "",
      heightMin: "",
      heightMax: "",
      heightUnit: "cm",
      vocalProfile: [],
      requiredSkills: []
    }]);
  };

  const duplicateRole = (index: number) => {
    const roleToDuplicate = roles[index];
    setRoles([...roles, { ...roleToDuplicate }]);
    toast({
      title: "Role Duplicated",
      description: "Role has been duplicated successfully",
    });
  };

  const removeRole = (index: number) => {
    setRoles(roles.filter((_, i) => i !== index));
  };

  const updateRole = (index: number, field: keyof Role, value: string | string[] | boolean) => {
    const newRoles = [...roles];
    newRoles[index] = { ...newRoles[index], [field]: value };
    setRoles(newRoles);
  };

  const toggleEmotion = (roleIndex: number, emotion: string) => {
    const newRoles = [...roles];
    const currentEmotions = newRoles[roleIndex].emotions;
    if (currentEmotions.includes(emotion)) {
      newRoles[roleIndex].emotions = currentEmotions.filter(e => e !== emotion);
    } else {
      newRoles[roleIndex].emotions = [...currentEmotions, emotion];
    }
    setRoles(newRoles);
  };

  const addCustomEmotion = (roleIndex: number, emotion: string) => {
    if (!emotion.trim()) return;
    const newRoles = [...roles];
    if (!newRoles[roleIndex].emotions.includes(emotion.trim())) {
      newRoles[roleIndex].emotions = [...newRoles[roleIndex].emotions, emotion.trim()];
    }
    setRoles(newRoles);
  };

  const removeEmotion = (roleIndex: number, emotion: string) => {
    const newRoles = [...roles];
    newRoles[roleIndex].emotions = newRoles[roleIndex].emotions.filter(e => e !== emotion);
    setRoles(newRoles);
  };

  const commonEmotions = [
    "Joy", "Sadness", "Anger", "Fear", "Surprise", "Disgust",
    "Excitement", "Anxiety", "Confidence", "Vulnerability", "Love", "Hatred"
  ];

  const vocalProfiles = [
    "Deep Resonance", "High Pitch", "Gravelly", "Smooth", "Raspy",
    "Regional Dialect Required", "Accent Required", "Clear Articulation"
  ];

  const skillOptions = [
    "English", "Spanish", "French", "German", "Mandarin", "Japanese",
    "Piano", "Guitar", "Drums", "Violin", "Singing",
    "Stage Combat", "Martial Arts", "Equestrian", "Swimming", "Dancing",
    "Car Driving", "Motorcycle", "Photography", "Cooking"
  ];

  const toggleVocalProfile = (roleIndex: number, profile: string) => {
    const newRoles = [...roles];
    const currentProfiles = newRoles[roleIndex].vocalProfile;
    if (currentProfiles.includes(profile)) {
      newRoles[roleIndex].vocalProfile = currentProfiles.filter(p => p !== profile);
    } else {
      newRoles[roleIndex].vocalProfile = [...currentProfiles, profile];
    }
    setRoles(newRoles);
  };

  const toggleSkill = (roleIndex: number, skill: string) => {
    const newRoles = [...roles];
    const currentSkills = newRoles[roleIndex].requiredSkills;
    if (currentSkills.includes(skill)) {
      newRoles[roleIndex].requiredSkills = currentSkills.filter(s => s !== skill);
    } else {
      newRoles[roleIndex].requiredSkills = [...currentSkills, skill];
    }
    setRoles(newRoles);
  };

  const addMoodBoardUrl = () => {
    if (moodBoardInput.trim() && !moodBoardUrls.includes(moodBoardInput.trim())) {
      setMoodBoardUrls([...moodBoardUrls, moodBoardInput.trim()]);
      setMoodBoardInput("");
    }
  };

  const removeMoodBoardUrl = (url: string) => {
    setMoodBoardUrls(moodBoardUrls.filter(u => u !== url));
  };

  return (
    <DashboardLayout userType={userType || "director"}>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/projects")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Post Casting Call</h1>
            <p className="text-muted-foreground">Create a new project and find the perfect talent</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Midnight Dreams"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="productionCompany">Production Company</Label>
                <Input
                  id="productionCompany"
                  placeholder="e.g., Dark Waters Productions"
                  value={productionCompany}
                  onChange={(e) => setProductionCompany(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectType">Project Type *</Label>
                <Select value={projectType} onValueChange={setProjectType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Feature Film">Feature Film</SelectItem>
                    <SelectItem value="TV Series">TV Series</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                    <SelectItem value="Short Film">Short Film</SelectItem>
                    <SelectItem value="Music Video">Music Video</SelectItem>
                    <SelectItem value="Documentary">Documentary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Project Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your project, the story, tone, and what you're looking for..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Application Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shootStartDate">Shoot Start Date *</Label>
                  <Input
                    id="shootStartDate"
                    type="date"
                    value={shootStartDate}
                    onChange={(e) => setShootStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shootEndDate">Shoot End Date *</Label>
                  <Input
                    id="shootEndDate"
                    type="date"
                    value={shootEndDate}
                    onChange={(e) => setShootEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location (City/Region) {!remoteAuditionsOnly && '*'}</Label>
                <Input
                  id="location"
                  placeholder="e.g., Los Angeles, CA"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required={!remoteAuditionsOnly}
                  disabled={remoteAuditionsOnly}
                />
                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox
                    id="remoteAuditionsOnly"
                    checked={remoteAuditionsOnly}
                    onCheckedChange={(checked) => setRemoteAuditionsOnly(checked as boolean)}
                  />
                  <Label htmlFor="remoteAuditionsOnly" className="text-sm font-normal cursor-pointer">
                    Remote Auditions Only
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="moodBoard">Mood Board / Reference</Label>
                <p className="text-xs text-muted-foreground">Add image URLs, PDFs, or script sides links</p>
                <div className="flex gap-2">
                  <Input
                    id="moodBoard"
                    placeholder="Paste URL here..."
                    value={moodBoardInput}
                    onChange={(e) => setMoodBoardInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addMoodBoardUrl();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addMoodBoardUrl}>
                    <Upload className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                {moodBoardUrls.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {moodBoardUrls.map((url, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                        <span className="text-xs flex-1 truncate">{url}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMoodBoardUrl(url)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="isDraft">Draft Status</Label>
                  <p className="text-xs text-muted-foreground">
                    {isDraft ? "Project is saved as draft" : "Project will be actively posted"}
                  </p>
                </div>
                <Switch
                  id="isDraft"
                  checked={isDraft}
                  onCheckedChange={setIsDraft}
                />
              </div>
            </CardContent>
          </Card>

          {/* Roles */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Casting Roles</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addRole}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Role
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {roles.map((role, index) => (
                <div key={index} className="border border-border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-medium">Role {index + 1}</h4>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => duplicateRole(index)}
                        title="Duplicate Role"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      {roles.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRole(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Role Name *</Label>
                    <Input
                      placeholder="e.g., Lead Actor, Supporting Role"
                      value={role.roleName}
                      onChange={(e) => updateRole(index, 'roleName', e.target.value)}
                      required={index === 0}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Role Description</Label>
                    <Textarea
                      placeholder="Describe the character, requirements, and what you're looking for..."
                      value={role.roleDescription}
                      onChange={(e) => updateRole(index, 'roleDescription', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`role-emotions-${index}`}>Required Emotions</Label>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {commonEmotions.map((emotion) => (
                          <Badge
                            key={emotion}
                            variant={role.emotions.includes(emotion) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleEmotion(index, emotion)}
                          >
                            {emotion}
                          </Badge>
                        ))}
                      </div>
                      
                      {role.emotions.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Selected Emotions:</Label>
                          <div className="flex flex-wrap gap-2">
                            {role.emotions.map((emotion) => (
                              <Badge key={emotion} variant="secondary">
                                {emotion}
                                <X
                                  className="ml-1 h-3 w-3 cursor-pointer"
                                  onClick={() => removeEmotion(index, emotion)}
                                />
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Input
                          id={`custom-emotion-${index}`}
                          placeholder="Add custom emotion..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addCustomEmotion(index, e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            const input = document.getElementById(`custom-emotion-${index}`) as HTMLInputElement;
                            if (input) {
                              addCustomEmotion(index, input.value);
                              input.value = '';
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Physical Requirements */}
                  <div className="space-y-3 border-t border-border pt-4">
                    <h5 className="text-sm font-medium">Physical Requirements</h5>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Age Range *</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Min"
                            value={role.ageMin}
                            onChange={(e) => updateRole(index, 'ageMin', e.target.value)}
                            required
                          />
                          <Input
                            type="number"
                            placeholder="Max"
                            value={role.ageMax}
                            onChange={(e) => updateRole(index, 'ageMax', e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Height Range *</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="Min"
                            value={role.heightMin}
                            onChange={(e) => updateRole(index, 'heightMin', e.target.value)}
                            required
                          />
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="Max"
                            value={role.heightMax}
                            onChange={(e) => updateRole(index, 'heightMax', e.target.value)}
                            required
                          />
                          <Select 
                            value={role.heightUnit} 
                            onValueChange={(value) => updateRole(index, 'heightUnit', value)}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cm">cm</SelectItem>
                              <SelectItem value="ft">ft</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Vocal Profile</Label>
                      <div className="flex flex-wrap gap-2">
                        {vocalProfiles.map((profile) => (
                          <Badge
                            key={profile}
                            variant={role.vocalProfile.includes(profile) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleVocalProfile(index, profile)}
                          >
                            {profile}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Skill Requirements */}
                  <div className="space-y-3 border-t border-border pt-4">
                    <h5 className="text-sm font-medium">Skill Requirements</h5>
                    <div className="flex flex-wrap gap-2">
                      {skillOptions.map((skill) => (
                        <Badge
                          key={skill}
                          variant={role.requiredSkills.includes(skill) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleSkill(index, skill)}
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                </div>
              ))}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/projects")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className={isDraft ? "" : "bg-accent hover:bg-accent/90"}>
              {loading ? (isDraft ? "Saving..." : "Posting...") : (isDraft ? "Save as Draft" : "Post Casting Call")}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}