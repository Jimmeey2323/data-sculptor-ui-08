import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { ProcessedData } from '@/types/data';
import {
  LineChart,
  Clock,
  Calendar,
  User,
  Percent,
  DollarSign,
  Activity,
  BarChart3,
  Users,
  CheckCircle2,
  XCircle,
  BarChart,
} from 'lucide-react';
import CountUp from 'react-countup';
import { Sparklines, SparklinesLine, SparklinesSpots } from 'react-sparklines';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export const formatIndianCurrency = (value: number): string => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(value);
};

interface MetricsPanelProps {
  data: ProcessedData[];
}

const generateSparklineData = (data: ProcessedData[], field: keyof ProcessedData, periods: number = 10): number[] => {
  // Group data by period
  const periodData = data.reduce((acc: Record<string, number>, item) => {
    const period = item.period || 'Unknown';
    if (!acc[period]) acc[period] = 0;
    const value = typeof item[field] === 'number' ? item[field] as number : 
                  typeof item[field] === 'string' ? parseFloat(item[field] as string) || 0 : 0;
    acc[period] += value;
    return acc;
  }, {});

  // Sort periods chronologically and take the last `periods` number
  const sortedPeriods = Object.keys(periodData).sort();
  const recentPeriods = sortedPeriods.slice(-periods);

  // Return the values for the recent periods
  return recentPeriods.map(period => periodData[period]);
};

const MetricsPanel: React.FC<MetricsPanelProps> = ({ data }) => {
  const [showCountUp, setShowCountUp] = useState(false);

  useEffect(() => {
    setShowCountUp(true);
  }, []);

  const metrics = useMemo(() => {
    if (!data.length) return [];

    const totalClasses = data.reduce((sum, item) => sum + item.totalOccurrences, 0);
    const totalCheckins = data.reduce((sum, item) => sum + item.totalCheckins, 0);
    const totalRevenue = data.reduce((sum, item) => {
      const revenue = typeof item.totalRevenue === 'string' ? parseFloat(item.totalRevenue) : item.totalRevenue;
      return sum + (revenue || 0);
    }, 0);
    const totalCancelled = data.reduce((sum, item) => sum + item.totalCancelled, 0);
    const totalTime = data.reduce((sum, item) => sum + item.totalTime, 0);

    const totalNonEmpty = data.reduce((sum, item) => sum + item.totalNonEmpty, 0);
    const averageClassSize = totalClasses > 0 ? totalCheckins / totalClasses : 0;
    const averageRevenue = totalClasses > 0 ? totalRevenue / totalClasses : 0;
    const cancellationRate = totalCheckins + totalCancelled > 0 ? (totalCancelled / (totalCheckins + totalCancelled)) * 100 : 0;
    
    const uniqueTeachers = new Set(data.map(item => item.teacherName)).size;
    const uniqueClasses = new Set(data.map(item => item.cleanedClass)).size;
    const uniqueLocations = new Set(data.map(item => item.location)).size;

    return [
      {
        title: 'Total Classes',
        value: totalClasses,
        icon: Calendar,
        color: 'bg-blue-500',
        textColor: 'text-blue-500',
        bgColor: 'bg-blue-50 dark:bg-blue-950',
        gradient: 'from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/30',
        sparkData: generateSparklineData(data, 'totalOccurrences')
      },
      {
        title: 'Total Check-ins',
        value: totalCheckins,
        icon: CheckCircle2,
        color: 'bg-green-500',
        textColor: 'text-green-500',
        bgColor: 'bg-green-50 dark:bg-green-950',
        gradient: 'from-green-50 to-green-100 dark:from-green-900/50 dark:to-green-800/30',
        sparkData: generateSparklineData(data, 'totalCheckins')
      },
      {
        title: 'Total Revenue',
        value: formatIndianCurrency(totalRevenue),
        icon: DollarSign,
        color: 'bg-emerald-500',
        textColor: 'text-emerald-500',
        bgColor: 'bg-emerald-50 dark:bg-emerald-950',
        gradient: 'from-emerald-50 to-emerald-100 dark:from-emerald-900/50 dark:to-emerald-800/30',
        sparkData: generateSparklineData(data, 'totalRevenue')
      },
      {
        title: 'Avg. Class Size',
        value: averageClassSize.toFixed(1),
        icon: Users,
        color: 'bg-violet-500',
        textColor: 'text-violet-500',
        bgColor: 'bg-violet-50 dark:bg-violet-950',
        gradient: 'from-violet-50 to-violet-100 dark:from-violet-900/50 dark:to-violet-800/30',
        sparkData: []
      },
      {
        title: 'Cancellations',
        value: totalCancelled,
        icon: XCircle,
        color: 'bg-red-500',
        textColor: 'text-red-500',
        bgColor: 'bg-red-50 dark:bg-red-950',
        gradient: 'from-red-50 to-red-100 dark:from-red-900/50 dark:to-red-800/30',
        sparkData: generateSparklineData(data, 'totalCancelled')
      },
      {
        title: 'Cancellation Rate',
        value: `${cancellationRate.toFixed(1)}%`,
        icon: Percent,
        color: 'bg-orange-500',
        textColor: 'text-orange-500',
        bgColor: 'bg-orange-50 dark:bg-orange-950',
        gradient: 'from-orange-50 to-orange-100 dark:from-orange-900/50 dark:to-orange-800/30',
        sparkData: []
      },
      {
        title: 'Revenue Per Class',
        value: formatIndianCurrency(averageRevenue),
        icon: BarChart,
        color: 'bg-amber-500',
        textColor: 'text-amber-500',
        bgColor: 'bg-amber-50 dark:bg-amber-950',
        gradient: 'from-amber-50 to-amber-100 dark:from-amber-900/50 dark:to-amber-800/30',
        sparkData: []
      },
      {
        title: 'Total Hours',
        value: totalTime.toFixed(0),
        icon: Clock,
        color: 'bg-cyan-500',
        textColor: 'text-cyan-500',
        bgColor: 'bg-cyan-50 dark:bg-cyan-950',
        gradient: 'from-cyan-50 to-cyan-100 dark:from-cyan-900/50 dark:to-cyan-800/30',
        sparkData: generateSparklineData(data, 'totalTime')
      },
      {
        title: 'Unique Classes',
        value: uniqueClasses,
        icon: Activity,
        color: 'bg-fuchsia-500',
        textColor: 'text-fuchsia-500',
        bgColor: 'bg-fuchsia-50 dark:bg-fuchsia-950',
        gradient: 'from-fuchsia-50 to-fuchsia-100 dark:from-fuchsia-900/50 dark:to-fuchsia-800/30',
        sparkData: []
      },
      {
        title: 'Unique Trainers',
        value: uniqueTeachers,
        icon: User,
        color: 'bg-pink-500',
        textColor: 'text-pink-500',
        bgColor: 'bg-pink-50 dark:bg-pink-950',
        gradient: 'from-pink-50 to-pink-100 dark:from-pink-900/50 dark:to-pink-800/30',
        sparkData: []
      },
      {
        title: 'Locations',
        value: uniqueLocations,
        icon: BarChart3,
        color: 'bg-yellow-500',
        textColor: 'text-yellow-500',
        bgColor: 'bg-yellow-50 dark:bg-yellow-950',
        gradient: 'from-yellow-50 to-yellow-100 dark:from-yellow-900/50 dark:to-yellow-800/30',
        sparkData: []
      },
      {
        title: 'Class Attendance',
        value: `${(totalCheckins * 100 / (totalClasses * 10)).toFixed(1)}%`,
        icon: LineChart,
        color: 'bg-teal-500', 
        textColor: 'text-teal-500',
        bgColor: 'bg-teal-50 dark:bg-teal-950',
        gradient: 'from-teal-50 to-teal-100 dark:from-teal-900/50 dark:to-teal-800/30',
        sparkData: []
      }
    ];
  }, [data]);

  return (
    <div className="mb-8 relative">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3,
              delay: index * 0.1,
              ease: [0.4, 0, 0.2, 1]
            }}
          >
            <Card className={cn(
              "relative h-[140px] group hover:scale-[1.02] transition-all duration-200",
              "before:absolute before:inset-0 before:rounded-xl",
              "before:bg-gradient-to-br before:from-white/40 dark:before:from-white/5",
              "before:to-transparent before:backdrop-blur-xl before:-z-10",
              "border border-white/20 dark:border-white/10",
              "bg-white/10 dark:bg-gray-950/30 backdrop-blur-xl",
              "shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.2)]",
              "overflow-hidden"
            )}>
              <div className="p-4 h-full flex flex-col relative z-10">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-300 tracking-wide">
                    {metric.title}
                  </p>
                  <div className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    metric.bgColor,
                    "group-hover:bg-opacity-70"
                  )}>
                    <metric.icon className={cn(
                      "h-3.5 w-3.5 transition-transform group-hover:scale-110",
                      metric.textColor
                    )} />
                  </div>
                </div>
                
                <div className="mt-1">
                  <div className={cn(
                    "text-2xl font-semibold tracking-tight",
                    "bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400",
                    "bg-clip-text text-transparent"
                  )}>
                    {typeof metric.value === 'number' ? (
                      showCountUp ? (
                        <CountUp
                          end={metric.value}
                          decimals={metric.title.includes('Avg') || metric.title.includes('Rate') ? 1 : 0}
                          delay={0.5}
                        />
                      ) : '0'
                    ) : (
                      metric.value
                    )}
                  </div>
                </div>

                <div className="mt-auto">
                  {metric.sparkData && metric.sparkData.length > 1 && (
                    <div className="h-[40px] -mx-1">
                      <Sparklines data={metric.sparkData} margin={0} height={40}>
                        <SparklinesLine 
                          style={{ 
                            stroke: `var(--${metric.textColor.replace('text-', '')})`,
                            strokeWidth: 1.5,
                            fill: 'none'
                          }} 
                        />
                        <SparklinesSpots 
                          size={2}
                          style={{ 
                            stroke: `var(--${metric.textColor.replace('text-', '')})`,
                            strokeWidth: 1.5,
                            fill: 'white'
                          }}
                        />
                      </Sparklines>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MetricsPanel;
