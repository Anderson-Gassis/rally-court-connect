
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GridIcon, MapIcon } from 'lucide-react';
import CourtSearch from '@/components/CourtSearch';
import CourtsList from '@/components/CourtsList';
import MapView from '@/components/MapView';
import { useCourtSearch } from '@/hooks/useCourts';
import { useGeolocation } from '@/hooks/useGeolocation';
import { toast } from 'sonner';

const CourtTabContent = () => {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const { courts, isLoading, error, setSearchTerm, setFilters } = useCourtSearch();
  const { latitude, longitude, getCurrentLocation, error: geoError } = useGeolocation();

  // Get user location on mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Show error if geolocation fails
  useEffect(() => {
    if (geoError) {
      toast.error('Erro ao obter localização', {
        description: geoError + '. O filtro de distância pode não funcionar corretamente.'
      });
    }
  }, [geoError]);

  // Apply URL parameters on mount
  useEffect(() => {
    const location = searchParams.get('location');
    const sportType = searchParams.get('sport_type');
    const maxDistance = searchParams.get('max_distance');

    if (location || sportType || maxDistance) {
      if (location) setSearchTerm(location);
      
      const urlFilters: any = {};
      if (sportType) urlFilters.sport_type = sportType;
      if (maxDistance) urlFilters.max_distance = parseFloat(maxDistance);
      
      if (Object.keys(urlFilters).length > 0) {
        setFilters(urlFilters);
      }
    }
  }, [searchParams, setSearchTerm, setFilters]);

  const handleSearch = (location: string, filters: any) => {
    setSearchTerm(location);
    
    // Add user coordinates to filters for distance calculation
    const filtersWithCoords = {
      ...filters,
      lat: latitude || undefined,
      lng: longitude || undefined,
    };
    
    setFilters(filtersWithCoords);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-lg">Erro ao carregar quadras: {error.message}</p>
      </div>
    );
  }

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
      
      <CourtSearch onSearch={handleSearch} />
      
      <div className="mt-8">
        {viewMode === 'grid' ? (
          isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Carregando quadras...</p>
            </div>
          ) : (
            <CourtsList courts={courts} />
          )
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
