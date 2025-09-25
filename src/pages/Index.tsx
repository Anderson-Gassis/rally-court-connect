
import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import CourtSearch from '@/components/CourtSearch';
import CourtCard from '@/components/CourtCard';
import MapView from '@/components/MapView';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Activity, Clock, MapPin, Star } from 'lucide-react';

const Index = () => {
  // Mock data for courts
  const courts = [
    {
      id: '1',
      name: 'Clube Atlético Paulistano',
      type: 'Saibro',
      sportType: 'tennis' as const,
      image: 'https://images.unsplash.com/photo-1569955914862-7d551e5516a1?q=80&w=500',
      location: 'Jardins, São Paulo',
      distance: '2.5km',
      rating: 4.8,
      price: 80,
      available: true,
      features: ['Iluminada', 'Vestiário', 'Estacionamento'],
    },
    {
      id: '2',
      name: 'Tennis Park',
      type: 'Rápida',
      sportType: 'tennis' as const,
      image: 'https://images.unsplash.com/photo-1614743758466-e569f4791116?q=80&w=500',
      location: 'Moema, São Paulo',
      distance: '3.1km',
      rating: 4.5,
      price: 60,
      available: false,
      features: ['Cobertura', 'Arquibancada'],
    },
    {
      id: '3',
      name: 'Condomínio Green Park',
      type: 'Saibro',
      sportType: 'padel' as const,
      image: 'https://images.unsplash.com/photo-1620742820748-87c09249a72a?q=80&w=500',
      location: 'Pinheiros, São Paulo',
      distance: '1.7km',
      rating: 4.2,
      price: 50,
      available: true,
      features: ['Iluminada', 'Coberta'],
    },
    {
      id: '4',
      name: 'Academia Ace',
      type: 'Indoor',
      sportType: 'beach-tennis' as const,
      image: 'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?q=80&w=500',
      location: 'Vila Olímpia, São Paulo',
      distance: '4.3km',
      rating: 4.9,
      price: 120,
      available: true,
      features: ['Ar-condicionado', 'Pro Shop', 'Restaurante'],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <HeroSection />
        
        {/* Search Widget */}
        <div className="container mx-auto px-4">
          <CourtSearch />
          
          {/* Featured Courts */}
          <section className="mt-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Quadras em Destaque</h2>
              <Button variant="outline" className="text-tennis-blue border-tennis-blue">
                Ver Todas
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {courts.map(court => (
                <CourtCard key={court.id} {...court} />
              ))}
            </div>
          </section>
          
          {/* Map Section */}
          <section className="mt-16 mb-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Encontre Quadras Próximas</h2>
            </div>
            <MapView />
          </section>
          
          {/* How It Works */}
          <section className="mt-16 mb-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900">Como Funciona</h2>
              <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
                Reserve quadras de tênis em minutos através de 3 passos simples.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center">
                <div className="bg-tennis-blue-light p-4 rounded-full mb-4">
                  <MapPin className="h-8 w-8 text-tennis-blue" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Encontre</h3>
                <p className="text-gray-600">
                  Busque quadras perto de você com filtros avançados para encontrar o local perfeito.
                </p>
              </div>
              
              {/* Step 2 */}
              <div className="flex flex-col items-center text-center">
                <div className="bg-tennis-blue-light p-4 rounded-full mb-4">
                  <Clock className="h-8 w-8 text-tennis-blue" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Reserve</h3>
                <p className="text-gray-600">
                  Escolha o horário disponível e confirme sua reserva com pagamento simples e rápido.
                </p>
              </div>
              
              {/* Step 3 */}
              <div className="flex flex-col items-center text-center">
                <div className="bg-tennis-blue-light p-4 rounded-full mb-4">
                  <Activity className="h-8 w-8 text-tennis-blue" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Jogue</h3>
                <p className="text-gray-600">
                  Chegue na quadra, apresente sua reserva digital e aproveite seu jogo.
                </p>
              </div>
            </div>
          </section>
          
          {/* CTA Section */}
          <section className="bg-tennis-blue-light rounded-xl p-8 md:p-12 mb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Pronto para jogar?</h2>
                <p className="text-gray-700 mb-6">
                  Registre-se gratuitamente e comece a reservar quadras de tênis por todo o Brasil.
                  Junte-se aos milhares de jogadores que já fazem parte da nossa comunidade.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    className="bg-tennis-blue hover:bg-tennis-blue-dark text-white px-8 py-6"
                  >
                    Cadastre-se Grátis
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-tennis-blue text-tennis-blue hover:bg-tennis-blue/10 px-8 py-6"
                  >
                    Saiba Mais
                  </Button>
                </div>
              </div>
              <div className="hidden md:flex justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1595435934824-1bef2e389342?q=80&w=400" 
                  alt="Jogador de tênis" 
                  className="rounded-lg max-w-full object-cover h-64 shadow-xl" 
                />
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
