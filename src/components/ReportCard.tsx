
import React from 'react';
import { FileText, ShieldCheck, Clock, FileSpreadsheet, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ReportCardProps = {
  className?: string;
};

const ReportCard = ({ className }: ReportCardProps) => {
  return (
    <div className={cn('glass-card p-6', className)}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold">AI Report Generation</h3>
        <FileText className="h-5 w-5 text-shield-blue" />
      </div>
      
      <div className="rounded-xl bg-shield-light p-5 mb-6">
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <FileSpreadsheet className="h-5 w-5 text-shield-blue" />
            <span className="text-sm font-medium">Analyzing Data</span>
          </div>
          <div className="h-4 w-3/4 bg-white/60 rounded animate-pulse"></div>
          <div className="h-4 w-full bg-white/60 rounded animate-pulse"></div>
          <div className="h-4 w-5/6 bg-white/60 rounded animate-pulse"></div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <FileCode className="h-5 w-5 text-shield-blue" />
            <span className="text-sm font-medium">Generating Report</span>
          </div>
          <div className="h-4 w-2/3 bg-white/60 rounded animate-pulse"></div>
          <div className="h-4 w-4/5 bg-white/60 rounded animate-pulse"></div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="text-sm text-gray-600 mb-2">Report Status</div>
        <div className="flex items-center space-x-2 text-green-600">
          <ShieldCheck className="h-5 w-5" />
          <span className="font-medium">Blockchain Verification in Progress</span>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="text-sm text-gray-600 mb-2">Time Remaining</div>
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-shield-blue" />
          <span className="font-medium">Approximately 2 minutes</span>
        </div>
      </div>
      
      <div className="space-y-2 mb-6">
        <div className="text-sm text-gray-600 mb-1">AI Analysis Progress</div>
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full w-2/3 bg-shield-blue rounded-full animate-pulse"></div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button 
          to="/cancel-report" 
          variant="outline" 
          className="border-shield-blue text-shield-blue hover:bg-shield-blue hover:text-white transition-all"
        >
          Cancel
        </Button>
        <Button 
          to="/view-draft-report"
          className="bg-shield-blue text-white hover:bg-blue-600 transition-all"
        >
          View Draft Report
        </Button>
      </div>
    </div>
  );
};

export default ReportCard;
