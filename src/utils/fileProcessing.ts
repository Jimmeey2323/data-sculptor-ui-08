
import { ProcessedData, RawDataRow } from "@/types/data";
import { processRawData } from "./dataProcessing";
import { toast } from "@/hooks/use-toast";

export async function processZipFile(file: File): Promise<ProcessedData[]> {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('Starting zip file processing...');
      // Load JSZip dynamically to reduce initial bundle size
      const JSZip = (await import('jszip')).default;
      const Papa = (await import('papaparse')).default;
      
      const zip = new JSZip();
      
      // Read the zip file
      const zipContent = await zip.loadAsync(file);
      
      let foundFile = null;
      let fileName = '';
      
      // Search for the target CSV file in the zip
      const targetFileName = "momence-teachers-payroll-report-aggregate-combined";
      
      console.log('Looking for files matching pattern:', targetFileName);
      console.log('Available files in ZIP:', Object.keys(zipContent.files));
      
      // Look through all files in the zip
      const filePromises = Object.keys(zipContent.files).map(async (filename) => {
        console.log('Examining file in zip:', filename);
        if (filename.toLowerCase().includes(targetFileName.toLowerCase()) && filename.endsWith('.csv')) {
          console.log('Found matching file:', filename);
          fileName = filename;
          const fileData = await zipContent.files[filename].async("string");
          return fileData;
        }
        return null;
      });
      
      const results = await Promise.all(filePromises);
      foundFile = results.find(result => result !== null);
      
      // If we can't find the exact match, try a more general approach
      if (!foundFile) {
        console.log('No exact match found, looking for any CSV file');
        // Try looking for any CSV file
        const csvFiles = Object.keys(zipContent.files).filter(name => name.endsWith('.csv'));
        if (csvFiles.length > 0) {
          console.log('Found CSV file instead:', csvFiles[0]);
          fileName = csvFiles[0];
          foundFile = await zipContent.files[csvFiles[0]].async("string");
        }
      }
      
      if (!foundFile) {
        console.error('No matching file found in zip. Available files:', Object.keys(zipContent.files));
        toast({
          title: "File not found",
          description: "Could not find the required data file in the ZIP. Please make sure it contains a file with 'momence-teachers-payroll-report-aggregate-combined' in its name.",
          variant: "destructive"
        });
        throw new Error(`Could not find the target file "${targetFileName}" in the uploaded ZIP.`);
      }
      
      console.log(`Found matching file: ${fileName}, parsing CSV data...`);
      toast({
        title: "File found",
        description: `Processing data from ${fileName}`,
      });
      
      // Parse CSV content
      Papa.parse(foundFile, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function(results) {
          console.log('CSV parsing complete. Row count:', results.data?.length);
          console.log('CSV headers:', results.meta?.fields);
          
          // Check if we have valid data
          if (results.data && Array.isArray(results.data) && results.data.length > 0) {
            console.log('Sample row:', results.data[0]);
            
            // Log field names to help debugging
            if (results.data[0]) {
              console.log('Available fields in first row:', Object.keys(results.data[0]));
            }
            
            try {
              const processedData = processRawData(results.data as RawDataRow[]);
              console.log(`Processed ${processedData.length} data records`);
              toast({
                title: "Data processed",
                description: `Successfully processed ${processedData.length} records`,
              });
              resolve(processedData);
            } catch (error) {
              console.error('Error in processRawData:', error);
              toast({
                title: "Processing error",
                description: "Error while processing the CSV data. Please check console for details.",
                variant: "destructive"
              });
              reject(error);
            }
          } else {
            toast({
              title: "Empty data",
              description: "The CSV file doesn't contain any valid data rows.",
              variant: "destructive"
            });
            reject(new Error('CSV file is empty or invalid.'));
          }
        },
        error: function(error) {
          console.error('Error parsing CSV:', error);
          toast({
            title: "CSV parsing error",
            description: "Failed to parse the CSV file. It may be corrupted or in an unexpected format.",
            variant: "destructive"
          });
          reject(error);
        }
      });
    } catch (error) {
      console.error('Error processing zip file:', error);
      toast({
        title: "Error",
        description: "Failed to process the ZIP file. Please check if it's a valid ZIP archive.",
        variant: "destructive"
      });
      reject(error);
    }
  });
}

export function exportToCSV(data: ProcessedData[]): void {
  try {
    const Papa = require('papaparse');
    
    // Convert the data to a CSV string
    const csv = Papa.unparse(data);
    
    // Create a blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `class_data_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export successful",
      description: "Your data has been exported to CSV successfully."
    });
  } catch (error) {
    console.error('Error exporting CSV:', error);
    toast({
      title: "Export failed",
      description: "Failed to export data to CSV. Please try again.",
      variant: "destructive"
    });
  }
}
