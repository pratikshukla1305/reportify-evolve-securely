import React from 'react';
import { FileText, ShieldCheck, Clock, FileSpreadsheet, FileCode, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type ReportCardProps = {
  className?: string;
  reportId?: string;
  pdfUrl?: string;
  onDownload?: () => void;
};

const ReportCard = ({ className, reportId, pdfUrl, onDownload }: ReportCardProps) => {
  const handleDownloadClick = async () => {
    if (onDownload) {
      onDownload();
      return;
    }
    
    try {
      if (pdfUrl) {
        console.log("Downloading PDF from URL:", pdfUrl);
        
        // Create an invisible anchor element for the download
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `Shield-Report-${reportId || 'download'}.pdf`;
        // This is important to make it work on all browsers
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        
        // Remove the link from the document
        setTimeout(() => {
          document.body.removeChild(link);
        }, 100);
        
        // Log download if reportId exists
        if (reportId) {
          try {
            // Record the download in the database if possible
            await supabase.from('pdf_downloads').insert({
              report_id: reportId,
              filename: `Shield-Report-${reportId}.pdf`,
              success: true,
              // We don't have officer_id here, it's a user download
            });
          } catch (logError) {
            // Just log the error, but don't show to user as download already worked
            console.error("Failed to log PDF download:", logError);
          }
        }
        
        toast.success("PDF download started");
      } else {
        // If no pdfUrl is provided, try to fetch the latest PDF for this report
        if (reportId) {
          console.log("No PDF URL provided, fetching latest PDF for report:", reportId);
          
          const { data: pdfs, error } = await supabase
            .from('report_pdfs')
            .select('*')
            .eq('report_id', reportId)
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (error) {
            console.error("Error fetching PDF:", error);
            throw new Error(`Failed to fetch PDF: ${error.message}`);
          }
          
          if (pdfs && pdfs.length > 0) {
            const latestPdf = pdfs[0];
            console.log("Found PDF:", latestPdf);
            
            // Create and click download link
            const link = document.createElement('a');
            link.href = latestPdf.file_url;
            link.download = latestPdf.file_name;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            
            // Remove the link from the document
            setTimeout(() => {
              document.body.removeChild(link);
            }, 100);
            
            toast.success("PDF download started");
            return;
          } else {
            console.error("No PDFs found for report:", reportId);
            throw new Error("No PDF available for this report");
          }
        } else {
          toast.error("No PDF available to download");
          console.error("No PDF URL or report ID available for download");
        }
      }
    } catch (error: any) {
      toast.error(`Download failed: ${error.message || "Unknown error"}`);
      console.error("PDF download error:", error);
    }
  };
  
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
        {pdfUrl ? (
          <Button 
            onClick={handleDownloadClick}
            className="bg-shield-blue text-white hover:bg-blue-600 transition-all"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        ) : (
          <Button 
            to="/view-draft-report"
            className="bg-shield-blue text-white hover:bg-blue-600 transition-all"
          >
            View Draft Report
          </Button>
        )}
      </div>
    </div>
  );
};

export default ReportCard;
