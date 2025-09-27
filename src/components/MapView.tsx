
import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';
import { useCourts } from '@/hooks/useCourts';
import { useGeolocation } from '@/hooks/useGeolocation';

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
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [mapError, setMapError] = useState('');
  const { data: courts = [] } = useCourts();
  const { latitude, longitude, getCurrentLocation } = useGeolocation();

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
        setShowApiKeyInput(true);
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

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      setShowApiKeyInput(false);
      localStorage.setItem('googleMapsApiKey', apiKey);
    }
  };

  // Try to load API key from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('googleMapsApiKey');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

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
        {showApiKeyInput && (
          <div className="absolute inset-0 z-10 bg-background/95 backdrop-blur-sm flex items-center justify-center p-6">
            <form onSubmit={handleApiKeySubmit} className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full">
              <div className="flex items-center mb-4">
                <AlertCircle className="text-orange-500 mr-2" size={20} />
                <h4 className="font-semibold text-foreground">Configurar Google Maps</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Para usar os mapas, insira sua chave de API do Google Maps:
              </p>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Cole sua Google Maps API Key aqui..."
                className="w-full p-3 border rounded-lg mb-4 text-sm"
                required
              />
              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Ativar Mapas
              </button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Siga o guia CONFIGURACAO_GOOGLE.md para obter sua chave
              </p>
            </form>
          </div>
        )}

        {mapError && (
          <div className="absolute inset-0 z-10 bg-background/95 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full text-center">
              <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
              <h4 className="font-semibold text-foreground mb-2">Erro nos Mapas</h4>
              <p className="text-sm text-muted-foreground mb-4">{mapError}</p>
              <button
                onClick={() => setShowApiKeyInput(true)}
                className="bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Reconfigurar API Key
              </button>
            </div>
          </div>
        )}

        <div
          ref={mapRef}
          className="w-full h-full bg-muted"
          style={{ minHeight: '384px' }}
        />
        
        {!map && !showApiKeyInput && !mapError && (
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
