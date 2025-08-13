
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ProcessedData, FilterOption, SortOption } from '@/types/data';
import { DateRangePicker, DateRange } from '@/components/DateRangePicker';
import { 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Trash, 
  Filter, 
  ArrowUp, 
  ArrowDown,
  Calendar
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Card, CardContent } from "@/components/ui/card";

interface DataFiltersProps {
  onFilterChange: (filters: FilterOption[]) => void;
  onSortChange: (sorts: SortOption[]) => void;
  onDateRangeChange?: (dateRange: DateRange | undefined) => void;
  data: ProcessedData[];
  activeFilters: number;
  dateRange?: DateRange;
}

interface Filter {
  id: string;
  field: keyof ProcessedData;
  operator: 'contains' | 'equals' | 'starts' | 'ends' | 'greater' | 'less' | 'after' | 'before' | 'on' | 'in';
  value: string;
}

interface Sort {
  id: string;
  field: keyof ProcessedData;
  direction: 'asc' | 'desc';
}

const DataFilters: React.FC<DataFiltersProps> = ({ 
  onFilterChange, 
  onSortChange,
  onDateRangeChange, 
  data,
  activeFilters,
  dateRange
}) => {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [sorts, setSorts] = useState<Sort[]>([]);
  const [expandedSection, setExpandedSection] = useState<string | null>('filters');

  // Get unique values for certain fields to provide dropdown options
  const uniquePeriods = [...new Set(data.map(item => item.period))].filter(Boolean).sort();
  const uniqueLocations = [...new Set(data.map(item => item.location))].filter(Boolean).sort();
  const uniqueClasses = [...new Set(data.map(item => item.cleanedClass))].filter(Boolean).sort();
  const uniqueTeachers = [...new Set(data.map(item => item.teacherName))].filter(Boolean).sort();

  const addFilter = () => {
    const newFilter = {
      id: `filter-${Date.now()}`,
      field: 'teacherName' as keyof ProcessedData,
      operator: 'contains' as const,
      value: ''
    };
    setFilters([...filters, newFilter]);
  };

  const updateFilter = (id: string, field: keyof Filter, value: any) => {
    const updatedFilters = filters.map(filter => {
      if (filter.id === id) {
        return { ...filter, [field]: value };
      }
      return filter;
    });
    setFilters(updatedFilters);
    
    // Convert filters to FilterOption and notify parent
    const filterOptions = updatedFilters.filter(f => f.value !== '').map(({field, operator, value}) => ({
      field,
      operator,
      value
    }));
    onFilterChange(filterOptions);
  };

  const removeFilter = (id: string) => {
    const updatedFilters = filters.filter(filter => filter.id !== id);
    setFilters(updatedFilters);
    
    // Convert filters to FilterOption and notify parent
    const filterOptions = updatedFilters.map(({field, operator, value}) => ({
      field,
      operator,
      value
    }));
    onFilterChange(filterOptions);
  };

  const addSort = () => {
    const newSort = {
      id: `sort-${Date.now()}`,
      field: 'totalCheckins' as keyof ProcessedData,
      direction: 'desc' as const
    };
    setSorts([...sorts, newSort]);
  };

  const updateSort = (id: string, field: keyof Sort, value: any) => {
    const updatedSorts = sorts.map(sort => {
      if (sort.id === id) {
        return { ...sort, [field]: value };
      }
      return sort;
    });
    setSorts(updatedSorts);
    
    // Convert sorts to SortOption and notify parent
    const sortOptions = updatedSorts.map(({field, direction}) => ({
      field,
      direction
    }));
    onSortChange(sortOptions);
  };

  const removeSort = (id: string) => {
    const updatedSorts = sorts.filter(sort => sort.id !== id);
    setSorts(updatedSorts);
    
    // Convert sorts to SortOption and notify parent
    const sortOptions = updatedSorts.map(({field, direction}) => ({
      field,
      direction
    }));
    onSortChange(sortOptions);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (onDateRangeChange) {
      onDateRangeChange(range);
    }
  };

  // Get predefined filters for specific fields
  const getQuickFilters = (field: keyof ProcessedData) => {
    switch (field) {
      case 'location':
        return uniqueLocations.map(location => ({
          label: location,
          value: location,
          operator: 'equals' as const
        }));
      case 'period':
        return uniquePeriods.map(period => ({
          label: period,
          value: period,
          operator: 'equals' as const
        }));
      case 'cleanedClass':
        return uniqueClasses.map(className => ({
          label: className,
          value: className,
          operator: 'equals' as const
        }));
      case 'teacherName':
        return uniqueTeachers.map(teacher => ({
          label: teacher,
          value: teacher,
          operator: 'equals' as const
        }));
      default:
        return [];
    }
  };

  // Handle quick filter selection
  const handleQuickFilter = (field: keyof ProcessedData, value: string, operator: 'contains' | 'equals') => {
    const filterExists = filters.some(f => f.field === field && f.value === value && f.operator === operator);
    
    if (filterExists) {
      const updatedFilters = filters.filter(f => !(f.field === field && f.value === value && f.operator === operator));
      setFilters(updatedFilters);
      
      const filterOptions = updatedFilters.map(({field, operator, value}) => ({
        field,
        operator,
        value
      }));
      onFilterChange(filterOptions);
    } else {
      const newFilter = {
        id: `filter-${Date.now()}`,
        field,
        operator,
        value
      };
      const updatedFilters = [...filters, newFilter];
      setFilters(updatedFilters);
      
      const filterOptions = updatedFilters.map(({field, operator, value}) => ({
        field,
        operator,
        value
      }));
      onFilterChange(filterOptions);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <Label className="mb-2 block text-sm font-medium">Date Range</Label>
          <DateRangePicker value={dateRange} onChange={handleDateRangeChange} placeholder="Filter by date range" />
        </div>

        <div className="md:col-span-2">
          <Label className="mb-2 block text-sm font-medium">Quick Filters</Label>
          <div className="flex flex-wrap gap-2">
            <Select 
              onValueChange={(value) => {
                const [field, val, operator] = value.split('|');
                handleQuickFilter(field as keyof ProcessedData, val, operator as 'contains' | 'equals');
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Add location filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Locations</SelectLabel>
                  {getQuickFilters('location').map((filter, index) => (
                    <SelectItem key={`loc-${index}`} value={`location|${filter.value}|equals`}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Accordion type="single" collapsible value={expandedSection || undefined} onValueChange={(value) => setExpandedSection(value)}>
        <AccordionItem value="filters" className="border-none">
          <div className="flex items-center justify-between">
            <AccordionTrigger className="py-2 hover:no-underline">
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                <span className="font-medium">Advanced Filters</span>
                {filters.length > 0 && (
                  <Badge variant="secondary" className="ml-2">{filters.length}</Badge>
                )}
              </div>
            </AccordionTrigger>
            <Button variant="ghost" size="sm" onClick={addFilter}>
              <Plus className="h-4 w-4 mr-1" /> Add Filter
            </Button>
          </div>
          <AccordionContent>
            <div className="space-y-3">
              {filters.map((filter) => (
                <Card key={filter.id} className="border-[#E0E6F0]">
                  <CardContent className="p-3">
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-4">
                        <Select 
                          value={filter.field} 
                          onValueChange={(value) => updateFilter(filter.id, 'field', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Text Fields</SelectLabel>
                              <SelectItem value="teacherName">Teacher Name</SelectItem>
                              <SelectItem value="location">Location</SelectItem>
                              <SelectItem value="cleanedClass">Class Type</SelectItem>
                              <SelectItem value="dayOfWeek">Day of Week</SelectItem>
                              <SelectItem value="period">Period</SelectItem>
                            </SelectGroup>
                            <SelectGroup>
                              <SelectLabel>Numeric Fields</SelectLabel>
                              <SelectItem value="totalCheckins">Check-ins</SelectItem>
                              <SelectItem value="totalRevenue">Revenue</SelectItem>
                              <SelectItem value="totalOccurrences">Class Count</SelectItem>
                              <SelectItem value="totalCancelled">Cancellations</SelectItem>
                              <SelectItem value="classAverageIncludingEmpty">Average Class Size</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3">
                        <Select 
                          value={filter.operator} 
                          onValueChange={(value) => updateFilter(filter.id, 'operator', value as any)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Operator" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="contains">Contains</SelectItem>
                            <SelectItem value="equals">Equals</SelectItem>
                            <SelectItem value="starts">Starts with</SelectItem>
                            <SelectItem value="ends">Ends with</SelectItem>
                            <SelectItem value="greater">Greater than</SelectItem>
                            <SelectItem value="less">Less than</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-4">
                        <Input 
                          value={filter.value} 
                          onChange={(e) => updateFilter(filter.id, 'value', e.target.value)} 
                          placeholder="Value"
                        />
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeFilter(filter.id)}
                          className="w-8 h-8"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="sorts" className="border-none">
          <div className="flex items-center justify-between">
            <AccordionTrigger className="py-2 hover:no-underline">
              <div className="flex items-center">
                <ArrowDown className="h-4 w-4 mr-2" />
                <span className="font-medium">Sort Options</span>
                {sorts.length > 0 && (
                  <Badge variant="secondary" className="ml-2">{sorts.length}</Badge>
                )}
              </div>
            </AccordionTrigger>
            <Button variant="ghost" size="sm" onClick={addSort}>
              <Plus className="h-4 w-4 mr-1" /> Add Sort
            </Button>
          </div>
          <AccordionContent>
            <div className="space-y-3">
              {sorts.map((sort) => (
                <Card key={sort.id} className="border-[#E0E6F0]">
                  <CardContent className="p-3">
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-6">
                        <Select 
                          value={sort.field} 
                          onValueChange={(value) => updateSort(sort.id, 'field', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="teacherName">Teacher Name</SelectItem>
                            <SelectItem value="location">Location</SelectItem>
                            <SelectItem value="cleanedClass">Class Type</SelectItem>
                            <SelectItem value="totalCheckins">Check-ins</SelectItem>
                            <SelectItem value="totalRevenue">Revenue</SelectItem>
                            <SelectItem value="totalOccurrences">Class Count</SelectItem>
                            <SelectItem value="totalCancelled">Cancellations</SelectItem>
                            <SelectItem value="classAverageIncludingEmpty">Average Class Size</SelectItem>
                            <SelectItem value="period">Period</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-5">
                        <Select 
                          value={sort.direction} 
                          onValueChange={(value) => updateSort(sort.id, 'direction', value as 'asc' | 'desc')}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Direction" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="asc">
                              <div className="flex items-center">
                                <ArrowUp className="h-4 w-4 mr-2" />
                                Ascending
                              </div>
                            </SelectItem>
                            <SelectItem value="desc">
                              <div className="flex items-center">
                                <ArrowDown className="h-4 w-4 mr-2" />
                                Descending
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeSort(sort.id)}
                          className="w-8 h-8"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default DataFilters;
