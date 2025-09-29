import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NearbyPlayersSearch from '@/components/NearbyPlayersSearch';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Players = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Button variant="ghost" asChild className="mb-4">
              <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Início
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Encontrar Jogadores</h1>
            <p className="text-lg text-gray-600 mt-2">
              Conecte-se com jogadores da sua região e desafie para uma partida
            </p>
          </div>

          <NearbyPlayersSearch />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Players;