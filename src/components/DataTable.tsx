import React, { useState, useEffect, useMemo } from 'react';
import { ProcessedData } from '@/types/data';
import { 
  Search, ChevronDown, ChevronRight, ArrowUp, ArrowDown,
  Settings, Eye, EyeOff, Layers, Type, Palette, Bookmark,
  BookmarkX, Filter, MapPin, Calendar, BarChart3, Clock,
  ListFilter, User, ListChecks, IndianRupee, LayoutGrid,
  LayoutList, Kanban, LineChart, Download, Sliders, Sparkles,
  TrendingUp, Users, Target, Award, Zap
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

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
  const [summaryNotes, setSummaryNotes] = useState("Key insights from the data analysis will be displayed here...");
  const [isEditingSummary, setIsEditingSummary] = useState(false);

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
        // For flat view, each row represents one data entry, so totalOccurrences should be the actual occurrence count
        totalOccurrences: item.occurrences ? item.occurrences.length : 1,
        totalEmpty: item.occurrences ? item.occurrences.filter(occ => occ.isEmpty).length : (item.totalCheckins === 0 ? 1 : 0),
        totalNonEmpty: item.occurrences ? item.occurrences.filter(occ => !occ.isEmpty).length : (item.totalCheckins > 0 ? 1 : 0),
        classAverageIncludingEmpty: item.occurrences && item.occurrences.length > 0 ? item.totalCheckins / item.occurrences.length : (item.totalCheckins || 0),
        classAverageExcludingEmpty: item.occurrences ? 
          (item.occurrences.filter(occ => !occ.isEmpty).length > 0 ? 
            item.totalCheckins / item.occurrences.filter(occ => !occ.isEmpty).length : 0) : 
          (item.totalCheckins > 0 ? item.totalCheckins : 0)
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
          allOccurrences: []
        };
      }
      
      // Add to children array - each child represents one data entry
      groups[groupKey].children.push({
        ...item,
        totalOccurrences: item.occurrences ? item.occurrences.length : 1,
        totalEmpty: item.occurrences ? item.occurrences.filter(occ => occ.isEmpty).length : (item.totalCheckins === 0 ? 1 : 0),
        totalNonEmpty: item.occurrences ? item.occurrences.filter(occ => !occ.isEmpty).length : (item.totalCheckins > 0 ? 1 : 0),
        classAverageIncludingEmpty: item.occurrences && item.occurrences.length > 0 ? item.totalCheckins / item.occurrences.length : (item.totalCheckins || 0),
        classAverageExcludingEmpty: item.occurrences ? 
          (item.occurrences.filter(occ => !occ.isEmpty).length > 0 ? 
            item.totalCheckins / item.occurrences.filter(occ => !occ.isEmpty).length : 0) : 
          (item.totalCheckins > 0 ? item.totalCheckins : 0)
      });
      
      // Collect all occurrences for the group
      if (item.occurrences) {
        groups[groupKey].allOccurrences.push(...item.occurrences);
      } else {
        groups[groupKey].allOccurrences.push({
          date: item.date,
          checkins: item.totalCheckins,
          revenue: Number(item.totalRevenue),
          cancelled: item.totalCancelled || 0,
          nonPaid: item.totalNonPaid || 0,
          isEmpty: item.totalCheckins === 0
        });
      }
      
      // Update group totals
      groups[groupKey].totalCheckins += Number(item.totalCheckins);
      groups[groupKey].totalRevenue += Number(item.totalRevenue);
      groups[groupKey].totalCancelled += Number(item.totalCancelled || 0);
      groups[groupKey].totalNonPaid += Number(item.totalNonPaid || 0);
      groups[groupKey].totalPayout += Number(item.totalPayout || 0);
      groups[groupKey].totalTips += Number(item.totalTips || 0);
    });
    
    // Calculate group-level metrics
    Object.values(groups).forEach((group: any) => {
      // The Classes column should show the number of children (individual data entries)
      group.totalOccurrences = group.children.length;
      
      // Calculate empty and non-empty based on all occurrences
      group.totalEmpty = group.allOccurrences.filter((occ: any) => occ.isEmpty).length;
      group.totalNonEmpty = group.allOccurrences.filter((occ: any) => !occ.isEmpty).length;
      
      // Calculate averages
      const totalOccurrenceCount = group.allOccurrences.length;
      group.classAverageIncludingEmpty = totalOccurrenceCount > 0 
        ? group.totalCheckins / totalOccurrenceCount 
        : 0;
        
      group.classAverageExcludingEmpty = group.totalNonEmpty > 0 
        ? group.totalCheckins / group.totalNonEmpty 
        : 0;
        
      // Clean up
      delete group.allOccurrences;
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
      acc.totalEmpty += Number(group.totalEmpty || 0);
      acc.totalNonEmpty += Number(group.totalNonEmpty || 0);
      return acc;
    }, {
      totalCheckins: 0,
      totalRevenue: 0,
      totalOccurrences: 0,
      totalCancelled: 0,
      totalEmpty: 0,
      totalNonEmpty: 0
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
      { key: "totalOccurrences", label: "Classes", numeric: true, currency: false, iconComponent: <ListFilter className="h-4 w-4" />, visible: true },
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
                { key: "totalOccurrences", label: "Classes", numeric: true, currency: false, iconComponent: <ListFilter className="h-4 w-4" />, visible: true },
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
    <div className="relative bg-gradient-to-br from-background via-muted/5 to-muted/10 min-h-screen">
      {/* Glassmorphism Header Section */}
      <div className="glass-card backdrop-blur-xl bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 border-primary/10 dark:border-primary/20 p-8 mb-6 rounded-2xl shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-6">
          {/* Animated Title */}
          <div className="flex items-center gap-4">
            <motion.div
              className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg"
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1] 
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="h-8 w-8 text-primary-foreground" />
            </motion.div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Data Analytics Hub
              </h2>
              <p className="text-muted-foreground mt-1">Advanced insights and visualizations</p>
            </div>
          </div>
          
          {/* Enhanced Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search classes, trainers, locations..."
              className="pl-12 h-12 bg-background/80 backdrop-blur-sm border-primary/20 shadow-lg focus:ring-4 focus:ring-primary/20 transition-all text-base rounded-xl"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => setSearchTerm('')}
              >
                ×
              </Button>
            )}
          </div>
          
          {/* Enhanced Controls */}
          <div className="flex flex-wrap gap-3">
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger className="w-[220px] h-12 bg-background/80 backdrop-blur-sm border-primary/20 shadow-lg rounded-xl">
                <div className="flex items-center gap-3">
                  <Filter className="h-5 w-5 text-primary" />
                  <SelectValue placeholder="Group By" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-md border-primary/20 rounded-xl shadow-2xl">
                <SelectGroup>
                  <SelectLabel className="text-muted-foreground font-semibold px-3 py-2">Grouping Options</SelectLabel>
                  {groupingOptions.map(option => (
                    <SelectItem key={option.id} value={option.id} className="focus:bg-primary/10 rounded-lg mx-1">{option.label}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <Select value={viewMode} onValueChange={setViewMode}>
              <SelectTrigger className="w-[180px] h-12 bg-background/80 backdrop-blur-sm border-primary/20 shadow-lg rounded-xl">
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-primary" />
                  <SelectValue placeholder="View Mode" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-md border-primary/20 rounded-xl shadow-2xl">
                <SelectGroup>
                  <SelectLabel className="text-muted-foreground font-semibold px-3 py-2">View Mode</SelectLabel>
                  {viewModes.map(mode => (
                    <SelectItem key={mode.id} value={mode.id} className="focus:bg-primary/10 rounded-lg mx-1">{mode.label}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <Tabs value={tableView} onValueChange={setTableView} className="w-[200px]">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 backdrop-blur-sm h-12 rounded-xl">
                <TabsTrigger value="grouped" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium">Grouped</TabsTrigger>
                <TabsTrigger value="flat" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium">Flat</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg" className="flex items-center gap-2 bg-background/80 backdrop-blur-sm border-primary/20 shadow-lg hover:bg-primary/5 h-12 px-6 rounded-xl">
                  <Settings className="h-5 w-5" />
                  <span className="hidden sm:inline font-medium">Customize</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-background/95 backdrop-blur-md border-primary/20 rounded-2xl shadow-2xl max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                    <Sliders className="h-6 w-6 text-primary" />
                    Table Customization
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 mt-6">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-lg">Visible Columns</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={resetColumnVisibility}
                      className="text-sm font-medium"
                    >
                      Reset All
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2">
                    {columns.map(col => (
                      <div key={col.key} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/30">
                        <Checkbox 
                          id={`column-${col.key}`} 
                          checked={columnVisibility[col.key] !== false} 
                          onCheckedChange={() => toggleColumnVisibility(col.key)}
                        />
                        <Label htmlFor={`column-${col.key}`} className="flex items-center gap-2 font-medium cursor-pointer">
                          {col.iconComponent && (
                            <span className="text-muted-foreground">{col.iconComponent}</span>
                          )}
                          {col.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg">Items per page</h4>
                    <RadioGroup value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                      <div className="flex items-center space-x-6">
                        {[5, 10, 25, 50].map(size => (
                          <div key={size} className="flex items-center space-x-2">
                            <RadioGroupItem value={size.toString()} id={`page-${size}`} />
                            <Label htmlFor={`page-${size}`} className="font-medium">{size}</Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" size="lg" onClick={exportCSV} className="bg-background/80 backdrop-blur-sm border-primary/20 shadow-lg hover:bg-primary/5 h-12 px-6 rounded-xl">
              <Download className="mr-2 h-5 w-5" />
              <span className="font-medium">Export CSV</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Enhanced Table Container */}
      <div className="glass-card bg-background/90 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden border border-primary/10">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <motion.tr 
                className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-b-2 border-primary/20"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {tableView === "grouped" && groupBy !== "none" && (
                  <TableHead className="w-[60px] border-r border-primary/20 bg-gradient-to-b from-primary/5 to-secondary/5">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Layers className="h-5 w-5 text-primary mx-auto" />
                    </motion.div>
                  </TableHead>
                )}
                {visibleColumns.map((column, index) => (
                  <motion.th 
                    key={column.key}
                    className={cn(
                      "h-[60px] px-6 font-bold text-foreground border-r border-primary/20 last:border-r-0 bg-gradient-to-b from-primary/5 to-secondary/5",
                      column.numeric ? "text-right" : "text-left",
                      "hover:bg-primary/10 transition-all duration-300 cursor-pointer select-none whitespace-nowrap group"
                    )}
                    onClick={() => requestSort(column.key)}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className={cn(
                      "flex items-center gap-3 group-hover:scale-105 transition-transform",
                      column.numeric ? "justify-end" : "justify-start"
                    )}>
                      {!column.numeric && column.iconComponent && (
                        <motion.span 
                          className="text-primary"
                          whileHover={{ scale: 1.2, rotate: 10 }}
                        >
                          {column.iconComponent}
                        </motion.span>
                      )}
                      <span className="font-bold text-lg">{column.label}</span>
                      {column.numeric && column.iconComponent && (
                        <motion.span 
                          className="text-primary"
                          whileHover={{ scale: 1.2, rotate: 10 }}
                        >
                          {column.iconComponent}
                        </motion.span>
                      )}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: sortConfig?.key === column.key ? 1 : 0 }}
                        className="text-primary"
                      >
                        {getSortIndicator(column.key)}
                      </motion.div>
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
                          "cursor-pointer hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 transition-all duration-300 border-b border-primary/10 group",
                          expandedRows[group.key] && "bg-gradient-to-r from-primary/10 to-secondary/10 shadow-lg",
                          groupIndex % 2 === 0 ? "bg-muted/30" : "bg-background"
                        )}
                        onClick={() => toggleRowExpansion(group.key)}
                        style={{ height: `${rowHeight + 10}px` }}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: groupIndex * 0.1 }}
                        whileHover={{ scale: 1.01 }}
                      >
                        {tableView === "grouped" && groupBy !== "none" && (
                          <TableCell className="py-3 border-r border-primary/20 bg-gradient-to-b from-primary/5 to-secondary/5">
                            <Button variant="ghost" size="icon" className="h-8 w-8 p-0 hover:bg-primary/20 transition-all duration-300 rounded-lg">
                              <motion.div
                                animate={{ rotate: expandedRows[group.key] ? 90 : 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                {expandedRows[group.key] ? (
                                  <ChevronDown className="h-5 w-5 text-primary" />
                                ) : (
                                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                )}
                              </motion.div>
                            </Button>
                          </TableCell>
                        )}
                        
                        {visibleColumns.map(column => {
                          if (column.key === 'teacherName') {
                            return (
                              <TableCell key={column.key} className={cn(
                                "py-4 px-6 border-r border-primary/20 last:border-r-0", 
                                column.numeric ? "text-right" : "text-left"
                              )}>
                                <div className="flex items-center gap-4">
                                  <Avatar className="h-10 w-10 ring-2 ring-primary/30 shadow-lg">
                                    <AvatarImage src={trainerAvatars[group.teacherName]} />
                                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-bold text-base">
                                      {group.teacherName?.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-semibold text-foreground whitespace-nowrap">{group.teacherName}</span>
                                </div>
                              </TableCell>
                            );
                          }
                          
                          if (column.key === 'cleanedClass' && tableView === 'grouped') {
                            return (
                              <TableCell key={column.key} className={cn(
                                "py-4 px-6 border-r border-primary/20 last:border-r-0", 
                                column.numeric ? "text-right" : "text-left"
                              )}>
                                <div className="flex items-center gap-4">
                                  <Badge variant="secondary" className="font-semibold bg-gradient-to-r from-primary/15 to-secondary/15 text-primary border-primary/30 shadow-md px-3 py-1">
                                    {group.totalOccurrences || 0}
                                  </Badge>
                                  <span className="font-semibold text-lg whitespace-nowrap">{group.cleanedClass}</span>
                                </div>
                              </TableCell>
                            );
                          }
                          
                          if (column.key === 'totalOccurrences') {
                            return (
                              <TableCell key={column.key} className={cn(
                                "py-4 px-6 border-r border-primary/20 last:border-r-0", 
                                column.numeric ? "text-right" : "text-left"
                              )}>
                                <span className="font-mono text-base font-semibold text-primary">
                                  {group.totalOccurrences || 0}
                                </span>
                              </TableCell>
                            );
                          }
                          
                          if (column.key === 'totalEmpty') {
                            return (
                              <TableCell key={column.key} className={cn(
                                "py-4 px-6 border-r border-primary/20 last:border-r-0 text-destructive", 
                                column.numeric ? "text-right" : "text-left"
                              )}>
                                <span className="font-mono text-base font-semibold">
                                  {group.totalEmpty || 0}
                                </span>
                              </TableCell>
                            );
                          }
                          
                          if (column.key === 'totalNonEmpty') {
                            return (
                              <TableCell key={column.key} className={cn(
                                "py-4 px-6 border-r border-primary/20 last:border-r-0 text-green-600 dark:text-green-400", 
                                column.numeric ? "text-right" : "text-left"
                              )}>
                                <span className="font-mono text-base font-semibold">
                                  {group.totalNonEmpty || 0}
                                </span>
                              </TableCell>
                            );
                          }
                          
                          if (column.key === 'classAverageIncludingEmpty' || column.key === 'classAverageExcludingEmpty') {
                            const value = group[column.key];
                            return (
                              <TableCell key={column.key} className={cn(
                                "py-4 px-6 border-r border-primary/20 last:border-r-0", 
                                column.numeric ? "text-right" : "text-left"
                              )}>
                                <span className="font-mono text-base font-semibold">
                                  {typeof value === 'number' ? value.toFixed(1) : value}
                                </span>
                              </TableCell>
                            );
                          }
                          
                          return (
                            <TableCell key={column.key} className={cn(
                              "py-4 px-6 border-r border-primary/20 last:border-r-0", 
                              column.numeric ? "text-right" : "text-left"
                            )}>
                              <span className={cn(
                                column.numeric && "font-mono text-base font-semibold",
                                column.currency && "text-emerald-600 dark:text-emerald-400",
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
                              initial={{ opacity: 0, y: -15, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -15, scale: 0.98 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              className="bg-gradient-to-r from-muted/40 to-muted/20 text-sm border-b border-primary/5 hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 transition-all duration-300"
                              style={{ height: `${rowHeight + 5}px` }}
                            >
                              {tableView === "grouped" && groupBy !== "none" && (
                                <TableCell className="border-r border-primary/20 bg-gradient-to-b from-muted/50 to-muted/30">
                                  <div className="w-8 h-8 flex items-center justify-center">
                                    <motion.div 
                                      className="w-3 h-3 rounded-full bg-gradient-to-r from-primary/60 to-secondary/60"
                                      animate={{ scale: [1, 1.2, 1] }}
                                      transition={{ duration: 2, repeat: Infinity }}
                                    />
                                  </div>
                                </TableCell>
                              )}
                              
                              {visibleColumns.map(column => {
                                if (column.key === 'teacherName') {
                                  return (
                                    <TableCell key={`child-${column.key}`} className={cn(
                                      "py-3 px-6 pl-16 border-r border-primary/20 last:border-r-0", 
                                      column.numeric ? "text-right" : "text-left"
                                    )}>
                                      <div className="flex items-center gap-3">
                                        <Avatar className="h-7 w-7 ring-1 ring-primary/30">
                                          <AvatarImage src={trainerAvatars[item.teacherName]} />
                                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                                            {item.teacherName?.charAt(0)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className="text-muted-foreground font-medium whitespace-nowrap">{item.teacherName}</span>
                                      </div>
                                    </TableCell>
                                  );
                                }
                                
                                return (
                                  <TableCell key={`child-${column.key}`} className={cn(
                                    "py-3 px-6 border-r border-primary/20 last:border-r-0", 
                                    column.numeric ? "text-right" : "text-left"
                                  )}>
                                    <span className={cn(
                                      "text-muted-foreground font-medium",
                                      column.numeric && "font-mono text-sm",
                                      column.currency && "text-emerald-600/80 dark:text-emerald-400/80",
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
                  
                  {/* Enhanced Totals Row */}
                  <motion.tr 
                    className="bg-gradient-to-r from-primary/15 via-secondary/15 to-accent/15 border-t-4 border-primary/30 font-bold shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    style={{ height: `${rowHeight + 15}px` }}
                  >
                    {tableView === "grouped" && groupBy !== "none" && (
                      <TableCell className="border-r border-primary/30 bg-gradient-to-b from-primary/20 to-secondary/20">
                        <div className="flex items-center justify-center">
                          <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          >
                            <Target className="h-6 w-6 text-primary" />
                          </motion.div>
                        </div>
                      </TableCell>
                    )}
                    
                    {visibleColumns.map((column, index) => {
                      let totalValue = "";
                      
                      if (column.key === 'cleanedClass') {
                        totalValue = `${filteredGroups.length} Groups`;
                      } else if (column.key === 'totalOccurrences') {
                        totalValue = totals.totalOccurrences.toString();
                      } else if (column.key === 'totalEmpty') {
                        totalValue = totals.totalEmpty.toString();
                      } else if (column.key === 'totalNonEmpty') {
                        totalValue = totals.totalNonEmpty.toString();
                      } else if (column.key === 'totalCheckins') {
                        totalValue = totals.totalCheckins.toString();
                      } else if (column.key === 'totalRevenue') {
                        totalValue = formatIndianCurrency(totals.totalRevenue);
                      } else if (column.key === 'totalCancelled') {
                        totalValue = totals.totalCancelled.toString();
                      } else if (column.key === 'classAverageIncludingEmpty') {
                        const avg = totals.totalOccurrences > 0 ? totals.totalCheckins / totals.totalOccurrences : 0;
                        totalValue = avg.toFixed(1);
                      } else if (index === 0) {
                        totalValue = "TOTALS";
                      } else {
                        totalValue = "—";
                      }
                      
                      return (
                        <TableCell 
                          key={`total-${column.key}`} 
                          className={cn(
                            "py-4 px-6 border-r border-primary/30 last:border-r-0 text-primary font-bold text-lg",
                            column.numeric ? "text-right" : "text-left",
                            "whitespace-nowrap"
                          )}
                        >
                          <motion.span
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            {totalValue}
                          </motion.span>
                        </TableCell>
                      );
                    })}
                  </motion.tr>
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length + 1} className="text-center py-16 text-muted-foreground">
                    <motion.div 
                      className="flex flex-col items-center gap-4"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Search className="h-12 w-12 text-muted-foreground/50" />
                      <span className="text-xl font-medium">No results found</span>
                      <span className="text-sm">Try adjusting your search or filters</span>
                    </motion.div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Enhanced Footer with Editable Summary */}
      <div className="glass-card bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 backdrop-blur-xl border-primary/10 p-6 rounded-2xl shadow-2xl mt-6">
        <div className="flex flex-col gap-6">
          {/* Summary Stats with Enhanced Visual Appeal */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <motion.div 
              className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 rounded-xl border border-primary/20"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{filteredGroups.length}</p>
                  <p className="text-sm text-muted-foreground font-medium">{tableView === "grouped" ? "Groups" : "Rows"}</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-4 rounded-xl border border-emerald-500/20"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <ListChecks className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">{totals.totalCheckins.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground font-medium">Check-ins</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 p-4 rounded-xl border border-amber-500/20"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <IndianRupee className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">{formatIndianCurrency(totals.totalRevenue)}</p>
                  <p className="text-sm text-muted-foreground font-medium">Revenue</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-4 rounded-xl border border-blue-500/20"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{totals.totalOccurrences.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground font-medium">Classes</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-red-500/10 to-red-500/5 p-4 rounded-xl border border-red-500/20"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <Users className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{totals.totalEmpty.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground font-medium">Empty</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-green-500/10 to-green-500/5 p-4 rounded-xl border border-green-500/20"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{totals.totalNonEmpty.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground font-medium">Non-empty</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Editable Summary Section */}
          <Card className="bg-gradient-to-br from-muted/30 to-muted/10 border-primary/20 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Award className="h-6 w-6 text-primary" />
                  </motion.div>
                  Data Insights Summary
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingSummary(!isEditingSummary)}
                  className="hover:bg-primary/10"
                >
                  {isEditingSummary ? 'Save' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isEditingSummary ? (
                <Textarea
                  value={summaryNotes}
                  onChange={(e) => setSummaryNotes(e.target.value)}
                  placeholder="Add your insights and analysis notes here..."
                  className="min-h-[120px] bg-background/50 border-primary/20"
                />
              ) : (
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed">{summaryNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Pagination */}
          <div className="flex justify-center">
            <Pagination>
              <PaginationContent className="bg-background/80 backdrop-blur-sm rounded-xl border border-primary/20 px-2 shadow-lg">
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => goToPage(currentPage - 1)}
                    className={cn(
                      "transition-all duration-300",
                      currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-primary/10 hover:scale-105"
                    )}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let pageNumber;
                  
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
                          "cursor-pointer transition-all duration-300",
                          pageNumber === currentPage 
                            ? "bg-primary text-primary-foreground shadow-lg scale-110" 
                            : "hover:bg-primary/10 hover:scale-105"
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
                      "transition-all duration-300",
                      currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-primary/10 hover:scale-105"
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{Math.min((currentPage - 1) * pageSize + 1, sortedGroups.length)}</span> to <span className="font-semibold text-foreground">{Math.min(currentPage * pageSize, sortedGroups.length)}</span> of <span className="font-semibold text-foreground">{sortedGroups.length}</span> {tableView === "grouped" ? "groups" : "rows"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
