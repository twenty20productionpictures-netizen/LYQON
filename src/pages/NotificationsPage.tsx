import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Star, Video, Users, CheckCircle, AlertCircle, Info, MessageSquare, FileText } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

type Notification = {
  id: string;
  type: string;
  title: string;
  content: string;
  read: boolean;
  link: string | null;
  created_at: string;
};

export default function NotificationsPage() {
  const { userType, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      subscribeToNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
          toast({
            title: "New Notification",
            description: (payload.new as Notification).title,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error: any) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user?.id)
        .eq("read", false);

      if (error) throw error;

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error: any) {
      console.error("Error marking all as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
      });
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "match": return Star;
      case "application": return FileText;
      case "message": return MessageSquare;
      case "casting_call": return Video;
      case "system": return Info;
      default: return Bell;
    }
  };

  const filteredNotifications = notifications.filter((n) =>
    filter === "all" ? true : !n.read
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DashboardLayout userType={userType || "talent"}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Activity & Alerts</h1>
            <p className="text-muted-foreground">Stay updated with your casting journey</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark All Read
            </Button>
            <Button variant="accent" onClick={() => navigate("/settings")}>
              <Bell className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-card border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-accent">{unreadCount}</div>
              <div className="text-sm text-muted-foreground">Unread Alerts</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {notifications.filter((n) => n.type === "match").length}
              </div>
              <div className="text-sm text-muted-foreground">New Matches</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">
                {notifications.filter((n) => n.type === "application").length}
              </div>
              <div className="text-sm text-muted-foreground">Applications</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-muted-foreground">{notifications.length}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                variant={filter === "unread" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("unread")}
              >
                Unread ({unreadCount})
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading notifications...</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => {
                const IconComponent = getIcon(notification.type);
                return (
                  <Card
                    key={notification.id}
                    className={`${notification.read ? 'bg-card/40' : 'bg-card/80 border-l-4 border-l-primary'} border-border hover:shadow-ai transition-all cursor-pointer`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-full ${
                          notification.type === 'match' ? 'bg-accent/20 text-accent' :
                          notification.type === 'application' ? 'bg-primary/20 text-primary' :
                          notification.type === 'message' ? 'bg-gradient-ai text-white' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold ${notification.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-accent rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.content}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* AI Insights */}
        <Card className="bg-gradient-accent/10 border-accent/20">
          <CardHeader>
            <CardTitle className="text-accent flex items-center gap-2">
              <Star className="h-5 w-5" />
              AI Activity Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground mb-4">
              {unreadCount > 0 
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}. Stay on top of your opportunities!`
                : "You're all caught up! Check back later for new opportunities."}
            </p>
            <div className="flex gap-2">
              <Button variant="accent" size="sm" onClick={() => navigate("/profile")}>
                Update Portfolio
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/projects")}>
                Browse Projects
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}