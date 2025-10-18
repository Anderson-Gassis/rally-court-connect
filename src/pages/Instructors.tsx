
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import InstructorsSearchContainer from '@/components/InstructorsSearchContainer';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoginModal from '@/components/LoginModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, GraduationCap, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Instructors = () => {
  const { isAuthenticated } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Button variant="ghost" asChild className="mb-4">
              <Link to="/" className="flex items-center text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Início
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">👨‍🏫 Encontre Professores de Tênis</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Conecte-se com professores qualificados e agende suas aulas
            </p>
          </div>

          <ErrorBoundary>
            {isAuthenticated ? (
              <InstructorsSearchContainer />
            ) : (
              <Card className="max-w-2xl mx-auto border-2">
                <CardContent className="pt-12 pb-12 text-center">
                  <GraduationCap className="h-20 w-20 mx-auto mb-6 text-primary" />
                  <h2 className="text-2xl font-bold mb-4">
                    Cadastre-se e encontre um profissional para jogar com você!
                  </h2>
                  <p className="text-muted-foreground mb-8 text-lg">
                    Acesse sua conta para visualizar professores qualificados, 
                    verificar disponibilidade e agendar suas aulas de tênis.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      size="lg"
                      className="gap-2"
                      onClick={() => setIsLoginModalOpen(true)}
                    >
                      <UserPlus className="h-5 w-5" />
                      Criar Conta
                    </Button>
                    <Button 
                      size="lg"
                      variant="outline"
                      onClick={() => setIsLoginModalOpen(true)}
                    >
                      Já tenho conta
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </ErrorBoundary>
        </div>
      </main>
      
      <Footer />
      
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </div>
  );
};

export default Instructors;
