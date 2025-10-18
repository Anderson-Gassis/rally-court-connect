import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import CourtSearch from '@/components/CourtSearch';
import CourtCard from '@/components/CourtCard';
import MapView from '@/components/MapView';
import Footer from '@/components/Footer';
import Analytics from '@/components/Analytics';
import { PWAInstallBanner } from '@/components/PWAInstallBanner';
import { Button } from '@/components/ui/button';
import { Activity, Clock, MapPin, Star } from 'lucide-react';
import { useCourts } from '@/hooks/useCourts';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useAuth } from '@/hooks/useAuth';
import LoginModal from '@/components/LoginModal';
import { CourtFilters } from '@/services/courtsService';

const Index = () => {
  const navigate = useNavigate();
  const { latitude, longitude } = useGeolocation();
  const { data: courts = [], isLoading } = useCourts({
    lat: latitude,
    lng: longitude,
  });
  const { isAuthenticated } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleSearch = (location: string, filters: CourtFilters) => {
    // Navigate to courts page with search parameters
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (filters.sport_type) params.set('sport_type', filters.sport_type);
    if (filters.max_distance) params.set('max_distance', filters.max_distance.toString());
    
    navigate(`/courts?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Analytics />
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <HeroSection />
        
        {/* Search Widget */}
        <div className="container mx-auto px-4">
          <CourtSearch onSearch={handleSearch} />
          
          {/* Featured Courts */}
          <section className="mt-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Quadras em Destaque</h2>
              <Button variant="outline" className="text-tennis-blue border-tennis-blue">
                <Link to="/courts">Ver Todas</Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg h-48 w-full mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))
              ) : (
                courts.slice(0, 4).map(court => (
                  <CourtCard 
                    key={court.id}
                    id={court.id}
                    name={court.name}
                    type={court.type}
                    sportType={court.sport_type as 'tennis' | 'padel' | 'beach-tennis'}
                    image={court.image_url || 'https://images.unsplash.com/photo-1569955914862-7d551e5516a1?q=80&w=500'}
                    location={court.location}
                    distance={court.distance ? `${court.distance.toFixed(1)}km` : ''}
                    rating={court.rating}
                    price={court.price_per_hour}
                    available={court.available}
                    features={court.features || []}
                  />
                ))
              )}
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
          
          {/* Partner Section */}
          <section className="mt-16 mb-16">
            <div className="bg-gradient-to-r from-tennis-blue to-tennis-blue-dark rounded-xl p-8 md:p-12 text-white">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Tem uma quadra?</h2>
                <p className="text-lg opacity-90 max-w-2xl mx-auto">
                  Faça parte da maior rede de quadras do Brasil e conecte-se com milhares de jogadores. 
                  Aumente sua visibilidade e gere mais receita com suas quadras.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="text-center">
                  <div className="bg-white/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Visibilidade</h3>
                  <p className="opacity-90">
                    Sua quadra será vista por milhares de jogadores ativos na plataforma
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-white/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Activity className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Gestão Fácil</h3>
                  <p className="opacity-90">
                    Sistema completo para gerenciar reservas e horários automaticamente
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-white/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Mais Receita</h3>
                  <p className="opacity-90">
                    Maximize a ocupação das suas quadras com reservas 24/7
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <Button 
                  variant="outline" 
                  className="bg-white text-tennis-blue border-white hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
                  asChild
                >
                  <Link to="/players">Encontrar Jogadores</Link>
                </Button>
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
                    onClick={handleLoginClick}
                  >
                    Cadastre-se Grátis
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-tennis-blue text-tennis-blue hover:bg-tennis-blue/10 px-8 py-6"
                    asChild
                  >
                    <Link to="/players">Encontrar Jogadores</Link>
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
      
      <PWAInstallBanner />
      <Footer />
      
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </div>
  );
};

export default Index;