
import React from 'react';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { ProcessedData } from '@/types/data';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import KanbanCard from './KanbanCard';

interface Column {
  id: string;
  name: string;
  items: { id: string; data: ProcessedData }[];
}

interface KanbanBoardProps {
  data: ProcessedData[];
  trainerAvatars: Record<string, string>;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ data, trainerAvatars }) => {
  const [columns, setColumns] = React.useState<{ [key: string]: Column }>({
    'column-1': {
      id: 'column-1',
      name: 'Scheduled',
      items: data
        .filter(item => item.totalCheckins === 0 && item.totalCancelled === 0)
        .map(item => ({ id: item.uniqueID, data: item })),
    },
    'column-2': {
      id: 'column-2',
      name: 'Completed',
      items: data
        .filter(item => item.totalCheckins > 0)
        .map(item => ({ id: item.uniqueID, data: item })),
    },
    'column-3': {
      id: 'column-3',
      name: 'Cancelled',
      items: data
        .filter(item => item.totalCancelled > 0)
        .map(item => ({ id: item.uniqueID, data: item })),
    },
  });

  const [selectedCard, setSelectedCard] = React.useState<string | null>(null);

  const columnStyles: { [key: string]: string } = {
    'column-1': 'bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700',
    'column-2': 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700',
    'column-3': 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700',
  };

  const columnIcons: { [key: string]: React.ReactNode } = {
    'column-1': <Badge variant="outline" className="mr-2">⏳</Badge>,
    'column-2': <Badge variant="outline" className="mr-2">✅</Badge>,
    'column-3': <Badge variant="outline" className="mr-2">❌</Badge>,
  };

  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const start = columns[source.droppableId];
    const end = columns[destination.droppableId];

    if (start === end) {
      const newItemIds = Array.from(start.items);
      newItemIds.splice(source.index, 1);
      newItemIds.splice(destination.index, 0, { id: draggableId, data: data.find(item => item.uniqueID === draggableId)! });

      const newColumn = {
        ...start,
        items: newItemIds,
      };
      setColumns({
        ...columns,
        [newColumn.id]: newColumn,
      });
      return;
    }

    // Moving from one list to another
    const startItemIds = Array.from(start.items);
    const [removed] = startItemIds.splice(source.index, 1);
    const destinationItemIds = Array.from(end.items);
    destinationItemIds.splice(destination.index, 0, removed);

    const newStart = {
      ...start,
      items: startItemIds,
    };
    const newEnd = {
      ...end,
      items: destinationItemIds,
    };

    setColumns({
      ...columns,
      [newStart.id]: newStart,
      [newEnd.id]: newEnd,
    });
  };
  
  return (
    <div className="my-6">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.keys(columns).map((columnId, index) => (
            <div key={columnId} className={`p-4 rounded-lg border ${columnStyles[columnId]}`}>
              <h3 className="font-semibold text-lg mb-3 flex items-center">
                {columnIcons[columnId]}
                {columns[columnId].name} ({columns[columnId].items.length})
              </h3>
              <Droppable droppableId={columnId}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="min-h-[300px]"
                  >
                    {columns[columnId].items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided) => {
                          // Extract the provided props
                          const { innerRef, draggableProps, dragHandleProps } = provided;
                          
                          return (
                            <div
                              ref={innerRef}
                              {...draggableProps}
                              {...dragHandleProps}
                              className="mb-3"
                            >
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                              >
                                <KanbanCard
                                  key={item.id} 
                                  data={item.data}
                                  isActive={selectedCard === item.id}
                                />
                              </motion.div>
                            </div>
                          );
                        }}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
      
      <div className="mt-4 text-sm text-muted-foreground">
        <Badge variant="outline" className="mr-2">⏳</Badge> = Scheduled | <Badge variant="outline" className="mr-2">✅</Badge> = Completed | <Badge variant="outline" className="mr-2">❌</Badge> = Cancelled
      </div>
    </div>
  );
};

export default KanbanBoard;
