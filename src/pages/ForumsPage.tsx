import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useForums } from "@/hooks/useForums";
import { CreateThreadDialog } from "@/components/forums/CreateThreadDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Plus, 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  Eye,
  ShieldCheck,
  User,
  Filter
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type Category = "all" | "casting" | "technology" | "filmmaking" | "news";

export default function ForumsPage() {
  const { userType } = useAuth();
  const navigate = useNavigate();
  const { threads, isLoading, fetchThreads } = useForums();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchThreads(activeCategory === 'all' ? undefined : activeCategory);
  }, [activeCategory]);

  const categories = [
    { id: "all" as Category, label: "All Topics", color: "default" },
    { id: "casting" as Category, label: "Casting & Auditions", color: "primary" },
    { id: "technology" as Category, label: "Technology & AI", color: "primary" },
    { id: "filmmaking" as Category, label: "Filmmaking & Production", color: "primary" },
    { id: "news" as Category, label: "Industry News", color: "primary" },
  ];

  const filteredThreads = threads.filter(thread => {
    const matchesSearch = thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         thread.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const getCategoryLabel = (category: Category) => {
    return categories.find(c => c.id === category)?.label || category;
  };

  return (
    <DashboardLayout userType={userType || "talent"}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Industry Forums</h1>
            <p className="text-muted-foreground mt-2">
              Connect with the film community, discuss industry trends, and share knowledge
            </p>
          </div>
          <Button 
            variant="accent" 
            size="lg" 
            className="gap-2"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-5 w-5" />
            Post New Topic
          </Button>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex gap-4 flex-col sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search topics, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={activeCategory} onValueChange={(v) => setActiveCategory(v as Category)}>
                <SelectTrigger className="w-full sm:w-[280px] bg-background">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Forum Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{threads.length}</p>
                  <p className="text-sm text-muted-foreground">Active Discussions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <User className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">1,234</p>
                  <p className="text-sm text-muted-foreground">Community Members</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">89</p>
                  <p className="text-sm text-muted-foreground">Posts Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Threads List */}
        <div className="space-y-4">
          {filteredThreads.map((thread) => (
            <Card 
              key={thread.id} 
              className="hover:bg-card/80 transition-colors cursor-pointer"
              onClick={() => navigate(`/forums/${thread.id}`)}
            >
              <CardContent className="pt-6 pb-6">
                <div className="flex gap-6">
                  {/* Author Avatar */}
                  <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Avatar className="h-12 w-12 border-2 border-border">
                      <AvatarImage src={thread.profiles?.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {thread.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Thread Content */}
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {thread.is_pinned && (
                          <Badge variant="secondary" className="text-xs px-2 py-0.5">
                            Pinned
                          </Badge>
                        )}
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs px-2 py-0.5">
                          {getCategoryLabel(thread.category as any)}
                        </Badge>
                        {thread.is_moderated && (
                          <Badge variant="outline" className="gap-1 text-xs px-2 py-0.5">
                            <ShieldCheck className="h-3 w-3" />
                            Moderated
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors leading-relaxed">
                        {thread.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{thread.profiles?.full_name || 'Anonymous'}</span>
                        <Badge variant="secondary" className="text-xs px-2 py-0.5">
                          {thread.profiles?.user_type === "talent" ? "Talent" : "Director"}
                        </Badge>
                      </div>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(thread.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Tags */}
                    {thread.tags && thread.tags.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        {thread.tags.map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs bg-muted/50 px-2.5 py-0.5">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Thread Stats */}
                  <div className="flex flex-col items-end gap-3 text-sm text-muted-foreground flex-shrink-0">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="h-4 w-4" />
                      <span className="font-semibold text-foreground">
                        {thread.forum_posts?.[0]?.count || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Eye className="h-4 w-4" />
                      <span>{thread.views}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredThreads.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No discussions found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or category filter
              </p>
              <Button variant="accent" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Start a New Discussion
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Community Guidelines Notice */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <ShieldCheck className="h-5 w-5" />
              Moderated Community
            </CardTitle>
            <CardDescription>
              All discussions are moderated to maintain a professional and respectful environment. 
              Posts violating community guidelines will be reviewed and may be removed.
            </CardDescription>
          </CardHeader>
        </Card>

        <CreateThreadDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSuccess={() => fetchThreads(activeCategory === 'all' ? undefined : activeCategory)}
        />
      </div>
    </DashboardLayout>
  );
}
