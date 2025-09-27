import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  name: string;
  fullName?: string;
  avatarUrl?: string;
  skillLevel?: string;
  location?: string;
  role?: 'player' | 'partner' | 'admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, name: string, role?: 'player' | 'partner', partnerData?: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchUserProfile(session.user);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      // Tentar buscar o perfil algumas vezes (para aguardar o trigger)
      let profile = null;
      let attempts = 0;
      const maxAttempts = 3;

      while (!profile && attempts < maxAttempts) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', supabaseUser.id)
          .single();
        
        profile = data;
        if (!profile && attempts < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        attempts++;
      }

      if (profile) {
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: profile.full_name || supabaseUser.email!,
          fullName: profile.full_name,
          avatarUrl: profile.avatar_url,
          skillLevel: profile.skill_level,
          location: profile.location,
          role: profile.role || 'player',
        });
      } else {
        // Se o perfil não foi encontrado, criar um básico
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: supabaseUser.email!,
          role: 'player',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Create basic user object if profile fetch fails
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email!,
        name: supabaseUser.email!,
        role: 'player',
      });
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Registrar atividade de login
        setTimeout(async () => {
          try {
            await supabase.rpc('log_user_activity', {
              activity_type_param: 'login',
              activity_data_param: { login_method: 'email' }
            });
          } catch (error) {
            console.error('Error logging activity:', error);
          }
        }, 500);

        await fetchUserProfile(data.user);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: 'player' | 'partner' = 'player', partnerData?: any) => {
    setLoading(true);
    try {
      // Verificar se o email já existe
      const { data: existingUsers } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email.toLowerCase().trim())
        .limit(1);

      if (existingUsers && existingUsers.length > 0) {
        throw new Error('Este email já está em uso. Tente fazer login ou use outro email.');
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: name,
            role: role,
          }
        },
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          throw new Error('Este email já está em uso. Tente fazer login ou use outro email.');
        }
        throw error;
      }

      // O trigger handle_new_user() criará automaticamente o profile
      if (data.user) {
        // Aguardar um pouco para o trigger processar
        await new Promise(resolve => setTimeout(resolve, 100));

        // Se for partner, criar partner_info record
        if (role === 'partner' && partnerData) {
          const { error: partnerError } = await supabase
            .from('partner_info')
            .insert({
              user_id: data.user.id,
              business_name: partnerData.businessName,
              contact_phone: partnerData.contactPhone,
              business_type: partnerData.businessType,
              description: partnerData.description,
            });

          if (partnerError) {
            console.error('Partner info creation error:', partnerError);
            throw new Error('Erro ao criar informações do parceiro');
          }
        }

        // Registrar atividade de registro
        setTimeout(async () => {
          try {
            await supabase.rpc('log_user_activity', {
              activity_type_param: 'register',
              activity_data_param: { role, registration_method: 'email' }
            });
          } catch (error) {
            console.error('Error logging activity:', error);
          }
        }, 500);

        // Buscar o perfil criado
        await fetchUserProfile(data.user);
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;