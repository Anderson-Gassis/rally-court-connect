import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Analytics from '@/components/Analytics';
import { PWAInstallBanner } from '@/components/PWAInstallBanner';
import LoginModal from '@/components/LoginModal';
import { useCourts } from '@/hooks/useCourts';
import { useGeolocation } from '@/hooks/useGeolocation';

// Immersive Components
import ImmersiveHero from '@/components/immersive/ImmersiveHero';
import HowItWorksSection from '@/components/immersive/HowItWorksSection';
import FeaturedCourtsSection from '@/components/immersive/FeaturedCourtsSection';
import PartnersSection from '@/components/immersive/PartnersSection';
import CTASection from '@/components/immersive/CTASection';

const Index = () => {
  const { latitude, longitude } = useGeolocation();
  const { data: courts = [], isLoading } = useCourts({
    lat: latitude,
    lng: longitude,
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  return (
    <div className="relative">
      <Analytics />
      <Navbar />
      
      <main className="overflow-y-auto snap-y snap-mandatory">
        {/* Hero Section - Fullscreen */}
        <ImmersiveHero />
        
        {/* How It Works - Fullscreen */}
        <HowItWorksSection />
        
        {/* Featured Courts - Fullscreen */}
        <FeaturedCourtsSection 
          courts={courts as any[]} 
          isLoading={isLoading} 
        />
        
        {/* Partners Section - Fullscreen */}
        <PartnersSection />
        
        {/* CTA Section - Fullscreen */}
        <CTASection onLoginClick={handleLoginClick} />
      </main>
      
      <PWAInstallBanner />
      <Footer />
      
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </div>
  );
};

export default Index;
