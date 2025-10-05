import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userType: 'talent' | 'director' | null;
  loading: boolean;
  signUp: (email: string, password: string, userType: 'talent' | 'director', fullName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userType, setUserType] = useState<'talent' | 'director' | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch user profile to get user_type
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUserType(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) {
      setUserType(data.role as 'talent' | 'director');
    }
    setLoading(false);
  };

  const signUp = async (email: string, password: string, type: 'talent' | 'director', fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          user_type: type
        }
      }
    });

    if (error) {
      toast.error(error.message);
      throw error;
    }

    if (data.user) {
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
          user_type: type
        });

      if (profileError) {
        toast.error('Profile creation failed');
        throw profileError;
      }

      toast.success('Account created successfully!');
      setUserType(type);
      navigate(type === 'talent' ? '/dashboard/talent' : '/dashboard/director');
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      throw error;
    }

    if (data.user) {
      // Fetch user role to determine redirect
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      if (roleData) {
        setUserType(roleData.role as 'talent' | 'director');
        toast.success('Welcome back!');
        navigate(roleData.role === 'talent' ? '/dashboard/talent' : '/dashboard/director');
      }
    }
  };

  const signOut = async () => {
    try {
      // Clear local state first
      setUser(null);
      setSession(null);
      setUserType(null);
      
      // Attempt to sign out from Supabase
      await supabase.auth.signOut();
      
      toast.success('Signed out successfully');
    } catch (error: any) {
      // Even if signOut fails (e.g., session already expired), 
      // we've cleared local state, so just show a generic message
      console.error('Sign out error:', error);
    } finally {
      // Always navigate to home regardless of signOut success
      navigate('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, userType, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
