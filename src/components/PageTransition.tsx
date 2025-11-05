import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import LoadingAnimation from './LoadingAnimation';

interface PageTransitionProps {
  children: React.ReactNode;
  initialLoad?: boolean;
  loadingDuration?: number;
  message?: string;
}

export default function PageTransition({ 
  children, 
  initialLoad = false,
  loadingDuration = 1500,
  message = "Loading..."
}: PageTransitionProps) {
  const [isLoading, setIsLoading] = useState(initialLoad);

  useEffect(() => {
    if (initialLoad) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, loadingDuration);

      return () => clearTimeout(timer);
    }
  }, [initialLoad, loadingDuration]);

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <LoadingAnimation key="loading" message={message} />
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ 
            duration: 0.5,
            ease: "easeInOut"
          }}
          className="w-full h-full"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
