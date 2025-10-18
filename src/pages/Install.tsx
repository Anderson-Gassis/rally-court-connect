import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Smartphone, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Smartphone className="w-12 h-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Instale o Kourtify</CardTitle>
          <CardDescription className="text-lg mt-2">
            Acesse o app diretamente da tela inicial do seu celular
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {isInstalled ? (
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-primary mx-auto" />
              <p className="text-xl font-semibold">App instalado com sucesso!</p>
              <p className="text-muted-foreground">
                O Kourtify já está disponível na tela inicial do seu dispositivo.
              </p>
              <Button onClick={() => navigate('/')} className="w-full">
                Começar a usar
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Benefícios do App:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Acesso rápido direto da tela inicial</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Funciona offline para consultar suas reservas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Notificações de lembretes de partidas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Experiência completa como um app nativo</span>
                  </li>
                </ul>
              </div>

              {isInstallable ? (
                <Button 
                  onClick={handleInstallClick} 
                  className="w-full" 
                  size="lg"
                >
                  <Download className="mr-2" />
                  Instalar Agora
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Como instalar no seu dispositivo:</h4>
                    
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-medium mb-1">📱 iPhone/iOS:</p>
                        <ol className="list-decimal list-inside space-y-1 ml-2">
                          <li>Toque no botão de compartilhar (ícone de seta para cima)</li>
                          <li>Role para baixo e toque em "Adicionar à Tela de Início"</li>
                          <li>Toque em "Adicionar"</li>
                        </ol>
                      </div>
                      
                      <div>
                        <p className="font-medium mb-1">🤖 Android:</p>
                        <ol className="list-decimal list-inside space-y-1 ml-2">
                          <li>Toque no menu (⋮) no canto superior direito</li>
                          <li>Toque em "Instalar app" ou "Adicionar à tela inicial"</li>
                          <li>Toque em "Instalar"</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={() => navigate('/')} 
                    variant="outline" 
                    className="w-full"
                  >
                    Continuar no navegador
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Install;
