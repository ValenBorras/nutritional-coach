'use client';

import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'coral' | 'white' | 'sage' | 'charcoal';
  text?: string;
  showText?: boolean;
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'coral', 
  text = 'Cargando...', 
  showText = true 
}: LoadingSpinnerProps) {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  };

  const colors = {
    coral: 'border-coral',
    white: 'border-white',
    sage: 'border-sage',
    charcoal: 'border-charcoal'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <motion.div
        className={`${sizes[size]} ${colors[color]} border-4 border-t-transparent rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {showText && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-charcoal font-marcellus text-lg"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

export function PulsingDots({ 
  color = 'coral',
  size = 'md'
}: { color?: 'coral' | 'white' | 'sage' | 'charcoal'; size?: 'sm' | 'md' | 'lg' }) {
  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const colors = {
    coral: 'bg-coral',
    white: 'bg-white',
    sage: 'bg-sage',
    charcoal: 'bg-charcoal'
  };

  return (
    <div className="flex space-x-2">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`${dotSizes[size]} ${colors[color]} rounded-full`}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: index * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}

export function LoadingCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-mist-white to-sage/10"
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md mx-4"
      >
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          className="h-16 w-16 border-4 border-coral border-t-transparent rounded-full mx-auto mb-6"
        />
        
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-marcellus text-charcoal mb-2"
        >
          NutriGuide
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-charcoal/70"
        >
          Preparando tu experiencia...
        </motion.p>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="h-1 bg-gradient-to-r from-coral to-sage rounded-full mt-6"
        />
      </motion.div>
    </motion.div>
  );
} 