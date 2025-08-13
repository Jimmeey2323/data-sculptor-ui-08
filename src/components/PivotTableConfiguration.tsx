
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { SaveIcon, XIcon } from 'lucide-react';

interface PivotTableConfigurationProps {
  onSave: (config: any) => void;
  onClose: () => void;
}

const PivotTableConfiguration: React.FC<PivotTableConfigurationProps> = ({ onSave, onClose }) => {
  const [name, setName] = useState('');
  const [rowDimension, setRowDimension] = useState('teacherName');
  const [colDimension, setColDimension] = useState('dayOfWeek');
  const [metric, setMetric] = useState('totalCheckins');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showTotals, setShowTotals] = useState(true);
  const [timeGrouping, setTimeGrouping] = useState('none');
  
  const handleSave = () => {
    onSave({
      name,
      rowDimension,
      colDimension,
      metric,
      showHeatmap,
      showTotals,
      timeGrouping
    });
    onClose();
  };
  
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Configuration Name</Label>
        <Input 
          id="name" 
          placeholder="My Custom Pivot Table" 
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Row Dimension</Label>
          <Select value={rowDimension} onValueChange={setRowDimension}>
            <SelectTrigger>
              <SelectValue placeholder="Select row dimension" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="teacherName">Trainer</SelectItem>
              <SelectItem value="cleanedClass">Class Type</SelectItem>
              <SelectItem value="location">Location</SelectItem>
              <SelectItem value="dayOfWeek">Day of Week</SelectItem>
              <SelectItem value="period">Time Period</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1">
          <Label>Column Dimension</Label>
          <Select value={colDimension} onValueChange={setColDimension}>
            <SelectTrigger>
              <SelectValue placeholder="Select column dimension" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dayOfWeek">Day of Week</SelectItem>
              <SelectItem value="period">Time Period</SelectItem>
              <SelectItem value="teacherName">Trainer</SelectItem>
              <SelectItem value="cleanedClass">Class Type</SelectItem>
              <SelectItem value="location">Location</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Metric</Label>
          <Select value={metric} onValueChange={setMetric}>
            <SelectTrigger>
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="totalCheckins">Check-ins</SelectItem>
              <SelectItem value="totalRevenue">Revenue</SelectItem>
              <SelectItem value="totalOccurrences">Classes</SelectItem>
              <SelectItem value="classAverageIncludingEmpty">Average Attendance</SelectItem>
              <SelectItem value="totalCancelled">Cancellations</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1">
          <Label>Time Grouping</Label>
          <Select value={timeGrouping} onValueChange={setTimeGrouping}>
            <SelectTrigger>
              <SelectValue placeholder="Select time grouping" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
              <SelectItem value="year">Year</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 pt-2">
        <Switch 
          id="heatmap" 
          checked={showHeatmap}
          onCheckedChange={setShowHeatmap}
        />
        <Label htmlFor="heatmap">Enable Heatmap</Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch 
          id="totals" 
          checked={showTotals}
          onCheckedChange={setShowTotals}
        />
        <Label htmlFor="totals">Show Row/Column Totals</Label>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          <XIcon className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={handleSave}>
          <SaveIcon className="h-4 w-4 mr-2" />
          Save Configuration
        </Button>
      </div>
    </div>
  );
};

export default PivotTableConfiguration;
