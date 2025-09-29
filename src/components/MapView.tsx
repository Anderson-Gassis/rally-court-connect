
import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';
import { useCourts } from '@/hooks/useCourts';
import { useGeolocation } from '@/hooks/useGeolocation';
import { supabase } from '@/integrations/supabase/client';

interface GoogleMaps {
  Map: new (element: HTMLElement, options: any) => any;
  Marker: new (options: any) => any;
  InfoWindow: new (options: any) => any;
  SymbolPath: {
    CIRCLE: number;
  };
  places: {
    PlacesService: new (map: any) => any;
  };
}

declare global {
  interface Window {
    google?: {
      maps: GoogleMaps;
    };
    initMap?: () => void;
  }
}

const MapView = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [mapError, setMapError] = useState('');
  const { data: courts = [] } = useCourts();
  const { latitude, longitude, getCurrentLocation } = useGeolocation();
  
  // Get Google Maps API key from secrets
  const [apiKey, setApiKey] = useState('');

  // Fetch API key from Supabase edge function
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-maps-config');
        
        if (error) throw error;
        
        if (data?.hasKey && data?.apiKey) {
          setApiKey(data.apiKey);
          setMapError('');
        } else {
          setMapError('Chave de API do Google Maps não configurada. Configure a GOOGLE_MAPS_API_KEY nos secrets.');
        }
      } catch (error) {
        console.error('Error fetching API key:', error);
        setMapError('Erro ao carregar configuração do Google Maps.');
      }
    };
    
    fetchApiKey();
  }, []);

  // Request location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Load Google Maps Script
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      if (!apiKey) {
        setMapError('Chave de API do Google Maps não configurada. Configure a GOOGLE_MAPS_API_KEY nos secrets.');
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      window.initMap = initializeMap;
      
      script.onerror = () => {
        setMapError('Erro ao carregar Google Maps. Verifique a chave de API.');
      };
      
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, [apiKey]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const defaultCenter = latitude && longitude ? 
      { lat: latitude, lng: longitude } : 
      { lat: -23.5505, lng: -46.6333 }; // São Paulo default

    const newMap = new window.google.maps.Map(mapRef.current, {
      zoom: 13,
      center: defaultCenter,
      styles: [
        {
          featureType: 'poi.sports_complex',
          elementType: 'all',
          stylers: [{ visibility: 'on' }]
        }
      ]
    });

    setMap(newMap);
    setMapError('');

    // Add markers for courts
    courts.forEach((court) => {
      if (court.latitude && court.longitude) {
        const marker = new window.google.maps.Marker({
          position: { lat: court.latitude, lng: court.longitude },
          map: newMap,
          title: court.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#22c55e',
            fillOpacity: 1,
            strokeColor: '#16a34a',
            strokeWeight: 2,
          },
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h4 class="font-semibold">${court.name}</h4>
              <p class="text-sm text-gray-600">${court.location}</p>
              <p class="text-sm font-medium text-green-600">R$ ${court.price_per_hour}/hora</p>
            </div>
          `,
        });

        marker.addListener('click', () => {
          infoWindow.open(newMap, marker);
        });
      }
    });

    // Add user location marker if available
    if (latitude && longitude) {
      new window.google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: newMap,
        title: 'Sua localização',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          strokeColor: '#1d4ed8',
          strokeWeight: 3,
        },
      });
    }
  };


  return (
    <div className="border rounded-lg shadow overflow-hidden bg-background">
      <div className="p-4 flex justify-between items-center border-b bg-card">
        <h3 className="font-medium text-foreground">Quadras Próximas</h3>
        <div className="flex items-center gap-2">
          <Navigation size={16} className="text-primary" />
          <span className="text-sm text-primary">Google Maps</span>
        </div>
      </div>
      
      <div className="relative h-96">
        {mapError && (
          <div className="absolute inset-0 z-10 bg-background/95 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full text-center">
              <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
              <h4 className="font-semibold text-foreground mb-2">Erro nos Mapas</h4>
              <p className="text-sm text-muted-foreground mb-4">{mapError}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Verifique se a GOOGLE_MAPS_API_KEY está configurada corretamente nos secrets.
              </p>
            </div>
          </div>
        )}

        <div
          ref={mapRef}
          className="w-full h-full bg-muted"
          style={{ minHeight: '384px' }}
        />
        
        {!map && !mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
            <div className="text-center">
              <MapPin size={48} className="text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando mapa...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
