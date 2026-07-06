import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  const fetchProfile = async (userId: string, userEmail?: string, userMeta?: Record<string, unknown>, retryCount = 0) => {
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

    if (error) {
      if (retryCount < 2) {
        setTimeout(() => fetchProfile(userId, userEmail, userMeta, retryCount + 1), 500);
        return;
      }
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    if (!data) {
      if (retryCount < 2) {
        setTimeout(() => fetchProfile(userId, userEmail, userMeta, retryCount + 1), 500);
        return;
      }
      // Last resort: create the profile client-side
      if (userEmail) {
        const { data: created } = await supabase.from('profiles').insert({
          id: userId,
          email: userEmail,
          full_name: (userMeta?.full_name as string) || '',
          role: 'student',
        }).select().maybeSingle();
        if (created) {
          setProfile(created as Profile);
          setProfileLoading(false);
          return;
        }
      }
      setProfile(null);
      setProfileLoading(false);
      return;
    }

      setProfile(data as Profile);
      setProfileLoading(false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setProfile(null);
      setProfileLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id, user.email, user.user_metadata);
  };

  useEffect(() => {
    try {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id, session.user.email, session.user.user_metadata);
        } else {
          setProfileLoading(false);
          setLoading(false);
        }
        setLoading(false);
      }).catch((err) => {
        console.error('Error getting session:', err);
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          (async () => { await fetchProfile(session.user.id, session.user.email, session.user.user_metadata); })();
        } else {
          setProfile(null);
          setProfileLoading(false);
        }
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } catch (err) {
      console.error('Auth setup error:', err);
      setLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) return { error };
      // Profile is auto-created by database trigger (handle_new_user)
      // Fallback: if trigger didn't create it, try client-side insert
      if (data.user) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();
        if (!existingProfile) {
          await supabase.from('profiles').insert({
            id: data.user.id,
            email,
            full_name: fullName,
            role: 'student',
          });
        }
      }
      return { error: null };
    } catch (err) {
      console.error('Sign up error:', err);
      return { error: err as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error ?? null };
    } catch (err) {
      console.error('Sign in error:', err);
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setProfile(null);
      setProfileLoading(true);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, profileLoading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
