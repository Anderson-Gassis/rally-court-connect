import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Users, Eye } from 'lucide-react';
import FullscreenSection from './FullscreenSection';
import PremiumButton from './PremiumButton';

const benefits = [
  {
    icon: Eye,
    title: 'Visibilidade',
    description: 'Sua quadra vista por milhares de jogadores ativos',
  },
  {
    icon: TrendingUp,
    title: 'Gestão Fácil',
    description: 'Sistema completo para gerenciar reservas automaticamente',
  },
  {
    icon: Users,
    title: 'Mais Receita',
    description: 'Maximize a ocupação com reservas 24/7',
  },
];

const PartnersSection: React.FC = () => {
  return (
    <FullscreenSection
      overlayType="none"
      className="bg-gradient-to-br from-primary via-tennis-blue-dark to-primary"
    >
      <div className="min-h-screen flex items-center py-20">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className="flex items-center gap-4"
              >
                <span className="w-12 h-px bg-primary-foreground/50" />
                <span className="font-body text-xs uppercase tracking-[0.3em] text-primary-foreground/80">
                  Para Proprietários
                </span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 80 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="display-lg text-primary-foreground"
              >
                Tem uma
                <br />
                <span className="text-primary-foreground/60">quadra?</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="body-lg text-primary-foreground/80 max-w-lg"
              >
                Faça parte da maior rede de quadras do Brasil e conecte-se com 
                milhares de jogadores. Aumente sua visibilidade e gere mais receita.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <PremiumButton 
                  to="/para-proprietarios" 
                  variant="outline" 
                  size="lg"
                  className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                >
                  Saiba Mais
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </PremiumButton>
              </motion.div>
            </div>

            {/* Right Column - Benefits */}
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, x: 100 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="group"
                >
                  <div className="glass-dark rounded-lg p-6 border border-primary-foreground/10 transition-all duration-500 hover:border-primary-foreground/30">
                    <div className="flex items-start gap-6">
                      {/* Icon */}
                      <div className="w-14 h-14 rounded-full bg-primary-foreground/10 flex items-center justify-center flex-shrink-0 transition-all duration-500 group-hover:bg-primary-foreground/20">
                        <benefit.icon className="w-6 h-6 text-primary-foreground" />
                      </div>

                      {/* Text */}
                      <div>
                        <h3 className="font-display text-2xl text-primary-foreground mb-2">
                          {benefit.title}
                        </h3>
                        <p className="font-body text-primary-foreground/70">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </FullscreenSection>
  );
};

export default PartnersSection;
