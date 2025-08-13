
import React, { useState } from 'react';
import { ProcessedData } from '@/types/data';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { formatIndianCurrency } from '@/components/MetricsPanel';
import { ArrowUp, ArrowDown, Filter } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface PivotViewProps {
  data: ProcessedData[];
  trainerAvatars: Record<string, string>;
}

type PivotDimension = keyof ProcessedData;

interface PivotMetric {
  key: keyof ProcessedData;
  label: string;
  formatter?: (value: any) => string;
}

const PivotView: React.FC<PivotViewProps> = ({ data, trainerAvatars }) => {
  const { toast } = useToast();
  const [rowDimension, setRowDimension] = useState<PivotDimension>('cleanedClass');
  const [colDimension, setColDimension] = useState<PivotDimension>('dayOfWeek');
  const [metric, setMetric] = useState<PivotDimension>('totalCheckins');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [timeGrouping, setTimeGrouping] = useState('none');
  const [displayFormat, setDisplayFormat] = useState<'raw' | 'formatted'>('formatted');

  const dimensions: { key: PivotDimension; label: string }[] = [
    { key: 'cleanedClass', label: 'Class Type' },
    { key: 'dayOfWeek', label: 'Day of Week' },
    { key: 'classTime', label: 'Class Time' },
    { key: 'location', label: 'Location' },
    { key: 'teacherName', label: 'Instructor' },
    { key: 'period', label: 'Period' },
  ];

  const metrics: PivotMetric[] = [
    { key: 'totalCheckins', label: 'Check-ins' },
    { key: 'totalOccurrences', label: 'Classes' },
    { key: 'totalRevenue', label: 'Revenue', formatter: value => formatIndianCurrency(Number(value)) },
    { key: 'classAverageIncludingEmpty', label: 'Avg. Attendance', formatter: value => (typeof value === 'number' ? value.toFixed(1) : String(value)) },
    { key: 'totalCancelled', label: 'Cancellations' }
  ];

  // Get unique values for column dimension
  const columnValues = React.useMemo(() => {
    const uniqueValues = new Set(data.map(item => String(item[colDimension])));
    return Array.from(uniqueValues).sort();
  }, [data, colDimension]);

  // Create pivot table data
  const pivotData = React.useMemo(() => {
    // Group data by row dimension
    const rowGroups = new Map<string, ProcessedData[]>();
    
    data.forEach(item => {
      const rowKey = String(item[rowDimension]);
      if (!rowGroups.has(rowKey)) {
        rowGroups.set(rowKey, []);
      }
      rowGroups.get(rowKey)!.push(item);
    });
    
    // Calculate metrics for each cell
    const result = Array.from(rowGroups.entries()).map(([rowKey, items]) => {
      const row: any = { rowKey };
      
      // Calculate row total
      const rowTotal = items.reduce((sum, item) => {
        let value = item[metric];
        // Convert string to number if needed
        if (typeof value === 'string' && value !== 'N/A') {
          value = parseFloat(value);
        }
        if (typeof value === 'number') {
          return sum + value;
        }
        return sum;
      }, 0);
      
      row.total = rowTotal;
      
      // Calculate metrics for each column
      columnValues.forEach(colKey => {
        const cellItems = items.filter(item => String(item[colDimension]) === colKey);
        
        if (cellItems.length > 0) {
          const cellValue = cellItems.reduce((sum, item) => {
            let value = item[metric];
            // Convert string to number if needed
            if (typeof value === 'string' && value !== 'N/A') {
              value = parseFloat(value);
            }
            if (typeof value === 'number') {
              return sum + value;
            }
            return sum;
          }, 0);
          
          row[colKey] = cellValue;
        } else {
          row[colKey] = null;
        }
      });
      
      return row;
    });
    
    // Sort rows by total
    return result.sort((a, b) => {
      if (sortDirection === 'asc') {
        return a.total - b.total;
      } else {
        return b.total - a.total;
      }
    });
  }, [data, rowDimension, colDimension, metric, columnValues, sortDirection]);

  // Calculate column totals
  const columnTotals = React.useMemo(() => {
    const totals: Record<string, number> = { total: 0 };
    
    columnValues.forEach(colKey => {
      totals[colKey] = pivotData.reduce((sum, row) => sum + (row[colKey] || 0), 0);
    });
    
    totals.total = pivotData.reduce((sum, row) => sum + row.total, 0);
    
    return totals;
  }, [pivotData, columnValues]);

  // Format cell value
  const formatCellValue = (value: any): string => {
    if (value === null || value === undefined) {
      return '-';
    }
    
    if (displayFormat === 'raw') {
      return String(value);
    }
    
    const selectedMetric = metrics.find(m => m.key === metric);
    if (selectedMetric?.formatter) {
      return selectedMetric.formatter(value);
    }
    
    return String(value);
  };
  
  // Calculate cell background color based on value (heatmap)
  const getCellBackground = (value: any, columnMax: number): string => {
    if (!showHeatmap || value === null || value === 0 || columnMax === 0) {
      return '';
    }
    
    // Calculate color intensity based on the proportion of the max value
    const intensity = Math.min(0.9, Math.max(0.1, value / columnMax));
    return `bg-primary/[${intensity.toFixed(2)}]`;
  };
  
  // Get column maximums for heatmap coloring
  const columnMaxValues = React.useMemo(() => {
    const maxValues: Record<string, number> = {};
    
    columnValues.forEach(colKey => {
      maxValues[colKey] = Math.max(...pivotData.map(row => row[colKey] || 0));
    });
    
    maxValues.total = Math.max(...pivotData.map(row => row.total));
    
    return maxValues;
  }, [pivotData, columnValues]);
  
  // Get avatar for row dimension
  const getRowAvatar = (rowKey: string) => {
    if (rowDimension === 'teacherName' && trainerAvatars[rowKey]) {
      return (
        <Avatar className="h-6 w-6 mr-2 inline-block">
          <AvatarImage src={trainerAvatars[rowKey]} alt={rowKey} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {rowKey.split(' ').map(part => part.charAt(0)).join('').toUpperCase().slice(0, 2)}
          </AvatarFallback>
        </Avatar>
      );
    }
    return null;
  };

  const savePivotConfiguration = () => {
    const config = {
      name: `${dimensions.find(d => d.key === rowDimension)?.label} by ${dimensions.find(d => d.key === colDimension)?.label}`,
      rowDimension,
      colDimension,
      metric,
      sortDirection,
      showHeatmap,
      timeGrouping,
      displayFormat
    };
    
    let savedConfigs = [];
    const storedConfigs = localStorage.getItem('pivotConfigs');
    if (storedConfigs) {
      try {
        savedConfigs = JSON.parse(storedConfigs);
      } catch (error) {
        console.error('Error parsing saved configurations:', error);
      }
    }
    
    savedConfigs.push(config);
    localStorage.setItem('pivotConfigs', JSON.stringify(savedConfigs));
    
    toast({
      title: "Configuration Saved",
      description: "Your pivot table configuration has been saved."
    });
  };

  return (
    <div className="p-4">
      <div className="mb-6 flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="space-y-1 w-full sm:w-48">
            <Label htmlFor="rowDimension">Row Dimension</Label>
            <Select value={rowDimension} onValueChange={(value) => setRowDimension(value as PivotDimension)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose row dimension" />
              </SelectTrigger>
              <SelectContent>
                {dimensions.map((dim) => (
                  <SelectItem key={dim.key} value={dim.key}>
                    {dim.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1 w-full sm:w-48">
            <Label htmlFor="colDimension">Column Dimension</Label>
            <Select value={colDimension} onValueChange={(value) => setColDimension(value as PivotDimension)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose column dimension" />
              </SelectTrigger>
              <SelectContent>
                {dimensions.map((dim) => (
                  <SelectItem key={dim.key} value={dim.key}>
                    {dim.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1 w-full sm:w-48">
            <Label htmlFor="metric">Metric</Label>
            <Select value={metric} onValueChange={(value) => setMetric(value as PivotDimension)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose metric" />
              </SelectTrigger>
              <SelectContent>
                {metrics.map((m) => (
                  <SelectItem key={m.key} value={m.key}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center space-x-2 whitespace-nowrap">
            <Switch 
              checked={showHeatmap} 
              onCheckedChange={setShowHeatmap} 
              id="heatmap" 
            />
            <Label htmlFor="heatmap">Heatmap</Label>
          </div>
          
          <Button onClick={savePivotConfiguration} variant="outline" className="border-[#E0E6F0]">
            Save Configuration
          </Button>
          
          <button
            onClick={() => setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))}
            className="flex items-center space-x-1 px-3 py-1.5 bg-primary/5 hover:bg-primary/10 rounded-md"
          >
            <span className="text-sm">Sort</span>
            {sortDirection === 'asc' ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      
      <Card className="overflow-x-auto border-[#E0E6F0] rounded-xl">
        <div className="min-w-[800px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="border-r font-semibold">
                  <div className="flex items-center justify-between">
                    <span>{dimensions.find(d => d.key === rowDimension)?.label}</span>
                  </div>
                </TableHead>
                {columnValues.map((colKey) => (
                  <TableHead key={colKey} className="text-center font-medium">
                    {colKey}
                  </TableHead>
                ))}
                <TableHead className="text-center bg-gray-50 dark:bg-gray-900 font-semibold">
                  Total
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pivotData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell className="border-r font-medium">
                    {getRowAvatar(row.rowKey)}
                    {row.rowKey}
                  </TableCell>
                  {columnValues.map((colKey) => (
                    <TableCell 
                      key={colKey} 
                      className={`text-center ${getCellBackground(row[colKey], columnMaxValues[colKey])}`}
                    >
                      {formatCellValue(row[colKey])}
                    </TableCell>
                  ))}
                  <TableCell className={`text-center font-semibold bg-gray-50 dark:bg-gray-900 ${getCellBackground(row.total, columnMaxValues.total)}`}>
                    {formatCellValue(row.total)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-gray-100 dark:bg-gray-800 font-semibold">
                <TableCell className="border-r">Total</TableCell>
                {columnValues.map((colKey) => (
                  <TableCell key={colKey} className="text-center">
                    {formatCellValue(columnTotals[colKey])}
                  </TableCell>
                ))}
                <TableCell className="text-center bg-gray-200 dark:bg-gray-700">
                  {formatCellValue(columnTotals.total)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default PivotView;
