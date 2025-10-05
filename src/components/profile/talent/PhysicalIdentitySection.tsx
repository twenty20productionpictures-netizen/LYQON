import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { User, Ruler, Eye, Palette, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type PhysicalIdentitySectionProps = {
  userId?: string;
};

export function PhysicalIdentitySection({ userId }: PhysicalIdentitySectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const profileUserId = userId || user?.id;
  const isOwnProfile = !userId;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [hairColor, setHairColor] = useState("");
  const [eyeColor, setEyeColor] = useState("");
  const [genderIdentity, setGenderIdentity] = useState("");
  const [ethnicity, setEthnicity] = useState<string[]>([]);
  const [looksTypes, setLooksTypes] = useState<string[]>([]);
  const [newType, setNewType] = useState("");
  const [newEthnicity, setNewEthnicity] = useState("");

  useEffect(() => {
    if (profileUserId) {
      fetchPhysicalData();
    }
  }, [profileUserId]);

  const fetchPhysicalData = async () => {
    if (!profileUserId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("talent_profiles")
        .select("*")
        .eq("user_id", profileUserId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setHeightCm(data.height_cm?.toString() || "");
        setWeightKg(data.weight_kg?.toString() || "");
        setHairColor(data.hair_color || "");
        setEyeColor(data.eye_color || "");
        setGenderIdentity(data.gender_identity || "");
        setEthnicity(data.ethnicity || []);
        setLooksTypes(data.looks_types || []);
      }
    } catch (error) {
      console.error("Error fetching physical data:", error);
      toast({
        title: "Error",
        description: "Failed to load physical data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profileUserId || !isOwnProfile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("talent_profiles")
        .update({
          height_cm: heightCm ? parseInt(heightCm) : null,
          weight_kg: weightKg ? parseInt(weightKg) : null,
          hair_color: hairColor || null,
          eye_color: eyeColor || null,
          gender_identity: genderIdentity || null,
          ethnicity: ethnicity.length > 0 ? ethnicity : null,
          looks_types: looksTypes.length > 0 ? looksTypes : null,
        })
        .eq("user_id", profileUserId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Physical data updated successfully",
      });
    } catch (error: any) {
      console.error("Error saving physical data:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save physical data",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addLookType = () => {
    if (newType.trim() && !looksTypes.includes(newType.trim())) {
      setLooksTypes([...looksTypes, newType.trim()]);
      setNewType("");
    }
  };

  const removeLookType = (type: string) => {
    setLooksTypes(looksTypes.filter(t => t !== type));
  };

  const addEthnicity = () => {
    if (newEthnicity.trim() && !ethnicity.includes(newEthnicity.trim())) {
      setEthnicity([...ethnicity, newEthnicity.trim()]);
      setNewEthnicity("");
    }
  };

  const removeEthnicity = (eth: string) => {
    setEthnicity(ethnicity.filter(e => e !== eth));
  };

  if (loading) {
    return (
      <Card className="bg-gradient-card border-border">
        <CardContent className="p-6">
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Physical & Identity Data
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Core data for AI filtering and targeted character matching
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Physical Measurements */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height-cm" className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-primary" />
                Height (cm)
              </Label>
              <Input id="height-cm" type="number" placeholder="e.g., 175" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} disabled={!isOwnProfile} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight-kg" className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-primary" />
                Weight (kg)
              </Label>
              <Input id="weight-kg" type="number" placeholder="e.g., 70" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} disabled={!isOwnProfile} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hair-color" className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                Hair Color
              </Label>
              <Input id="hair-color" placeholder="e.g., Brown, Blonde" value={hairColor} onChange={(e) => setHairColor(e.target.value)} disabled={!isOwnProfile} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eye-color" className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                Eye Color
              </Label>
              <Input id="eye-color" placeholder="e.g., Blue, Brown" value={eyeColor} onChange={(e) => setEyeColor(e.target.value)} disabled={!isOwnProfile} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender Identity</Label>
              <Input id="gender" placeholder="e.g., Male, Female, Non-binary" value={genderIdentity} onChange={(e) => setGenderIdentity(e.target.value)} disabled={!isOwnProfile} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ethnicity">Ethnicity</Label>
              <div className="flex gap-2">
                <Input 
                  id="ethnicity" 
                  placeholder="e.g., Caucasian, Asian" 
                  value={newEthnicity}
                  onChange={(e) => setNewEthnicity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addEthnicity()}
                  disabled={!isOwnProfile}
                />
                {isOwnProfile && (
                  <Button onClick={addEthnicity} variant="outline">Add</Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {ethnicity.map((eth) => (
                  <Badge key={eth} variant="secondary" className="text-sm py-2 px-3">
                    {eth}
                    {isOwnProfile && (
                      <button
                        onClick={() => removeEthnicity(eth)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Looks/Types */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Looks/Types</Label>
            <p className="text-sm text-muted-foreground">
              Add character types you can portray (e.g., "Student," "Doctor," "Tired Dad")
            </p>
            
            <div className="flex gap-2">
              <Input
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                placeholder="Add a look/type..."
                onKeyPress={(e) => e.key === 'Enter' && addLookType()}
                disabled={!isOwnProfile}
              />
              {isOwnProfile && (
                <Button onClick={addLookType} variant="outline">Add</Button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {looksTypes.map((type) => (
                <Badge key={type} variant="secondary" className="text-sm py-2 px-3">
                  {type}
                  {isOwnProfile && (
                    <button
                      onClick={() => removeLookType(type)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {isOwnProfile && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={fetchPhysicalData} disabled={saving}>
                Cancel
              </Button>
              <Button variant="hero" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
