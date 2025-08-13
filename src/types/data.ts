
export interface RawDataRow {
  'Teacher First Name': string;
  'Teacher Last Name': string;
  'Teacher Email'?: string;
  'Time (h)': string;
  'Class name': string;
  'Class date': string;
  'Location': string;
  'Payrate': string;
  'Employee Code'?: string;
  'Payrate Code'?: string;
  'Total Revenue': string;
  'Base Payout'?: string;
  'Additional Payout'?: string;
  'Total Payout'?: string;
  'Tip'?: string;
  'Participants'?: string;
  'Checked in': string;
  'Comps'?: string;
  'Checked In Comps'?: string;
  'Late cancellations'?: string;
  'Non Paid Customers'?: string;
}

export interface ClassOccurrence {
  date: string;
  checkins: number;
  revenue: number;
  cancelled: number;
  nonPaid: number;
  isEmpty: boolean;
}

export interface ProcessedData {
  teacherName: string;
  teacherEmail?: string;
  totalTime: number;
  classTime: string;
  location: string;
  cleanedClass: string;
  date: string;
  dayOfWeek: string;
  period: string; // e.g., "Mar-22"
  totalCheckins: number;
  totalOccurrences: number;
  totalRevenue: number | string;
  totalCancelled: number;
  totalEmpty: number;
  totalNonEmpty: number;
  totalNonPaid: number;
  classAverageIncludingEmpty: number | string;
  classAverageExcludingEmpty: number | string;
  uniqueID: string; // For tracking purposes
  totalPayout?: number | string;
  totalBasePayout?: number | string;
  totalAdditionalPayout?: number | string;
  totalTips?: number | string;
  totalParticipants?: number | string;
  totalComps?: number | string;
  datesOccurred?: Set<string>;
  occurrences: ClassOccurrence[]; // New field to track individual occurrences
}

export type ViewMode = 'table' | 'grid' | 'kanban' | 'timeline' | 'pivot';

export interface FilterOption {
  field: keyof ProcessedData;
  operator: 'contains' | 'equals' | 'starts' | 'ends' | 'greater' | 'less' | 'after' | 'before' | 'on' | 'in';
  value: string;
}

export interface SortOption {
  field: keyof ProcessedData;
  direction: 'asc' | 'desc';
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'donut';
  primaryMetric: keyof ProcessedData;
  groupBy: keyof ProcessedData;
}

export interface MetricData {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  color?: string;
}

// Add these for KanbanBoard
export interface KanbanItem {
  id: string;
  content: ProcessedData;
  data: ProcessedData;
}

export interface KanbanCardProps {
  data: ProcessedData;
  key?: string;
  isActive: boolean;
}

export type Theme = 'light' | 'dark' | 'system';
