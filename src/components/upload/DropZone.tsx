
import React, { useRef } from 'react';
import { Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

type DropZoneProps = {
  onFilesAdded: (files: File[]) => void;
  acceptedFileTypes?: string;
};

const DropZone: React.FC<DropZoneProps> = ({ 
  onFilesAdded, 
  acceptedFileTypes = "video/*,image/*" 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesAdded(Array.from(e.dataTransfer.files));
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesAdded(Array.from(e.target.files));
    }
  };
  
  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const isVideo = acceptedFileTypes.includes('video');

  return (
    <div 
      className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center mb-6 hover:border-shield-blue transition-colors cursor-pointer"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={handleBrowseClick}
    >
      <div className="mx-auto w-16 h-16 rounded-full bg-shield-blue/10 flex items-center justify-center mb-4">
        <Video className="h-8 w-8 text-shield-blue" />
      </div>
      <p className="text-gray-600 mb-2">
        Drag and drop {isVideo ? "video" : "media"} evidence here
      </p>
      <p className="text-sm text-gray-500 mb-4">or</p>
      <Button 
        variant="outline" 
        className="border-shield-blue text-shield-blue hover:bg-shield-blue hover:text-white transition-all"
        onClick={(e) => {
          e.stopPropagation();
          handleBrowseClick();
        }}
      >
        Browse Files
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        accept={acceptedFileTypes}
        onChange={handleFileChange}
      />
      {isVideo && (
        <p className="mt-4 text-xs text-gray-500">
          Supported formats: MP4, MOV, AVI (max 100MB)
        </p>
      )}
    </div>
  );
};

export default DropZone;
