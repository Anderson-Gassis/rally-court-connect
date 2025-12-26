import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Zap } from 'lucide-react';
import FullscreenSection from './FullscreenSection';

const features = [
  {
    number: '01',
    icon: MapPin,
    title: 'Encontre',
    description: 'Busque quadras perto de você com filtros avançados para encontrar o local perfeito.',
  },
  {
    number: '02',
    icon: Clock,
    title: 'Reserve',
    description: 'Escolha o horário disponível e confirme sua reserva com pagamento simples e rápido.',
  },
  {
    number: '03',
    icon: Zap,
    title: 'Jogue',
    description: 'Chegue na quadra, apresente sua reserva digital e aproveite seu jogo.',
  },
];

const HowItWorksSection: React.FC = () => {
  return (
    <FullscreenSection
      overlayType="none"
      className="bg-background"
    >
      <div className="min-h-screen flex items-center py-20">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          {/* Header */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 mb-16 lg:mb-24">
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-6"
            >
              <span className="font-body text-xs uppercase tracking-[0.3em] text-primary mb-4 block">
                Como Funciona
              </span>
              <h2 className="display-lg text-foreground">
                Simples como
                <br />
                <span className="text-primary">1, 2, 3</span>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-6 flex items-end"
            >
              <p className="body-lg text-muted-foreground max-w-md">
                Reserve quadras de tênis em minutos através de 3 passos simples. 
                Sem complicação, sem burocracia.
              </p>
            </motion.div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={feature.number}
                initial={{ opacity: 0, y: 80 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: index * 0.15 }}
                className="group"
              >
                <div className="relative">
                  {/* Number */}
                  <span className="display-xl text-muted/50 absolute -top-4 -left-2 select-none">
                    {feature.number}
                  </span>

                  {/* Content */}
                  <div className="relative z-10 pt-16">
                    {/* Icon */}
                    <div className="mb-6">
                      <div className="w-16 h-16 rounded-full border-2 border-primary/30 flex items-center justify-center transition-all duration-500 group-hover:bg-primary group-hover:border-primary">
                        <feature.icon className="w-7 h-7 text-primary transition-colors duration-500 group-hover:text-primary-foreground" />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="display-md text-foreground mb-4 transition-colors duration-300 group-hover:text-primary">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="body-md text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Decorative line */}
                    <div className="mt-8 h-px bg-border w-full">
                      <motion.div
                        className="h-full bg-primary origin-left"
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.2 }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </FullscreenSection>
  );
};

export default HowItWorksSection;
