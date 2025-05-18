
import React from 'react';
import NearbyPlayersSearch from '@/components/NearbyPlayersSearch';

const PlayersTabContent = () => {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Encontre Jogadores</h1>
        <p className="text-gray-600 mt-2">
          Busque jogadores próximos para desafiar para uma partida
        </p>
      </div>
      
      <NearbyPlayersSearch />
    </>
  );
};

export default PlayersTabContent;
