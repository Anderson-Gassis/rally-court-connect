
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CourtSearch from '@/components/CourtSearch';
import CourtCard from '@/components/CourtCard';
import MapView from '@/components/MapView';
import { Button } from '@/components/ui/button';
import { GridIcon, MapIcon } from 'lucide-react';

const Courts = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  
  // Mock data for courts - same as Index page
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
      features: ['Ar-condicionado', 'Pro Shop', 'Restaurante'],
    },
    {
      id: '5',
      name: 'Centro Esportivo Ibirapuera',
      type: 'Saibro',
      image: 'https://images.unsplash.com/photo-1622279488885-c9ab5396a402?q=80&w=500',
      location: 'Ibirapuera, São Paulo',
      distance: '5.2km',
      rating: 4.1,
      price: 40,
      available: true,
      features: ['Pública', 'Estacionamento'],
    },
    {
      id: '6',
      name: 'Tênis Clube Paulista',
      type: 'Grama',
      image: 'https://images.unsplash.com/photo-1523246181290-a16e4207bbe7?q=80&w=500',
      location: 'Higienópolis, São Paulo',
      distance: '6.8km',
      rating: 4.7,
      price: 150,
      available: true,
      features: ['Vestiário Premium', 'Restaurante', 'Spa'],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
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
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Courts;
