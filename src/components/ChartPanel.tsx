
import React, { useState } from 'react';
import { ProcessedData, ChartConfig } from '@/types/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { ChevronDown, Download, Share2, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, TrendingUp, Target, Zap, Sparkles, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface ChartPanelProps {
  data: ProcessedData[];
}

const ChartPanel: React.FC<ChartPanelProps> = ({ data }) => {
  const [chartType, setChartType] = useState<ChartConfig['type']>('bar');
  const [primaryMetric, setPrimaryMetric] = useState<keyof ProcessedData>('totalCheckins');
  const [groupBy, setGroupBy] = useState<keyof ProcessedData>('cleanedClass');
  const [showAnimation, setShowAnimation] = useState(true);
  const [selectedDataPoint, setSelectedDataPoint] = useState<any>(null);

  // Enhanced color palettes
  const COLORS = {
    primary: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'],
    gradient: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
    modern: ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'],
    sophisticated: ['#1e293b', '#475569', '#64748b', '#94a3b8', '#cbd5e1']
  };

  const [colorScheme, setColorScheme] = useState<keyof typeof COLORS>('gradient');

  const metrics = [
    { key: 'totalCheckins', label: 'Total Check-ins', icon: <Activity className="h-4 w-4" /> },
    { key: 'totalOccurrences', label: 'Total Occurrences', icon: <BarChart3 className="h-4 w-4" /> },
    { key: 'totalRevenue', label: 'Total Revenue', icon: <TrendingUp className="h-4 w-4" /> },
    { key: 'totalCancelled', label: 'Total Cancellations', icon: <Target className="h-4 w-4" /> },
    { key: 'totalEmpty', label: 'Empty Classes', icon: <Zap className="h-4 w-4" /> },
    { key: 'totalNonEmpty', label: 'Non-Empty Classes', icon: <Sparkles className="h-4 w-4" /> },
    { key: 'classAverageIncludingEmpty', label: 'Average Attendance (All)', icon: <Activity className="h-4 w-4" /> },
    { key: 'classAverageExcludingEmpty', label: 'Average Attendance (Non-Empty)', icon: <Activity className="h-4 w-4" /> },
    { key: 'totalTime', label: 'Total Hours', icon: <BarChart3 className="h-4 w-4" /> },
    { key: 'totalNonPaid', label: 'Non-Paid Customers', icon: <Target className="h-4 w-4" /> }
  ];

  const dimensions = [
    { key: 'cleanedClass', label: 'Class Type', icon: <BarChart3 className="h-4 w-4" /> },
    { key: 'dayOfWeek', label: 'Day of Week', icon: <Activity className="h-4 w-4" /> },
    { key: 'location', label: 'Location', icon: <Target className="h-4 w-4" /> },
    { key: 'teacherName', label: 'Instructor', icon: <Sparkles className="h-4 w-4" /> },
    { key: 'period', label: 'Period', icon: <TrendingUp className="h-4 w-4" /> }
  ];

  // Enhanced chart data preparation
  const chartData = React.useMemo(() => {
    if (data.length === 0) return [];
    
    const groups = data.reduce((acc, item) => {
      const key = String(item[groupBy]);
      if (!acc[key]) {
        acc[key] = {
          name: key,
          value: 0,
          count: 0,
          items: []
        };
      }

      let value = 0;
      if (primaryMetric === 'totalRevenue' || primaryMetric === 'totalTime') {
        value = parseFloat(String(item[primaryMetric]) || '0');
      } else if (primaryMetric === 'classAverageIncludingEmpty' || primaryMetric === 'classAverageExcludingEmpty') {
        const strValue = String(item[primaryMetric]);
        value = strValue === 'N/A' ? 0 : parseFloat(strValue);
      } else {
        value = Number(item[primaryMetric]);
      }
      
      acc[key].value += value;
      acc[key].count += 1;
      acc[key].items.push(item);
      return acc;
    }, {} as Record<string, { name: string; value: number; count: number; items: ProcessedData[] }>);
    
    return Object.values(groups)
      .sort((a, b) => b.value - a.value)
      .slice(0, 12)
      .map((item, index) => ({
        ...item,
        fill: COLORS[colorScheme][index % COLORS[colorScheme].length],
        percentage: ((item.value / Object.values(groups).reduce((sum, g) => sum + g.value, 0)) * 100).toFixed(1)
      }));
  }, [data, groupBy, primaryMetric, colorScheme]);

  const chartTypeOptions = [
    { id: 'bar', label: 'Bar Chart', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'line', label: 'Line Chart', icon: <LineChartIcon className="h-4 w-4" /> },
    { id: 'area', label: 'Area Chart', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'pie', label: 'Pie Chart', icon: <PieChartIcon className="h-4 w-4" /> },
    { id: 'donut', label: 'Donut Chart', icon: <Target className="h-4 w-4" /> },
    { id: 'radar', label: 'Radar Chart', icon: <Zap className="h-4 w-4" /> },
    { id: 'scatter', label: 'Scatter Plot', icon: <Activity className="h-4 w-4" /> }
  ];

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-muted-foreground text-lg">No data available for the selected filters.</p>
          </motion.div>
        </div>
      );
    }

    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 80 }
    };

    const formatTooltip = (value: any, name: string) => {
      if (primaryMetric === 'totalRevenue') {
        return [`₹${Number(value).toLocaleString('en-IN')}`, name];
      }
      return [Number(value).toLocaleString(), name];
    };

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart {...commonProps}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[colorScheme][0]} stopOpacity={0.9}/>
                  <stop offset="95%" stopColor={COLORS[colorScheme][0]} stopOpacity={0.6}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={80} 
                tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis tick={{ fill: 'hsl(var(--foreground))' }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                formatter={formatTooltip}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Bar 
                dataKey="value" 
                fill="url(#barGradient)"
                name={metrics.find(m => m.key === primaryMetric)?.label || primaryMetric}
                radius={[4, 4, 0, 0]}
                onMouseEnter={(data) => setSelectedDataPoint(data)}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart {...commonProps}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={COLORS[colorScheme][0]}/>
                  <stop offset="100%" stopColor={COLORS[colorScheme][1]}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis tick={{ fill: 'hsl(var(--foreground))' }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip formatter={formatTooltip} contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="url(#lineGradient)"
                strokeWidth={3}
                dot={{ fill: COLORS[colorScheme][0], strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, fill: COLORS[colorScheme][1] }}
                name={metrics.find(m => m.key === primaryMetric)?.label || primaryMetric}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart {...commonProps}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[colorScheme][0]} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={COLORS[colorScheme][0]} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis tick={{ fill: 'hsl(var(--foreground))' }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip formatter={formatTooltip} contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={COLORS[colorScheme][0]}
                fillOpacity={1}
                fill="url(#areaGradient)"
                strokeWidth={2}
                name={metrics.find(m => m.key === primaryMetric)?.label || primaryMetric}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
      case 'donut':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={chartData} 
                cx="50%" 
                cy="50%" 
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={chartType === 'pie' ? 140 : 140} 
                innerRadius={chartType === 'donut' ? 80 : 0}
                fill="#8884d8" 
                dataKey="value"
                animationBegin={showAnimation ? 0 : undefined}
                animationDuration={showAnimation ? 800 : 0}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.fill}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip formatter={formatTooltip} contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData.slice(0, 6)} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
              <PolarGrid stroke="hsl(var(--muted))" />
              <PolarAngleAxis 
                dataKey="name" 
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 'dataMax']}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              />
              <Radar
                name={metrics.find(m => m.key === primaryMetric)?.label || primaryMetric}
                dataKey="value"
                stroke={COLORS[colorScheme][0]}
                fill={COLORS[colorScheme][0]}
                fillOpacity={0.3}
                strokeWidth={2}
                dot={{ fill: COLORS[colorScheme][1], strokeWidth: 2, r: 4 }}
              />
              <Tooltip formatter={formatTooltip} contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }} />
            </RadarChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis 
                dataKey="name" 
                type="category"
                tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                dataKey="value"
                tick={{ fill: 'hsl(var(--foreground))' }}
                stroke="hsl(var(--muted-foreground))"
              />
              <ZAxis dataKey="count" range={[50, 400]} />
              <Tooltip formatter={formatTooltip} contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }} />
              <Scatter 
                name={metrics.find(m => m.key === primaryMetric)?.label || primaryMetric}
                data={chartData} 
                fill={COLORS[colorScheme][0]}
              />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="glass-card bg-background/90 backdrop-blur-xl shadow-2xl border border-primary/10 mb-6">
      <CardHeader className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-b border-primary/20">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="p-2 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg"
            >
              <BarChart3 className="h-6 w-6 text-primary-foreground" />
            </motion.div>
            Advanced Chart Analytics
          </CardTitle>
          
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="animation-toggle" className="text-sm font-medium">Animations</Label>
              <Switch
                id="animation-toggle"
                checked={showAnimation}
                onCheckedChange={setShowAnimation}
              />
            </div>
            
            <Select value={colorScheme} onValueChange={(value: keyof typeof COLORS) => setColorScheme(value)}>
              <SelectTrigger className="w-[140px] bg-background/80 border-primary/20">
                <SelectValue placeholder="Colors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primary</SelectItem>
                <SelectItem value="gradient">Gradient</SelectItem>
                <SelectItem value="modern">Modern</SelectItem>
                <SelectItem value="sophisticated">Sophisticated</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" className="bg-background/80 border-primary/20 hover:bg-primary/5">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="bg-background/80 border-primary/20 hover:bg-primary/5">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Enhanced Chart Type Selector */}
        <Tabs value={chartType} onValueChange={(value) => setChartType(value as ChartConfig['type'])} className="mb-6">
          <TabsList className="grid grid-cols-7 bg-muted/30 backdrop-blur-sm rounded-xl p-1 h-auto gap-1">
            {chartTypeOptions.map((option) => (
              <TabsTrigger 
                key={option.id} 
                value={option.id}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-3 py-2 flex flex-col items-center gap-1 min-h-[60px]"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {option.icon}
                </motion.div>
                <span className="text-xs font-medium">{option.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Enhanced Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="primaryMetric" className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Metric
            </Label>
            <Select value={primaryMetric as string} onValueChange={value => setPrimaryMetric(value as keyof ProcessedData)}>
              <SelectTrigger id="primaryMetric" className="bg-background/80 border-primary/20">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                {metrics.map(metric => (
                  <SelectItem key={metric.key} value={metric.key} className="flex items-center">
                    <div className="flex items-center gap-2">
                      {metric.icon}
                      {metric.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="groupBy" className="text-sm font-semibold flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Group By
            </Label>
            <Select value={groupBy as string} onValueChange={value => setGroupBy(value as keyof ProcessedData)}>
              <SelectTrigger id="groupBy" className="bg-background/80 border-primary/20">
                <SelectValue placeholder="Select dimension" />
              </SelectTrigger>
              <SelectContent>
                {dimensions.map(dimension => (
                  <SelectItem key={dimension.key} value={dimension.key}>
                    <div className="flex items-center gap-2">
                      {dimension.icon}
                      {dimension.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Chart Data Summary */}
        {chartData.length > 0 && (
          <div className="mb-4 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/20">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {chartData.length} data points
              </Badge>
              <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                {metrics.find(m => m.key === primaryMetric)?.label}
              </Badge>
              <Badge variant="secondary" className="bg-accent/10 text-accent">
                Grouped by {dimensions.find(d => d.key === groupBy)?.label}
              </Badge>
            </div>
          </div>
        )}
        
        {/* Enhanced Chart Container */}
        <motion.div 
          className="h-[500px] w-full bg-gradient-to-br from-background/50 to-muted/20 rounded-xl border border-primary/10 p-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${chartType}-${primaryMetric}-${groupBy}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {renderChart()}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Selected Data Point Details */}
        {selectedDataPoint && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-gradient-to-r from-accent/5 to-primary/5 rounded-xl border border-accent/20"
          >
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              Selected: {selectedDataPoint.name}
            </h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Value:</span>
                <span className="ml-2 font-semibold">{selectedDataPoint.value?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Count:</span>
                <span className="ml-2 font-semibold">{selectedDataPoint.count}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Percentage:</span>
                <span className="ml-2 font-semibold">{selectedDataPoint.percentage}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChartPanel;
