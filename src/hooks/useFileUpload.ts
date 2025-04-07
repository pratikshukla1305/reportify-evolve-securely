
import { useState } from 'react';
import { toast } from 'sonner';

type UploadProgressType = Record<string, number>;

export const useFileUpload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressType>({});
  const [isUploading, setIsUploading] = useState(false);
  
  const addFiles = (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles]);
    
    // Create preview URLs
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
      
      // Simulate upload progress
      simulateFileUpload(file.name);
    });
    
    toast.success(`${newFiles.length} file(s) added successfully`);
  };
  
  const removeFile = (index: number) => {
    const fileName = files[index].name;
    
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
    
    // Remove from progress tracking
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
    
    toast.info("File removed");
  };
  
  const simulateFileUpload = (fileName: string) => {
    setIsUploading(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Check if all files are uploaded
        const allUploaded = Object.values(uploadProgress).every(p => p === 100);
        if (allUploaded) {
          setIsUploading(false);
        }
      }
      setUploadProgress(prev => ({
        ...prev,
        [fileName]: progress
      }));
    }, 500);
  };
  
  return {
    files,
    previews,
    uploadProgress,
    isUploading,
    addFiles,
    removeFile,
    setIsUploading
  };
};
