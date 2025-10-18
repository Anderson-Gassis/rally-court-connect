import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MapPin, Filter, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BuscarQuadras = () => {
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
            <MapPin className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Buscar Quadras</h1>
            <p className="text-xl text-muted-foreground">
              Encontre a quadra perfeita para seu jogo
            </p>
          </div>

          <div className="bg-card rounded-lg shadow-lg p-8 mb-8">
            <p className="text-lg leading-relaxed mb-6">
              O sistema de <strong>busca de quadras da Kourtify</strong> utiliza geolocalização para mostrar as opções mais próximas de você.
            </p>
            
            <p className="text-lg leading-relaxed mb-8">
              Você pode filtrar por cidade, bairro, tipo de piso, preço e disponibilidade.
              Além disso, quadras parceiras podem ser reservadas diretamente pelo app, com confirmação instantânea e integração com sua agenda.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="text-center p-6 bg-muted/50 rounded-lg">
                <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Geolocalização</h3>
                <p className="text-sm text-muted-foreground">
                  Encontre quadras próximas a você automaticamente
                </p>
              </div>

              <div className="text-center p-6 bg-muted/50 rounded-lg">
                <Filter className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Filtros Avançados</h3>
                <p className="text-sm text-muted-foreground">
                  Pesquise por tipo de piso, preço e comodidades
                </p>
              </div>

              <div className="text-center p-6 bg-muted/50 rounded-lg">
                <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Reserva Instantânea</h3>
                <p className="text-sm text-muted-foreground">
                  Reserve online com confirmação imediata
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link to="/courts">
              <Button size="lg" className="text-lg px-8">
                Buscar Quadras Agora
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BuscarQuadras;
