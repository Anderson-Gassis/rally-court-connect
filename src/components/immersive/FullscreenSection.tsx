import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface FullscreenSectionProps {
  children: ReactNode;
  className?: string;
  overlayType?: 'dark' | 'light' | 'none' | 'gradient';
  backgroundImage?: string;
  backgroundColor?: string;
  id?: string;
}

const FullscreenSection: React.FC<FullscreenSectionProps> = ({
  children,
  className = '',
  overlayType = 'none',
  backgroundImage,
  backgroundColor,
  id,
}) => {
  const getOverlayClass = () => {
    switch (overlayType) {
      case 'dark':
        return 'section-overlay';
      case 'light':
        return 'section-overlay-light';
      case 'gradient':
        return 'absolute inset-0 z-10 bg-gradient-to-b from-transparent via-background/30 to-background';
      default:
        return '';
    }
  };

  return (
    <section
      id={id}
      className={`fullscreen-section ${className}`}
      style={{
        backgroundColor: backgroundColor,
      }}
    >
      {/* Background Image */}
      {backgroundImage && (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}

      {/* Overlay */}
      {overlayType !== 'none' && <div className={getOverlayClass()} />}

      {/* Content */}
      <div className="section-content">
        {children}
      </div>
    </section>
  );
};

export default FullscreenSection;

// Animation variants for content
export const fadeInUpVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

export const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export const slideInRightVariants = {
  hidden: { opacity: 0, x: 100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// Animated components
export const AnimatedHeading: React.FC<{
  children: ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = '', delay = 0 }) => (
  <motion.h1
    initial={{ opacity: 0, y: 80 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.5 }}
    transition={{
      duration: 0.8,
      delay,
      ease: [0.16, 1, 0.3, 1],
    }}
    className={className}
  >
    {children}
  </motion.h1>
);

export const AnimatedText: React.FC<{
  children: ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = '', delay = 0 }) => (
  <motion.p
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.5 }}
    transition={{
      duration: 0.6,
      delay,
      ease: [0.16, 1, 0.3, 1],
    }}
    className={className}
  >
    {children}
  </motion.p>
);

export const AnimatedButton: React.FC<{
  children: ReactNode;
  className?: string;
  delay?: number;
  onClick?: () => void;
}> = ({ children, className = '', delay = 0, onClick }) => (
  <motion.button
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.5 }}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    transition={{
      duration: 0.5,
      delay,
      ease: [0.16, 1, 0.3, 1],
    }}
    className={className}
    onClick={onClick}
  >
    {children}
  </motion.button>
);
