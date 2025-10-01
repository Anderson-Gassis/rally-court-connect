import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Star } from 'lucide-react';
import heroTennisCourt from '@/assets/hero-tennis-court.jpg';
const HeroSection = () => {
  return <section className="relative bg-gradient-to-r from-tennis-blue-light to-white py-16 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Hero Content */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
              Encontre e reserve <span className="text-tennis-blue">quadras de tênis</span> perto de você
            </h1>
            <p className="text-lg text-gray-600">
              Conectamos jogadores a quadras disponíveis em clubes, condomínios e espaços públicos. 
              Reserve, jogue e divirta-se!
            </p>
            
            <div className="flex flex-wrap gap-3 mt-4">
              <Button className="bg-tennis-blue hover:bg-tennis-blue-dark text-white py-6 px-8 text-lg" asChild>
                <Link to="/courts">Encontrar Quadras</Link>
              </Button>
              <Button variant="outline" className="border-tennis-blue text-tennis-blue hover:bg-tennis-blue/10 py-6 px-8 text-lg" asChild>
                <Link to="/players">Encontrar jogadores</Link>
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-4 md:gap-6 pt-4">
              <div className="flex items-center text-gray-700">
                <MapPin className="h-5 w-5 text-tennis-blue mr-2" />
                <span>Encontre quadras próximas</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Calendar className="h-5 w-5 text-tennis-blue mr-2" />
                <span>Reserve em segundos</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Star className="h-5 w-5 text-tennis-blue mr-2" />
                <span>Avalie sua experiência</span>
              </div>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="hidden lg:flex justify-center relative">
            <div className="relative w-full h-[500px] rounded-lg overflow-hidden shadow-xl">
              <img src={heroTennisCourt} alt="Tennis Court" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              
              {/* Floating Cards */}
              <div className="absolute bottom-8 left-8 bg-white rounded-lg p-4 shadow-lg max-w-[220px] tennis-ball-shadow">
                <div className="flex items-center mb-2">
                  <div className="h-2 w-2 rounded-full bg-tennis-green mr-2"></div>
                  <p className="text-sm font-medium">Disponível Agora</p>
                </div>
                <h3 className="font-semibold text-gray-900">Clube Atlético</h3>
                <p className="text-sm text-gray-600">5 quadras de saibro • 3km</p>
                <div className="mt-2 text-tennis-blue font-semibold">R$80/hora</div>
              </div>
              
              <div className="absolute top-8 right-8 bg-white rounded-lg p-4 shadow-lg max-w-[200px] tennis-ball-shadow animate-bounce-gentle">
                <div className="text-lg font-bold text-tennis-blue">+450</div>
                <p className="text-sm text-gray-700">quadras disponíveis</p>
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