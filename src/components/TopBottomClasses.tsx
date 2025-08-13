
import React, { useState, useMemo } from 'react';
import { ProcessedData } from '@/types/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatIndianCurrency } from './MetricsPanel';
import { Calendar, Clock, MapPin, ChevronDown, TrendingUp, TrendingDown, Users, DollarSign } from 'lucide-react';

interface TopBottomClassesProps {
  data: ProcessedData[];
}

const TopBottomClasses: React.FC<TopBottomClassesProps> = ({ data }) => {
  const [groupByTrainer, setGroupByTrainer] = useState(false);
  const [metric, setMetric] = useState<'attendance' | 'revenue'>('attendance');
  const [displayCount, setDisplayCount] = useState(5);

  const getTopBottomClasses = () => {
    if (!data || data.length === 0) return { top: [], bottom: [] };

    if (groupByTrainer) {
      // Group by trainer and class type - data is already filtered from Dashboard
      const grouped = data.reduce((acc, item) => {
        const key = `${item.teacherName}-${item.cleanedClass}-${item.dayOfWeek}-${item.classTime}-${item.location}`;
        if (!acc[key]) {
          acc[key] = {
            teacherName: item.teacherName,
            cleanedClass: item.cleanedClass,
            dayOfWeek: item.dayOfWeek,
            classTime: item.classTime,
            location: item.location,
            totalCheckins: 0,
            totalRevenue: 0,
            totalOccurrences: 0,
          };
        }
        acc[key].totalCheckins += Number(item.totalCheckins);
        acc[key].totalRevenue += Number(item.totalRevenue);
        acc[key].totalOccurrences += Number(item.totalOccurrences);
        
        return acc;
      }, {} as Record<string, any>);

      const classes = Object.values(grouped).map(item => ({
        ...item,
        average: item.totalOccurrences > 0 ? item.totalCheckins / item.totalOccurrences : 0,
      }));

      // Filter out classes that don't meet criteria
      const validClasses = classes.filter(item => {
        return !item.cleanedClass.toLowerCase().includes('hosted') && 
               !item.cleanedClass.includes('Recovery') && 
               item.totalOccurrences >= 2;
      });

      return {
        top: validClasses
          .sort((a, b) => metric === 'attendance' 
            ? b.average - a.average 
            : b.totalRevenue - a.totalRevenue
          )
          .slice(0, displayCount),
        bottom: validClasses
          .sort((a, b) => metric === 'attendance'
            ? a.average - b.average
            : a.totalRevenue - b.totalRevenue
          )
          .slice(0, displayCount)
      };
    } else {
      // Group by class type, day, time and location - data is already filtered from Dashboard
      const grouped = data.reduce((acc, item) => {
        const key = `${item.cleanedClass}-${item.dayOfWeek}-${item.classTime}-${item.location}`;
        if (!acc[key]) {
          acc[key] = {
            cleanedClass: item.cleanedClass,
            dayOfWeek: item.dayOfWeek,
            classTime: item.classTime,
            location: item.location,
            totalCheckins: 0,
            totalRevenue: 0,
            totalOccurrences: 0,
            trainers: new Set(),
          };
        }
        acc[key].totalCheckins += Number(item.totalCheckins);
        acc[key].totalRevenue += Number(item.totalRevenue);
        acc[key].totalOccurrences += Number(item.totalOccurrences);
        acc[key].trainers.add(item.teacherName);
        
        return acc;
      }, {} as Record<string, any>);

      const classes = Object.values(grouped).map(item => ({
        ...item,
        trainers: Array.from(item.trainers),
        average: item.totalOccurrences > 0 ? item.totalCheckins / item.totalOccurrences : 0,
      }));

      // Filter out classes that don't meet criteria
      const validClasses = classes.filter(item => {
        return !item.cleanedClass.toLowerCase().includes('hosted') && 
               !item.cleanedClass.includes('Recovery') && 
               item.totalOccurrences >= 2;
      });

      return {
        top: validClasses
          .sort((a, b) => metric === 'attendance'
            ? b.average - a.average
            : b.totalRevenue - a.totalRevenue
          )
          .slice(0, displayCount),
        bottom: validClasses
          .sort((a, b) => metric === 'attendance'
            ? a.average - b.average
            : a.totalRevenue - b.totalRevenue
          )
          .slice(0, displayCount)
      };
    }
  };

  const { top, bottom } = getTopBottomClasses();
  const hasMoreData = useMemo(() => {
    const totalFilteredClasses = data.filter(item => 
      !item.cleanedClass.toLowerCase().includes('hosted') && 
      !item.cleanedClass.includes('Recovery') &&
      Number(item.totalOccurrences) >= 2
    ).length;
    
    return totalFilteredClasses > displayCount;
  }, [data, displayCount]);

  const handleShowMore = () => {
    setDisplayCount(prev => prev + 5);
  };

  const ClassCard = ({ item, index, isTop }: { item: any; index: number; isTop: boolean }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-background via-background to-muted/20 hover:from-primary/5 hover:to-secondary/5">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${
              isTop 
                ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg' 
                : 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg'
            }`}>
              {isTop ? index + 1 : displayCount - index}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                {item.cleanedClass}
              </h3>
              {groupByTrainer ? (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Users className="h-3 w-3" />
                  {item.teacherName}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Users className="h-3 w-3" />
                  {Array.isArray(item.trainers) 
                    ? `${item.trainers.length} trainer${item.trainers.length > 1 ? 's' : ''}` 
                    : ''}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${isTop ? 'text-emerald-600' : 'text-orange-600'}`}>
              {metric === 'attendance' 
                ? item.average.toFixed(1)
                : formatIndianCurrency(item.totalRevenue)
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {metric === 'attendance' ? 'Avg. Attendance' : 'Total Revenue'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {item.dayOfWeek}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {item.classTime}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {item.location}
            </span>
          </div>
          <Badge variant="secondary" className="font-medium">
            {item.totalOccurrences} classes
          </Badge>
        </div>
        
        <div className="mt-3 pt-3 border-t border-border/50">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Total check-ins:</span>
            <span className="font-medium">{item.totalCheckins}</span>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-muted-foreground">Total revenue:</span>
            <span className="font-medium">{formatIndianCurrency(item.totalRevenue)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Performance Analytics
          </h2>
          <p className="text-muted-foreground mt-2">
            Discover your top and bottom performing classes based on filtered data (minimum 2 classes)
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <Switch
              checked={groupByTrainer}
              onCheckedChange={setGroupByTrainer}
              id="trainer-switch"
              className="data-[state=checked]:bg-primary"
            />
            <Label htmlFor="trainer-switch" className="font-medium">
              Group by Trainer
            </Label>
          </div>
          
          <Tabs value={metric} onValueChange={(value) => setMetric(value as 'attendance' | 'revenue')} className="w-auto">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="attendance" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Attendance
              </TabsTrigger>
              <TabsTrigger value="revenue" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Revenue
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Top Performers */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 via-background to-green-50/50 dark:from-emerald-950/20 dark:via-background dark:to-green-950/10">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                <TrendingUp className="h-5 w-5" />
              </div>
              Top {displayCount} Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {top.length > 0 ? top.map((item, index) => (
              <ClassCard key={index} item={item} index={index} isTop={true} />
            )) : (
              <div className="p-8 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No classes found matching the applied filters (minimum 2 occurrences required)</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bottom Performers */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 via-background to-red-50/50 dark:from-orange-950/20 dark:via-background dark:to-red-950/10">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-orange-700 dark:text-orange-400">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                <TrendingDown className="h-5 w-5" />
              </div>
              Bottom {displayCount} Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {bottom.length > 0 ? bottom.map((item, index) => (
              <ClassCard key={index} item={item} index={index} isTop={false} />
            )) : (
              <div className="p-8 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No classes found matching the applied filters (minimum 2 occurrences required)</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {hasMoreData && (
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={handleShowMore}
            className="bg-background/80 backdrop-blur-sm hover:bg-primary/5 border-primary/20 hover:border-primary/40 transition-all duration-300"
          >
            Show More Classes <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default TopBottomClasses;
