import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileUp, FilePlus, File, FileArchive, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
interface FileUploaderProps {
  onFileUpload: (file: File) => void;
}
const FileUploader: React.FC<FileUploaderProps> = ({
  onFileUpload
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<'idle' | 'ready' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleFiles(files);
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };
  const handleFiles = (files: FileList) => {
    if (files.length > 0) {
      if (files[0].name.endsWith('.zip')) {
        setSelectedFile(files[0]);
        setUploadState('ready');
      } else {
        setSelectedFile(files[0]);
        setUploadState('error');
      }
    }
  };
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const uploadFile = () => {
    if (selectedFile && uploadState === 'ready') {
      onFileUpload(selectedFile);
    }
  };
  const resetSelection = () => {
    setSelectedFile(null);
    setUploadState('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  return <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        
        <p className="text-muted-foreground">
          Upload your class data ZIP file to analyze and visualize your studio's performance
        </p>
      </div>
      
      <AnimatePresence mode="wait">
        {!selectedFile ? <motion.div className={`
              relative rounded-xl border-2 border-dashed p-12 text-center transition-all bg-gradient-to-b
              ${isDragging ? 'border-primary bg-primary/5 from-primary/5 to-transparent' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 from-gray-50/50 to-transparent dark:from-gray-900/20'}
            `} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={triggerFileInput} initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: -20
      }} transition={{
        duration: 0.3
      }}>
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="bg-primary/10 p-6 rounded-full">
                <motion.div animate={{
              rotate: [0, 10, -10, 10, 0],
              scale: [1, 1.05, 1]
            }} transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
              repeatDelay: 1
            }}>
                  <FileArchive className="h-16 w-16 text-primary" />
                </motion.div>
              </div>
              <div className="flex flex-col space-y-2 text-center">
                <h3 className="text-xl font-semibold">Upload Your ZIP File</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Drag and drop your ZIP file here or click to browse
                </p>
                
              </div>
              <Button type="button" className="mt-2">
                <FileUp className="mr-2 h-4 w-4" />
                Select ZIP File
              </Button>
            </div>
            <input ref={fileInputRef} type="file" className="hidden" accept=".zip" onChange={handleFileInput} />
          </motion.div> : <motion.div className="border rounded-xl p-8 bg-card" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: -20
      }} transition={{
        duration: 0.3
      }}>
            <div className="flex flex-col items-center space-y-6">
              <div className={`
                p-6 rounded-full 
                ${uploadState === 'ready' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}
              `}>
                {uploadState === 'ready' ? <FileArchive className="h-12 w-12 text-green-600 dark:text-green-400" /> : <X className="h-12 w-12 text-red-600 dark:text-red-400" />}
              </div>
              
              <div className="space-y-4 w-full max-w-md">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Selected file</h3>
                    {uploadState === 'ready' ? <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 px-2 py-1 rounded-full flex items-center">
                        <Check className="mr-1 h-3 w-3" />
                        Ready
                      </span> : <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 px-2 py-1 rounded-full flex items-center">
                        <X className="mr-1 h-3 w-3" />
                        Invalid file
                      </span>}
                  </div>
                  
                  <div className="flex items-center border rounded-lg p-3 bg-muted/50">
                    <div className="bg-primary/10 p-2 rounded mr-3">
                      <File className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  
                  {uploadState === 'error' && <p className="text-sm text-red-500 dark:text-red-400 mt-2">
                      Please select a valid ZIP file containing class data.
                    </p>}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <Button variant="outline" onClick={resetSelection} className="flex-1">
                    Select Different File
                  </Button>
                  <Button onClick={uploadFile} disabled={uploadState !== 'ready'} className="flex-1">
                    <Upload className="mr-2 h-4 w-4" />
                    Process Data
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>}
      </AnimatePresence>
    </div>;
};
export default FileUploader;