import React, { useMemo, useState } from 'react';
import { ProcessedData } from '@/types/data';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { formatIndianCurrency } from '@/components/MetricsPanel';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin } from 'lucide-react';

interface TimelineViewProps {
  data: ProcessedData[];
  trainerAvatars: Record<string, string>;
}

type TimeGrouping = 'day' | 'week' | 'month' | 'quarter' | 'year';

const TimelineView: React.FC<TimelineViewProps> = ({ data, trainerAvatars }) => {
  const [period, setPeriod] = useState<string>('all');
  const [timeGrouping, setTimeGrouping] = useState<TimeGrouping>('day');

  // Get unique periods from data
  const periods = useMemo(() => {
    const uniquePeriods = new Set(data.map(item => item.period));
    return Array.from(uniquePeriods).filter(Boolean).sort();
  }, [data]);

  // Filter data based on selected period
  const filteredData = useMemo(() => {
    if (period === 'all') {
      return data;
    }
    return data.filter(item => item.period === period);
  }, [data, period]);

  // Group data by selected time grouping
  const groupedData = useMemo(() => {
    if (timeGrouping === 'day') {
      // Group by day of week
      return filteredData.reduce((acc: Record<string, ProcessedData[]>, item) => {
        const day = item.dayOfWeek || 'Unknown';
        if (!acc[day]) acc[day] = [];
        acc[day].push(item);
        return acc;
      }, {});
    } 
    else if (timeGrouping === 'week') {
      // Group by week number (approximation from date)
      return filteredData.reduce((acc: Record<string, ProcessedData[]>, item) => {
        if (!item.date) {
          if (!acc['Unknown Week']) acc['Unknown Week'] = [];
          acc['Unknown Week'].push(item);
          return acc;
        }
        
        const date = new Date(item.date);
        if (isNaN(date.getTime())) {
          if (!acc['Unknown Week']) acc['Unknown Week'] = [];
          acc['Unknown Week'].push(item);
          return acc;
        }
        
        // Calculate week number
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
        const weekNumber = Math.ceil(days / 7);
        
        const weekLabel = `Week ${weekNumber}, ${date.getFullYear()}`;
        if (!acc[weekLabel]) acc[weekLabel] = [];
        acc[weekLabel].push(item);
        
        return acc;
      }, {});
    }
    else if (timeGrouping === 'month') {
      // Group by month
      return filteredData.reduce((acc: Record<string, ProcessedData[]>, item) => {
        const monthYear = item.period || 'Unknown';
        if (!acc[monthYear]) acc[monthYear] = [];
        acc[monthYear].push(item);
        return acc;
      }, {});
    }
    else if (timeGrouping === 'quarter') {
      // Group by quarter
      return filteredData.reduce((acc: Record<string, ProcessedData[]>, item) => {
        if (!item.period) {
          if (!acc['Unknown Quarter']) acc['Unknown Quarter'] = [];
          acc['Unknown Quarter'].push(item);
          return acc;
        }
        
        const [month, year] = item.period.split('-');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthIndex = months.indexOf(month);
        
        let quarter = 0;
        if (monthIndex >= 0 && monthIndex <= 2) quarter = 1;
        else if (monthIndex >= 3 && monthIndex <= 5) quarter = 2;
        else if (monthIndex >= 6 && monthIndex <= 8) quarter = 3;
        else quarter = 4;
        
        const quarterLabel = `Q${quarter} ${year}`;
        if (!acc[quarterLabel]) acc[quarterLabel] = [];
        acc[quarterLabel].push(item);
        
        return acc;
      }, {});
    }
    else {
      // Group by year
      return filteredData.reduce((acc: Record<string, ProcessedData[]>, item) => {
        if (!item.period) {
          if (!acc['Unknown Year']) acc['Unknown Year'] = [];
          acc['Unknown Year'].push(item);
          return acc;
        }
        
        const year = item.period.split('-')[1];
        const yearLabel = `20${year}`;
        
        if (!acc[yearLabel]) acc[yearLabel] = [];
        acc[yearLabel].push(item);
        
        return acc;
      }, {});
    }
  }, [filteredData, timeGrouping]);

  // Calculate metrics for each time group
  const groupMetrics = useMemo(() => {
    const metrics: Record<string, { 
      totalCheckins: number; 
      totalClasses: number; 
      totalRevenue: number;
      uniqueClasses: number;
      uniqueInstructors: number;
    }> = {};
    
    Object.entries(groupedData).forEach(([group, items]) => {
      const uniqueClasses = new Set(items.map(item => item.cleanedClass));
      const uniqueInstructors = new Set(items.map(item => item.teacherName));
      
      metrics[group] = {
        totalCheckins: items.reduce((sum, item) => sum + item.totalCheckins, 0),
        totalClasses: items.reduce((sum, item) => sum + item.totalOccurrences, 0),
        totalRevenue: items.reduce((sum, item) => sum + Number(item.totalRevenue), 0),
        uniqueClasses: uniqueClasses.size,
        uniqueInstructors: uniqueInstructors.size
      };
    });
    
    return metrics;
  }, [groupedData]);

  // Animation variants with proper typing
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const periodVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 120
      }
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Sort grouped data by keys
  const sortedGroups = useMemo(() => {
    return Object.keys(groupedData).sort((a, b) => {
      // For day of week, use a specific order
      if (timeGrouping === 'day') {
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        return days.indexOf(a) - days.indexOf(b);
      }
      // For other groupings, just sort alphabetically
      return a.localeCompare(b);
    });
  }, [groupedData, timeGrouping]);

  return (
    <div className="p-4">
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
          <h3 className="text-lg font-semibold">Timeline View</h3>
          <div className="flex gap-2">
            <div className="w-48">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Periods</SelectItem>
                  {periods.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Tabs value={timeGrouping} onValueChange={(value) => setTimeGrouping(value as TimeGrouping)}>
              <TabsList>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="quarter">Quarter</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        <motion.div 
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {sortedGroups.map((groupKey, index) => (
            <motion.div 
              key={groupKey}
              className="relative"
              variants={periodVariants}
            >
              {/* Group header */}
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-16 md:w-24 text-right pe-4">
                  <span className="font-medium text-lg text-primary">{groupKey}</span>
                </div>
                
                <div className="flex-grow h-0.5 bg-primary/20 relative">
                  <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-primary/20 border-4 border-white dark:border-gray-900 flex items-center justify-center">
                    {index + 1}
                  </div>
                </div>
                
                <div className="flex-shrink-0 w-64 ps-4">
                  <div className="flex gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Classes:</span>{' '}
                      <span className="font-medium">{groupMetrics[groupKey].totalClasses}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Check-ins:</span>{' '}
                      <span className="font-medium">{groupMetrics[groupKey].totalCheckins}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Revenue:</span>{' '}
                      <span className="font-medium">{formatIndianCurrency(groupMetrics[groupKey].totalRevenue)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Group content */}
              <div className="ps-20 md:ps-28">
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  variants={periodVariants}
                >
                  {groupedData[groupKey]
                    .sort((a, b) => b.totalCheckins - a.totalCheckins)
                    .slice(0, 9)
                    .map((item, itemIndex) => (
                      <motion.div 
                        key={itemIndex}
                        variants={itemVariants}
                      >
                        <Card className="overflow-hidden hover:shadow-md transition-shadow border-l-4 border-l-primary/30">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none">
                                {item.dayOfWeek} {item.classTime}
                              </Badge>
                              <Badge variant="outline" className="flex items-center gap-1">
                                {item.totalOccurrences}x
                              </Badge>
                            </div>
                            
                            <h4 className="font-medium mb-2">{item.cleanedClass}</h4>
                            
                            <div className="flex items-center gap-2 mb-3">
                              <Avatar className="h-6 w-6">
                                {trainerAvatars[item.teacherName] ? (
                                  <AvatarImage src={trainerAvatars[item.teacherName]} alt={item.teacherName} />
                                ) : (
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    {getInitials(item.teacherName)}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <p className="text-xs text-muted-foreground">{item.teacherName}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="text-xs text-muted-foreground">Check-ins</p>
                                <p className="font-medium">{item.totalCheckins}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Revenue</p>
                                <p className="font-medium">{formatIndianCurrency(Number(item.totalRevenue))}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Avg. Attendance</p>
                                <p className="font-medium">
                                  {typeof item.classAverageIncludingEmpty === 'number'
                                    ? item.classAverageIncludingEmpty.toFixed(1)
                                    : item.classAverageIncludingEmpty}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Location</p>
                                <p className="font-medium truncate">{item.location}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                </motion.div>
                
                {groupedData[groupKey].length > 9 && (
                  <div className="text-center mt-4">
                    <Badge variant="outline" className="bg-slate-50 dark:bg-slate-900">
                      +{groupedData[groupKey].length - 9} more classes
                    </Badge>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default TimelineView;
