import React from 'react';
import { ProcessedData, KanbanCardProps } from '@/types/data';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, BarChart3, Users } from 'lucide-react';

const KanbanCard: React.FC<KanbanCardProps> = ({ data, isActive }) => {
  return (
    <Card className={`shadow-sm hover:shadow-md transition-shadow duration-200 ${isActive ? 'border-2 border-primary' : ''}`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium">{data.cleanedClass}</div>
          <Badge variant="secondary">{data.location}</Badge>
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
          <Calendar className="h-3 w-3" />
          {data.date}
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
          <Clock className="h-3 w-3" />
          {data.classTime}
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
          <BarChart3 className="h-3 w-3" />
          Revenue: {data.totalRevenue}
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Users className="h-3 w-3" />
          Check-ins: {data.totalCheckins}
        </div>
      </CardContent>
    </Card>
  );
};

export default KanbanCard;
