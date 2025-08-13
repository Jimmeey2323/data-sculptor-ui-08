
import React, { useState, useEffect, useMemo } from 'react';
import { ProcessedData } from '@/types/data';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Badge,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Label,
} from '@/components/ui/components';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  IndianRupee, 
  Filter,
  Search,
  ArrowUpDown,
  Grid3x3,
  BookOpen
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { trainerAvatars } from '../Dashboard';
import { formatIndianCurrency } from '../MetricsPanel';
import { AnimatePresence, motion } from 'framer-motion';

interface GridViewProps {
  data: ProcessedData[];
  trainerAvatars: Record<string, string>;
}

export type GridGrouping = 'cleanedClass' | 'dayOfWeek' | 'location' | 'teacherName' | 'none';
export type GridCardMetric = 'totalCheckins' | 'totalRevenue' | 'classAverageIncludingEmpty' | 'totalClasses';

const GridView: React.FC<GridViewProps> = ({ data, trainerAvatars }) => {
  const [groupBy, setGroupBy] = useState<GridGrouping>('cleanedClass');
  const [displayMetric, setDisplayMetric] = useState<GridCardMetric>('totalCheckins');
  const [cardsPerRow, setCardsPerRow] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  
  // Group the data based on the selected grouping option
  const groupedData = useMemo(() => {
    if (!data.length) return {};

    // If no grouping, return each item as its own group
    if (groupBy === 'none') {
      return data.reduce((acc, item) => {
        const key = item.uniqueID;
        if (!acc[key]) {
          acc[key] = [item];
        }
        return acc;
      }, {} as Record<string, ProcessedData[]>);
    }

    // Group by the selected field
    return data.reduce((acc, item) => {
      const key = String(item[groupBy]);
      
      // Filter by search query if present
      if (searchQuery && !key.toLowerCase().includes(searchQuery.toLowerCase())) {
        return acc;
      }
      
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as Record<string, ProcessedData[]>);
  }, [data, groupBy, searchQuery]);

  // Calculate aggregate values for each group
  const cardData = useMemo(() => {
    return Object.entries(groupedData).map(([groupName, items]) => {
      // Calculate aggregates
      const totalClasses = items.reduce((sum, item) => sum + item.totalOccurrences, 0);
      const totalCheckins = items.reduce((sum, item) => sum + item.totalCheckins, 0);
      const totalRevenue = items.reduce((sum, item) => {
        return sum + Number(item.totalRevenue || 0);
      }, 0);
      const avgClassSize = totalClasses > 0 ? totalCheckins / totalClasses : 0;
      
      // For teacher cards, get the avatar
      const teacherAvatar = groupBy === 'teacherName' ? trainerAvatars[groupName] : null;
      
      // For display on the card
      let displayValue: string | number = 0;
      
      switch(displayMetric) {
        case 'totalCheckins':
          displayValue = totalCheckins;
          break;
        case 'totalRevenue':
          displayValue = formatIndianCurrency(totalRevenue);
          break;
        case 'classAverageIncludingEmpty':
          displayValue = avgClassSize.toFixed(1);
          break;
        case 'totalClasses':
          displayValue = totalClasses;
          break;
        default:
          displayValue = totalCheckins;
      }
      
      return {
        id: groupName,
        groupName,
        items,
        totalClasses,
        totalCheckins,
        totalRevenue,
        avgClassSize,
        displayValue,
        teacherAvatar
      };
    }).sort((a, b) => {
      // Sort based on the selected metric
      if (displayMetric === 'totalRevenue') {
        return b.totalRevenue - a.totalRevenue;
      } else if (displayMetric === 'totalCheckins') {
        return b.totalCheckins - a.totalCheckins;
      } else if (displayMetric === 'classAverageIncludingEmpty') {
        return b.avgClassSize - a.avgClassSize;
      } else {
        return b.totalClasses - a.totalClasses;
      }
    });
  }, [groupedData, displayMetric, groupBy, trainerAvatars]);

  const toggleCardExpansion = (cardId: string) => {
    setExpandedCard(prevId => prevId === cardId ? null : cardId);
  };

  // Generate background gradient classes based on metrics
  const getCardGradient = (index: number, value: number, max: number) => {
    // Use a different gradient based on index to create variety
    const gradientIndex = index % 4;
    const gradients = [
      'from-blue-500 to-indigo-600',
      'from-purple-500 to-pink-600',
      'from-emerald-500 to-teal-600',
      'from-amber-500 to-orange-600'
    ];
    
    // Adjust opacity based on the value relative to max
    const intensity = Math.max(0.5, Math.min(1, value / (max || 1)));
    
    return `bg-gradient-to-br ${gradients[gradientIndex]} bg-opacity-${Math.round(intensity * 100)}`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Grid View</h2>
          <p className="text-muted-foreground">Visualize your class data in a card layout</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          {/* Search bar */}
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
          
          {/* Group by selector */}
          <div className="w-full sm:w-auto">
            <Select value={groupBy} onValueChange={(value) => setGroupBy(value as GridGrouping)}>
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
                <SelectItem value="none">No Grouping</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Display metric selector */}
          <div className="w-full sm:w-auto">
            <Select value={displayMetric} onValueChange={(value) => setDisplayMetric(value as GridCardMetric)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <SelectValue placeholder="Show metric" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="totalCheckins">Show Check-ins</SelectItem>
                <SelectItem value="totalRevenue">Show Revenue</SelectItem>
                <SelectItem value="classAverageIncludingEmpty">Show Avg Attendance</SelectItem>
                <SelectItem value="totalClasses">Show Total Classes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Card size control */}
          <div className="w-full sm:w-auto flex items-center gap-2">
            <Grid3x3 className="h-4 w-4 text-muted-foreground" />
            <Slider 
              className="w-24"
              min={1} 
              max={6} 
              step={1} 
              value={[cardsPerRow]} 
              onValueChange={(values) => setCardsPerRow(values[0])}
            />
          </div>
        </div>
      </div>
      
      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${Math.min(cardsPerRow, 3)} lg:grid-cols-${cardsPerRow} gap-6`}>
        {cardData.map((card, index) => {
          // Find the maximum value to normalize the background intensity
          const maxValue = Math.max(...cardData.map(c => 
            displayMetric === 'totalRevenue' ? c.totalRevenue : 
            displayMetric === 'totalCheckins' ? c.totalCheckins : 
            displayMetric === 'classAverageIncludingEmpty' ? c.avgClassSize : 
            c.totalClasses
          ));
          
          // Get the value for background intensity
          const valueForBg = displayMetric === 'totalRevenue' ? card.totalRevenue : 
                             displayMetric === 'totalCheckins' ? card.totalCheckins : 
                             displayMetric === 'classAverageIncludingEmpty' ? card.avgClassSize : 
                             card.totalClasses;
          
          const isExpanded = expandedCard === card.id;
          
          return (
            <motion.div 
              key={card.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex flex-col"
            >
              <Card 
                className={`overflow-hidden h-full flex flex-col cursor-pointer hover:shadow-lg transition-shadow group ${isExpanded ? 'shadow-md' : ''}`}
                onClick={() => toggleCardExpansion(card.id)}
              >
                <CardHeader className={`relative p-5 ${getCardGradient(index, valueForBg, maxValue)} text-white`}>
                  <div className="absolute top-0 right-0 bottom-0 left-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  <div className="relative z-10">
                    <CardTitle className="flex items-center gap-2 text-lg mb-1 truncate">
                      {groupBy === 'cleanedClass' && <BookOpen className="h-5 w-5" />}
                      {groupBy === 'dayOfWeek' && <Calendar className="h-5 w-5" />}
                      {groupBy === 'location' && <MapPin className="h-5 w-5" />}
                      {groupBy === 'teacherName' && (
                        card.teacherAvatar ? (
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={card.teacherAvatar} alt={card.groupName} />
                            <AvatarFallback className="bg-white/20 text-white">
                              {card.groupName.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <Users className="h-5 w-5" />
                        )
                      )}
                      <span className="truncate">{card.groupName}</span>
                    </CardTitle>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-white border-white/30 bg-white/10">
                        {card.totalClasses} {card.totalClasses === 1 ? 'class' : 'classes'}
                      </Badge>
                      <div className="text-3xl font-bold">
                        {displayMetric === 'totalCheckins' && (
                          <div className="flex items-center gap-1">
                            <Users className="h-5 w-5 text-white/70" />
                            {card.displayValue}
                          </div>
                        )}
                        {displayMetric === 'totalRevenue' && (
                          <div className="flex items-center gap-1">
                            <IndianRupee className="h-5 w-5 text-white/70" />
                            {card.displayValue}
                          </div>
                        )}
                        {displayMetric === 'classAverageIncludingEmpty' && (
                          <div className="flex items-center gap-1">
                            <ArrowUpDown className="h-5 w-5 text-white/70" />
                            {card.displayValue}
                          </div>
                        )}
                        {displayMetric === 'totalClasses' && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-5 w-5 text-white/70" />
                            {card.displayValue}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-grow p-4 bg-card">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Check-ins:</span>
                    </div>
                    <div className="font-medium text-right">{card.totalCheckins}</div>
                    
                    <div className="flex items-center gap-1">
                      <IndianRupee className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Revenue:</span>
                    </div>
                    <div className="font-medium text-right">{formatIndianCurrency(card.totalRevenue)}</div>
                    
                    <div className="flex items-center gap-1">
                      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Avg Size:</span>
                    </div>
                    <div className="font-medium text-right">{card.avgClassSize.toFixed(1)}</div>
                  </div>
                </CardContent>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden bg-card"
                    >
                      <div className="px-4 pb-4 space-y-3">
                        <div className="text-sm font-medium">Detail Records</div>
                        <div className="max-h-60 overflow-y-auto pr-1 space-y-2">
                          {card.items.slice(0, 10).map((item, itemIndex) => (
                            <div 
                              key={`${item.uniqueID}-${itemIndex}`} 
                              className="text-sm p-2 rounded-lg bg-muted hover:bg-primary/5"
                            >
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">{item.period}</span>
                                <Badge variant="outline" className="text-xs">{item.totalOccurrences} classes</Badge>
                              </div>
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Users className="h-3.5 w-3.5" />
                                  <span>{item.totalCheckins} check-ins</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <IndianRupee className="h-3.5 w-3.5" />
                                  <span>{formatIndianCurrency(Number(item.totalRevenue))}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                          {card.items.length > 10 && (
                            <div className="text-center text-xs text-muted-foreground py-1">
                              + {card.items.length - 10} more records
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <CardFooter className="p-3 border-t text-xs text-center text-muted-foreground bg-card">
                  {isExpanded ? "Click to collapse" : "Click for details"}
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </div>
      
      {cardData.length === 0 && (
        <div className="flex items-center justify-center h-48 border border-dashed rounded-lg">
          <div className="text-center text-muted-foreground">
            <div className="mb-2">No data found</div>
            <div className="text-sm">Try changing the grouping or search criteria</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GridView;
