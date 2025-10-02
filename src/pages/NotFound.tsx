import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Search, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4">
      <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
        <div className="space-y-4">
          <h1 className="text-9xl font-bold text-primary">
            404
          </h1>
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-gray-900">
              Página não encontrada
            </h2>
            <p className="text-gray-600">
              A página que você está procurando não existe ou foi movida
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              Voltar ao início
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link to="/courts">
              <Search className="h-4 w-4" />
              Buscar quadras
            </Link>
          </Button>
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        <div className="pt-8">
          <p className="text-sm text-gray-500">
            Precisa de ajuda?{' '}
            <Link to="/" className="text-primary hover:underline">
              Entre em contato
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
