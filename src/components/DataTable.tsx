import React, { useState, useEffect, useMemo } from 'react';
import { ProcessedData } from '@/types/data';
import { 
  Search, ChevronDown, ChevronRight, ArrowUp, ArrowDown,
  Settings, Eye, EyeOff, Layers, Type, Palette, Bookmark,
  BookmarkX, Filter, MapPin, Calendar, BarChart3, Clock,
  ListFilter, User, ListChecks, IndianRupee, LayoutGrid,
  LayoutList, Kanban, LineChart, Download, Sliders
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trainerAvatars } from './Dashboard';
import { formatIndianCurrency } from './MetricsPanel';
import { motion, AnimatePresence } from 'framer-motion';

interface DataTableProps {
  data: ProcessedData[];
  trainerAvatars: Record<string, string>;
}

// Define column type for better type safety
interface ColumnDefinition {
  key: string;
  label: string;
  numeric: boolean;
  currency: boolean;
  iconComponent?: React.ReactNode;
  visible?: boolean;
}

export function DataTable({ data, trainerAvatars }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    teacherName: true,
    location: true,
    cleanedClass: true,
    dayOfWeek: true,
    period: true,
    date: true,
    classTime: true,
    totalCheckins: true,
    totalRevenue: true,
    totalOccurrences: true,
    classAverageIncludingEmpty: true,
    classAverageExcludingEmpty: true,
    totalCancelled: true
  });
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [viewMode, setViewMode] = useState("default");
  const [groupBy, setGroupBy] = useState("class-day-time-location");
  const [tableView, setTableView] = useState("grouped");
  const [rowHeight, setRowHeight] = useState(35);

  // Group data by selected grouping option
  const groupedData = useMemo(() => {
    const getGroupKey = (item: ProcessedData) => {
      switch(groupBy) {
        case "class-day-time-location-trainer":
          return `${item.cleanedClass}|${item.dayOfWeek}|${item.classTime}|${item.location}|${item.teacherName}`;
        case "class-day-time-location":
          return `${item.cleanedClass}|${item.dayOfWeek}|${item.classTime}|${item.location}`;
        case "class-day-time":
          return `${item.cleanedClass}|${item.dayOfWeek}|${item.classTime}`;
        case "class-time":
          return `${item.cleanedClass}|${item.classTime}`;
        case "class-day":
          return `${item.cleanedClass}|${item.dayOfWeek}`;
        case "class-location":
          return `${item.cleanedClass}|${item.location}`;
        case "day-time":
          return `${item.dayOfWeek}|${item.classTime}`;
        case "location":
          return `${item.location}`;
        case "trainer":
          return `${item.teacherName}`;
        case "month": {
          const date = item.date;
          const month = date ? new Date(date.split(',')[0]).toLocaleString('default', { month: 'long', year: 'numeric' }) : "Unknown";
          return month;
        }
        case "none":
        default:
          return `row-${data.indexOf(item)}`;
      }
    };

    if (tableView === "flat" || groupBy === "none") {
      return data.map(item => ({
        ...item,
        key: `flat-${data.indexOf(item)}`,
        isChild: true,
        // For flat view, each row represents 1 occurrence
        displayOccurrences: 1,
        // Recalculate averages for individual rows
        classAverageIncludingEmpty: item.totalCheckins / 1,
        classAverageExcludingEmpty: item.totalCheckins > 0 ? item.totalCheckins / 1 : 0
      }));
    }
    
    const groups: Record<string, any> = {};
    
    data.forEach(item => {
      const groupKey = getGroupKey(item);
      
      if (!groups[groupKey]) {
        groups[groupKey] = {
          key: groupKey,
          teacherName: item.teacherName,
          cleanedClass: item.cleanedClass,
          dayOfWeek: item.dayOfWeek,
          classTime: item.classTime,
          location: item.location,
          period: item.period,
          date: item.date,
          children: [],
          totalCheckins: 0,
          totalRevenue: 0,
          totalOccurrences: 0,
          totalCancelled: 0,
          totalEmpty: 0,
          totalNonEmpty: 0,
          totalNonPaid: 0,
          totalPayout: 0,
          totalTips: 0,
          displayOccurrences: 0 // This will be the count of children
        };
      }
      
      // Add to children array with corrected values for individual rows
      groups[groupKey].children.push({
        ...item,
        // Individual rows in grouped view should show 1 for totalOccurrences
        displayOccurrences: 1,
        // Recalculate averages for individual rows (always 1 occurrence)
        classAverageIncludingEmpty: item.totalCheckins,
        classAverageExcludingEmpty: item.totalCheckins > 0 ? item.totalCheckins : 0
      });
      
      // Update metrics - sum up the original totalOccurrences for the group
      groups[groupKey].totalCheckins += Number(item.totalCheckins);
      groups[groupKey].totalRevenue += Number(item.totalRevenue);
      groups[groupKey].totalOccurrences += Number(item.totalOccurrences);
      groups[groupKey].totalCancelled += Number(item.totalCancelled || 0);
      groups[groupKey].totalEmpty += Number(item.totalEmpty || 0);
      groups[groupKey].totalNonEmpty += Number(item.totalNonEmpty || 0);
      groups[groupKey].totalNonPaid += Number(item.totalNonPaid || 0);
      groups[groupKey].totalPayout += Number(item.totalPayout || 0);
      groups[groupKey].totalTips += Number(item.totalTips || 0);
      
      // Set displayOccurrences to the count of children (individual rows)
      groups[groupKey].displayOccurrences = groups[groupKey].children.length;
    });
    
    // Calculate averages for each group
    Object.values(groups).forEach((group: any) => {
      group.classAverageIncludingEmpty = group.totalOccurrences > 0 
        ? group.totalCheckins / group.totalOccurrences 
        : 0;
        
      group.classAverageExcludingEmpty = group.totalNonEmpty > 0 
        ? group.totalCheckins / group.totalNonEmpty 
        : 0;
    });
    
    return Object.values(groups);
  }, [data, groupBy, tableView]);
  
  // Define grouping options
  const groupingOptions = [
    { id: "class-day-time-location-trainer", label: "Class + Day + Time + Location + Trainer" },
    { id: "class-day-time-location", label: "Class + Day + Time + Location" },
    { id: "class-day-time", label: "Class + Day + Time" },
    { id: "class-time", label: "Class + Time" },
    { id: "class-day", label: "Class + Day" },
    { id: "class-location", label: "Class + Location" },
    { id: "day-time", label: "Day + Time" },
    { id: "location", label: "Location" },
    { id: "trainer", label: "Trainer" },
    { id: "month", label: "Month" },
    { id: "none", label: "No Grouping" }
  ];
  
  // Define view modes
  const viewModes = [
    { id: "default", label: "Default View" },
    { id: "compact", label: "Compact View" },
    { id: "detailed", label: "Detailed View" },
    { id: "financials", label: "Financial Focus" },
    { id: "attendance", label: "Attendance Focus" },
    { id: "trainer", label: "Trainer Focus" },
    { id: "analytics", label: "Analytics View" },
    { id: "all", label: "All Columns" }
  ];

  // Filter the grouped data based on search term
  const filteredGroups = useMemo(() => {
    if (!searchTerm) return groupedData;
    
    const searchLower = searchTerm.toLowerCase();
    
    return groupedData.filter((group: any) => {
      // Search in parent row
      const parentMatch = [
        group.teacherName,
        group.cleanedClass,
        group.dayOfWeek,
        group.location,
        group.classTime,
        group.period,
      ].some(field => field && String(field).toLowerCase().includes(searchLower));
      
      if (parentMatch) return true;
      
      // Search in child rows
      if (group.children) {
        return group.children.some((child: ProcessedData) => 
          Object.values(child).some(val => 
            val && typeof val === 'string' && val.toLowerCase().includes(searchLower)
          )
        );
      }
      
      return false;
    });
  }, [groupedData, searchTerm]);
  
  // Apply sorting
  const sortedGroups = useMemo(() => {
    if (!sortConfig) return filteredGroups;
    
    return [...filteredGroups].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      const isNumeric = !isNaN(Number(aValue)) && !isNaN(Number(bValue));
      
      if (isNumeric) {
        return sortConfig.direction === 'asc'
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredGroups, sortConfig]);

  // Pagination
  const paginatedGroups = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedGroups.slice(startIndex, startIndex + pageSize);
  }, [sortedGroups, currentPage, pageSize]);
  
  // Calculate totals for footer
  const totals = useMemo(() => {
    return filteredGroups.reduce((acc: any, group: any) => {
      acc.totalCheckins += Number(group.totalCheckins || 0);
      acc.totalRevenue += Number(group.totalRevenue || 0);
      acc.totalOccurrences += Number(group.totalOccurrences || 0);
      acc.totalCancelled += Number(group.totalCancelled || 0);
      acc.displayOccurrences += Number(group.displayOccurrences || 0);
      return acc;
    }, {
      totalCheckins: 0,
      totalRevenue: 0,
      totalOccurrences: 0,
      totalCancelled: 0,
      displayOccurrences: 0
    });
  }, [filteredGroups]);
  
  // Get columns based on view mode
  const getColumns = (): ColumnDefinition[] => {
    const baseColumns: ColumnDefinition[] = [
      { key: "cleanedClass", label: "Class Type", iconComponent: <ListChecks className="h-4 w-4" />, numeric: false, currency: false, visible: true },
      { key: "dayOfWeek", label: "Day", iconComponent: <Calendar className="h-4 w-4" />, numeric: false, currency: false, visible: true },
      { key: "classTime", label: "Time", iconComponent: <Clock className="h-4 w-4" />, numeric: false, currency: false, visible: true },
      { key: "location", label: "Location", iconComponent: <MapPin className="h-4 w-4" />, numeric: false, currency: false, visible: true },
    ];
    
    const attendanceColumns: ColumnDefinition[] = [
      { key: "displayOccurrences", label: "Classes", numeric: true, currency: false, iconComponent: <ListFilter className="h-4 w-4" />, visible: true },
      { key: "totalEmpty", label: "Empty", numeric: true, currency: false, iconComponent: <ListFilter className="h-4 w-4" />, visible: true },
      { key: "totalNonEmpty", label: "Non-empty", numeric: true, currency: false, iconComponent: <ListFilter className="h-4 w-4" />, visible: true },
      { key: "totalCheckins", label: "Checked In", numeric: true, currency: false, iconComponent: <ListChecks className="h-4 w-4" />, visible: true },
      { key: "classAverageIncludingEmpty", label: "Avg. (All)", numeric: true, currency: false, iconComponent: <BarChart3 className="h-4 w-4" />, visible: true },
      { key: "classAverageExcludingEmpty", label: "Avg. (Non-empty)", numeric: true, currency: false, iconComponent: <BarChart3 className="h-4 w-4" />, visible: true }
    ];
    
    const financialColumns: ColumnDefinition[] = [
      { key: "totalRevenue", label: "Revenue", numeric: true, currency: true, iconComponent: <IndianRupee className="h-4 w-4" />, visible: true },
      { key: "totalCancelled", label: "Late Cancels", numeric: true, currency: false, iconComponent: <Calendar className="h-4 w-4" />, visible: true },
      { key: "totalPayout", label: "Payout", numeric: true, currency: true, iconComponent: <IndianRupee className="h-4 w-4" />, visible: true },
      { key: "totalTips", label: "Tips", numeric: true, currency: true, iconComponent: <IndianRupee className="h-4 w-4" />, visible: true }
    ];
    
    const detailedColumns: ColumnDefinition[] = [
      { key: "teacherName", label: "Trainer", iconComponent: <User className="h-4 w-4" />, numeric: false, currency: false, visible: true },
      { key: "period", label: "Period", iconComponent: <Calendar className="h-4 w-4" />, numeric: false, currency: false, visible: true },
      { key: "date", label: "Date", iconComponent: <Calendar className="h-4 w-4" />, numeric: false, currency: false, visible: true },
    ];

    switch(viewMode) {
      case "compact":
        return [...baseColumns.slice(0, 2), 
                { key: "classTime", label: "Time", iconComponent: <Clock className="h-4 w-4" />, numeric: false, currency: false, visible: true },
                { key: "displayOccurrences", label: "Classes", numeric: true, currency: false, iconComponent: <ListFilter className="h-4 w-4" />, visible: true },
                { key: "totalCheckins", label: "Checked In", numeric: true, currency: false, iconComponent: <ListChecks className="h-4 w-4" />, visible: true },
                { key: "classAverageIncludingEmpty", label: "Avg. (All)", numeric: true, currency: false, iconComponent: <BarChart3 className="h-4 w-4" />, visible: true },
                financialColumns[0]];
      case "detailed":
        return [...baseColumns, ...attendanceColumns, ...financialColumns, ...detailedColumns];
      case "financials":
        return [...baseColumns.slice(0, 3), financialColumns[0], financialColumns[2], financialColumns[3]];
      case "attendance":
        return [...baseColumns.slice(0, 3), ...attendanceColumns, financialColumns[1]];
      case "trainer":
        return [detailedColumns[0], ...baseColumns.slice(0, 3), attendanceColumns[3], financialColumns[0]];
      case "analytics":
        return [...baseColumns.slice(0, 3), attendanceColumns[4], attendanceColumns[5], financialColumns[0]];
      case "all":
        return [
          ...detailedColumns,
          ...baseColumns, 
          ...attendanceColumns,
          ...financialColumns
        ];
      default:
        return [...baseColumns, ...attendanceColumns.slice(0, 4), financialColumns[0]];
    }
  };

  const columns = getColumns();
  
  // Filter columns based on visibility settings
  const visibleColumns = columns.filter(col => 
    columnVisibility[col.key] !== false
  );
  
  // Toggle row expansion
  const toggleRowExpansion = (key: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  // Toggle column visibility
  const toggleColumnVisibility = (column: string) => {
    setColumnVisibility(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };
  
  // Handle sort request
  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Get sort indicator for column headers
  const getSortIndicator = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };
  
  // Navigate to specific page
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  // Calculate total pages
  const totalPages = Math.ceil(sortedGroups.length / pageSize);
  
  // Reset column visibility
  const resetColumnVisibility = () => {
    setColumnVisibility({
      teacherName: true,
      location: true,
      cleanedClass: true,
      dayOfWeek: true,
      period: true,
      date: true,
      classTime: true,
      totalCheckins: true,
      totalRevenue: true,
      totalOccurrences: true,
      classAverageIncludingEmpty: true,
      classAverageExcludingEmpty: true,
      totalCancelled: true
    });
  };

  // Export data as CSV
  const exportCSV = () => {
    const headers = Object.keys(data[0] || {}).filter(key => key !== 'children' && key !== 'key');
    const csvRows = [headers.join(',')];
    
    data.forEach(row => {
      const values = headers.map(header => {
        const val = row[header as keyof ProcessedData];
        return `"${val}"`;
      });
      csvRows.push(values.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'class_data_export.csv');
    link.click();
  };
  
  // Format cell values
  const formatCellValue = (key: string, value: any) => {
    if (value === undefined || value === null) return "-";
    
    const column = columns.find(col => col.key === key);
    if (!column) return String(value);
    
    if (column.currency && typeof value === 'number') {
      return formatIndianCurrency(value);
    }
    
    if (column.numeric) {
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        return numValue.toLocaleString();
      }
    }
    
    return String(value);
  };
  
  return (
    <div className="relative">
      {/* Modern Header Section */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 rounded-t-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search classes, trainers, locations..."
              className="pl-9 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-300 dark:border-slate-600 shadow-sm focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* Enhanced Controls with modern styling */}
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger className="w-[200px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-300 dark:border-slate-600 shadow-sm">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" />
                  <SelectValue placeholder="Group By" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-slate-300 dark:border-slate-600">
                <SelectGroup>
                  <SelectLabel className="text-muted-foreground font-medium">Grouping Options</SelectLabel>
                  {groupingOptions.map(option => (
                    <SelectItem key={option.id} value={option.id} className="focus:bg-primary/10">{option.label}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <Select value={viewMode} onValueChange={setViewMode}>
              <SelectTrigger className="w-[160px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-300 dark:border-slate-600 shadow-sm">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" />
                  <SelectValue placeholder="View Mode" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-slate-300 dark:border-slate-600">
                <SelectGroup>
                  <SelectLabel className="text-muted-foreground font-medium">View Mode</SelectLabel>
                  {viewModes.map(mode => (
                    <SelectItem key={mode.id} value={mode.id} className="focus:bg-primary/10">{mode.label}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <Tabs value={tableView} onValueChange={setTableView} className="w-[180px]">
              <TabsList className="grid w-full grid-cols-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                <TabsTrigger value="grouped" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Grouped</TabsTrigger>
                <TabsTrigger value="flat" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Flat</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-300 dark:border-slate-600 shadow-sm hover:bg-primary/5">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Customize</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-slate-300 dark:border-slate-600">
                <DialogHeader>
                  <DialogTitle>Table Customization</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Visible Columns</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={resetColumnVisibility}
                      className="text-xs"
                    >
                      Reset
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
                    {columns.map(col => (
                      <div key={col.key} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`column-${col.key}`} 
                          checked={columnVisibility[col.key] !== false} 
                          onCheckedChange={() => toggleColumnVisibility(col.key)}
                        />
                        <Label htmlFor={`column-${col.key}`} className="flex items-center gap-1.5">
                          {col.iconComponent && (
                            <span className="text-muted-foreground">{col.iconComponent}</span>
                          )}
                          {col.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Items per page</h4>
                    <RadioGroup value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                      <div className="flex items-center space-x-4">
                        {[5, 10, 25, 50].map(size => (
                          <div key={size} className="flex items-center space-x-2">
                            <RadioGroupItem value={size.toString()} id={`page-${size}`} />
                            <Label htmlFor={`page-${size}`}>{size}</Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" size="sm" onClick={exportCSV} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-300 dark:border-slate-600 shadow-sm hover:bg-primary/5">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>
      
      {/* Modern Table Container */}
      <div className="bg-white dark:bg-slate-900 shadow-xl rounded-b-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <motion.tr 
                className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {tableView === "grouped" && groupBy !== "none" && (
                  <TableHead className="w-[40px] border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"></TableHead>
                )}
                {visibleColumns.map((column, index) => (
                  <motion.th 
                    key={column.key}
                    className={cn(
                      "h-[50px] px-6 font-semibold text-slate-700 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700 last:border-r-0 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900",
                      column.numeric ? "text-right" : "text-left",
                      "hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer select-none whitespace-nowrap"
                    )}
                    onClick={() => requestSort(column.key)}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <div className={cn(
                      "flex items-center gap-2",
                      column.numeric ? "justify-end" : "justify-start"
                    )}>
                      {!column.numeric && column.iconComponent && (
                        <span className="text-primary/70">{column.iconComponent}</span>
                      )}
                      <span className="font-medium">{column.label}</span>
                      {column.numeric && column.iconComponent && (
                        <span className="text-primary/70">{column.iconComponent}</span>
                      )}
                      {getSortIndicator(column.key)}
                    </div>
                  </motion.th>
                ))}
              </motion.tr>
            </TableHeader>
            <TableBody>
              {paginatedGroups.length > 0 ? (
                <>
                  {paginatedGroups.map((group: any, groupIndex) => (
                    <React.Fragment key={group.key}>
                      {/* Enhanced Parent Row */}
                      <motion.tr 
                        className={cn(
                          "cursor-pointer hover:bg-primary/5 transition-all duration-200 border-b border-slate-100 dark:border-slate-800 group",
                          expandedRows[group.key] && "bg-primary/10 shadow-sm",
                          groupIndex % 2 === 0 ? "bg-slate-25 dark:bg-slate-900/30" : "bg-white dark:bg-slate-900"
                        )}
                        onClick={() => toggleRowExpansion(group.key)}
                        style={{ height: `${rowHeight}px` }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: groupIndex * 0.05 }}
                      >
                        {tableView === "grouped" && groupBy !== "none" && (
                          <TableCell className="py-2 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                            <Button variant="ghost" size="icon" className="h-6 w-6 p-0 hover:bg-primary/20 transition-colors">
                              {expandedRows[group.key] ? (
                                <ChevronDown className="h-4 w-4 text-primary" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                              )}
                            </Button>
                          </TableCell>
                        )}
                        
                        {visibleColumns.map(column => {
                          if (column.key === 'teacherName') {
                            return (
                              <TableCell key={column.key} className={cn(
                                "py-3 px-6 border-r border-slate-200 dark:border-slate-700 last:border-r-0", 
                                column.numeric ? "text-right" : "text-left"
                              )}>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8 ring-2 ring-primary/20 shadow-sm">
                                    <AvatarImage src={trainerAvatars[group.teacherName]} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                                      {group.teacherName?.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium text-foreground whitespace-nowrap">{group.teacherName}</span>
                                </div>
                              </TableCell>
                            );
                          }
                          
                          if (column.key === 'cleanedClass' && tableView === 'grouped') {
                            return (
                              <TableCell key={column.key} className={cn(
                                "py-3 px-6 border-r border-slate-200 dark:border-slate-700 last:border-r-0", 
                                column.numeric ? "text-right" : "text-left"
                              )}>
                                <div className="flex items-center gap-3">
                                  <Badge variant="secondary" className="font-medium bg-primary/10 text-primary border-primary/20 shadow-sm">
                                    {group.displayOccurrences || 0}
                                  </Badge>
                                  <span className="font-medium whitespace-nowrap">{group.cleanedClass}</span>
                                </div>
                              </TableCell>
                            );
                          }
                          
                          if (column.key === 'displayOccurrences') {
                            return (
                              <TableCell key={column.key} className={cn(
                                "py-3 px-6 border-r border-slate-200 dark:border-slate-700 last:border-r-0", 
                                column.numeric ? "text-right" : "text-left"
                              )}>
                                <span className="font-mono text-sm font-medium">
                                  {group.displayOccurrences || 0}
                                </span>
                              </TableCell>
                            );
                          }
                          
                          if (column.key === 'classAverageIncludingEmpty' || column.key === 'classAverageExcludingEmpty') {
                            const value = group[column.key];
                            return (
                              <TableCell key={column.key} className={cn(
                                "py-3 px-6 border-r border-slate-200 dark:border-slate-700 last:border-r-0", 
                                column.numeric ? "text-right" : "text-left"
                              )}>
                                <span className="font-mono text-sm">
                                  {typeof value === 'number' ? value.toFixed(1) : value}
                                </span>
                              </TableCell>
                            );
                          }
                          
                          return (
                            <TableCell key={column.key} className={cn(
                              "py-3 px-6 border-r border-slate-200 dark:border-slate-700 last:border-r-0", 
                              column.numeric ? "text-right" : "text-left"
                            )}>
                              <span className={cn(
                                column.numeric && "font-mono text-sm",
                                column.currency && "text-emerald-600 dark:text-emerald-400 font-medium",
                                "whitespace-nowrap"
                              )}>
                                {formatCellValue(column.key, group[column.key])}
                              </span>
                            </TableCell>
                          );
                        })}
                      </motion.tr>
                      
                      {/* Enhanced Child Rows with Animation */}
                      {group.children && expandedRows[group.key] && (
                        <AnimatePresence>
                          {group.children.map((item: ProcessedData, index: number) => (
                            <motion.tr 
                              key={`${group.key}-child-${index}`}
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2, delay: index * 0.03 }}
                              className="bg-slate-50/50 dark:bg-slate-800/30 text-sm border-b border-slate-100 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-700/30 transition-colors"
                              style={{ height: `${rowHeight}px` }}
                            >
                              {tableView === "grouped" && groupBy !== "none" && (
                                <TableCell className="border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                                  <div className="w-6 h-6 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-primary/40"></div>
                                  </div>
                                </TableCell>
                              )}
                              
                              {visibleColumns.map(column => {
                                if (column.key === 'teacherName') {
                                  return (
                                    <TableCell key={`child-${column.key}`} className={cn(
                                      "py-2 px-6 pl-12 border-r border-slate-200 dark:border-slate-700 last:border-r-0", 
                                      column.numeric ? "text-right" : "text-left"
                                    )}>
                                      <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6 ring-1 ring-primary/20">
                                          <AvatarImage src={trainerAvatars[item.teacherName]} />
                                          <AvatarFallback className="bg-primary/5 text-primary text-xs">
                                            {item.teacherName?.charAt(0)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className="text-muted-foreground whitespace-nowrap">{item.teacherName}</span>
                                      </div>
                                    </TableCell>
                                  );
                                }
                                
                                if (column.key === 'cleanedClass') {
                                  return (
                                    <TableCell key={`child-${column.key}`} className="py-2 px-6 pl-12 border-r border-slate-200 dark:border-slate-700 last:border-r-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground whitespace-nowrap">{item.cleanedClass}</span>
                                        <Badge variant="outline" className="text-[10px] h-4 px-1 font-normal bg-background/50">
                                          {item.date ? new Date(item.date.split(',')[0]).toLocaleDateString() : ""}
                                        </Badge>
                                      </div>
                                    </TableCell>
                                  );
                                }
                                
                                if (column.key === 'displayOccurrences') {
                                  return (
                                    <TableCell key={`child-${column.key}`} className={cn(
                                      "py-2 px-6 border-r border-slate-200 dark:border-slate-700 last:border-r-0", 
                                      column.numeric ? "text-right" : "text-left"
                                    )}>
                                      <span className="text-muted-foreground font-mono text-xs">
                                        1
                                      </span>
                                    </TableCell>
                                  );
                                }
                                
                                return (
                                  <TableCell key={`child-${column.key}`} className={cn(
                                    "py-2 px-6 border-r border-slate-200 dark:border-slate-700 last:border-r-0", 
                                    column.numeric ? "text-right" : "text-left"
                                  )}>
                                    <span className={cn(
                                      "text-muted-foreground",
                                      column.numeric && "font-mono text-xs",
                                      column.currency && "text-emerald-600/70 dark:text-emerald-400/70",
                                      "whitespace-nowrap"
                                    )}>
                                      {formatCellValue(column.key, item[column.key as keyof ProcessedData])}
                                    </span>
                                  </TableCell>
                                );
                              })}
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      )}
                    </React.Fragment>
                  ))}
                  
                  {/* Totals Row */}
                  <motion.tr 
                    className="bg-gradient-to-r from-primary/5 to-primary/10 border-t-2 border-primary/20 font-semibold"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    style={{ height: `${rowHeight + 5}px` }}
                  >
                    {tableView === "grouped" && groupBy !== "none" && (
                      <TableCell className="border-r border-primary/20 bg-primary/10">
                        <div className="flex items-center justify-center">
                          <BarChart3 className="h-4 w-4 text-primary" />
                        </div>
                      </TableCell>
                    )}
                    
                    {visibleColumns.map((column, index) => {
                      let totalValue = "";
                      
                      if (column.key === 'cleanedClass') {
                        totalValue = `${filteredGroups.length} Groups`;
                      } else if (column.key === 'displayOccurrences') {
                        totalValue = totals.displayOccurrences.toString();
                      } else if (column.key === 'totalCheckins') {
                        totalValue = totals.totalCheckins.toString();
                      } else if (column.key === 'totalRevenue') {
                        totalValue = formatIndianCurrency(totals.totalRevenue);
                      } else if (column.key === 'totalOccurrences') {
                        totalValue = totals.totalOccurrences.toString();
                      } else if (column.key === 'totalCancelled') {
                        totalValue = totals.totalCancelled.toString();
                      } else if (column.key === 'classAverageIncludingEmpty') {
                        const avg = totals.totalOccurrences > 0 ? totals.totalCheckins / totals.totalOccurrences : 0;
                        totalValue = avg.toFixed(1);
                      } else if (index === 0) {
                        totalValue = "TOTALS";
                      } else {
                        totalValue = "-";
                      }
                      
                      return (
                        <TableCell 
                          key={`total-${column.key}`} 
                          className={cn(
                            "py-3 px-6 border-r border-primary/20 last:border-r-0 text-primary font-semibold",
                            column.numeric ? "text-right" : "text-left",
                            "whitespace-nowrap"
                          )}
                        >
                          {totalValue}
                        </TableCell>
                      );
                    })}
                  </motion.tr>
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length + 1} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-8 w-8 text-muted-foreground/50" />
                      <span>No results found</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Enhanced Footer */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 rounded-b-xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Summary Stats */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="font-medium">{filteredGroups.length}</span>
              <span>{tableView === "grouped" ? "Groups" : "Rows"}</span>
            </div>
            <div className="flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-emerald-500" />
              <span className="font-medium">{totals.totalCheckins.toLocaleString()}</span>
              <span>Total Check-ins</span>
            </div>
            <div className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-amber-500" />
              <span className="font-medium">{formatIndianCurrency(totals.totalRevenue)}</span>
              <span>Total Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="font-medium">{totals.totalOccurrences.toLocaleString()}</span>
              <span>Total Classes</span>
            </div>
          </div>
          
          {/* Enhanced Pagination */}
          <Pagination>
            <PaginationContent className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg border border-slate-200 dark:border-slate-700 px-2 shadow-sm">
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => goToPage(currentPage - 1)}
                  className={cn(
                    "transition-colors",
                    currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-primary/10"
                  )}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNumber;
                
                // Show pages around current page
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      isActive={pageNumber === currentPage}
                      onClick={() => goToPage(pageNumber)}
                      className={cn(
                        "cursor-pointer transition-colors",
                        pageNumber === currentPage 
                          ? "bg-primary text-primary-foreground shadow-sm" 
                          : "hover:bg-primary/10"
                      )}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => goToPage(currentPage + 1)}
                  className={cn(
                    "transition-colors",
                    currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-primary/10"
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
        
        <div className="mt-3 text-xs text-center text-slate-500 dark:text-slate-400">
          Showing <span className="font-medium text-slate-700 dark:text-slate-300">{Math.min((currentPage - 1) * pageSize + 1, sortedGroups.length)}</span> to <span className="font-medium text-slate-700 dark:text-slate-300">{Math.min(currentPage * pageSize, sortedGroups.length)}</span> of <span className="font-medium text-slate-700 dark:text-slate-300">{sortedGroups.length}</span> {tableView === "grouped" ? "groups" : "rows"}
        </div>
      </div>
    </div>
  );
}