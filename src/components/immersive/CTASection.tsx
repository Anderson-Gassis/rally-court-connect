import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import FullscreenSection from './FullscreenSection';
import PremiumButton from './PremiumButton';

interface CTASectionProps {
  onLoginClick?: () => void;
}

const CTASection: React.FC<CTASectionProps> = ({ onLoginClick }) => {
  return (
    <FullscreenSection
      overlayType="none"
      className="bg-tennis-blue-light"
    >
      <div className="min-h-screen flex items-center py-20">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            {/* Left - Image/Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
              className="relative order-2 lg:order-1"
            >
              <div className="relative aspect-square max-w-md mx-auto lg:mx-0">
                {/* Decorative circles */}
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse" />
                <div className="absolute inset-8 rounded-full border-2 border-primary/30" />
                <div className="absolute inset-16 rounded-full bg-primary/10" />
                
                {/* Center content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <motion.span
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 }}
                      className="display-xl text-primary block"
                    >
                      100%
                    </motion.span>
                    <motion.span
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 }}
                      className="font-body text-lg text-foreground uppercase tracking-wider"
                    >
                      Grátis
                    </motion.span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right - Content */}
            <div className="space-y-8 order-1 lg:order-2">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className="flex items-center gap-4"
              >
                <span className="w-12 h-px bg-primary" />
                <span className="font-body text-xs uppercase tracking-[0.3em] text-primary">
                  Comece Agora
                </span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 80 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="display-lg text-foreground"
              >
                Pronto para
                <br />
                <span className="text-primary">jogar?</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="body-lg text-muted-foreground max-w-lg"
              >
                Registre-se gratuitamente e comece a reservar quadras de tênis 
                por todo o Brasil. Junte-se aos milhares de jogadores que já 
                fazem parte da nossa comunidade.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <PremiumButton 
                  onClick={onLoginClick}
                  variant="primary" 
                  size="lg"
                >
                  Cadastre-se Grátis
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </PremiumButton>

                <PremiumButton 
                  to="/players" 
                  variant="outline" 
                  size="lg"
                >
                  Encontrar Jogadores
                </PremiumButton>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </FullscreenSection>
  );
};

export default CTASection;
