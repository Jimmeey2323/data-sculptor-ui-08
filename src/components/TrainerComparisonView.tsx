import React, { useState, useMemo } from 'react';
import { ProcessedData } from '@/types/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatIndianCurrency } from '@/components/MetricsPanel';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { motion } from 'framer-motion';
import { Badge } from './ui/badge';

interface TrainerComparisonViewProps {
  data: ProcessedData[];
  trainerAvatars: Record<string, string>;
}

type ViewType = 'cards' | 'detailed' | 'chart' | 'radar';

const TrainerComparisonView: React.FC<TrainerComparisonViewProps> = ({ data, trainerAvatars }) => {
  const [comparisonMetric, setComparisonMetric] = useState<keyof ProcessedData>('totalCheckins');
  const [numTrainers, setNumTrainers] = useState<number>(5);
  const [viewType, setViewType] = useState<ViewType>('cards');

  const metrics = [
    { key: 'totalCheckins', label: 'Total Check-ins' },
    { key: 'totalOccurrences', label: 'Class Count' },
    { key: 'totalRevenue', label: 'Total Revenue' },
    { key: 'classAverageIncludingEmpty', label: 'Average Attendance' },
    { key: 'totalCancelled', label: 'Cancellations' },
  ];

  const trainerStats = useMemo(() => {
    // Group data by trainer
    const trainerMap = new Map<string, any>();

    data.forEach(item => {
      if (!trainerMap.has(item.teacherName)) {
        trainerMap.set(item.teacherName, {
          name: item.teacherName,
          totalCheckins: 0,
          totalOccurrences: 0,
          totalRevenue: 0,
          totalCancelled: 0,
          totalTime: 0,
          classAverageIncludingEmpty: 0,
          classAverageExcludingEmpty: 0,
          totalEmpty: 0,
          totalNonEmpty: 0,
          classCount: 0,
          classes: new Set(),
          topClass: '',
          topClassAttendance: 0,
          bottomClass: '',
          bottomClassAttendance: Number.MAX_SAFE_INTEGER,
          classData: {},
        });
      }

      const trainer = trainerMap.get(item.teacherName);
      trainer.totalCheckins += item.totalCheckins;
      trainer.totalOccurrences += item.totalOccurrences;
      trainer.totalRevenue += Number(item.totalRevenue);
      trainer.totalCancelled += item.totalCancelled;
      trainer.totalTime += item.totalTime;
      trainer.totalEmpty += item.totalEmpty;
      trainer.totalNonEmpty += item.totalNonEmpty;
      trainer.classes.add(item.cleanedClass);
      trainer.classCount += 1;

      // Track class-specific data for each trainer
      const classKey = item.cleanedClass;
      if (!trainer.classData[classKey]) {
        trainer.classData[classKey] = {
          className: classKey,
          totalCheckins: 0,
          totalOccurrences: 0,
          totalRevenue: 0,
          averageAttendance: 0
        };
      }
      trainer.classData[classKey].totalCheckins += item.totalCheckins;
      trainer.classData[classKey].totalOccurrences += item.totalOccurrences;
      trainer.classData[classKey].totalRevenue += Number(item.totalRevenue);

      // Track top and bottom performing classes for each trainer
      const avgAttendance = item.totalOccurrences > 0 ? item.totalCheckins / item.totalOccurrences : 0;
      if (avgAttendance > trainer.topClassAttendance) {
        trainer.topClassAttendance = avgAttendance;
        trainer.topClass = item.cleanedClass;
      }
      if (item.totalOccurrences > 0 && avgAttendance < trainer.bottomClassAttendance) {
        trainer.bottomClassAttendance = avgAttendance;
        trainer.bottomClass = item.cleanedClass;
      }
    });

    // Calculate averages and format data
    return Array.from(trainerMap.values()).map(trainer => {
      // Calculate average attendance
      const avgAttendance = trainer.totalOccurrences > 0 
        ? trainer.totalCheckins / trainer.totalOccurrences 
        : 0;
        
      // Calculate average excluding empty classes
      const avgExcludingEmpty = trainer.totalNonEmpty > 0
        ? trainer.totalCheckins / trainer.totalNonEmpty
        : 0;
      
      // Calculate average revenue per class
      const revenuePerClass = trainer.totalOccurrences > 0
        ? trainer.totalRevenue / trainer.totalOccurrences
        : 0;
        
      // Calculate cancellation rate
      const cancellationRate = (trainer.totalCheckins + trainer.totalCancelled) > 0
        ? (trainer.totalCancelled / (trainer.totalCheckins + trainer.totalCancelled)) * 100
        : 0;
      
      // Calculate class-specific averages
      Object.values(trainer.classData).forEach((classData: any) => {
        classData.averageAttendance = classData.totalOccurrences > 0 
          ? classData.totalCheckins / classData.totalOccurrences
          : 0;
      });
      
      return {
        ...trainer,
        classAverageIncludingEmpty: avgAttendance,
        classAverageExcludingEmpty: avgExcludingEmpty,
        revenuePerClass: revenuePerClass,
        cancellationRate: cancellationRate,
        classes: Array.from(trainer.classes),
        // Format class data as array for charts
        classDataArray: Object.values(trainer.classData),
      };
    })
    .sort((a, b) => {
      // Sort based on the selected metric
      if (comparisonMetric === 'classAverageIncludingEmpty') {
        return b.classAverageIncludingEmpty - a.classAverageIncludingEmpty;
      }
      return Number(b[comparisonMetric]) - Number(a[comparisonMetric]);
    })
    .slice(0, numTrainers);
  }, [data, comparisonMetric, numTrainers]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  const COLORS = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', 
    '#00C49F', '#FFBB28', '#FF8042', '#a4de6c', '#d0ed57'
  ];

  const formatValue = (value: number, metric: keyof ProcessedData): string => {
    if (metric === 'totalRevenue') {
      return formatIndianCurrency(value);
    }
    if (metric === 'classAverageIncludingEmpty') {
      return value.toFixed(1);
    }
    return value.toString();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100
      }
    }
  };

  // Custom tooltip for the bar chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      let formattedValue = value;
      
      if (comparisonMetric === 'totalRevenue') {
        formattedValue = formatIndianCurrency(value);
      } else if (comparisonMetric === 'classAverageIncludingEmpty') {
        formattedValue = parseFloat(value).toFixed(1);
      }
      
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border rounded shadow-md">
          <p className="font-bold">{label}</p>
          <p className="text-sm">
            <span className="font-medium">{metrics.find(m => m.key === comparisonMetric)?.label}: </span>
            {formattedValue}
          </p>
        </div>
      );
    }
    return null;
  };

  // Prepare radar chart data
  const radarData = useMemo(() => {
    // Normalize all metrics to a 0-100 scale for radar chart
    const maxValues = {
      totalCheckins: Math.max(...trainerStats.map(t => t.totalCheckins)),
      totalOccurrences: Math.max(...trainerStats.map(t => t.totalOccurrences)),
      totalRevenue: Math.max(...trainerStats.map(t => t.totalRevenue)),
      classAverageIncludingEmpty: Math.max(...trainerStats.map(t => t.classAverageIncludingEmpty)),
      classCount: Math.max(...trainerStats.map(t => t.classCount)),
    };
    
    // Create radar format data
    return trainerStats.map(trainer => ({
      name: trainer.name,
      "Check-ins": maxValues.totalCheckins ? (trainer.totalCheckins / maxValues.totalCheckins) * 100 : 0,
      "Classes": maxValues.totalOccurrences ? (trainer.totalOccurrences / maxValues.totalOccurrences) * 100 : 0,
      "Revenue": maxValues.totalRevenue ? (trainer.totalRevenue / maxValues.totalRevenue) * 100 : 0,
      "Avg. Attendance": maxValues.classAverageIncludingEmpty ? (trainer.classAverageIncludingEmpty / maxValues.classAverageIncludingEmpty) * 100 : 0,
      "Class Types": maxValues.classCount ? (trainer.classCount / maxValues.classCount) * 100 : 0,
    }));
  }, [trainerStats]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-xl font-bold">Trainer Comparison</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="w-full sm:w-56">
              <Select
                value={comparisonMetric as string}
                onValueChange={(value) => setComparisonMetric(value as keyof ProcessedData)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  {metrics.map(metric => (
                    <SelectItem key={metric.key as string} value={metric.key as string}>
                      {metric.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-40">
              <Select
                value={String(numTrainers)}
                onValueChange={(value) => setNumTrainers(Number(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Trainers to show" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Top 5</SelectItem>
                  <SelectItem value="10">Top 10</SelectItem>
                  <SelectItem value="15">Top 15</SelectItem>
                  <SelectItem value="20">Top 20</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Tabs value={viewType} onValueChange={(value) => setViewType(value as ViewType)}>
              <TabsList>
                <TabsTrigger value="cards">Cards</TabsTrigger>
                <TabsTrigger value="detailed">Detailed</TabsTrigger>
                <TabsTrigger value="chart">Chart</TabsTrigger>
                <TabsTrigger value="radar">Radar</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {viewType === 'cards' && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {trainerStats.map((trainer, index) => (
              <motion.div 
                key={index} 
                variants={itemVariants}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex items-center p-4 border-b">
                      <Avatar className="h-12 w-12 mr-4 border-2 border-primary/30">
                        {trainerAvatars[trainer.name] ? (
                          <AvatarImage src={trainerAvatars[trainer.name]} alt={trainer.name} />
                        ) : (
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {getInitials(trainer.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">{trainer.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {trainer.classCount} Classes · {trainer.classes.length} Unique Types
                        </p>
                      </div>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Check-ins</p>
                        <p className="font-medium">{trainer.totalCheckins}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Classes</p>
                        <p className="font-medium">{trainer.totalOccurrences}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                        <p className="font-medium">{formatIndianCurrency(trainer.totalRevenue)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Avg Attendance</p>
                        <p className="font-medium">{trainer.classAverageIncludingEmpty.toFixed(1)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {viewType === 'detailed' && (
          <div className="space-y-6">
            {trainerStats.map((trainer, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="p-4 bg-slate-50 dark:bg-slate-900 border-b">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      {trainerAvatars[trainer.name] ? (
                        <AvatarImage src={trainerAvatars[trainer.name]} alt={trainer.name} />
                      ) : (
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {getInitials(trainer.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{trainer.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {trainer.totalOccurrences} total classes · {trainer.totalTime.toFixed(0)} hours
                      </p>
                    </div>
                    <Badge className="ml-auto" variant="secondary">
                      Rank #{index + 1}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-2 gap-0 divide-x divide-y">
                    <div className="p-4">
                      <h4 className="text-sm font-medium mb-3">Performance Metrics</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Total Check-ins</p>
                          <p className="text-lg font-semibold">{trainer.totalCheckins}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Revenue</p>
                          <p className="text-lg font-semibold">{formatIndianCurrency(trainer.totalRevenue)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Avg. Attendance</p>
                          <p className="text-lg font-semibold">{trainer.classAverageIncludingEmpty.toFixed(1)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Revenue Per Class</p>
                          <p className="text-lg font-semibold">{formatIndianCurrency(trainer.revenuePerClass)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Cancellation Rate</p>
                          <p className="text-lg font-semibold">{trainer.cancellationRate.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Empty Classes</p>
                          <p className="text-lg font-semibold">{trainer.totalEmpty}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="text-sm font-medium mb-3">Class Breakdown</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Top Performing Class</p>
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{trainer.topClass}</p>
                            <Badge variant="outline" className="ml-2">{trainer.topClassAttendance.toFixed(1)} avg</Badge>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Bottom Performing Class</p>
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{trainer.bottomClass}</p>
                            <Badge variant="outline" className="ml-2">{trainer.bottomClassAttendance.toFixed(1)} avg</Badge>
                          </div>
                        </div>
                        <div className="border-t pt-3">
                          <p className="text-xs text-muted-foreground mb-2">Class Distribution</p>
                          <div className="h-20">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={trainer.classDataArray.slice(0, 5)}>
                                <XAxis dataKey="className" tick={false} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="totalCheckins" fill="#8884d8" name="Check-ins">
                                  {trainer.classDataArray.slice(0, 5).map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {viewType === 'chart' && (
          <div className="flex flex-col space-y-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={trainerStats}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tickFormatter={(value) => {
                      if (comparisonMetric === 'totalRevenue') {
                        return formatIndianCurrency(value).substring(0, 6);
                      } else if (comparisonMetric === 'classAverageIncludingEmpty') {
                        return value.toFixed(1);
                      }
                      return value;
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey={comparisonMetric} 
                    name={metrics.find(m => m.key === comparisonMetric)?.label} 
                  >
                    {trainerStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-base">Top Classes by Trainer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {trainerStats.slice(0, 5).map((trainer, idx) => (
                      <div key={idx} className="flex items-center justify-between border-b pb-2 last:border-0">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            {trainerAvatars[trainer.name] ? (
                              <AvatarImage src={trainerAvatars[trainer.name]} alt={trainer.name} />
                            ) : (
                              <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                {getInitials(trainer.name)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{trainer.name}</p>
                            <p className="text-xs text-muted-foreground">Best: {trainer.topClass}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{trainer.topClassAttendance.toFixed(1)}</p>
                          <p className="text-xs text-muted-foreground">avg. attendance</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-base">Revenue Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={trainerStats.slice(0, 5)}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={(value) => formatIndianCurrency(value).substring(0, 6)} />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value) => formatIndianCurrency(Number(value))} />
                        <Legend />
                        <Bar dataKey="totalRevenue" name="Total Revenue" fill="#82ca9d">
                          {trainerStats.slice(0, 5).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                        <Bar dataKey="revenuePerClass" name="Revenue Per Class" fill="#8884d8">
                          {trainerStats.slice(0, 5).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[(index + 5) % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {viewType === 'radar' && (
          <div className="h-[500px] flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tickCount={5} />
                <Tooltip 
                  formatter={(value) => {
                    // Check if value is a number before calling toFixed
                    return typeof value === 'number' ? [`${value.toFixed(1)}%`, ''] : [value, ''];
                  }}
                  labelFormatter={(label) => `${label}`}
                />
                <Legend />
                {["Check-ins", "Classes", "Revenue", "Avg. Attendance", "Class Types"].map((dataKey, index) => (
                  <Radar 
                    key={dataKey} 
                    name={dataKey} 
                    dataKey={dataKey} 
                    stroke={COLORS[index % COLORS.length]} 
                    fill={COLORS[index % COLORS.length]} 
                    fillOpacity={0.6} 
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrainerComparisonView;
