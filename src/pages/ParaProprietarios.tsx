import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Building2, Calendar, TrendingUp, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ParaProprietarios = () => {
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
            <Building2 className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Para Proprietários</h1>
            <p className="text-xl text-muted-foreground">
              Rentabilize sua quadra e atraia mais clientes
            </p>
          </div>

          <div className="bg-card rounded-lg shadow-lg p-8 mb-8">
            <p className="text-lg leading-relaxed mb-6">
              Se você é proprietário de quadra, a Kourtify é o lugar certo para <strong>rentabilizar seus horários e atrair novos clientes</strong>.
            </p>
            
            <p className="text-lg leading-relaxed mb-8">
              Divulgue sua quadra no nosso <strong>marketplace</strong>, controle sua agenda em tempo real e receba reservas diretamente na plataforma.
            </p>

            <p className="text-lg leading-relaxed mb-8">
              Além disso, oferecemos planos para parceiros que desejam <strong>aumentar a visibilidade e preencher horários ociosos</strong> com jogadores próximos.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="text-center p-6 bg-muted/50 rounded-lg">
                <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Marketplace</h3>
                <p className="text-sm text-muted-foreground">
                  Divulgue sua quadra para milhares de jogadores
                </p>
              </div>

              <div className="text-center p-6 bg-muted/50 rounded-lg">
                <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Gestão de Agenda</h3>
                <p className="text-sm text-muted-foreground">
                  Controle reservas e horários em tempo real
                </p>
              </div>

              <div className="text-center p-6 bg-muted/50 rounded-lg">
                <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Mais Visibilidade</h3>
                <p className="text-sm text-muted-foreground">
                  Aumente sua ocupação e receita
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link to="/add-court">
              <Button size="lg" className="text-lg px-8">
                Cadastrar Minha Quadra
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ParaProprietarios;
