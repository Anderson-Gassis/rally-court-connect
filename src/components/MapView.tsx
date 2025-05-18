
import React from 'react';

const MapView = () => {
  return (
    <div className="border rounded-lg shadow overflow-hidden bg-gray-100">
      <div className="p-4 flex justify-between border-b bg-white">
        <h3 className="font-medium">Quadras Próximas</h3>
        <span className="text-sm text-tennis-blue">Ver lista</span>
      </div>
      <div className="map-container relative">
        {/* Map placeholder - In a real app, we would integrate with Google Maps or Mapbox */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-2">Mapa de quadras próximas</p>
            <p className="text-sm text-gray-400">(Integração com mapas será implementada)</p>
          </div>
        </div>
        <img 
          src="https://maps.googleapis.com/maps/api/staticmap?center=São+Paulo,Brazil&zoom=13&size=600x400&maptype=roadmap" 
          alt="Map"
          className="w-full h-full object-cover opacity-25"
        />
      </div>
    </div>
  );
};

export default MapView;
