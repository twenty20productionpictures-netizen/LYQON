import { useAuth } from "@/hooks/useAuth";
import { TalentProfileView } from "@/components/profile/TalentProfileView";
import { DirectorProfileView } from "@/components/profile/DirectorProfileView";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function ProfilePage() {
  const { userType, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");
  const [viewingUserType, setViewingUserType] = useState<string | null>(null);
  const [fetchingUserType, setFetchingUserType] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserType();
    } else {
      setViewingUserType(userType);
    }
  }, [userId, userType]);

  const fetchUserType = async () => {
    setFetchingUserType(true);
    try {
      const { data, error } = await supabase
        .from("public_profiles")
        .select("user_type")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      setViewingUserType(data?.user_type || null);
    } catch (error) {
      console.error("Error fetching user type:", error);
      setViewingUserType(null);
    } finally {
      setFetchingUserType(false);
    }
  };

  if (loading || fetchingUserType) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground animate-pulse">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout userType={userType || "talent"}>
      {viewingUserType === "talent" ? (
        <TalentProfileView userId={userId || undefined} />
      ) : (
        <DirectorProfileView userId={userId || undefined} />
      )}
    </DashboardLayout>
  );
}
