
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SOSButtonProps {
  onClick: () => void;
  className?: string;
}

const SOSButton = ({ onClick, className }: SOSButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "bg-red-600 hover:bg-red-700 text-white font-bold rounded-full shadow-lg flex items-center justify-center gap-1 animate-pulse",
        className
      )}
    >
      <AlertTriangle className="h-4 w-4" />
      <span className="font-bold">SOS</span>
    </Button>
  );
};

export default SOSButton;
