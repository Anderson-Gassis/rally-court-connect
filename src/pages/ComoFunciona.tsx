import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Users, Calendar, Trophy, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ComoFunciona = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para o início
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Users className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Para Jogadores</h1>
            <p className="text-xl text-muted-foreground">
              Conecte-se, jogue e evolua com a Kourtify
            </p>
          </div>

          <div className="bg-card rounded-lg shadow-lg p-8 mb-8">
            <p className="text-lg leading-relaxed mb-6">
              A Kourtify foi criada para quem ama esportes de raquete e quer jogar mais.
              Nossa plataforma conecta jogadores com interesses e níveis semelhantes, facilitando encontrar <strong>parceiros de jogo</strong> e <strong>organizar partidas</strong>.
            </p>
            
            <p className="text-lg leading-relaxed mb-8">
              Basta criar seu perfil, informar o esporte que pratica e sua localização — o sistema mostra outros jogadores próximos.
              Você pode enviar convites, combinar horários e até registrar os resultados para pontuar no ranking.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="text-center p-6 bg-muted/50 rounded-lg">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Encontre Parceiros</h3>
                <p className="text-sm text-muted-foreground">
                  Conecte-se com jogadores do seu nível e região
                </p>
              </div>

              <div className="text-center p-6 bg-muted/50 rounded-lg">
                <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Organize Partidas</h3>
                <p className="text-sm text-muted-foreground">
                  Agende jogos e confirme horários facilmente
                </p>
              </div>

              <div className="text-center p-6 bg-muted/50 rounded-lg">
                <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Evolua no Ranking</h3>
                <p className="text-sm text-muted-foreground">
                  Registre resultados e acompanhe sua evolução
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link to="/find-partner">
              <Button size="lg" className="text-lg px-8">
                Começar Agora
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ComoFunciona;
