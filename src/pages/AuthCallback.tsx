import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase automatically handles the token from the URL hash.
    // We just need to wait for the session to be established.
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          navigate('/auth?error=callback_failed');
          return;
        }

        if (data.session) {
          // Session established — redirect to dashboard
          navigate('/player-dashboard', { replace: true });
        } else {
          // No session found — redirect to login
          navigate('/auth', { replace: true });
        }
      } catch (err) {
        console.error('Unexpected error in auth callback:', err);
        navigate('/auth?error=unexpected');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        <p className="text-muted-foreground text-sm">Finalizando login com Google...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
