import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import FullscreenSection from './FullscreenSection';
import ScrollIndicator from './ScrollIndicator';
import PremiumButton from './PremiumButton';
import heroTennisCourt from '@/assets/hero-tennis-court.jpg';

const ImmersiveHero: React.FC = () => {
  return (
    <FullscreenSection
      backgroundImage={heroTennisCourt}
      overlayType="dark"
      className="relative"
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 z-5">
        <div className="absolute top-1/4 right-[10%] w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 left-[5%] w-64 h-64 rounded-full bg-tennis-green/10 blur-3xl" />
      </div>

      <div className="relative z-20 min-h-screen flex items-center">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            {/* Main Content */}
            <div className="lg:col-span-7 space-y-8">
              {/* Pre-title */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex items-center gap-4"
              >
                <span className="w-12 h-px bg-primary" />
                <span className="font-body text-xs uppercase tracking-[0.3em] text-primary">
                  Plataforma de Reservas
                </span>
              </motion.div>

              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 80 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="display-xl text-primary-foreground"
              >
                Encontre
                <br />
                <span className="text-primary">Sua Quadra</span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="body-lg text-primary-foreground/80 max-w-xl"
              >
                Conectamos jogadores a quadras disponíveis em clubes, 
                condomínios e espaços públicos. Reserve, jogue e divirta-se.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <PremiumButton to="/courts" variant="primary" size="lg">
                  Encontrar Quadras
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </PremiumButton>

                <PremiumButton to="/players" variant="outline" size="lg" className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground hover:text-foreground">
                  Encontrar Jogadores
                </PremiumButton>
              </motion.div>
            </div>

            {/* Stats Column */}
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="lg:col-span-5 hidden lg:block"
            >
              <div className="glass rounded-lg p-8 border border-primary-foreground/10">
                <div className="space-y-8">
                  {/* Stat 1 */}
                  <div className="flex items-center gap-6">
                    <span className="display-md text-primary">450+</span>
                    <div>
                      <p className="font-body text-sm text-primary-foreground/60 uppercase tracking-wider">Quadras</p>
                      <p className="font-body text-primary-foreground">Disponíveis</p>
                    </div>
                  </div>

                  <div className="h-px bg-primary-foreground/10" />

                  {/* Stat 2 */}
                  <div className="flex items-center gap-6">
                    <span className="display-md text-primary">3k+</span>
                    <div>
                      <p className="font-body text-sm text-primary-foreground/60 uppercase tracking-wider">Jogadores</p>
                      <p className="font-body text-primary-foreground">Ativos</p>
                    </div>
                  </div>

                  <div className="h-px bg-primary-foreground/10" />

                  {/* Stat 3 */}
                  <div className="flex items-center gap-6">
                    <span className="display-md text-primary">24/7</span>
                    <div>
                      <p className="font-body text-sm text-primary-foreground/60 uppercase tracking-wider">Reservas</p>
                      <p className="font-body text-primary-foreground">Online</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <ScrollIndicator label="Explore" />
    </FullscreenSection>
  );
};

export default ImmersiveHero;
