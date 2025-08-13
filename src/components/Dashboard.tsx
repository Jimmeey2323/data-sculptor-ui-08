import React, { useState, useEffect } from 'react';
import { ProcessedData, ViewMode, FilterOption, SortOption } from '@/types/data';
import ViewSwitcherWrapper from './ViewSwitcherWrapper';
import { DataTable } from '@/components/DataTable';
import DataFilters from '@/components/DataFilters';
import MetricsPanel from '@/components/MetricsPanel';
import ChartPanel from '@/components/ChartPanel';
import TopBottomClasses from '@/components/TopBottomClasses';
import GridView from '@/components/views/GridView';
import KanbanView from '@/components/views/KanbanView';
import TimelineView from '@/components/views/TimelineView';
import PivotView from '@/components/views/PivotView';
import SearchBar from '@/components/SearchBar';
import TrainerComparisonView from '@/components/TrainerComparisonView';
import LocationComparisonView from '@/components/comparisons/LocationComparisonView';
import ClassComparisonView from '@/components/comparisons/ClassComparisonView';
import TimeComparisonView from '@/components/comparisons/TimeComparisonView';
import PivotTableConfiguration from '@/components/PivotTableConfiguration';
import { DateRange } from '@/components/DateRangePicker';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { exportToCSV } from '@/utils/fileProcessing';
import { applyFilters, FilterOptions } from '@/utils/filterUtils';
import { 
  Upload, 
  BarChart3, 
  Download, 
  RefreshCw, 
  Search,
  FileText,
  FileSpreadsheet,
  FileJson,
  Users,
  MapPin,
  Clock,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  Settings
} from 'lucide-react';
import ProgressBar from '@/components/ProgressBar';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import CountUp from 'react-countup';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from '@/components/ui/use-toast';

interface DashboardProps {
  data: ProcessedData[];
  loading: boolean;
  progress: number;
  onReset: () => void;
  viewMode: ViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
  onLogout: () => void;
}

export const trainerAvatars: Record<string, string> = {
  'Kajol': 'https://i.postimg.cc/s2t4ypt9/80638-picture.jpg',
  'Shreya': 'https://images.unsplash.com/photo-1607274016862-4fcdc7f8e98d',
  'Priti': 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
  'Swati': 'https://images.unsplash.com/photo-1580489944761-15a19d654956',
  'Krishna': 'https://images.unsplash.com/photo-1530268771320-e8fbd1c86d2c',
  'Tanya': 'https://images.unsplash.com/photo-1566753323558-f4e0952af115',
  'Gayatri': 'https://images.unsplash.com/photo-1548142813-c348350df52b',
  'Amit': 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c',
  'Ravi': 'https://images.unsplash.com/photo-1560250097-0b93528c311a',
  'Sunita': 'https://images.unsplash.com/photo-1590001602951-e7b4b29506e6'
};

const Dashboard: React.FC<DashboardProps> = ({ 
  data, 
  loading, 
  progress, 
  onReset,
  viewMode,
  setViewMode,
  onLogout
}) => {
  const { toast } = useToast();
  const [filteredData, setFilteredData] = useState<ProcessedData[]>([]);
  const [filters, setFilters] = useState<FilterOption[]>([]);
  const [sortOptions, setSortOptions] = useState<SortOption[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(true);
  const [isTableFilterCollapsed, setIsTableFilterCollapsed] = useState(true);
  const [showTrainerComparison, setShowTrainerComparison] = useState(false);
  const [activeComparisonTab, setActiveComparisonTab] = useState('trainers');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [savedPivotConfigs, setSavedPivotConfigs] = useState<any[]>([]);
  const [showPivotConfig, setShowPivotConfig] = useState(false);

  // Apply filters effect using centralized filtering
  useEffect(() => {
    if (!data.length) return;

    // Convert current filters to FilterOptions format
    const filterOptions: FilterOptions = {
      searchTerm: searchQuery || undefined,
      selectedTrainer: filters.find(f => f.field === 'teacherName')?.value || 'all',
      selectedClass: filters.find(f => f.field === 'cleanedClass')?.value || 'all',
      selectedLocation: filters.find(f => f.field === 'location')?.value || 'all',
      selectedDayOfWeek: filters.find(f => f.field === 'dayOfWeek')?.value || 'all',
      selectedPeriod: filters.find(f => f.field === 'period')?.value || 'all',
      dateRange: dateRange ? { from: dateRange.from, to: dateRange.to } : undefined,
    };

    // Apply filters using the centralized utility
    let result = applyFilters(data, filterOptions);

    // Apply additional legacy filters for compatibility
    if (filters.length > 0) {
      result = result.filter(item => {
        return filters.every(filter => {
          if (filter.field === 'period' && filter.operator === 'in') {
            const selectedPeriods = filter.value.split(',');
            return selectedPeriods.some(period => item.period === period);
          }
          
          const fieldValue = String(item[filter.field]);
          
          switch (filter.operator) {
            case 'contains':
              return fieldValue.toLowerCase().includes(filter.value.toLowerCase());
            case 'equals':
              return fieldValue.toLowerCase() === filter.value.toLowerCase();
            case 'starts':
              return fieldValue.toLowerCase().startsWith(filter.value.toLowerCase());
            case 'ends':
              return fieldValue.toLowerCase().endsWith(filter.value.toLowerCase());
            case 'greater':
              return Number(fieldValue) > Number(filter.value);
            case 'less':
              return Number(fieldValue) < Number(filter.value);
            case 'after':
              return new Date(fieldValue) > new Date(filter.value);
            case 'before':
              return new Date(fieldValue) < new Date(filter.value);
            case 'on':
              return new Date(fieldValue).toDateString() === new Date(filter.value).toDateString();
            default:
              return true;
          }
        });
      });
    }

    // Apply sorting
    if (sortOptions.length > 0) {
      result.sort((a, b) => {
        for (const sort of sortOptions) {
          const valueA = a[sort.field];
          const valueB = b[sort.field];
          
          const isNumeric = !isNaN(Number(valueA)) && !isNaN(Number(valueB));
          
          let comparison = 0;
          if (isNumeric) {
            comparison = Number(valueA) - Number(valueB);
          } else {
            comparison = String(valueA).localeCompare(String(valueB));
          }
          
          if (comparison !== 0) {
            return sort.direction === 'asc' ? comparison : -comparison;
          }
        }
        
        return 0;
      });
    }
    
    console.log(`Filtered data: ${result.length} items from ${data.length} original items`);
    setFilteredData(result);
  }, [data, filters, sortOptions, searchQuery, dateRange]);

  // Load saved pivot configurations and data from localStorage on component mount
  useEffect(() => {
    const savedConfigs = localStorage.getItem('pivotConfigs');
    if (savedConfigs) {
      try {
        setSavedPivotConfigs(JSON.parse(savedConfigs));
      } catch (error) {
        console.error('Error loading saved pivot configurations:', error);
      }
    }
  }, []);

  const handleFilterChange = (newFilters: FilterOption[]) => {
    setFilters(newFilters);
  };

  const handleSortChange = (newSortOptions: SortOption[]) => {
    setSortOptions(newSortOptions);
  };

  const handleDateRangeChange = (range?: DateRange) => {
    setDateRange(range);
  };

  const handleExport = (format: 'csv' | 'json' | 'excel') => {
    if (format === 'csv') {
      exportToCSV(filteredData);
    } else if (format === 'json') {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredData, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "class_data.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } else if (format === 'excel') {
      exportToCSV(filteredData);
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  }; 
  
  const clearFilters = () => {
    setFilters([]);
    setSearchQuery('');
    setDateRange(undefined);
  };

  const handleSavePivotConfig = (config: any) => {
    const newConfigs = [...savedPivotConfigs, config];
    setSavedPivotConfigs(newConfigs);
    localStorage.setItem('pivotConfigs', JSON.stringify(newConfigs));
    toast({
      title: "Configuration Saved",
      description: "Your pivot table configuration has been saved."
    });
  };

  const handleDeletePivotConfig = (index: number) => {
    const newConfigs = savedPivotConfigs.filter((_, i) => i !== index);
    setSavedPivotConfigs(newConfigs);
    localStorage.setItem('pivotConfigs', JSON.stringify(newConfigs));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 p-12 min-h-[60vh]">
        <h2 className="text-2xl font-semibold">Processing Data</h2>
        <ProgressBar progress={progress} />
        <div className="text-center">
          <p className="text-lg font-medium mb-2">Analyzed 
            <span className="text-primary mx-1">
              <CountUp 
                end={data.length} 
                decimals={0}
              />
            </span> 
            records so far
          </p>
          <p className="text-sm text-muted-foreground">Please wait while we process your file...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in bg-gradient-to-b from-[#F8F9FC] to-[#F0F4FF] dark:from-gray-900 dark:to-gray-950 min-h-screen">
      <div className="bg-white dark:bg-gray-900 border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center">
            <motion.img 
              src="https://i.imgur.com/9mOm7gP.png" 
              alt="Logo" 
              className="h-10 w-auto mr-3"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[#1E2F4D] dark:text-slate-100">
                Class Analytics Dashboard
              </h1>
              <p className="text-xs text-[#6B7A99] dark:text-slate-400">
                {filteredData.length} Classes | {filters.length} Active Filters
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-auto">
            <ThemeToggle />
            
            <Button variant="outline" size="sm" onClick={onReset} className="border-[#E0E6F0]">
              <RefreshCw className="mr-2 h-4 w-4" />
              Upload New
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-[#E0E6F0]">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                  <FileText className="mr-2 h-4 w-4" />
                  Export for Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json')}>
                  <FileJson className="mr-2 h-4 w-4" />
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="outline" size="sm" onClick={() => setShowPivotConfig(true)} className="hidden md:flex border-[#E0E6F0]">
              <Settings className="mr-2 h-4 w-4" />
              Customize
            </Button>
            
            <Button variant="ghost" size="icon" onClick={onLogout}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <Collapsible
          open={!isFilterCollapsed}
          onOpenChange={(open) => setIsFilterCollapsed(!open)}
          className="w-full bg-white dark:bg-gray-900 shadow-sm rounded-lg border border-[#E0E6F0] mb-6"
        >
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex-1 max-w-xl">
                <SearchBar onSearch={handleSearchChange} data={data} />
              </div>
              {(filters.length > 0 || dateRange || searchQuery) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="gap-1.5 hidden sm:flex"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1 border-[#E0E6F0]">
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Global Filters</span>
                  {isFilterCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
          
          <CollapsibleContent>
            <div className="p-4 border-t">
              <DataFilters 
                onFilterChange={handleFilterChange} 
                onSortChange={handleSortChange}
                onDateRangeChange={handleDateRangeChange}
                data={data}
                activeFilters={filters.length}
                dateRange={dateRange}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <MetricsPanel data={filteredData} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-3 border-[#E0E6F0] rounded-xl shadow-sm">
            <CardContent className="p-6">
              <TopBottomClasses data={filteredData} />
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-6">
          <Card className="border-[#E0E6F0] rounded-xl shadow-sm">
            <CardContent className="p-6">
              <Tabs defaultValue="trainers" value={activeComparisonTab} onValueChange={setActiveComparisonTab} className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-[#323B4C] dark:text-white">Comparison Analysis</h2>
                  <TabsList>
                    <TabsTrigger value="trainers" onClick={() => setActiveComparisonTab("trainers")}>
                      <Users className="w-4 h-4 mr-2" />
                      Trainers
                    </TabsTrigger>
                    <TabsTrigger value="locations" onClick={() => setActiveComparisonTab("locations")}>
                      <MapPin className="w-4 h-4 mr-2" />
                      Locations
                    </TabsTrigger>
                    <TabsTrigger value="classes" onClick={() => setActiveComparisonTab("classes")}>
                      <BookOpen className="w-4 h-4 mr-2" />
                      Classes
                    </TabsTrigger>
                    <TabsTrigger value="time" onClick={() => setActiveComparisonTab("time")}>
                      <Clock className="w-4 h-4 mr-2" />
                      Time & Day
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="trainers" className="mt-0">
                  <TrainerComparisonView data={filteredData} trainerAvatars={trainerAvatars} />
                </TabsContent>
                
                <TabsContent value="locations" className="mt-0">
                  <LocationComparisonView data={filteredData} />
                </TabsContent>
                
                <TabsContent value="classes" className="mt-0">
                  <ClassComparisonView data={filteredData} />
                </TabsContent>
                
                <TabsContent value="time" className="mt-0">
                  <TimeComparisonView data={filteredData} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <ViewSwitcherWrapper viewMode={viewMode} setViewMode={setViewMode} />

        <div className="bg-white dark:bg-gray-900 border border-[#E0E6F0] rounded-xl shadow-sm mb-6">
          {viewMode === 'table' && (
            <>
              <Collapsible
                open={!isTableFilterCollapsed}
                onOpenChange={(open) => setIsTableFilterCollapsed(!open)}
              >
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="text-lg font-semibold text-[#323B4C] dark:text-white">Data Table</h3>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-1 border-[#E0E6F0]">
                      <Filter className="h-4 w-4" />
                      <span className="hidden sm:inline">Table Filters</span>
                      {isTableFilterCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                
                <CollapsibleContent>
                  <div className="p-4 border-b bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm text-muted-foreground">Table-specific filters coming soon...</p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
              <DataTable data={filteredData} trainerAvatars={trainerAvatars} />
            </>
          )}
          {viewMode === 'grid' && <GridView data={filteredData} trainerAvatars={trainerAvatars} />}
          {viewMode === 'kanban' && <KanbanView data={filteredData} trainerAvatars={trainerAvatars} />}
          {viewMode === 'timeline' && <TimelineView data={filteredData} trainerAvatars={trainerAvatars} />}
          {viewMode === 'pivot' && <PivotView data={filteredData} trainerAvatars={trainerAvatars} />}
        </div>
        
        {savedPivotConfigs.length > 0 && (
          <div className="grid grid-cols-1 gap-6 mb-6">
            {savedPivotConfigs.map((config, index) => (
              <Card key={index} className="border-[#E0E6F0] rounded-xl shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold">{config.name || `Saved Pivot ${index + 1}`}</h3>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeletePivotConfig(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground">
                      Rows: {config.rowDimension}, Columns: {config.colDimension}, Metric: {config.metric}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <ChartPanel data={filteredData} />
      </div>

      {showPivotConfig && (
        <Dialog open={showPivotConfig} onOpenChange={setShowPivotConfig}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Dashboard Customization</DialogTitle>
            </DialogHeader>
            <PivotTableConfiguration 
              onSave={handleSavePivotConfig}
              onClose={() => setShowPivotConfig(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Dashboard;
