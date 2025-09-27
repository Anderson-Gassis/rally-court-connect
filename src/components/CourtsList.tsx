
import React from 'react';
import CourtCard from '@/components/CourtCard';
import { Court } from '@/services/courtsService';

interface CourtsListProps {
  courts: Court[];
}

const CourtsList = ({ courts }: CourtsListProps) => {
  if (courts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Nenhuma quadra encontrada</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courts.map(court => (
        <CourtCard 
          key={court.id} 
          id={court.id}
          name={court.name}
          type={court.type}
          image={court.image_url}
          location={court.location}
          distance={court.distance ? `${court.distance.toFixed(1)}km` : ''}
          rating={court.rating}
          price={court.price_per_hour}
          available={court.available}
          sportType={court.sport_type}
          features={court.features}
        />
      ))}
    </div>
  );
};

export default CourtsList;
