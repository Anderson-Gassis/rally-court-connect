
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GridIcon, MapIcon } from 'lucide-react';
import CourtSearch from '@/components/CourtSearch';
import CourtsList from '@/components/CourtsList';
import MapView from '@/components/MapView';

interface CourtTabContentProps {
  courts: Array<{
    id: string;
    name: string;
    type: string;
    image: string;
    location: string;
    distance: string;
    rating: number;
    price: number;
    available: boolean;
    sportType: string;
    features?: string[];
  }>;
}

const CourtTabContent = ({ courts }: CourtTabContentProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  return (
    <>
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
          <CourtsList courts={courts} />
        ) : (
          <div className="mt-4 h-[600px]">
            <MapView />
          </div>
        )}
      </div>
    </>
  );
};

export default CourtTabContent;
