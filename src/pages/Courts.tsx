
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CourtSearch from '@/components/CourtSearch';
import CourtCard from '@/components/CourtCard';
import MapView from '@/components/MapView';
import NearbyPlayersSearch from '@/components/NearbyPlayersSearch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { GridIcon, MapIcon } from 'lucide-react';

const Courts = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  
  // Mock data for courts with sport types
  const courts = [
    {
      id: '1',
      name: 'Clube Atlético Paulistano',
      type: 'Saibro',
      image: 'https://images.unsplash.com/photo-1569955914862-7d551e5516a1?q=80&w=500',
      location: 'Jardins, São Paulo',
      distance: '2.5km',
      rating: 4.8,
      price: 80,
      available: true,
      sportType: 'tennis',
      features: ['Iluminada', 'Vestiário', 'Estacionamento'],
    },
    {
      id: '2',
      name: 'Tennis Park',
      type: 'Rápida',
      image: 'https://images.unsplash.com/photo-1614743758466-e569f4791116?q=80&w=500',
      location: 'Moema, São Paulo',
      distance: '3.1km',
      rating: 4.5,
      price: 60,
      available: false,
      sportType: 'tennis',
      features: ['Cobertura', 'Arquibancada'],
    },
    {
      id: '3',
      name: 'Condomínio Green Park',
      type: 'Saibro',
      image: 'https://images.unsplash.com/photo-1620742820748-87c09249a72a?q=80&w=500',
      location: 'Pinheiros, São Paulo',
      distance: '1.7km',
      rating: 4.2,
      price: 50,
      available: true,
      sportType: 'tennis',
      features: ['Iluminada', 'Coberta'],
    },
    {
      id: '4',
      name: 'Academia Ace',
      type: 'Indoor',
      image: 'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?q=80&w=500',
      location: 'Vila Olímpia, São Paulo',
      distance: '4.3km',
      rating: 4.9,
      price: 120,
      available: true,
      sportType: 'tennis',
      features: ['Ar-condicionado', 'Pro Shop', 'Restaurante'],
    },
    {
      id: '5',
      name: 'Centro Esportivo Ibirapuera',
      type: 'Areia',
      image: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=500',
      location: 'Ibirapuera, São Paulo',
      distance: '5.2km',
      rating: 4.1,
      price: 40,
      available: true,
      sportType: 'beach-tennis',
      features: ['Pública', 'Estacionamento'],
    },
    {
      id: '6',
      name: 'Arena Beach Sports',
      type: 'Areia',
      image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=500',
      location: 'Higienópolis, São Paulo',
      distance: '6.8km',
      rating: 4.7,
      price: 70,
      available: true,
      sportType: 'beach-tennis',
      features: ['Vestiário Premium', 'Bar', 'Loja'],
    },
    {
      id: '7',
      name: 'Padel Center',
      type: 'Vidro',
      image: 'https://images.unsplash.com/photo-1626224583764-f0cb4761e5cc?q=80&w=500',
      location: 'Moema, São Paulo',
      distance: '3.8km',
      rating: 4.6,
      price: 90,
      available: true,
      sportType: 'padel',
      features: ['Iluminada', 'Vestiário', 'Estacionamento'],
    },
    {
      id: '8',
      name: 'Padel Club SP',
      type: 'Vidro',
      image: 'https://images.unsplash.com/photo-1626224583764-f0cb4761e5cc?q=80&w=500',
      location: 'Pinheiros, São Paulo',
      distance: '4.2km',
      rating: 4.4,
      price: 85,
      available: false,
      sportType: 'padel',
      features: ['Vestiário', 'Bar', 'Loja'],
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="courts" className="w-full">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="courts" className="w-1/2">Encontrar Quadras</TabsTrigger>
              <TabsTrigger value="players" className="w-1/2">Encontrar Jogadores</TabsTrigger>
            </TabsList>
            
            <TabsContent value="courts">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Encontre Quadras</h1>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant={viewMode === 'grid' ? 'default' : 'outline'} 
                    className={viewMode === 'grid' ? 'bg-tennis-blue' : ''}
                    onClick={() => setViewMode('grid')}
                  >
                    <GridIcon className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant={viewMode === 'map' ? 'default' : 'outline'} 
                    className={viewMode === 'map' ? 'bg-tennis-blue' : ''}
                    onClick={() => setViewMode('map')}
                  >
                    <MapIcon className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <CourtSearch />
              
              <div className="mt-8">
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courts.map(court => (
                      <CourtCard key={court.id} {...court} />
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 h-[600px]">
                    <MapView />
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="players">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Encontre Jogadores</h1>
                <p className="text-gray-600 mt-2">
                  Busque jogadores próximos para desafiar para uma partida
                </p>
              </div>
              
              <NearbyPlayersSearch />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Courts;
