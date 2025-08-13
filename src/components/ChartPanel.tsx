
import React, { useState } from 'react';
import { ProcessedData, ChartConfig } from '@/types/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  ScatterChart, 
  Scatter, 
  ZAxis,
  Area,
  AreaChart,
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  Download, 
  Share2, 
  TrendingUp, 
  BarChart3, 
  PieChart as PieChartIcon,
  Activity,
  Zap,
  Target,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ChartPanelProps {
  data: ProcessedData[];
}

const ChartPanel: React.FC<ChartPanelProps> = ({ data }) => {
  const [chartType, setChartType] = useState<ChartConfig['type']>('bar');
  const [primaryMetric, setPrimaryMetric] = useState<keyof ProcessedData>('totalCheckins');
  const [secondaryMetric, setSecondaryMetric] = useState<keyof ProcessedData>('totalRevenue');
  const [groupBy, setGroupBy] = useState<keyof ProcessedData>('cleanedClass');
  const [showAnimation, setShowAnimation] = useState(true);
  const [show3D, setShow3D] = useState(false);
  const [showSecondary, setShowSecondary] = useState(false);

  const COLORS = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', 
    '#00C49F', '#FFBB28', '#FF8042', '#a4de6c', '#d0ed57',
    '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb', '#dda0dd'
  ];

  const GRADIENT_COLORS = [
    ['#8884d8', '#4c51bf'],
    ['#82ca9d', '#38a169'],
    ['#ffc658', '#d69e2e'],
    ['#ff8042', '#e53e3e'],
    ['#0088FE', '#3182ce']
  ];

  const metrics = [
    { key: 'totalCheckins', label: 'Total Check-ins', icon: Activity },
    { key: 'totalOccurrences', label: 'Total Occurrences', icon: BarChart3 },
    { key: 'totalRevenue', label: 'Total Revenue', icon: TrendingUp },
    { key: 'totalCancelled', label: 'Total Cancellations', icon: Target },
    { key: 'totalEmpty', label: 'Empty Classes', icon: Eye },
    { key: 'totalNonEmpty', label: 'Non-Empty Classes', icon: EyeOff },
    { key: 'classAverageIncludingEmpty', label: 'Average Attendance (All)', icon: Activity },
    { key: 'classAverageExcludingEmpty', label: 'Average Attendance (Non-Empty)', icon: Zap },
    { key: 'totalTime', label: 'Total Hours', icon: Activity },
    { key: 'totalNonPaid', label: 'Non-Paid Customers', icon: Target }
  ];

  const dimensions = [
    { key: 'cleanedClass', label: 'Class Type' },
    { key: 'dayOfWeek', label: 'Day of Week' },
    { key: 'location', label: 'Location' },
    { key: 'teacherName', label: 'Instructor' },
    { key: 'period', label: 'Period' }
  ];

  // Enhanced chart data preparation
  const chartData = React.useMemo(() => {
    if (data.length === 0) return [];
    
    const groups = data.reduce((acc, item) => {
      const key = String(item[groupBy]);
      if (!acc[key]) {
        acc[key] = {
          name: key,
          primary: 0,
          secondary: 0,
          count: 0
        };
      }

      // Handle numeric conversion for different metrics
      let primaryValue = 0;
      let secondaryValue = 0;
      
      if (primaryMetric === 'totalRevenue' || primaryMetric === 'totalTime') {
        primaryValue = parseFloat(String(item[primaryMetric]) || '0');
      } else if (primaryMetric === 'classAverageIncludingEmpty' || primaryMetric === 'classAverageExcludingEmpty') {
        const strValue = String(item[primaryMetric]);
        primaryValue = strValue === 'N/A' ? 0 : parseFloat(strValue);
      } else {
        primaryValue = Number(item[primaryMetric]);
      }

      if (secondaryMetric === 'totalRevenue' || secondaryMetric === 'totalTime') {
        secondaryValue = parseFloat(String(item[secondaryMetric]) || '0');
      } else if (secondaryMetric === 'classAverageIncludingEmpty' || secondaryMetric === 'classAverageExcludingEmpty') {
        const strValue = String(item[secondaryMetric]);
        secondaryValue = strValue === 'N/A' ? 0 : parseFloat(strValue);
      } else {
        secondaryValue = Number(item[secondaryMetric]);
      }
      
      acc[key].primary += primaryValue;
      acc[key].secondary += secondaryValue;
      acc[key].count += 1;
      return acc;
    }, {} as Record<string, { name: string; primary: number; secondary: number; count: number }>);

    return Object.values(groups)
      .sort((a, b) => b.primary - a.primary)
      .slice(0, 15); // Limit to top 15 for better visualization
  }, [data, groupBy, primaryMetric, secondaryMetric]);

  const formatValue = (value: number, metric: keyof ProcessedData) => {
    if (metric === 'totalRevenue') {
      return `₹${value.toLocaleString('en-IN')}`;
    }
    if (metric === 'classAverageIncludingEmpty' || metric === 'classAverageExcludingEmpty') {
      return value.toFixed(1);
    }
    return value.toLocaleString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-gray-800/95 p-4 border border-border/50 rounded-lg shadow-xl backdrop-blur-sm">
          <p className="font-bold text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-muted-foreground">
                {entry.name === 'primary' ? metrics.find(m => m.key === primaryMetric)?.label : 
                 entry.name === 'secondary' ? metrics.find(m => m.key === secondaryMetric)?.label : 
                 entry.name}:
              </span>
              <span className="font-medium text-foreground">
                {entry.name === 'primary' ? formatValue(entry.value, primaryMetric) :
                 entry.name === 'secondary' ? formatValue(entry.value, secondaryMetric) :
                 formatValue(entry.value, primaryMetric)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 80 }
    };

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart {...commonProps}>
              <defs>
                {GRADIENT_COLORS.map((colors, index) => (
                  <linearGradient key={index} id={`gradient${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors[0]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={colors[1]} stopOpacity={0.6}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={80} 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis stroke="#6b7280" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="primary" 
                name={metrics.find(m => m.key === primaryMetric)?.label}
                fill="url(#gradient0)"
                radius={[4, 4, 0, 0]}
                animationDuration={showAnimation ? 1000 : 0}
              />
              {showSecondary && (
                <Bar 
                  dataKey="secondary" 
                  name={metrics.find(m => m.key === secondaryMetric)?.label}
                  fill="url(#gradient1)"
                  radius={[4, 4, 0, 0]}
                  animationDuration={showAnimation ? 1200 : 0}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart {...commonProps}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={80} 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis stroke="#6b7280" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="primary" 
                stroke="#8884d8" 
                strokeWidth={3}
                dot={{ fill: '#8884d8', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#8884d8', strokeWidth: 2 }}
                name={metrics.find(m => m.key === primaryMetric)?.label}
                animationDuration={showAnimation ? 1000 : 0}
              />
              {showSecondary && (
                <Line 
                  type="monotone" 
                  dataKey="secondary" 
                  stroke="#82ca9d" 
                  strokeWidth={3}
                  dot={{ fill: '#82ca9d', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#82ca9d', strokeWidth: 2 }}
                  name={metrics.find(m => m.key === secondaryMetric)?.label}
                  animationDuration={showAnimation ? 1200 : 0}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart {...commonProps}>
              <defs>
                <linearGradient id="areaGradient1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="areaGradient2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={80} 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis stroke="#6b7280" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="primary" 
                stroke="#8884d8" 
                fillOpacity={1} 
                fill="url(#areaGradient1)"
                name={metrics.find(m => m.key === primaryMetric)?.label}
                animationDuration={showAnimation ? 1000 : 0}
              />
              {showSecondary && (
                <Area 
                  type="monotone" 
                  dataKey="secondary" 
                  stroke="#82ca9d" 
                  fillOpacity={1} 
                  fill="url(#areaGradient2)"
                  name={metrics.find(m => m.key === secondaryMetric)?.label}
                  animationDuration={showAnimation ? 1200 : 0}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
      case 'donut':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <Pie 
                data={chartData} 
                cx="50%" 
                cy="50%" 
                labelLine={false}
                outerRadius={chartType === 'pie' ? 150 : 150}
                innerRadius={chartType === 'donut' ? 100 : 0}
                fill="#8884d8" 
                dataKey="primary"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                animationDuration={showAnimation ? 1000 : 0}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'radar':
        const radarData = chartData.slice(0, 6).map(item => ({
          name: item.name,
          value: item.primary,
          fullMark: Math.max(...chartData.map(d => d.primary))
        }));
        
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid gridType="polygon" />
              <PolarAngleAxis dataKey="name" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tickCount={5} />
              <Radar 
                name={metrics.find(m => m.key === primaryMetric)?.label}
                dataKey="value" 
                stroke="#8884d8" 
                fill="#8884d8" 
                fillOpacity={0.3}
                strokeWidth={2}
                animationDuration={showAnimation ? 1000 : 0}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="border-0 shadow-2xl bg-gradient-to-br from-white/95 to-slate-50/80 dark:from-gray-900/95 dark:to-gray-800/80 backdrop-blur-lg">
      <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-t-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="p-2 bg-primary/20 rounded-full"
            >
              <BarChart3 className="h-6 w-6 text-primary" />
            </motion.div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Interactive Analytics Charts
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Advanced data visualization with real-time insights
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Enhanced Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mt-4">
          <div className="space-y-1">
            <Label htmlFor="chartType" className="text-xs font-medium">Chart Type</Label>
            <Select value={chartType} onValueChange={(value) => setChartType(value as ChartConfig['type'])}>
              <SelectTrigger id="chartType" className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">📊 Bar Chart</SelectItem>
                <SelectItem value="line">📈 Line Chart</SelectItem>
                <SelectItem value="area">📊 Area Chart</SelectItem>
                <SelectItem value="pie">🥧 Pie Chart</SelectItem>
                <SelectItem value="donut">🍩 Donut Chart</SelectItem>
                <SelectItem value="radar">🎯 Radar Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="primaryMetric" className="text-xs font-medium">Primary Metric</Label>
            <Select value={primaryMetric as string} onValueChange={(value) => setPrimaryMetric(value as keyof ProcessedData)}>
              <SelectTrigger id="primaryMetric" className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {metrics.map(metric => (
                  <SelectItem key={metric.key} value={metric.key}>
                    <div className="flex items-center gap-2">
                      <metric.icon className="h-3 w-3" />
                      {metric.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="secondaryMetric" className="text-xs font-medium">Secondary Metric</Label>
            <Select value={secondaryMetric as string} onValueChange={(value) => setSecondaryMetric(value as keyof ProcessedData)}>
              <SelectTrigger id="secondaryMetric" className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {metrics.map(metric => (
                  <SelectItem key={metric.key} value={metric.key}>
                    <div className="flex items-center gap-2">
                      <metric.icon className="h-3 w-3" />
                      {metric.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="groupBy" className="text-xs font-medium">Group By</Label>
            <Select value={groupBy as string} onValueChange={(value) => setGroupBy(value as keyof ProcessedData)}>
              <SelectTrigger id="groupBy" className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dimensions.map(dimension => (
                  <SelectItem key={dimension.key} value={dimension.key}>
                    {dimension.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">Options</Label>
            <div className="flex items-center space-x-2">
              <Switch 
                id="animation" 
                checked={showAnimation} 
                onCheckedChange={setShowAnimation}
                className="data-[state=checked]:bg-primary"
              />
              <Label htmlFor="animation" className="text-xs">Animation</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium invisible">.</Label>
            <div className="flex items-center space-x-2">
              <Switch 
                id="secondary" 
                checked={showSecondary} 
                onCheckedChange={setShowSecondary}
                className="data-[state=checked]:bg-primary"
              />
              <Label htmlFor="secondary" className="text-xs">Dual Metrics</Label>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="h-[600px] w-full">
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <PieChartIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">No data available for the selected filters.</p>
                <p className="text-muted-foreground text-sm">Try adjusting your filters or grouping options.</p>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="h-full"
            >
              {renderChart()}
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartPanel;
