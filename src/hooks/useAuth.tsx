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
  role?: 'player' | 'partner' | 'instructor' | 'admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, name: string, role?: 'player' | 'partner' | 'instructor', partnerData?: any) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth changes FIRST to avoid missing events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        // Defer any Supabase calls to avoid deadlocks inside the callback
        setTimeout(() => {
          fetchUserProfile(session.user);
        }, 0);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setTimeout(() => {
          fetchUserProfile(session.user);
        }, 0);
      } else {
        setUser(null);
      }
      setLoading(false);
    }).catch((error) => {
      console.error('Error getting session:', error);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected for new users
        console.error('Error fetching profile:', error);
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
      // Limpar qualquer sessão anterior
      await supabase.auth.signOut({ scope: 'local' });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        // Melhor tratamento de erros específicos
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha incorretos. Verifique suas credenciais.');
        }
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Email não confirmado. Verifique sua caixa de entrada e confirme seu email.');
        }
        if (error.message.includes('Too many requests')) {
          throw new Error('Muitas tentativas de login. Aguarde alguns minutos e tente novamente.');
        }
        throw error;
      }

      if (data.user && data.session) {
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

  const register = async (email: string, password: string, name: string, role: 'player' | 'partner' | 'instructor' = 'player', partnerData?: any) => {
    setLoading(true);
    try {
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
          throw new Error('Este email já está em uso. Você já tem uma conta! Tente fazer login.');
        }
        if (error.message.includes('Unable to validate email address')) {
          throw new Error('Email inválido. Verifique o formato do email.');
        }
        throw error;
      }

      // O trigger handle_new_user() criará automaticamente o profile
      if (data.user) {
        // Aguardar um pouco para o trigger processar
        await new Promise(resolve => setTimeout(resolve, 100));

        // Se for partner, criar partner_info record
        if (role === 'partner' && partnerData) {
          const partnerInfoData: any = {
            user_id: data.user.id,
            business_name: partnerData.businessName,
            contact_phone: partnerData.contactPhone,
            business_type: partnerData.businessType,
            description: partnerData.description,
          };

          // Adicionar campos específicos para professores
          if (partnerData.specialization) {
            partnerInfoData.specialization = partnerData.specialization;
          }
          if (partnerData.location) {
            partnerInfoData.location = partnerData.location;
          }

          const { error: partnerError } = await supabase
            .from('partner_info')
            .insert(partnerInfoData);

          if (partnerError) {
            console.error('Partner info creation error:', partnerError);
            throw new Error('Erro ao criar informações do parceiro');
          }
        }

        // Se for instructor, criar instructor_info record
        if (role === 'instructor' && partnerData) {
          const instructorInfoData: any = {
            user_id: data.user.id,
            specialization: partnerData.specialization || [],
            experience_years: partnerData.experience_years || 0,
            hourly_rate: partnerData.hourly_rate || 0,
            bio: partnerData.bio || '',
            location: partnerData.location || '',
            trial_class_available: true,
            trial_class_price: 0,
          };

          const { error: instructorError } = await supabase
            .from('instructor_info')
            .insert(instructorInfoData);

          if (instructorError) {
            console.error('Instructor info creation error:', instructorError);
            
            // Deletar o usuário criado se falhar ao criar dados do professor
            await supabase.auth.admin.deleteUser(data.user.id).catch(console.error);
            
            throw new Error('Erro ao criar informações do professor. Por favor, tente novamente.');
          }
        }

        // Verificar se o usuário precisa confirmar email (após criar os dados)
        if (!data.user.email_confirmed_at) {
          // Usuário criado mas precisa confirmar email
          throw new Error('CONFIRMATION_REQUIRED');
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

        // Se email já estiver confirmado (muito raro), buscar perfil
        if (data.user.email_confirmed_at) {
          await fetchUserProfile(data.user);
        }
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

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const resendConfirmation = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Resend confirmation error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      // Fazer logout completo no Supabase (todas as sessões)
      await supabase.auth.signOut({ scope: 'global' });
      
      // Limpar estado local
      setUser(null);
      
      // Limpar todo o localStorage e sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      
      // Redirecionar para Home
      window.location.href = '/';
      
    } catch (error) {
      console.error('Logout error:', error);
      // Em caso de erro, forçar limpeza e redirecionamento
      setUser(null);
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    } finally {
      setLoading(false);
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
        resetPassword,
        resendConfirmation,
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