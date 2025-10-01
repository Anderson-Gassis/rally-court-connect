import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const AdPaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [confirming, setConfirming] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const sessionId = searchParams.get('session_id');
  const adType = searchParams.get('ad_type');

  useEffect(() => {
    if (!sessionId) {
      setError('ID de sessão não encontrado');
      setConfirming(false);
      return;
    }

    confirmPayment();
  }, [sessionId]);

  const confirmPayment = async () => {
    try {
      const { error: confirmError } = await supabase.functions.invoke(
        'confirm-ad-payment',
        { body: { sessionId } }
      );

      if (confirmError) throw confirmError;

      toast.success('Pagamento confirmado! Seu anúncio está ativo.');
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      setError('Erro ao confirmar pagamento');
      toast.error('Erro ao confirmar pagamento');
    } finally {
      setConfirming(false);
    }
  };

  const getRedirectPath = () => {
    switch (adType) {
      case 'partner_search':
        return '/find-partner';
      case 'court':
        return '/courts';
      case 'instructor':
        return '/instructors';
      default:
        return '/';
    }
  };

  if (confirming) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardContent className="pt-12 pb-8 text-center">
              <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold mb-2">Confirmando Pagamento</h2>
              <p className="text-gray-600">Aguarde enquanto processamos seu pagamento...</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-red-600">Erro no Pagamento</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => navigate('/')}>
                Voltar ao Início
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-green-600">Pagamento Confirmado!</CardTitle>
            <CardDescription>
              Seu anúncio foi publicado com sucesso e já está ativo na plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
              <p className="font-semibold text-blue-900 mb-1">🎉 Parabéns!</p>
              <p className="text-blue-800">
                Seu anúncio agora tem maior visibilidade e aparecerá em destaque nas pesquisas.
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button onClick={() => navigate(getRedirectPath())} className="w-full">
                Ver Anúncios
              </Button>
              <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                Voltar ao Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AdPaymentSuccess;