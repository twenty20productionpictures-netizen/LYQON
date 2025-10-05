import { Home, MessageSquare, Bell, Users, Search, Plus, User, Settings, LogOut } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { LiconLogo } from "@/components/LiconLogo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface AppSidebarProps {
  userType: "talent" | "director";
}

export function AppSidebar({ userType }: AppSidebarProps) {
  const { signOut, user } = useAuth();
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [profile, setProfile] = useState<{ full_name?: string; avatar_url?: string } | null>(null);
  
  const isCollapsed = state === "collapsed";

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      subscribeToNotifications();
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("user_id", user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id)
        .eq("read", false);

      if (error) throw error;
      setUnreadCount(count || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel("notification-count")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const navigationItems = [
    {
      title: "Dashboard",
      url: userType === "talent" ? "/dashboard/talent" : "/dashboard/director",
      icon: Home,
    },
    {
      title: "Messages",
      url: "/messages",
      icon: MessageSquare,
    },
    {
      title: "Activity/Alerts",
      url: "/notifications",
      icon: Bell,
    },
    {
      title: "Industry Forums",
      url: "/forums",
      icon: Users,
    },
    {
      title: "Discovery",
      url: "/discovery",
      icon: Search,
    },
    {
      title: "Projects",
      url: "/projects",
      icon: Plus,
    },
    {
      title: "My Portfolio",
      url: "/profile",
      icon: User,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ];

  const getNavClassName = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
      : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className={`flex items-center gap-2 p-2 ${isCollapsed ? 'justify-center' : ''}`}>
          <LiconLogo size="sm" showText={!isCollapsed} />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClassName}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                      {item.title === "Activity/Alerts" && unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs">
                          {unreadCount}
                        </Badge>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {user && profile && (
          <div className={`py-3 border-b border-sidebar-border ${isCollapsed ? 'px-0 flex justify-center' : 'px-3'}`}>
            {isCollapsed ? (
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || "User"} />
                <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">
                  {profile.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || "User"} />
                  <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">
                    {profile.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-sidebar-foreground truncate">
                    {profile.full_name || "User"}
                  </span>
                  <span className="text-xs text-sidebar-foreground/70 capitalize">
                    {userType}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={signOut}
              className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span>Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}