
import { ProcessedData, RawDataRow, ClassOccurrence } from "@/types/data";

export function getCleanedClass(sessionName: string): string {
  // Check for specific classes first
  if (/barre 57|barre57/i.test(sessionName)) {
      return /express/i.test(sessionName) ? "Studio Barre 57 Express" : "Studio Barre 57";
  } else if (/mat/i.test(sessionName)) {
      return /express/i.test(sessionName) ? "Studio Mat 57 Express" : "Studio Mat 57";
  } else if (/Trainer|Trainer's/i.test(sessionName)) {
      return /express/i.test(sessionName) ? "Studio Trainer's Choice Express" : "Studio Trainer's Choice";
  } else if (/cardio barre|Studio Cardio/i.test(sessionName)) {
      if (/plus/i.test(sessionName)) {
          return "Studio Cardio Barre Plus";
      } else if (/express/i.test(sessionName)) {
          return "Studio Cardio Barre Express";
      } else {
          return "Studio Cardio Barre";
      }
  } else if (/back body/i.test(sessionName)) {
      return /express/i.test(sessionName) ? "Studio Back Body Blaze Express" : "Studio Back Body Blaze";
  } else if (/fit/i.test(sessionName)) {
      return /express/i.test(sessionName) ? "Studio FIT Express" : "Studio FIT";
  } else if (/powercycle/i.test(sessionName)) {
      return /express/i.test(sessionName) ? "Studio powerCycle Express" : "Studio powerCycle";
  } else if (/amped/i.test(sessionName)) {
      return /express/i.test(sessionName) ? "Studio Amped Up! Express" : "Studio Amped Up!";
  } else if (/sweat/i.test(sessionName)) {
      return /express/i.test(sessionName) ? "Studio SWEAT In 30 Express" : "Studio SWEAT In 30";
  } else if (/foundation/i.test(sessionName)) {
      return /express/i.test(sessionName) ? "Studio Foundations Express" : "Studio Foundations";
  } else if (/recovery/i.test(sessionName)) {
      return /express/i.test(sessionName) ? "Studio Recovery Express" : "Studio Recovery";
  } else if (/pre\/post/i.test(sessionName)) {
      return "Studio Pre/Post Natal";
  } else if (/hiit/i.test(sessionName)) {
      return /express/i.test(sessionName) ? "Studio HIIT Express" : "Studio HIIT";
  }

  // Finally check for hosted classes
  if (/hosted|bridal|lrs|x p57|rugby|wework|olympics|birthday|host|raheja|pop|workshop|community|physique|soundrise|outdoor|p57 x|x/i.test(sessionName)) {
      return "Studio Hosted Class";
  }

  // If no match is found, return the original class name to avoid empty data
  return sessionName;
}

export function extractClassTime(dateTimeStr: string): string {
  try {
    // Format: "2023-04-07, 11:30 AM"
    const parts = dateTimeStr.split(', ');
    if (parts.length > 1) {
      return parts[1].trim();
    }
  } catch (error) {
    console.error('Error extracting class time:', error);
  }
  return '';
}

export function getDayOfWeek(dateStr: string): string {
  try {
    // Format: "2023-04-07, 11:30 AM"
    const parts = dateStr.split(', ');
    const datePart = parts[0].trim();
    
    const date = new Date(datePart);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  } catch (error) {
    console.error('Error getting day of week:', error);
    return '';
  }
}

export function getPeriod(dateStr: string): string {
  try {
    // Format: "2023-04-07, 11:30 AM"
    const parts = dateStr.split(', ');
    const datePart = parts[0].trim();
    
    const date = new Date(datePart);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear().toString().slice(-2);
    
    return `${month}-${year}`;
  } catch (error) {
    console.error('Error getting period:', error);
    return '';
  }
}

export function processRawData(rawData: RawDataRow[]): ProcessedData[] {
  console.log(`Processing ${rawData.length} raw data rows`);
  
  // Create a map to store processed data grouped by key attributes
  const processedDataMap = new Map<string, ProcessedData>();

  rawData.forEach((row, index) => {
    try {
      // Extract the necessary data from the row - adapting to the actual field names
      const teacherFirstName = row['Teacher First Name'] || '';
      const teacherLastName = row['Teacher Last Name'] || '';
      const teacherName = `${teacherFirstName} ${teacherLastName}`.trim();
      const teacherEmail = row['Teacher Email'] || '';
      const className = row['Class name'] || '';
      const classDate = row['Class date'] || '';
      const location = row['Location'] || '';
      const totalTime = parseFloat(row['Time (h)'] || '0');
      
      // Adjust field parsing based on the actual data format
      const checkedIn = parseFloat(row['Checked in'] || '0');
      const lateCancelled = parseFloat(row['Late cancellations'] || '0');
      const paid = parseFloat(row['Total Revenue'] || '0');
      const comp = parseFloat(row['Checked In Comps'] || row['Comps'] || '0');
      const nonPaidCustomers = parseFloat(row['Non Paid Customers'] || '0');
      
      // Process class data
      const cleanedClass = getCleanedClass(className) || "Unknown Class";
      const classTime = extractClassTime(classDate);
      const dayOfWeek = getDayOfWeek(classDate);
      const period = getPeriod(classDate);
      
      // Create a unique ID for this class
      const dateOnly = classDate.split(',')[0].trim();
      
      // Include teacher name in the key to group by instructor as well
      const key = `${cleanedClass}-${dayOfWeek}-${classTime}-${location}-${teacherName}`;
      
      // Create occurrence object for this specific class instance
      const occurrence: ClassOccurrence = {
        date: dateOnly,
        checkins: checkedIn,
        revenue: paid,
        cancelled: lateCancelled,
        nonPaid: comp + nonPaidCustomers,
        isEmpty: checkedIn === 0
      };
      
      console.log(`Row ${index}: Key=${key}, Date=${dateOnly}, CheckedIn=${checkedIn}, Paid=${paid}`);
      
      if (processedDataMap.has(key)) {
        // Update existing record
        const existingRecord = processedDataMap.get(key)!;
        existingRecord.occurrences.push(occurrence);
        
        // Recalculate totals
        existingRecord.totalCheckins = existingRecord.occurrences.reduce((sum, occ) => sum + occ.checkins, 0);
        existingRecord.totalRevenue = existingRecord.occurrences.reduce((sum, occ) => sum + occ.revenue, 0);
        existingRecord.totalCancelled = existingRecord.occurrences.reduce((sum, occ) => sum + occ.cancelled, 0);
        existingRecord.totalNonPaid = existingRecord.occurrences.reduce((sum, occ) => sum + occ.nonPaid, 0);
        existingRecord.totalOccurrences = existingRecord.occurrences.length;
        existingRecord.totalEmpty = existingRecord.occurrences.filter(occ => occ.isEmpty).length;
        existingRecord.totalNonEmpty = existingRecord.occurrences.filter(occ => !occ.isEmpty).length;
      } else {
        // Create new record
        const newRecord: ProcessedData = {
          teacherName,
          teacherEmail,
          totalTime,
          location,
          cleanedClass,
          classTime,
          date: dateOnly,
          dayOfWeek,
          period,
          totalCheckins: checkedIn,
          totalOccurrences: 1,
          totalRevenue: paid,
          totalCancelled: lateCancelled,
          totalEmpty: checkedIn === 0 ? 1 : 0,
          totalNonEmpty: checkedIn > 0 ? 1 : 0,
          totalNonPaid: comp + nonPaidCustomers,
          classAverageIncludingEmpty: 0, // Will calculate later
          classAverageExcludingEmpty: 0, // Will calculate later
          uniqueID: `${cleanedClass}-${dayOfWeek}-${classTime}-${location}-${dateOnly}`.replace(/\s+/g, '_'),
          occurrences: [occurrence]
        };
        
        processedDataMap.set(key, newRecord);
      }
    } catch (error) {
      console.error(`Error processing row ${index}:`, error, 'Row data:', JSON.stringify(row));
    }
  });

  // Convert the map to an array
  const processedData = Array.from(processedDataMap.values());
  
  console.log(`Generated ${processedData.length} processed data records`);
  
  // Calculate averages
  processedData.forEach(record => {
    if (record.totalOccurrences > 0) {
      record.classAverageIncludingEmpty = Number((record.totalCheckins / record.totalOccurrences).toFixed(1));
    } else {
      record.classAverageIncludingEmpty = 'N/A';
    }
    
    if (record.totalNonEmpty > 0) {
      record.classAverageExcludingEmpty = Number((record.totalCheckins / record.totalNonEmpty).toFixed(1));
    } else {
      record.classAverageExcludingEmpty = 'N/A';
    }
    
    // Ensure totalRevenue is a number
    if (typeof record.totalRevenue === 'string') {
      record.totalRevenue = parseFloat(record.totalRevenue) || 0;
    }
  });
  
  return processedData;
}

// Helper function to recompute ProcessedData based on filtered occurrences
export function recomputeProcessedData(item: ProcessedData, filteredOccurrences: ClassOccurrence[]): ProcessedData {
  if (filteredOccurrences.length === 0) {
    return {
      ...item,
      totalCheckins: 0,
      totalOccurrences: 0,
      totalRevenue: 0,
      totalCancelled: 0,
      totalEmpty: 0,
      totalNonEmpty: 0,
      totalNonPaid: 0,
      classAverageIncludingEmpty: 'N/A',
      classAverageExcludingEmpty: 'N/A',
      occurrences: filteredOccurrences
    };
  }

  const totalCheckins = filteredOccurrences.reduce((sum, occ) => sum + occ.checkins, 0);
  const totalRevenue = filteredOccurrences.reduce((sum, occ) => sum + occ.revenue, 0);
  const totalCancelled = filteredOccurrences.reduce((sum, occ) => sum + occ.cancelled, 0);
  const totalNonPaid = filteredOccurrences.reduce((sum, occ) => sum + occ.nonPaid, 0);
  const totalEmpty = filteredOccurrences.filter(occ => occ.isEmpty).length;
  const totalNonEmpty = filteredOccurrences.filter(occ => !occ.isEmpty).length;
  const totalOccurrences = filteredOccurrences.length;

  const classAverageIncludingEmpty = totalOccurrences > 0 ? 
    Number((totalCheckins / totalOccurrences).toFixed(1)) : 'N/A';
  const classAverageExcludingEmpty = totalNonEmpty > 0 ? 
    Number((totalCheckins / totalNonEmpty).toFixed(1)) : 'N/A';

  return {
    ...item,
    totalCheckins,
    totalOccurrences,
    totalRevenue,
    totalCancelled,
    totalEmpty,
    totalNonEmpty,
    totalNonPaid,
    classAverageIncludingEmpty,
    classAverageExcludingEmpty,
    occurrences: filteredOccurrences
  };
}
