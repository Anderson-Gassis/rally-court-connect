import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface PremiumButtonProps {
  children: ReactNode;
  to?: string;
  onClick?: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const PremiumButton: React.FC<PremiumButtonProps> = ({
  children,
  to,
  onClick,
  variant = 'primary',
  className = '',
  size = 'md',
}) => {
  const baseClasses = `
    relative inline-flex items-center justify-center
    font-display uppercase tracking-[0.15em]
    transition-all duration-500 ease-premium
    overflow-hidden group
  `;

  const sizeClasses = {
    sm: 'px-6 py-3 text-sm',
    md: 'px-8 py-4 text-base',
    lg: 'px-10 py-5 text-lg',
  };

  const variantClasses = {
    primary: `
      bg-primary text-primary-foreground
      hover:bg-primary/90
    `,
    outline: `
      border-2 border-foreground text-foreground
      hover:bg-foreground hover:text-background
    `,
    ghost: `
      text-foreground
      hover:text-primary
    `,
  };

  const buttonContent = (
    <>
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
      
      {/* Hover fill effect */}
      <span
        className={`
          absolute inset-0 z-0
          transform origin-left scale-x-0
          transition-transform duration-500 ease-premium
          group-hover:scale-x-100
          ${variant === 'primary' ? 'bg-primary-foreground/10' : ''}
          ${variant === 'outline' ? 'bg-foreground' : ''}
        `}
      />
      
      {/* Line decoration */}
      <span
        className={`
          absolute bottom-0 left-0 h-px w-full
          transform origin-right scale-x-0
          transition-transform duration-500 ease-premium
          group-hover:origin-left group-hover:scale-x-100
          ${variant === 'ghost' ? 'bg-primary' : 'bg-current'}
        `}
      />
    </>
  );

  const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  if (to) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Link to={to} className={combinedClasses}>
          {buttonContent}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={combinedClasses}
    >
      {buttonContent}
    </motion.button>
  );
};

export default PremiumButton;
