
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { getOfficerReports, updateReportStatus } from '@/services/reportServices';
import { FileText, AlertTriangle, Clock, User, MapPin, FileCheck, FileX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

interface ReportsListProps {
  limit?: number;
}

const ReportsList: React.FC<ReportsListProps> = ({ limit }) => {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [officerNotes, setOfficerNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const [activePreview, setActivePreview] = useState<string | null>(null);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const data = await getOfficerReports();
      console.log("Fetched reports:", data);
      // Apply limit if provided
      const limitedData = limit ? data.slice(0, limit) : data;
      setReports(limitedData);
    } catch (error: any) {
      console.error("Error fetching reports:", error);
      toast({
        title: "Error fetching reports",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [limit]);

  const handleStatusChange = async (reportId: string, status: string) => {
    setIsProcessing(true);
    try {
      await updateReportStatus(reportId, status, officerNotes);
      fetchReports();
      toast({
        title: "Status updated",
        description: `Report status changed to ${status}`,
      });
      setSelectedReport(null);
      setOfficerNotes('');
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted':
        return <Badge className="bg-blue-500">Submitted</Badge>;
      case 'processing':
        return <Badge className="bg-yellow-500">Processing</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const toggleVideoPreview = (url: string) => {
    if (activePreview === url) {
      setActivePreview(null);
    } else {
      setActivePreview(url);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-shield-blue"></div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Submitted Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No reports have been submitted yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <Card key={report.id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
              <div className="flex items-start space-x-2">
                <FileText className="h-5 w-5 mt-0.5 text-shield-blue" />
                <div>
                  <h3 className="font-medium text-lg">{report.title || 'Untitled Report'}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{format(new Date(report.created_at || report.report_date), 'MMM dd, yyyy h:mm a')}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center mt-2 sm:mt-0">
                {getStatusBadge(report.status)}
              </div>
            </div>

            {report.description && (
              <div className="mb-4">
                <p className="text-sm text-gray-700">{report.description}</p>
              </div>
            )}
            
            {report.evidence && report.evidence.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">Evidence</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {report.evidence.map((item: any, index: number) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded overflow-hidden cursor-pointer" onClick={() => toggleVideoPreview(item.storage_path)}>
                      {item.storage_path && (
                        item.type === 'video' || item.storage_path.toLowerCase().includes('video') || item.storage_path.toLowerCase().endsWith('.mp4') ? (
                          <div className="relative w-full h-full">
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                              </svg>
                            </div>
                            {activePreview === item.storage_path && (
                              <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4" onClick={(e) => {e.stopPropagation(); setActivePreview(null);}}>
                                <div className="w-full max-w-3xl">
                                  <video src={item.storage_path} controls autoPlay className="w-full" />
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <img 
                            src={item.storage_path} 
                            alt={`Evidence ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        )
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 mt-4">
              {report.status !== 'processing' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                  onClick={() => {
                    setSelectedReport(report);
                    setOfficerNotes('');
                  }}
                >
                  Mark Processing
                </Button>
              )}
              
              {report.status !== 'completed' && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-green-500 text-green-600 hover:bg-green-50"
                  onClick={() => {
                    setSelectedReport(report);
                    setOfficerNotes('');
                  }}
                >
                  Mark Completed
                </Button>
              )}
              
              <Button 
                size="sm"
                variant="outline"
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={selectedReport !== null} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Report Status</DialogTitle>
            <DialogDescription>
              Change the status of this report and add any notes for the reporter.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <p className="text-sm font-medium">Officer Notes (Optional)</p>
              <Textarea
                placeholder="Add any additional notes or feedback..."
                value={officerNotes}
                onChange={(e) => setOfficerNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            {selectedReport && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setSelectedReport(null)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                {selectedReport.status !== 'processing' && (
                  <Button
                    className="bg-yellow-500 hover:bg-yellow-600"
                    onClick={() => handleStatusChange(selectedReport.id, 'processing')}
                    disabled={isProcessing}
                  >
                    <FileCheck className="mr-2 h-4 w-4" />
                    Mark as Processing
                  </Button>
                )}
                {selectedReport.status !== 'completed' && (
                  <Button
                    className="bg-green-500 hover:bg-green-600"
                    onClick={() => handleStatusChange(selectedReport.id, 'completed')}
                    disabled={isProcessing}
                  >
                    <FileCheck className="mr-2 h-4 w-4" />
                    Mark as Completed
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportsList;
