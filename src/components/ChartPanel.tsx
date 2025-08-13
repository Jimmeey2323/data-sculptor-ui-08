import React, { useState } from 'react';
import { ProcessedData, ChartConfig } from '@/types/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis } from 'recharts';
import { ChevronDown, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
interface ChartPanelProps {
  data: ProcessedData[];
}
const ChartPanel: React.FC<ChartPanelProps> = ({
  data
}) => {
  const [chartType, setChartType] = useState<ChartConfig['type']>('bar');
  const [primaryMetric, setPrimaryMetric] = useState<keyof ProcessedData>('totalCheckins');
  const [groupBy, setGroupBy] = useState<keyof ProcessedData>('cleanedClass');

  // COLORS
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a4de6c', '#d0ed57'];
  const metrics = [{
    key: 'totalCheckins',
    label: 'Total Check-ins'
  }, {
    key: 'totalOccurrences',
    label: 'Total Occurrences'
  }, {
    key: 'totalRevenue',
    label: 'Total Revenue'
  }, {
    key: 'totalCancelled',
    label: 'Total Cancellations'
  }, {
    key: 'totalEmpty',
    label: 'Empty Classes'
  }, {
    key: 'totalNonEmpty',
    label: 'Non-Empty Classes'
  }, {
    key: 'classAverageIncludingEmpty',
    label: 'Average Attendance (All)'
  }, {
    key: 'classAverageExcludingEmpty',
    label: 'Average Attendance (Non-Empty)'
  }, {
    key: 'totalTime',
    label: 'Total Hours'
  }, {
    key: 'totalNonPaid',
    label: 'Non-Paid Customers'
  }];
  const dimensions = [{
    key: 'cleanedClass',
    label: 'Class Type'
  }, {
    key: 'dayOfWeek',
    label: 'Day of Week'
  }, {
    key: 'location',
    label: 'Location'
  }, {
    key: 'teacherName',
    label: 'Instructor'
  }, {
    key: 'period',
    label: 'Period'
  }];

  // Prepare chart data by grouping
  const chartData = React.useMemo(() => {
    if (data.length === 0) return [];
    const groups = data.reduce((acc, item) => {
      const key = String(item[groupBy]);
      if (!acc[key]) {
        acc[key] = {
          name: key,
          value: 0,
          count: 0
        };
      }

      // Handle numeric conversion for different metrics
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
      return acc;
    }, {} as Record<string, {
      name: string;
      value: number;
      count: number;
    }>);
    return Object.values(groups).sort((a, b) => b.value - a.value).slice(0, 10); // Limit to top 10 for better visualization
  }, [data, groupBy, primaryMetric]);
  return <Card className="bg-white dark:bg-gray-950">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-4 pb-2">
        <CardTitle className="text-xl font-bold">Advanced Analytics</CardTitle>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Chart
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="px-6 pb-6 rounded-none">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="w-full md:w-1/3 space-y-1">
            <Label htmlFor="chartType">Chart Type</Label>
            <Select value={chartType} onValueChange={value => setChartType(value as ChartConfig['type'])}>
              <SelectTrigger id="chartType">
                <SelectValue placeholder="Select chart type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="pie">Pie Chart</SelectItem>
                <SelectItem value="scatter">Scatter Plot</SelectItem>
                <SelectItem value="donut">Donut Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-1/3 space-y-1">
            <Label htmlFor="primaryMetric">Metric</Label>
            <Select value={primaryMetric as string} onValueChange={value => setPrimaryMetric(value as keyof ProcessedData)}>
              <SelectTrigger id="primaryMetric">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                {metrics.map(metric => <SelectItem key={metric.key} value={metric.key}>
                    {metric.label}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-1/3 space-y-1">
            <Label htmlFor="groupBy">Group By</Label>
            <Select value={groupBy as string} onValueChange={value => setGroupBy(value as keyof ProcessedData)}>
              <SelectTrigger id="groupBy">
                <SelectValue placeholder="Select dimension" />
              </SelectTrigger>
              <SelectContent>
                {dimensions.map(dimension => <SelectItem key={dimension.key} value={dimension.key}>
                    {dimension.label}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="h-[500px] w-full">
          {chartData.length === 0 ? <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No data available for the selected filters.</p>
            </div> : chartType === 'bar' ? <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 80
          }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{
              fontSize: 12
            }} />
                <YAxis />
                <Tooltip formatter={value => {
              if (primaryMetric === 'totalRevenue') {
                return [`₹${Number(value).toLocaleString('en-IN')}`, 'Value'];
              }
              return [value, 'Value'];
            }} />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name={metrics.find(m => m.key === primaryMetric)?.label || primaryMetric} />
              </BarChart>
            </ResponsiveContainer> : chartType === 'line' ? <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 80
          }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={0} textAnchor="end" height={80} tick={{
              fontSize: 12
            }} />
                <YAxis />
                <Tooltip formatter={value => {
              if (primaryMetric === 'totalRevenue') {
                return [`₹${Number(value).toLocaleString('en-IN')}`, 'Value'];
              }
              return [value, 'Value'];
            }} />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{
              r: 8
            }} name={metrics.find(m => m.key === primaryMetric)?.label || primaryMetric} />
              </LineChart>
            </ResponsiveContainer> : chartType === 'pie' || chartType === 'donut' ? <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20
          }}>
                <Pie data={chartData} cx="50%" cy="50%" labelLine={true} outerRadius={chartType === 'pie' ? 150 : 150} innerRadius={chartType === 'donut' ? 100 : 0} fill="#8884d8" dataKey="value" nameKey="name" label={({
              name,
              percent
            }) => `${name}: ${(percent * 100).toFixed(1)}%`}>
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={value => {
              if (primaryMetric === 'totalRevenue') {
                return [`₹${Number(value).toLocaleString('en-IN')}`, 'Value'];
              }
              return [value, 'Value'];
            }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer> : <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 80
          }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" type="category" name={dimensions.find(d => d.key === groupBy)?.label || groupBy} angle={0} textAnchor="end" height={80} tick={{
              fontSize: 12
            }} />
                <YAxis dataKey="value" name={metrics.find(m => m.key === primaryMetric)?.label || primaryMetric} />
                <ZAxis dataKey="count" range={[50, 500]} name="Count" />
                <Tooltip formatter={(value, name) => {
              if (name === 'Value' && primaryMetric === 'totalRevenue') {
                return [`₹${Number(value).toLocaleString('en-IN')}`, metrics.find(m => m.key === primaryMetric)?.label || primaryMetric];
              }
              return [value, name];
            }} cursor={{
              strokeDasharray: '3 3'
            }} />
                <Legend />
                <Scatter name={metrics.find(m => m.key === primaryMetric)?.label || primaryMetric} data={chartData} fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>}
        </div>
      </CardContent>
    </Card>;
};
export default ChartPanel;
