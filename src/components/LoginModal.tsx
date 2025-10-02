import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import PartnerSignupModal from './PartnerSignupModal';
import InstructorSignupModal from './InstructorSignupModal';
import { toast } from 'sonner';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const { login, register, loginWithGoogle, resetPassword, resendConfirmation, loading } = useAuth();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '' });
  const [isPartnerSignupOpen, setIsPartnerSignupOpen] = useState(false);
  const [isInstructorSignupOpen, setIsInstructorSignupOpen] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [lastRegisteredEmail, setLastRegisteredEmail] = useState('');

  const handlePartnerSignupClick = () => {
    onClose();
    setIsPartnerSignupOpen(true);
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      onClose();
    } catch (error) {
      toast.error('Erro no login com Google. Tente novamente.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.email.trim() || !loginData.password.trim()) {
      toast.error('Por favor, preencha email e senha');
      return;
    }
    
    try {
      await login(loginData.email.toLowerCase().trim(), loginData.password);
      toast.success('Login realizado com sucesso!');
      setLoginData({ email: '', password: '' });
      onClose();
    } catch (error: any) {
      console.error('Login error:', error);
      
      const errorMessage = error.message || error.toString();
      
      if (errorMessage.includes('Invalid login credentials') || errorMessage.includes('Email ou senha incorretos')) {
        toast.error('Email ou senha incorretos. Verifique suas credenciais e tente novamente.', {
          duration: 6000
        });
      } else if (errorMessage.includes('Email not confirmed') || errorMessage.includes('não confirmado')) {
        toast.error('Email não confirmado. Verifique sua caixa de entrada e confirme seu email primeiro.', {
          duration: 6000
        });
      } else if (errorMessage.includes('Too many requests') || errorMessage.includes('Muitas tentativas')) {
        toast.error('Muitas tentativas de login. Aguarde alguns minutos e tente novamente.', {
          duration: 8000
        });
      } else if (errorMessage.includes('User not found')) {
        toast.error('Usuário não encontrado. Verifique o email ou crie uma nova conta.', {
          duration: 6000
        });
      } else {
        toast.error('Erro no login. Tente novamente ou entre em contato com o suporte.', {
          duration: 5000
        });
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerData.name.trim() || !registerData.email.trim() || !registerData.password.trim()) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }
    
    if (registerData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.email.trim())) {
      toast.error('Por favor, digite um email válido');
      return;
    }
    
    try {
      await register(registerData.email.toLowerCase().trim(), registerData.password, registerData.name.trim());
      setLastRegisteredEmail(registerData.email.toLowerCase().trim());
      toast.success('Conta criada com sucesso! Verifique seu email para confirmar a conta antes de fazer login.');
      onClose();
      setRegisterData({ name: '', email: '', password: '' });
    } catch (error: any) {
      console.error('Registration error:', error);
      
      const errorMessage = error.message || error.toString();
      
      if (error.message === 'CONFIRMATION_REQUIRED') {
        setLastRegisteredEmail(registerData.email.toLowerCase().trim());
        toast.success('Conta criada! Verifique seu email para confirmar a conta antes de fazer login.', {
          duration: 6000
        });
        onClose();
        setRegisterData({ name: '', email: '', password: '' });
      } else if (errorMessage.includes('já está em uso') || errorMessage.includes('User already registered') || errorMessage.includes('already exists')) {
        toast.error('Este email já está em uso. Você já tem uma conta! Tente fazer login em vez de criar nova conta.', {
          duration: 6000
        });
      } else if (errorMessage.includes('Password should be at least')) {
        toast.error('A senha deve ter pelo menos 6 caracteres.');
      } else if (errorMessage.includes('Unable to validate email address') || errorMessage.includes('Invalid email')) {
        toast.error('Email inválido. Verifique o formato do email.');
      } else if (errorMessage.includes('Signup is disabled')) {
        toast.error('Cadastro temporariamente desabilitado. Tente novamente mais tarde.');
      } else {
        toast.error(errorMessage || 'Erro ao criar conta. Tente novamente.');
      }
    }
  };

  const handleResendConfirmation = async () => {
    const email = lastRegisteredEmail || loginData.email;
    if (!email) {
      toast.error('Digite um email primeiro.');
      return;
    }
    
    try {
      await resendConfirmation(email.toLowerCase().trim());
      toast.success('Email de confirmação reenviado! Verifique sua caixa de entrada.');
    } catch (error: any) {
      console.error('Resend confirmation error:', error);
      toast.error('Erro ao reenviar confirmação. Tente novamente.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await resetPassword(resetEmail.toLowerCase().trim());
      toast.success('Email de recuperação enviado! Verifique sua caixa de entrada.');
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast.error('Erro ao enviar email de recuperação. Tente novamente.');
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] sm:w-full max-w-[420px] max-h-[90vh] overflow-y-auto p-4 sm:p-6"  aria-describedby="login-description">

          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">
              {showForgotPassword ? 'Recuperar senha' : 'Acesse sua conta'}
            </DialogTitle>
            <p id="login-description" className="sr-only">
              Faça login ou crie sua conta
            </p>
          </DialogHeader>
          
          {showForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Digite seu email para recuperar a senha"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar email de recuperação'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowForgotPassword(false)}
              >
                Voltar ao login
              </Button>
            </form>
          ) : (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="register">Criar conta</TabsTrigger>
              </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
                
                <div className="text-center space-y-2">
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-muted-foreground"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Esqueci minha senha
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-muted-foreground"
                    onClick={handleResendConfirmation}
                  >
                    Não recebeu o email de confirmação?
                  </Button>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">ou</span>
                  </div>
                </div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full flex items-center gap-2"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuar com Google
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Nome completo</Label>
                  <Input
                    id="register-name"
                    type="text"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Senha</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Criando conta...' : 'Criar conta de Jogador'}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">ou</span>
                  </div>
                </div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full flex items-center gap-2"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuar com Google
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">ou</span>
                  </div>
                </div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full border-tennis-blue text-tennis-blue hover:bg-tennis-blue hover:text-white"
                  onClick={handlePartnerSignupClick}
                >
                  Cadastre-se como Proprietário de Quadra
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                  onClick={() => {
                    onClose();
                    setIsInstructorSignupOpen(true);
                  }}
                >
                  Cadastre-se como Professor
                </Button>
                
                <p className="text-xs text-center text-gray-600">
                  Proprietários: cadastre quadras e receba reservas<br/>
                  Professores: ofereça aulas e gerencie alunos
                </p>
              </form>
            </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
      
      <PartnerSignupModal 
        isOpen={isPartnerSignupOpen}
        onClose={() => setIsPartnerSignupOpen(false)}
      />
      
      <InstructorSignupModal 
        isOpen={isInstructorSignupOpen}
        onClose={() => setIsInstructorSignupOpen(false)}
      />
    </>
  );
};

export default LoginModal;