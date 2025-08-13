
import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number; // 0 to 100
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  
  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
      <motion.div 
        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5"
        style={{ width: `${clampedProgress}%` }}
        initial={{ width: "0%" }}
        animate={{ width: `${clampedProgress}%` }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          <motion.div 
            className="absolute top-0 left-0 right-0 h-full bg-white dark:bg-gray-300 opacity-20"
            animate={{ 
              x: ["-100%", "100%"] 
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.5,
              ease: "linear"
            }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default ProgressBar;
