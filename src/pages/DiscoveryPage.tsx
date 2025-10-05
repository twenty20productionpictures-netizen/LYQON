import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  user_type: string;
  avatar_url: string | null;
  bio: string | null;
}

export default function DiscoveryPage() {
  const { user, userType } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadProfiles();
  }, [user]);

  useEffect(() => {
    filterProfiles();
  }, [profiles, searchQuery, activeTab]);

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('public_profiles')
        .select('*')
        .neq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProfiles(data || []);
    } catch (error) {
      console.error('Error loading profiles:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProfiles = () => {
    let filtered = profiles;

    // Filter by user type
    if (activeTab !== "all") {
      filtered = filtered.filter(p => p.user_type === activeTab);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.full_name?.toLowerCase().includes(query) ||
        p.bio?.toLowerCase().includes(query)
      );
    }

    setFilteredProfiles(filtered);
  };

  const startConversation = (otherUserId: string) => {
    // Navigate to messages page with the user ID to start a conversation
    navigate(`/messages?start=${otherUserId}`);
  };

  const getInitials = (name: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return '??';
  };

  if (!userType) return null;

  return (
    <DashboardLayout userType={userType}>
      <div className="container mx-auto p-6">
        <div className="mb-6 animate-fadeInDown">
          <h1 className="text-3xl font-bold mb-2">Discover Users</h1>
          <p className="text-muted-foreground">
            Connect with talent and directors in the industry
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 animate-fadeInUp delay-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 transition-all duration-300 focus:shadow-ai"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6 animate-fadeInUp delay-200">
          <TabsList className="bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="all" className="transition-all duration-300">All Users</TabsTrigger>
            <TabsTrigger value="talent" className="transition-all duration-300">Talent</TabsTrigger>
            <TabsTrigger value="director" className="transition-all duration-300">Directors</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading users...
              </div>
            ) : filteredProfiles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No users found
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProfiles.map((profile, index) => (
                  <Card 
                    key={profile.id} 
                    className="bg-gradient-card border-border hover-lift hover:shadow-ai transition-all duration-300 animate-fadeInUp" 
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={profile.avatar_url || undefined} />
                          <AvatarFallback>
                            {getInitials(profile.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="truncate">
                            {profile.full_name || 'Anonymous User'}
                          </CardTitle>
                          <Badge 
                            variant="secondary" 
                            className="mt-2 capitalize"
                          >
                            {profile.user_type}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    {profile.bio && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {profile.bio}
                        </p>
                      </CardContent>
                    )}
                    <CardContent className="pt-0">
                      <Button
                        onClick={() => startConversation(profile.user_id)}
                        className="w-full transition-all duration-300 hover:scale-105"
                        variant="outline"
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Message
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
