import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Plus, Shield, Eye, Edit } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function TeamManagementSection() {
  const [teamMembers] = useState([
    { 
      id: 1, 
      name: "Sarah Johnson", 
      email: "sarah@sunsetstudios.com", 
      role: "Associate Casting Director",
      status: "active",
      permissions: { view: true, rate: true, manage: false }
    },
    { 
      id: 2, 
      name: "Michael Chen", 
      email: "michael@sunsetstudios.com", 
      role: "Casting Assistant",
      status: "active",
      permissions: { view: true, rate: false, manage: false }
    },
    { 
      id: 3, 
      name: "Emma Rodriguez", 
      email: "emma@sunsetstudios.com", 
      role: "Assistant",
      status: "pending",
      permissions: { view: true, rate: false, manage: false }
    },
  ]);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Team Management
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Invite and manage team members with specific project permissions
              </p>
            </div>
            <Button variant="hero">
              <Plus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invite Form */}
          <Card className="bg-accent/10 border-accent/20">
            <CardContent className="p-4">
              <h3 className="text-base font-semibold text-foreground mb-3">Invite New Team Member</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="member-name">Full Name</Label>
                  <Input id="member-name" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="member-email">Email Address</Label>
                  <Input id="member-email" type="email" placeholder="john@company.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="member-role">Role</Label>
                  <Input id="member-role" placeholder="e.g., Assistant" />
                </div>
              </div>
              <Button variant="accent" className="mt-4">
                <Mail className="mr-2 h-4 w-4" />
                Send Invitation
              </Button>
            </CardContent>
          </Card>

          {/* Team Members List */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">Team Members</h3>
            
            {teamMembers.map((member) => (
              <Card key={member.id} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{member.name}</h4>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{member.role}</Badge>
                        <Badge 
                          variant={member.status === "active" ? "default" : "outline"}
                          className={member.status === "active" ? "bg-green-500/20 text-green-500" : ""}
                        >
                          {member.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span className="text-muted-foreground">View</span>
                          <Badge variant={member.permissions.view ? "default" : "outline"} className="ml-1">
                            {member.permissions.view ? "✓" : "✗"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          <span className="text-muted-foreground">Rate</span>
                          <Badge variant={member.permissions.rate ? "default" : "outline"} className="ml-1">
                            {member.permissions.rate ? "✓" : "✗"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Edit className="h-3 w-3" />
                          <span className="text-muted-foreground">Manage</span>
                          <Badge variant={member.permissions.manage ? "default" : "outline"} className="ml-1">
                            {member.permissions.manage ? "✓" : "✗"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm">Remove</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
