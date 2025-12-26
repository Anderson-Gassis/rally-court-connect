import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import CourtCard from '@/components/CourtCard';
import FullscreenSection from './FullscreenSection';
import PremiumButton from './PremiumButton';
import { ArrowRight } from 'lucide-react';

interface Court {
  id: string;
  name: string;
  type: string;
  sport_type: 'tennis' | 'padel' | 'beach-tennis';
  image_url: string | null;
  location: string;
  distance?: number;
  rating: number | null;
  price_per_hour: number;
  available: boolean | null;
  features: string[] | null;
}

interface FeaturedCourtsProps {
  courts: Court[];
  isLoading: boolean;
}

const FeaturedCourtsSection: React.FC<FeaturedCourtsProps> = ({ courts, isLoading }) => {
  return (
    <FullscreenSection
      overlayType="none"
      className="bg-secondary/30"
    >
      <div className="min-h-screen flex items-center py-20">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 lg:mb-16 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <span className="font-body text-xs uppercase tracking-[0.3em] text-primary mb-4 block">
                Destaques
              </span>
              <h2 className="display-lg text-foreground">
                Quadras em
                <br />
                <span className="text-primary">Destaque</span>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <PremiumButton to="/courts" variant="ghost" size="md">
                Ver Todas
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </PremiumButton>
            </motion.div>
          </div>

          {/* Courts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="animate-pulse"
                >
                  <div className="bg-muted rounded-lg h-48 w-full mb-4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </motion.div>
              ))
            ) : (
              courts.slice(0, 4).map((court, index) => (
                <motion.div
                  key={court.id}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <CourtCard
                    id={court.id}
                    name={court.name}
                    type={court.type}
                    sportType={court.sport_type}
                    image={court.image_url || 'https://images.unsplash.com/photo-1569955914862-7d551e5516a1?q=80&w=500'}
                    location={court.location}
                    distance={court.distance ? `${court.distance.toFixed(1)}km` : ''}
                    rating={court.rating}
                    price={court.price_per_hour}
                    available={court.available}
                    features={court.features || []}
                  />
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </FullscreenSection>
  );
};

export default FeaturedCourtsSection;
