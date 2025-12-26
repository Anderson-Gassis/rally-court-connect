import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface ScrollIndicatorProps {
  className?: string;
  label?: string;
}

const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({
  className = '',
  label = 'Scroll',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.6 }}
      className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 ${className}`}
    >
      <span className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground">
        {label}
      </span>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <ChevronDown className="w-5 h-5 text-primary" />
      </motion.div>
    </motion.div>
  );
};

export default ScrollIndicator;
