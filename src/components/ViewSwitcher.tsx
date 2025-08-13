
import React from 'react';
import { ViewMode } from '@/types/data';
import { 
  Table, 
  Grid, 
  Kanban, 
  Clock, 
  PieChart 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ViewSwitcherProps {
  viewMode: ViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
}

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ viewMode, setViewMode }) => {
  const views: {id: ViewMode, label: string, icon: React.ReactNode}[] = [
    { id: 'table', label: 'Table View', icon: <Table className="h-4 w-4" /> },
    { id: 'grid', label: 'Grid View', icon: <Grid className="h-4 w-4" /> },
    { id: 'kanban', label: 'Kanban Board', icon: <Kanban className="h-4 w-4" /> },
    { id: 'timeline', label: 'Timeline', icon: <Clock className="h-4 w-4" /> },
    { id: 'pivot', label: 'Pivot Table', icon: <PieChart className="h-4 w-4" /> }
  ];

  return (
    <div className="flex overflow-x-auto py-2 gap-2 bg-white dark:bg-gray-950 border rounded-lg p-2">
      {views.map(view => (
        <Tooltip key={view.id}>
          <TooltipTrigger asChild>
            <Button
              variant={viewMode === view.id ? "default" : "outline"}
              className={cn(
                "flex items-center gap-2",
                viewMode === view.id ? "bg-primary/90 text-primary-foreground" : ""
              )}
              onClick={() => setViewMode(view.id as ViewMode)}
            >
              {view.icon}
              {view.label}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Switch to {view.label}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};
