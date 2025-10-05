import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: 'talent' | 'director';
}

export function ProtectedRoute({ children, requiredUserType }: ProtectedRouteProps) {
  const { user, userType, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    } else if (!loading && requiredUserType && userType !== requiredUserType) {
      // Redirect to correct dashboard if user type doesn't match
      navigate(userType === 'talent' ? '/dashboard/talent' : '/dashboard/director');
    }
  }, [user, userType, loading, navigate, requiredUserType]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
