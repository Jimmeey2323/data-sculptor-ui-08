
import { ProcessedData } from '@/types/data';
import { recomputeProcessedData } from './dataProcessing';

export interface FilterOptions {
  searchTerm?: string;
  selectedTrainer?: string;
  selectedClass?: string;
  selectedLocation?: string;
  selectedDayOfWeek?: string;
  selectedPeriod?: string;
  dateRange?: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

export function applyFilters(data: ProcessedData[], filters: FilterOptions): ProcessedData[] {
  if (!data || data.length === 0) return [];

  return data
    .map(item => {
      // First, filter occurrences based on date range
      let filteredOccurrences = item.occurrences || [];
      
      if (filters.dateRange && (filters.dateRange.from || filters.dateRange.to)) {
        filteredOccurrences = filteredOccurrences.filter(occurrence => {
          const occurrenceDate = new Date(occurrence.date);
          
          if (filters.dateRange!.from && occurrenceDate < filters.dateRange!.from) {
            return false;
          }
          
          if (filters.dateRange!.to && occurrenceDate > filters.dateRange!.to) {
            return false;
          }
          
          return true;
        });
      }
      
      // Recompute the item based on filtered occurrences
      return recomputeProcessedData(item, filteredOccurrences);
    })
    .filter(item => {
      // Exclude items with no occurrences after date filtering
      if (item.totalOccurrences === 0) {
        return false;
      }
      
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const searchableFields = [
          item.teacherName,
          item.cleanedClass,
          item.location,
          item.dayOfWeek,
          item.classTime
        ].join(' ').toLowerCase();
        
        if (!searchableFields.includes(searchLower)) {
          return false;
        }
      }

      // Trainer filter
      if (filters.selectedTrainer && filters.selectedTrainer !== 'all') {
        if (item.teacherName !== filters.selectedTrainer) {
          return false;
        }
      }

      // Class filter
      if (filters.selectedClass && filters.selectedClass !== 'all') {
        if (item.cleanedClass !== filters.selectedClass) {
          return false;
        }
      }

      // Location filter
      if (filters.selectedLocation && filters.selectedLocation !== 'all') {
        if (item.location !== filters.selectedLocation) {
          return false;
        }
      }

      // Day of week filter
      if (filters.selectedDayOfWeek && filters.selectedDayOfWeek !== 'all') {
        if (item.dayOfWeek !== filters.selectedDayOfWeek) {
          return false;
        }
      }

      // Period filter
      if (filters.selectedPeriod && filters.selectedPeriod !== 'all') {
        if (item.period !== filters.selectedPeriod) {
          return false;
        }
      }

      return true;
    });
}

export function getUniqueValues(data: ProcessedData[], field: keyof ProcessedData): string[] {
  const uniqueValues = new Set<string>();
  
  data.forEach(item => {
    const value = item[field];
    if (value !== null && value !== undefined && value !== '') {
      uniqueValues.add(String(value));
    }
  });
  
  return Array.from(uniqueValues).sort();
}
