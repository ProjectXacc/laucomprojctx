import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  name: string;
  matricNumber: string;
  email: string;
  profilePicture?: string;
  subscriptionStatus: 'active' | 'expired' | 'none';
  subscriptionExpiry?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isLoading: boolean;
  hasActiveSubscription: boolean;
  login: (matricNumber: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (name: string, matricNumber: string, password: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => void;
  checkSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session?.user) {
          // Use setTimeout to defer async operations and prevent deadlocks
          setTimeout(() => {
            createUserFromSupabase(session.user);
            checkSubscription();
          }, 0);
        } else {
          setUser(null);
          setHasActiveSubscription(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        createUserFromSupabase(session.user);
        checkSubscription();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const createUserFromSupabase = async (supabaseUser: SupabaseUser) => {
    try {
      // Try to get user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .maybeSingle();

      const user: User = {
        id: supabaseUser.id,
        name: profile?.display_name || supabaseUser.email?.split('@')[0] || 'User',
        matricNumber: supabaseUser.email || '',
        email: supabaseUser.email || '',
        subscriptionStatus: 'none'
      };

      setUser(user);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const checkSubscription = async () => {
    if (!session?.user) return;
    
    try {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('subscription_status', 'active')
        .maybeSingle();

      if (subscription && subscription.subscription_end) {
        const endDate = new Date(subscription.subscription_end);
        const now = new Date();
        const isActive = endDate > now;
        setHasActiveSubscription(isActive);
        
        if (user) {
          setUser({
            ...user,
            subscriptionStatus: isActive ? 'active' : 'expired',
            subscriptionExpiry: subscription.subscription_end
          });
        }
      } else {
        setHasActiveSubscription(false);
        if (user) {
          setUser({
            ...user,
            subscriptionStatus: 'none'
          });
        }
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setHasActiveSubscription(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      console.error('SignIn error:', error);
      return { 
        error: { 
          message: 'Network error. Please check your connection and try again.' 
        } 
      };
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            display_name: displayName || email.split('@')[0]
          }
        }
      });
      return { error };
    } catch (error) {
      console.error('SignUp error:', error);
      return { 
        error: { 
          message: 'Network error. Please check your connection and try again.' 
        } 
      };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('SignOut error:', error);
    }
  };

  // Legacy methods for backward compatibility
  const login = async (matricNumber: string, password: string): Promise<boolean> => {
    const { error } = await signIn(matricNumber, password);
    return !error;
  };

  const signup = async (name: string, matricNumber: string, password: string): Promise<boolean> => {
    const { error } = await signUp(matricNumber, password);
    if (!error) {
      // Create user profile
      setTimeout(async () => {
        await supabase.from('user_profiles').insert({
          user_id: session?.user?.id,
          display_name: name
        });
      }, 1000);
    }
    return !error;
  };

  const logout = () => {
    signOut();
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      
      // Update in Supabase
      if (session?.user) {
        supabase.from('user_profiles').upsert({
          user_id: session.user.id,
          display_name: updates.name || user.name
        });
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isLoading: loading,
      hasActiveSubscription,
      login,
      logout,
      signup,
      signIn,
      signUp,
      signOut,
      updateProfile,
      checkSubscription
    }}>
      {children}
    </AuthContext.Provider>
  );
};