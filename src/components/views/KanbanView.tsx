import React, { useState, useMemo } from 'react';
import { ProcessedData } from '@/types/data';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  IndianRupee,
  Filter,
  Search,
  BookOpen,
  MoreHorizontal,
  PlusCircle,
  Star,
  Check,
  Bookmark,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { formatIndianCurrency } from '../MetricsPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface KanbanViewProps {
  data: ProcessedData[];
  trainerAvatars: Record<string, string>;
}

type KanbanColumn = {
  id: string;
  title: string;
  items: ProcessedData[];
};

type ColumnKey = 'dayOfWeek' | 'location' | 'teacherName' | 'cleanedClass';
type CardMetric = 'totalCheckins' | 'totalRevenue' | 'period';

const KanbanView: React.FC<KanbanViewProps> = ({ data, trainerAvatars }) => {
  const [columnKey, setColumnKey] = useState<ColumnKey>('dayOfWeek');
  const [cardMetric, setCardMetric] = useState<CardMetric>('totalCheckins');
  const [expandedCards, setExpandedCards] = useState<string[]>([]);
  const [collapsedColumns, setCollapsedColumns] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedCards, setBookmarkedCards] = useState<string[]>([]);
  
  React.useEffect(() => {
    const savedBookmarks = localStorage.getItem('kanbanViewBookmarks');
    if (savedBookmarks) {
      setBookmarkedCards(JSON.parse(savedBookmarks));
    }
  }, []);
  
  React.useEffect(() => {
    localStorage.setItem('kanbanViewBookmarks', JSON.stringify(bookmarkedCards));
  }, [bookmarkedCards]);

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    
    return data.filter(item => {
      const searchFields = [
        item.cleanedClass,
        item.teacherName,
        item.location,
        item.dayOfWeek,
        item.period
      ];
      
      return searchFields.some(field => 
        String(field).toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [data, searchQuery]);

  const columns = useMemo<KanbanColumn[]>(() => {
    if (!filteredData.length) return [];
    
    const uniqueValues = Array.from(new Set(filteredData.map(item => item[columnKey])));
    
    if (columnKey === 'dayOfWeek') {
      const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      uniqueValues.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
    } else {
      uniqueValues.sort();
    }
    
    return uniqueValues.map(value => ({
      id: String(value),
      title: String(value),
      items: filteredData.filter(item => item[columnKey] === value)
    }));
  }, [filteredData, columnKey]);

  const onDragEnd = (result: DropResult) => {
    console.log('Drag ended', result);
  };

  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId) 
        : [...prev, cardId]
    );
  };

  const toggleColumnCollapse = (columnId: string) => {
    setCollapsedColumns(prev => 
      prev.includes(columnId) 
        ? prev.filter(id => id !== columnId) 
        : [...prev, columnId]
    );
  };

  const toggleCardBookmark = (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId) 
        : [...prev, cardId]
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Kanban View</h2>
          <p className="text-muted-foreground">Visualize your class data in columns</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-md border border-input bg-background p-2 text-sm"
            />
          </div>
          
          <div className="w-full sm:w-auto">
            <Select value={columnKey} onValueChange={(value) => setColumnKey(value as ColumnKey)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Group by" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cleanedClass">Group by Class</SelectItem>
                <SelectItem value="dayOfWeek">Group by Day</SelectItem>
                <SelectItem value="location">Group by Location</SelectItem>
                <SelectItem value="teacherName">Group by Teacher</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full sm:w-auto">
            <Select value={cardMetric} onValueChange={(value) => setCardMetric(value as CardMetric)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <SelectValue placeholder="Card focus" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="totalCheckins">Focus on Check-ins</SelectItem>
                <SelectItem value="totalRevenue">Focus on Revenue</SelectItem>
                <SelectItem value="period">Focus on Period</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex space-x-4 overflow-x-auto pb-6 -mx-6 px-6">
          {columns.map((column) => {
            const isCollapsed = collapsedColumns.includes(column.id);
            
            return (
              <div 
                key={column.id} 
                className="flex-shrink-0 w-80"
              >
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl shadow-sm border h-full flex flex-col">
                  <div className="p-3 border-b flex items-center justify-between sticky top-0 bg-slate-50 dark:bg-slate-900/50 rounded-t-xl z-10">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">
                        {columnKey === 'teacherName' && (
                          <div className="flex items-center gap-2">
                            {trainerAvatars[column.title] ? (
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={trainerAvatars[column.title]} alt={column.title} />
                                <AvatarFallback>
                                  {column.title.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <Users className="h-5 w-5 text-slate-500" />
                            )}
                            {column.title}
                          </div>
                        )}
                        
                        {columnKey === 'dayOfWeek' && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-slate-500" />
                            {column.title}
                          </div>
                        )}
                        
                        {columnKey === 'location' && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-slate-500" />
                            {column.title}
                          </div>
                        )}
                        
                        {columnKey === 'cleanedClass' && (
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-slate-500" />
                            {column.title}
                          </div>
                        )}
                      </div>
                      
                      <Badge variant="outline" className="ml-2">
                        {column.items.length}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => toggleColumnCollapse(column.id)}
                      >
                        {isCollapsed ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronUp className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Column Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Check className="mr-2 h-4 w-4" />
                            Select All
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Star className="mr-2 h-4 w-4" />
                            Star Column
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  <Droppable droppableId={column.id} isDropDisabled={isCollapsed}>
                    {(provided) => (
                      <div 
                        className={cn(
                          "flex-grow p-2 overflow-y-auto min-h-[200px] transition-all",
                          isCollapsed && "max-h-0 min-h-0 p-0 overflow-hidden"
                        )}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        <AnimatePresence>
                          {!isCollapsed && column.items.map((item, index) => {
                            const isExpanded = expandedCards.includes(item.uniqueID);
                            const isBookmarked = bookmarkedCards.includes(item.uniqueID);
                            
                            return (
                              <Draggable 
                                key={item.uniqueID} 
                                draggableId={item.uniqueID} 
                                index={index}
                              >
                                {(provided) => {
                                  const { innerRef, draggableProps, dragHandleProps } = provided;
                                  
                                  return (
                                    <div
                                      ref={innerRef}
                                      {...draggableProps}
                                      {...dragHandleProps}
                                      className="mb-3"
                                    >
                                      <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2, delay: index * 0.03 }}
                                      >
                                        <Card 
                                          className={cn(
                                            "overflow-hidden hover:shadow-md transition-shadow cursor-pointer",
                                            isBookmarked && "border-amber-300 dark:border-amber-700"
                                          )}
                                          onClick={() => toggleCardExpansion(item.uniqueID)}
                                        >
                                          <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between">
                                            <div className="flex items-center gap-2">
                                              {columnKey !== 'cleanedClass' && (
                                                <div className="flex items-center gap-1.5">
                                                  <BookOpen className="h-3.5 w-3.5 text-slate-500" />
                                                  <span className="text-sm font-medium truncate max-w-[140px]">
                                                    {item.cleanedClass}
                                                  </span>
                                                </div>
                                              )}
                                              
                                              {columnKey !== 'dayOfWeek' && (
                                                <div className="flex items-center gap-1.5">
                                                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                                                  <span className="text-sm">{item.dayOfWeek}</span>
                                                </div>
                                              )}
                                            </div>
                                            
                                            <button
                                              onClick={(e) => toggleCardBookmark(item.uniqueID, e)}
                                              className="text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300"
                                            >
                                              <Bookmark 
                                                className={cn(
                                                  "h-4 w-4",
                                                  isBookmarked ? "fill-current" : "fill-none"
                                                )}
                                              />
                                            </button>
                                          </CardHeader>
                                          
                                          <CardContent className="p-3 pt-2">
                                            <div className="flex items-center gap-2 mb-2">
                                              {cardMetric === 'totalCheckins' && (
                                                <div className="flex items-center gap-2 bg-primary/10 px-2 py-1 rounded-md w-full">
                                                  <Users className="h-4 w-4 text-primary" />
                                                  <div className="flex justify-between items-center w-full">
                                                    <span className="text-xs text-muted-foreground">Check-ins:</span>
                                                    <span className="font-bold">{item.totalCheckins}</span>
                                                  </div>
                                                </div>
                                              )}
                                              
                                              {cardMetric === 'totalRevenue' && (
                                                <div className="flex items-center gap-2 bg-amber-500/10 px-2 py-1 rounded-md w-full">
                                                  <IndianRupee className="h-4 w-4 text-amber-500" />
                                                  <div className="flex justify-between items-center w-full">
                                                    <span className="text-xs text-muted-foreground">Revenue:</span>
                                                    <span className="font-bold">{formatIndianCurrency(Number(item.totalRevenue))}</span>
                                                  </div>
                                                </div>
                                              )}
                                              
                                              {cardMetric === 'period' && (
                                                <div className="flex items-center gap-2 bg-indigo-500/10 px-2 py-1 rounded-md w-full">
                                                  <Calendar className="h-4 w-4 text-indigo-500" />
                                                  <div className="flex justify-between items-center w-full">
                                                    <span className="text-xs text-muted-foreground">Period:</span>
                                                    <span className="font-bold">{item.period}</span>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-x-1 gap-y-1 text-xs text-muted-foreground">
                                              {cardMetric !== 'totalCheckins' && (
                                                <div className="flex items-center justify-between col-span-1">
                                                  <div className="flex items-center gap-1">
                                                    <Users className="h-3 w-3" />
                                                    <span>Checkins:</span>
                                                  </div>
                                                  <span className="font-medium text-foreground">{item.totalCheckins}</span>
                                                </div>
                                              )}
                                              
                                              {cardMetric !== 'totalRevenue' && (
                                                <div className="flex items-center justify-between col-span-1">
                                                  <div className="flex items-center gap-1">
                                                    <IndianRupee className="h-3 w-3" />
                                                    <span>Revenue:</span>
                                                  </div>
                                                  <span className="font-medium text-foreground">
                                                    {formatIndianCurrency(Number(item.totalRevenue))}
                                                  </span>
                                                </div>
                                              )}
                                              
                                              {cardMetric !== 'period' && (
                                                <div className="flex items-center justify-between col-span-1">
                                                  <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>Period:</span>
                                                  </div>
                                                  <span className="font-medium text-foreground">{item.period}</span>
                                                </div>
                                              )}
                                              
                                              {columnKey !== 'teacherName' && (
                                                <div className="flex items-center justify-between col-span-1">
                                                  <div className="flex items-center gap-1">
                                                    <Users className="h-3 w-3" />
                                                    <span>Teacher:</span>
                                                  </div>
                                                  <span className="font-medium text-foreground truncate max-w-[80px]">
                                                    {item.teacherName}
                                                  </span>
                                                </div>
                                              )}
                                              
                                              {columnKey !== 'location' && (
                                                <div className="flex items-center justify-between col-span-1">
                                                  <div className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    <span>Location:</span>
                                                  </div>
                                                  <span className="font-medium text-foreground truncate max-w-[80px]">
                                                    {item.location}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                            
                                            <AnimatePresence>
                                              {isExpanded && (
                                                <motion.div
                                                  initial={{ height: 0, opacity: 0 }}
                                                  animate={{ height: 'auto', opacity: 1 }}
                                                  exit={{ height: 0, opacity: 0 }}
                                                  transition={{ duration: 0.2 }}
                                                  className="mt-3 pt-3 border-t overflow-hidden"
                                                >
                                                  <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-xs">
                                                    <div className="flex items-center justify-between col-span-1">
                                                      <span className="text-muted-foreground">Occurrences:</span>
                                                      <span className="font-medium">{item.totalOccurrences}</span>
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between col-span-1">
                                                      <span className="text-muted-foreground">Class Time:</span>
                                                      <span className="font-medium">{item.classTime}</span>
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between col-span-1">
                                                      <span className="text-muted-foreground">Cancelled:</span>
                                                      <span className="font-medium">{item.totalCancelled}</span>
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between col-span-1">
                                                      <span className="text-muted-foreground">Empty:</span>
                                                      <span className="font-medium">{item.totalEmpty}</span>
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between col-span-1">
                                                      <span className="text-muted-foreground">Non-Empty:</span>
                                                      <span className="font-medium">{item.totalNonEmpty}</span>
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between col-span-1">
                                                      <span className="text-muted-foreground">Non-Paid:</span>
                                                      <span className="font-medium">{item.totalNonPaid}</span>
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between col-span-2">
                                                      <span className="text-muted-foreground">Avg (All):</span>
                                                      <span className="font-medium">{item.classAverageIncludingEmpty}</span>
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between col-span-2">
                                                      <span className="text-muted-foreground">Avg (Non-Empty):</span>
                                                      <span className="font-medium">{item.classAverageExcludingEmpty}</span>
                                                    </div>
                                                  </div>
                                                </motion.div>
                                              )}
                                            </AnimatePresence>
                                          </CardContent>
                                          
                                          <CardFooter className="p-2 border-t flex justify-center items-center text-xs text-muted-foreground">
                                            {isExpanded ? "Click to collapse" : "Click for details"}
                                          </CardFooter>
                                        </Card>
                                      </motion.div>
                                    </div>
                                  );
                                }}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </AnimatePresence>
                        
                        {!isCollapsed && column.items.length === 0 && (
                          <div className="flex items-center justify-center h-32 border border-dashed rounded-lg">
                            <div className="text-center text-muted-foreground text-sm">
                              No items in this column
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanView;
