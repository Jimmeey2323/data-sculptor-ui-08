import React, { useState } from 'react';
import { ProcessedData, GroupedData, DataTableProps } from '@/types/data';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableRow } from "@/components/ui/table"
import { Badge } from '@/components/ui/badge';
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronRight, TrendingUp } from 'lucide-react';

const DataTable: React.FC<DataTableProps> = ({ data, filters }) => {
  const [search, setSearch] = useState("");
  const [expandedRows, setExpandedRows] = useState(new Set<number>());

  const toggleRow = (index: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(index)) {
      newExpandedRows.delete(index);
    } else {
      newExpandedRows.add(index);
    }
    setExpandedRows(newExpandedRows);
  };

  const renderRow = (item: ProcessedData | GroupedData, index: number, isChild = false) => {
    const isGrouped = 'items' in item;
    const isExpanded = expandedRows.has(index);

    return (
      <React.Fragment key={index}>
        <TableRow 
          className={`
            ${isChild ? 'bg-muted/30 border-l-4 border-l-primary/40' : 'hover:bg-muted/50'} 
            transition-all duration-200 cursor-pointer group
            ${isExpanded ? 'bg-muted/20' : ''}
          `}
          onClick={() => !isChild && isGrouped && toggleRow(index)}
        >
          <TableCell className="font-medium">
            <div className="flex items-center gap-2">
              {!isChild && isGrouped && (
                <ChevronRight 
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isExpanded ? 'rotate-90' : ''
                  }`} 
                />
              )}
              {isChild && <div className="w-4" />}
              <span className={isChild ? 'text-sm text-muted-foreground' : ''}>
                {isGrouped ? item.groupKey : item.cleanedClass}
              </span>
            </div>
          </TableCell>
          <TableCell>
            <Badge variant={isChild ? "outline" : "secondary"} className="text-xs">
              {isGrouped ? item.location : item.location}
            </Badge>
          </TableCell>
          <TableCell className="text-sm">
            {isGrouped ? item.date : item.date}
          </TableCell>
          <TableCell className="text-sm">
            {isGrouped ? item.classTime : item.classTime}
          </TableCell>
          <TableCell className="font-medium">
            {isChild ? 1 : (isGrouped ? item.items.length : 1)}
          </TableCell>
          <TableCell className="font-medium">
            ${isGrouped ? item.totalRevenue.toLocaleString() : item.totalRevenue.toLocaleString()}
          </TableCell>
          <TableCell className="font-medium">
            {isGrouped ? item.totalCheckins.toLocaleString() : item.totalCheckins.toLocaleString()}
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs font-medium">
                ${isGrouped ? (item.totalRevenue / item.items.length).toFixed(0) : item.totalRevenue}
              </span>
            </div>
          </TableCell>
        </TableRow>
        
        {!isChild && isGrouped && isExpanded && (
          <>
            {item.items.map((childItem, childIndex) => 
              renderRow(childItem, `${index}-${childIndex}` as any, true)
            )}
          </>
        )}
      </React.Fragment>
    );
  };

  const filteredData = data.filter(item => {
    const searchTerm = search.toLowerCase();
    return (
      item.cleanedClass.toLowerCase().includes(searchTerm) ||
      item.location.toLowerCase().includes(searchTerm) ||
      item.date.toLowerCase().includes(searchTerm) ||
      item.classTime.toLowerCase().includes(searchTerm)
    );
  });

  const debouncedSetSearch = (value: string) => {
    setTimeout(() => {
      setSearch(value);
    }, 300);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-4">
        <Input
          placeholder="Search classes..."
          onChange={(e) => debouncedSetSearch(e.target.value)}
        />
      </div>
      <ScrollArea>
        <Table>
          <TableCaption>A list of your recent classes.</TableCaption>
          <TableHead>
            <TableRow>
              <TableHead className="w-[200px]">Class</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Classes</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Check-ins</TableHead>
              <TableHead>Avg. Revenue</TableHead>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((item, index) => (
              renderRow(item, index)
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default DataTable;
