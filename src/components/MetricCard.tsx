
import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

const MetricCard = ({ title, value, icon, trend, className }: MetricCardProps) => {
  const isPositiveTrend = trend ? trend.value >= 0 : true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
      className="relative"
    >
      <Card className={cn(
        "overflow-hidden backdrop-blur-lg relative z-10",
        "bg-gradient-to-br from-white/40 to-white/10 dark:from-gray-800/40 dark:to-gray-900/10",
        "border border-white/20 dark:border-gray-800/50",
        "hover:border-primary/20 dark:hover:border-primary/20",
        "transition-all duration-300 ease-in-out",
        className
      )}>
        <div className="relative p-6">
          {/* Background Gradient Orb */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent dark:from-primary/10" />
          
          {/* Content */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  "bg-gradient-to-br from-primary/10 to-primary/5",
                  "dark:from-primary/20 dark:to-primary/10"
                )}>
                  {icon}
                </div>
                <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
              </div>
              
              {trend && (
                <div className={cn(
                  "flex items-center space-x-1 text-sm",
                  isPositiveTrend ? "text-green-500" : "text-red-500"
                )}>
                  {isPositiveTrend ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span className="font-medium">{Math.abs(trend.value)}%</span>
                  <span className="text-muted-foreground text-xs">{trend.label}</span>
                </div>
              )}
            </div>

            <div className="relative">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
              >
                <span className="text-3xl font-bold tracking-tight">{value}</span>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Hover Effect Border */}
        <div className="absolute inset-0 border border-primary/10 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300" />
      </Card>
    </motion.div>
  );
};

export default MetricCard;
