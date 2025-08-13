import React, { useState } from 'react';
import { Search, Filter, X, Calendar, MapPin, User, Clock, ListChecks } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { FilterOptions, getUniqueValues } from '@/utils/filterUtils';
import { ProcessedData } from '@/types/data';

interface EnhancedDataFiltersProps {
  data: ProcessedData[];
  onApplyFilters: (filters: FilterOptions) => void;
}

const EnhancedDataFilters: React.FC<EnhancedDataFiltersProps> = ({ data, onApplyFilters }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTrainer, setSelectedTrainer] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  const trainers = getUniqueValues(data, 'teacherName');
  const classes = getUniqueValues(data, 'cleanedClass');
  const locations = getUniqueValues(data, 'location');
  const daysOfWeek = getUniqueValues(data, 'dayOfWeek');
  const periods = getUniqueValues(data, 'period');

  const handleApplyFilters = () => {
    const filters: FilterOptions = {
      searchTerm,
      selectedTrainer,
      selectedClass,
      selectedLocation,
      selectedDayOfWeek,
      selectedPeriod,
      dateRange,
    };
    onApplyFilters(filters);
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedTrainer('all');
    setSelectedClass('all');
    setSelectedLocation('all');
    setSelectedDayOfWeek('all');
    setSelectedPeriod('all');
    setDateRange({ from: undefined, to: undefined });
    
    const emptyFilters: FilterOptions = {};
    onApplyFilters(emptyFilters);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6 flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {isFilterOpen && <X className="h-4 w-4 ml-auto" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 md:w-96 p-6 space-y-4" align="end">
            <h4 className="text-sm font-medium">Filter Options</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Select value={selectedTrainer} onValueChange={setSelectedTrainer}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Trainer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Trainers</SelectItem>
                    {trainers.map((trainer) => (
                      <SelectItem key={trainer} value={trainer}>{trainer}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select value={selectedDayOfWeek} onValueChange={setSelectedDayOfWeek}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Days</SelectItem>
                    {daysOfWeek.map((day) => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Periods</SelectItem>
                    {periods.map((period) => (
                      <SelectItem key={period} value={period}>{period}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                Clear Filters
              </Button>
              <div>
                <Button variant="secondary" size="sm" onClick={() => setIsFilterOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleApplyFilters}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </CardContent>
    </Card>
  );
};

export default EnhancedDataFilters;
