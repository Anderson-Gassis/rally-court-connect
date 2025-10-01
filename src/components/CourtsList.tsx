
import React from 'react';
import CourtCard from '@/components/CourtCard';
import { Court } from '@/services/courtsService';

interface CourtsListProps {
  courts: Court[];
}

const CourtsList = ({ courts }: CourtsListProps) => {
  // Sort courts: featured first, then by rating
  const sortedCourts = [...courts].sort((a, b) => {
    const aFeatured = a.featured_until && new Date(a.featured_until) > new Date();
    const bFeatured = b.featured_until && new Date(b.featured_until) > new Date();
    
    if (aFeatured && !bFeatured) return -1;
    if (!aFeatured && bFeatured) return 1;
    return b.rating - a.rating;
  });

  if (courts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Nenhuma quadra encontrada</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedCourts.map(court => (
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
          featuredUntil={court.featured_until}
        />
      ))}
    </div>
  );
};

export default CourtsList;
