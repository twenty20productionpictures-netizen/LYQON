import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Award, Globe, Music, Swords, Activity, X } from "lucide-react";

export function SkillsSection() {
  const [languages, setLanguages] = useState(["English (Native)", "Spanish (Fluent)"]);
  const [instruments, setInstruments] = useState(["Piano", "Guitar"]);
  const [combatSkills, setCombatSkills] = useState(["Stage Combat", "Sword Fighting"]);
  const [athleticSkills, setAthleticSkills] = useState(["Dance - Ballet", "Swimming"]);

  const [newLanguage, setNewLanguage] = useState("");
  const [newInstrument, setNewInstrument] = useState("");
  const [newCombat, setNewCombat] = useState("");
  const [newAthletic, setNewAthletic] = useState("");

  const addSkill = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (value.trim() && !list.includes(value.trim())) {
      setList([...list, value.trim()]);
      setter("");
    }
  };

  const removeSkill = (
    skill: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setList(list.filter(s => s !== skill));
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Skills & Specialization
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Unique skills for niche role matching (e.g., "fluent Russian-speaking violinist")
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Languages */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Languages
            </Label>
            <p className="text-sm text-muted-foreground">
              Include proficiency level (e.g., "Russian (Conversational)")
            </p>
            
            <div className="flex gap-2">
              <Input
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                placeholder="e.g., French (Fluent)"
                onKeyPress={(e) => e.key === 'Enter' && addSkill(newLanguage, setNewLanguage, languages, setLanguages)}
              />
              <Button onClick={() => addSkill(newLanguage, setNewLanguage, languages, setLanguages)} variant="outline">
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <Badge key={lang} variant="secondary" className="text-sm py-2 px-3">
                  {lang}
                  <button
                    onClick={() => removeSkill(lang, languages, setLanguages)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Instruments */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Music className="h-4 w-4 text-primary" />
              Musical Instruments
            </Label>
            
            <div className="flex gap-2">
              <Input
                value={newInstrument}
                onChange={(e) => setNewInstrument(e.target.value)}
                placeholder="e.g., Violin, Piano"
                onKeyPress={(e) => e.key === 'Enter' && addSkill(newInstrument, setNewInstrument, instruments, setInstruments)}
              />
              <Button onClick={() => addSkill(newInstrument, setNewInstrument, instruments, setInstruments)} variant="outline">
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {instruments.map((inst) => (
                <Badge key={inst} variant="secondary" className="text-sm py-2 px-3">
                  {inst}
                  <button
                    onClick={() => removeSkill(inst, instruments, setInstruments)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Combat Skills */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Swords className="h-4 w-4 text-primary" />
              Combat & Stunt Skills
            </Label>
            
            <div className="flex gap-2">
              <Input
                value={newCombat}
                onChange={(e) => setNewCombat(e.target.value)}
                placeholder="e.g., Stage Combat, Martial Arts"
                onKeyPress={(e) => e.key === 'Enter' && addSkill(newCombat, setNewCombat, combatSkills, setCombatSkills)}
              />
              <Button onClick={() => addSkill(newCombat, setNewCombat, combatSkills, setCombatSkills)} variant="outline">
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {combatSkills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-sm py-2 px-3">
                  {skill}
                  <button
                    onClick={() => removeSkill(skill, combatSkills, setCombatSkills)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Athletic/Movement */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Athletic & Movement Skills
            </Label>
            <p className="text-sm text-muted-foreground">
              Dance styles, sports, fitness level
            </p>
            
            <div className="flex gap-2">
              <Input
                value={newAthletic}
                onChange={(e) => setNewAthletic(e.target.value)}
                placeholder="e.g., Dance - Contemporary, Basketball"
                onKeyPress={(e) => e.key === 'Enter' && addSkill(newAthletic, setNewAthletic, athleticSkills, setAthleticSkills)}
              />
              <Button onClick={() => addSkill(newAthletic, setNewAthletic, athleticSkills, setAthleticSkills)} variant="outline">
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {athleticSkills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-sm py-2 px-3">
                  {skill}
                  <button
                    onClick={() => removeSkill(skill, athleticSkills, setAthleticSkills)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button variant="hero">Save Skills</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
