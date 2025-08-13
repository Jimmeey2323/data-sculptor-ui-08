
import React, { useState, useMemo } from 'react';
import { ProcessedData } from '@/types/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ChevronDown, 
  ChevronRight, 
  Calendar,
  Users,
  TrendingUp,
  Clock,
  MapPin,
  BookOpen,
  Edit,
  Save,
  X,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatIndianCurrency } from './MetricsPanel';

interface DataTableProps {
  data: ProcessedData[];
  trainerAvatars: Record<string, string>;
}

interface TableSummary {
  totalClasses: number;
  totalRevenue: number;
  avgAttendance: number;
  topTrainer: string;
  notes: string;
}

export const DataTable: React.FC<DataTableProps> = ({ data, trainerAvatars }) => {
  const [groupBy, setGroupBy] = useState<keyof ProcessedData | 'none'>('none');
  const [sortBy, setSortBy] = useState<keyof ProcessedData>('totalCheckins');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [editingSummary, setEditingSummary] = useState(false);
  const [summary, setSummary] = useState<TableSummary>({
    totalClasses: 0,
    totalRevenue: 0,
    avgAttendance: 0,
    topTrainer: '',
    notes: ''
  });

  const groupByOptions = [
    { value: 'none', label: 'No Grouping' },
    { value: 'teacherName', label: 'Instructor' },
    { value: 'cleanedClass', label: 'Class Type' },
    { value: 'location', label: 'Location' },
    { value: 'dayOfWeek', label: 'Day of Week' },
    { value: 'period', label: 'Period' }
  ];

  const sortByOptions = [
    { value: 'totalCheckins', label: 'Check-ins' },
    { value: 'totalOccurrences', label: 'Classes' },
    { value: 'totalRevenue', label: 'Revenue' },
    { value: 'classAverageIncludingEmpty', label: 'Avg Attendance' },
    { value: 'totalCancelled', label: 'Cancellations' }
  ];

  // Calculate summary data
  useMemo(() => {
    if (data.length === 0) return;

    const totalClasses = data.reduce((sum, item) => sum + item.totalOccurrences, 0);
    const totalRevenue = data.reduce((sum, item) => sum + Number(item.totalRevenue), 0);
    const totalCheckins = data.reduce((sum, item) => sum + item.totalCheckins, 0);
    const avgAttendance = totalClasses > 0 ? totalCheckins / totalClasses : 0;

    // Find top trainer by total check-ins
    const trainerStats = data.reduce((acc, item) => {
      acc[item.teacherName] = (acc[item.teacherName] || 0) + item.totalCheckins;
      return acc;
    }, {} as Record<string, number>);

    const topTrainer = Object.entries(trainerStats).reduce((top, [name, checkins]) => 
      checkins > top[1] ? [name, checkins] : top, ['', 0]
    )[0];

    setSummary(prev => ({
      ...prev,
      totalClasses,
      totalRevenue,
      avgAttendance,
      topTrainer
    }));
  }, [data]);

  const sortedData = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [data, sortBy, sortOrder]);

  const groupedData = useMemo(() => {
    if (groupBy === 'none') return null;

    const groups: Record<string, ProcessedData[]> = {};
    
    sortedData.forEach(item => {
      const key = String(item[groupBy]);
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    return Object.entries(groups).map(([key, items]) => {
      const totalCheckins = items.reduce((sum, item) => sum + item.totalCheckins, 0);
      const totalOccurrences = items.reduce((sum, item) => sum + item.totalOccurrences, 0);
      const totalRevenue = items.reduce((sum, item) => sum + Number(item.totalRevenue), 0);
      const totalCancelled = items.reduce((sum, item) => sum + item.totalCancelled, 0);
      
      // Calculate empty and non-empty based on individual occurrences
      let totalEmpty = 0;
      let totalNonEmpty = 0;
      
      items.forEach(item => {
        totalEmpty += item.totalEmpty;
        totalNonEmpty += item.totalNonEmpty;
      });

      const avgAttendance = totalOccurrences > 0 ? totalCheckins / totalOccurrences : 0;

      return {
        key,
        items,
        summary: {
          totalCheckins,
          totalOccurrences,
          totalRevenue,
          totalCancelled,
          totalEmpty,
          totalNonEmpty,
          avgAttendance
        }
      };
    }).sort((a, b) => {
      const aValue = a.summary[sortBy as keyof typeof a.summary] || 0;
      const bValue = b.summary[sortBy as keyof typeof b.summary] || 0;
      return sortOrder === 'desc' ? Number(bValue) - Number(aValue) : Number(aValue) - Number(bValue);
    });
  }, [sortedData, groupBy, sortBy, sortOrder]);

  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const formatValue = (value: any, key: string) => {
    if (key === 'totalRevenue') {
      return formatIndianCurrency(Number(value));
    }
    if (key === 'classAverageIncludingEmpty' || key === 'classAverageExcludingEmpty') {
      return typeof value === 'number' ? value.toFixed(1) : value;
    }
    return value;
  };

  const handleSummaryUpdate = () => {
    setEditingSummary(false);
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Animation */}
      <Card className="border-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="p-2 bg-primary/10 rounded-full"
              >
                <BarChart3 className="h-6 w-6 text-primary" />
              </motion.div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Data Analytics Table
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {data.length} records • Advanced filtering and grouping
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Select value={groupBy as string} onValueChange={(value) => setGroupBy(value as keyof ProcessedData | 'none')}>
                  <SelectTrigger className="w-40 bg-background/50 backdrop-blur-sm">
                    <SelectValue placeholder="Group by" />
                  </SelectTrigger>
                  <SelectContent>
                    {groupByOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy as string} onValueChange={(value) => setSortBy(value as keyof ProcessedData)}>
                  <SelectTrigger className="w-40 bg-background/50 backdrop-blur-sm">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortByOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="bg-background/50 backdrop-blur-sm"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Enhanced Table */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-background/80 to-muted/20 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="overflow-hidden rounded-lg">
            <Table>
              <TableHeader className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
                <TableRow className="border-0 hover:bg-transparent">
                  <TableHead className="font-semibold text-foreground">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Instructor</span>
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Class</span>
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>Location</span>
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Day</span>
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-foreground text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Activity className="h-4 w-4" />
                      <span>Check-ins</span>
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-foreground text-center">Classes</TableHead>
                  <TableHead className="font-semibold text-foreground text-center">Empty</TableHead>
                  <TableHead className="font-semibold text-foreground text-center">Non-Empty</TableHead>
                  <TableHead className="font-semibold text-foreground text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>Revenue</span>
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-foreground text-center">Avg</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {groupBy === 'none' ? (
                    sortedData.map((item, index) => (
                      <motion.tr
                        key={`${item.teacherName}-${item.cleanedClass}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2, delay: index * 0.02 }}
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8 border-2 border-primary/20">
                              {trainerAvatars[item.teacherName] ? (
                                <AvatarImage src={trainerAvatars[item.teacherName]} alt={item.teacherName} />
                              ) : (
                                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                  {getInitials(item.teacherName)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <span className="font-medium text-foreground">{item.teacherName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                            {item.cleanedClass}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">{item.location}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">{item.dayOfWeek}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                            {item.totalCheckins}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-medium">{item.totalOccurrences}</TableCell>
                        <TableCell className="text-center">
                          <span className="text-red-600 dark:text-red-400">{item.totalEmpty}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-green-600 dark:text-green-400">{item.totalNonEmpty}</span>
                        </TableCell>
                        <TableCell className="text-center font-medium text-primary">
                          {formatValue(item.totalRevenue, 'totalRevenue')}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                            {formatValue(item.classAverageIncludingEmpty, 'classAverageIncludingEmpty')}
                          </Badge>
                        </TableCell>
                      </motion.tr>
                    ))
                  ) : (
                    groupedData?.map((group, groupIndex) => (
                      <React.Fragment key={group.key}>
                        <motion.tr
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: groupIndex * 0.05 }}
                          className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border-b-2 border-primary/20 hover:from-primary/10 hover:to-primary/15 transition-all cursor-pointer"
                          onClick={() => toggleGroup(group.key)}
                        >
                          <TableCell colSpan={10}>
                            <div className="flex items-center justify-between py-2">
                              <div className="flex items-center space-x-3">
                                <div className="p-1.5 bg-primary/20 rounded-full">
                                  {expandedGroups.has(group.key) ? (
                                    <ChevronDown className="h-4 w-4 text-primary" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-primary" />
                                  )}
                                </div>
                                <span className="font-bold text-lg text-foreground">{group.key}</span>
                                <Badge variant="secondary" className="bg-primary/20 text-primary">
                                  {group.items.length} items
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-6 text-sm">
                                <div className="text-center">
                                  <p className="font-medium text-foreground">{group.summary.totalCheckins}</p>
                                  <p className="text-muted-foreground">Check-ins</p>
                                </div>
                                <div className="text-center">
                                  <p className="font-medium text-foreground">{group.summary.totalOccurrences}</p>
                                  <p className="text-muted-foreground">Classes</p>
                                </div>
                                <div className="text-center">
                                  <p className="font-medium text-primary">{formatValue(group.summary.totalRevenue, 'totalRevenue')}</p>
                                  <p className="text-muted-foreground">Revenue</p>
                                </div>
                                <div className="text-center">
                                  <p className="font-medium text-foreground">{group.summary.avgAttendance.toFixed(1)}</p>
                                  <p className="text-muted-foreground">Avg</p>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </motion.tr>
                        <AnimatePresence>
                          {expandedGroups.has(group.key) && group.items.map((item, itemIndex) => (
                            <motion.tr
                              key={`${item.teacherName}-${item.cleanedClass}-${itemIndex}`}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2, delay: itemIndex * 0.02 }}
                              className="border-b border-border/30 hover:bg-muted/20 transition-colors pl-8"
                            >
                              <TableCell className="pl-12">
                                <div className="flex items-center space-x-3">
                                  <Avatar className="h-8 w-8 border-2 border-primary/20">
                                    {trainerAvatars[item.teacherName] ? (
                                      <AvatarImage src={trainerAvatars[item.teacherName]} alt={item.teacherName} />
                                    ) : (
                                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                        {getInitials(item.teacherName)}
                                      </AvatarFallback>
                                    )}
                                  </Avatar>
                                  <span className="font-medium text-foreground">{item.teacherName}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                                  {item.cleanedClass}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <span className="text-muted-foreground">{item.location}</span>
                              </TableCell>
                              <TableCell>
                                <span className="text-muted-foreground">{item.dayOfWeek}</span>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                                  {item.totalCheckins}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center font-medium">{item.totalOccurrences}</TableCell>
                              <TableCell className="text-center">
                                <span className="text-red-600 dark:text-red-400">{item.totalEmpty}</span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="text-green-600 dark:text-green-400">{item.totalNonEmpty}</span>
                              </TableCell>
                              <TableCell className="text-center font-medium text-primary">
                                {formatValue(item.totalRevenue, 'totalRevenue')}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                                  {formatValue(item.classAverageIncludingEmpty, 'classAverageIncludingEmpty')}
                                </Badge>
                              </TableCell>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </React.Fragment>
                    ))
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Footer Summary */}
      <Card className="border-0 bg-gradient-to-r from-primary/5 via-background to-primary/5 dark:from-primary/10 dark:via-background dark:to-primary/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Data Summary
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingSummary(!editingSummary)}
              className="bg-background/50 backdrop-blur-sm"
            >
              {editingSummary ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
              {editingSummary ? 'Save' : 'Edit'}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-background/50 rounded-lg p-4 border backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-muted-foreground">Total Classes</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{summary.totalClasses.toLocaleString()}</p>
            </div>
            
            <div className="bg-background/50 rounded-lg p-4 border backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-muted-foreground">Total Revenue</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{formatIndianCurrency(summary.totalRevenue)}</p>
            </div>
            
            <div className="bg-background/50 rounded-lg p-4 border backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-muted-foreground">Avg. Attendance</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{summary.avgAttendance.toFixed(1)}</p>
            </div>
            
            <div className="bg-background/50 rounded-lg p-4 border backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-muted-foreground">Top Trainer</span>
              </div>
              <p className="text-lg font-bold text-foreground truncate">{summary.topTrainer}</p>
            </div>
          </div>

          <div className="bg-background/50 rounded-lg p-4 border backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <Edit className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Analysis Notes</span>
            </div>
            {editingSummary ? (
              <div className="space-y-3">
                <Textarea
                  value={summary.notes}
                  onChange={(e) => setSummary(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add your analysis notes here..."
                  className="min-h-[100px] bg-background/70 backdrop-blur-sm"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSummaryUpdate}>
                    <Save className="h-4 w-4 mr-1" />
                    Save Notes
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setEditingSummary(false)}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">
                {summary.notes || "Click edit to add analysis notes and insights about this data..."}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
