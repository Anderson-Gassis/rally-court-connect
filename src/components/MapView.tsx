
import React from 'react';
import { MapPin } from 'lucide-react';

const MapView = () => {
  return (
    <div className="border rounded-lg shadow overflow-hidden bg-gray-100">
      <div className="p-4 flex justify-between border-b bg-white">
        <h3 className="font-medium">Quadras Próximas</h3>
        <span className="text-sm text-tennis-blue">Ver lista</span>
      </div>
      <div className="map-container relative">
        {/* Map placeholder - In a real app, we would integrate with Google Maps or Mapbox */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
          <MapPin size={48} className="text-tennis-blue mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Map Integration Enabled</h3>
          <p className="text-gray-500 text-center mb-4">This area will display interactive maps showing nearby courts.</p>
          <div className="bg-white p-3 rounded-lg shadow-sm text-center max-w-md">
            <p className="text-sm text-gray-600">Integration with Google Maps or similar service will allow users to:</p>
            <ul className="text-sm text-left mt-2 space-y-1">
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-tennis-blue rounded-full mr-2"></span>
                <span>See courts based on their current location</span>
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-tennis-blue rounded-full mr-2"></span>
                <span>Get directions to selected courts</span>
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-tennis-blue rounded-full mr-2"></span>
                <span>Filter courts by distance and travel time</span>
              </li>
            </ul>
          </div>
        </div>
        <img 
          src="https://maps.googleapis.com/maps/api/staticmap?center=São+Paulo,Brazil&zoom=13&size=600x400&maptype=roadmap" 
          alt="Map"
          className="w-full h-full object-cover opacity-10"
        />
      </div>
    </div>
  );
};

export default MapView;
