import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';
import { useNavigate } from 'react-router-dom';

export const PWAInstallBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const { isInstallable, isInstalled, promptInstall } = usePWA();
  const navigate = useNavigate();

  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

    // Show banner if installable, not installed, and not dismissed in last 7 days
    if (isInstallable && !isInstalled && daysSinceDismissed > 7) {
      setTimeout(() => setShowBanner(true), 3000); // Show after 3 seconds
    }
  }, [isInstallable, isInstalled]);

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
  };

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      setShowBanner(false);
    } else {
      // If prompt failed, navigate to install page
      navigate('/install');
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-card border border-border rounded-lg shadow-lg p-4">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Download className="w-6 h-6 text-primary" />
          </div>
          
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-sm">Instale o Kourtify</h3>
            <p className="text-xs text-muted-foreground">
              Acesse rapidamente da tela inicial e use offline
            </p>
            
            <div className="flex gap-2 pt-1">
              <Button 
                onClick={handleInstall} 
                size="sm" 
                className="flex-1"
              >
                Instalar
              </Button>
              <Button 
                onClick={handleDismiss} 
                size="sm" 
                variant="outline"
              >
                Depois
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
