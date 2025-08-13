
import React from 'react';
import { ViewMode } from '@/types/data';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  Grid3X3, 
  KanbanSquare, 
  LineChart, 
  PieChart 
} from 'lucide-react';

interface ViewSwitcherWrapperProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const ViewSwitcherWrapper: React.FC<ViewSwitcherWrapperProps> = ({ 
  viewMode,
  setViewMode
}) => {
  const views = [
    { id: 'table', label: 'Table', icon: <Table className="h-4 w-4" /> },
    { id: 'grid', label: 'Grid', icon: <Grid3X3 className="h-4 w-4" /> },
    { id: 'kanban', label: 'Kanban', icon: <KanbanSquare className="h-4 w-4" /> },
    { id: 'timeline', label: 'Timeline', icon: <LineChart className="h-4 w-4" /> },
    { id: 'pivot', label: 'Pivot', icon: <PieChart className="h-4 w-4" /> }
  ];

  return (
    <div className="flex justify-between items-center mb-4">
      <div className="text-lg font-semibold">Data Views</div>
      <div className="flex space-x-1">
        {views.map((view) => (
          <Button
            key={view.id}
            variant={viewMode === view.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode(view.id as ViewMode)}
            className="flex items-center"
          >
            {view.icon}
            <span className="ml-1.5 hidden sm:inline-block">{view.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ViewSwitcherWrapper;
