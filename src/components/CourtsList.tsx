
import React from 'react';
import CourtCard from '@/components/CourtCard';

interface CourtsListProps {
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

const CourtsList = ({ courts }: CourtsListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courts.map(court => (
        <CourtCard key={court.id} {...court} />
      ))}
    </div>
  );
};

export default CourtsList;
