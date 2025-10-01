import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Star } from 'lucide-react';
import heroTennisCourt from '@/assets/hero-tennis-court.jpg';
const HeroSection = () => {
  return <section className="relative bg-gradient-to-r from-tennis-blue-light to-white py-8 sm:py-12 md:py-16 lg:py-20 overflow-hidden safe-area-inset">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
          {/* Hero Content */}
          <div className="space-y-4 sm:space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
              Encontre e reserve <span className="text-tennis-blue">quadras de tênis</span> perto de você
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed">
              Conectamos jogadores a quadras disponíveis em clubes, condomínios e espaços públicos. 
              Reserve, jogue e divirta-se!
            </p>
            
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mt-4 sm:mt-6">
              <Button className="bg-tennis-blue hover:bg-tennis-blue-dark text-white py-5 sm:py-6 px-6 sm:px-8 text-base sm:text-lg w-full sm:w-auto min-h-[48px] touch-manipulation" asChild>
                <Link to="/courts">Encontrar Quadras</Link>
              </Button>
              <Button variant="outline" className="border-tennis-blue text-tennis-blue hover:bg-tennis-blue/10 py-5 sm:py-6 px-6 sm:px-8 text-base sm:text-lg w-full sm:w-auto min-h-[48px] touch-manipulation" asChild>
                <Link to="/players">Encontrar jogadores</Link>
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 md:gap-6 pt-4 sm:pt-6">
              <div className="flex items-center text-gray-700 text-sm sm:text-base">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-tennis-blue mr-2 flex-shrink-0" />
                <span>Encontre quadras próximas</span>
              </div>
              <div className="flex items-center text-gray-700 text-sm sm:text-base">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-tennis-blue mr-2 flex-shrink-0" />
                <span>Reserve em segundos</span>
              </div>
              <div className="flex items-center text-gray-700 text-sm sm:text-base">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 text-tennis-blue mr-2 flex-shrink-0" />
                <span>Avalie sua experiência</span>
              </div>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="hidden md:flex justify-center relative mt-8 lg:mt-0">
            <div className="relative w-full h-[350px] md:h-[400px] lg:h-[500px] rounded-lg overflow-hidden shadow-xl">
              <img src={heroTennisCourt} alt="Tennis Court" className="absolute inset-0 w-full h-full object-cover" loading="eager" />
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              
              {/* Floating Cards */}
              <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 lg:bottom-8 lg:left-8 bg-white rounded-lg p-3 md:p-4 shadow-lg max-w-[180px] md:max-w-[220px] tennis-ball-shadow">
                <div className="flex items-center mb-2">
                  <div className="h-2 w-2 rounded-full bg-tennis-green mr-2"></div>
                  <p className="text-xs md:text-sm font-medium">Disponível Agora</p>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm md:text-base">Clube Atlético</h3>
                <p className="text-xs md:text-sm text-gray-600">5 quadras de saibro • 3km</p>
                <div className="mt-2 text-tennis-blue font-semibold text-sm md:text-base">R$80/hora</div>
              </div>
              
              <div className="absolute top-4 right-4 md:top-6 md:right-6 lg:top-8 lg:right-8 bg-white rounded-lg p-3 md:p-4 shadow-lg max-w-[160px] md:max-w-[200px] tennis-ball-shadow animate-bounce-gentle">
                <div className="text-base md:text-lg font-bold text-tennis-blue">+450</div>
                <p className="text-xs md:text-sm text-gray-700">quadras disponíveis</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tennis Balls Background */}
      <div className="absolute -bottom-16 -right-16 h-32 w-32 rounded-full bg-tennis-green opacity-10"></div>
      <div className="absolute top-12 -left-8 h-16 w-16 rounded-full bg-tennis-blue opacity-10"></div>
      <div className="absolute -top-12 right-32 h-24 w-24 rounded-full bg-tennis-orange opacity-10"></div>
    </section>;
};
export default HeroSection;