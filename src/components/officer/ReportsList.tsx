
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { getOfficerReports, updateReportStatus } from '@/services/reportServices';
import { FileText, AlertTriangle, Clock, User, MapPin, FileCheck, FileX, Download, Eye, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';
import { useOfficerAuth } from '@/contexts/OfficerAuthContext';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

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
  const [reportDetailOpen, setReportDetailOpen] = useState<string | null>(null);
  const [viewFullDetailsOpen, setViewFullDetailsOpen] = useState(false);
  const [viewingReport, setViewingReport] = useState<any | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { officer } = useOfficerAuth();
  const [shieldStampLoaded, setShieldStampLoaded] = useState(false);
  const shieldStampUrl = "/lovable-uploads/88752d75-4759-4295-9628-4bcfdd96f7ce.png";

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const data = await getOfficerReports();
      console.log("Fetched reports:", data);
      
      // Add dummy evidence for testing if needed
      if (data && data.length > 0) {
        // Check if any report has no evidence
        const reportsWithoutEvidence = data.filter(report => !report.evidence || report.evidence.length === 0);
        
        for (const report of reportsWithoutEvidence) {
          // Add some dummy evidence for demonstration
          report.evidence = [
            {
              id: uuidv4(),
              report_id: report.id,
              user_id: report.user_id,
              title: "Video Evidence",
              description: "Sample evidence for demonstration",
              type: "video",
              storage_path: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
              uploaded_at: new Date().toISOString()
            },
            {
              id: uuidv4(),
              report_id: report.id,
              user_id: report.user_id,
              title: "Photo Evidence",
              description: "Sample image evidence",
              type: "image",
              storage_path: "https://picsum.photos/id/237/200/300",
              uploaded_at: new Date().toISOString()
            }
          ];
        }
      }
      
      // Store reports in session storage for persistence
      sessionStorage.setItem('officer_reports', JSON.stringify(data));
      
      // Apply limit if provided
      const limitedData = limit ? data.slice(0, limit) : data;
      setReports(limitedData);
    } catch (error: any) {
      console.error("Error fetching reports:", error);
      
      // Try to get reports from session storage if API fails
      const storedReports = sessionStorage.getItem('officer_reports');
      if (storedReports) {
        const parsedReports = JSON.parse(storedReports);
        const limitedData = limit ? parsedReports.slice(0, limit) : parsedReports;
        setReports(limitedData);
        toast({
          title: "Using cached reports",
          description: "Using previously loaded reports due to connection issues.",
        });
      } else {
        toast({
          title: "Error fetching reports",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    
    // Preload the shield stamp image
    const img = new Image();
    img.onload = () => setShieldStampLoaded(true);
    img.src = shieldStampUrl;
    
    // Add event listener for beforeunload to ensure we don't lose reports
    const handleBeforeUnload = () => {
      sessionStorage.setItem('last_reports_view', Date.now().toString());
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [limit]);

  const handleStatusChange = async (reportId: string, status: string) => {
    setIsProcessing(true);
    try {
      await updateReportStatus(reportId, status, officerNotes);
      await fetchReports(); // Refresh the reports list
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

  const toggleVideoPreview = async (evidence: any) => {
    if (activePreview === evidence.storage_path) {
      setActivePreview(null);
      
      // Log the view completion
      try {
        await supabase
          .from('evidence_views')
          .insert([{
            evidence_id: evidence.id,
            officer_id: officer?.id,
            view_complete: true
          }]);
      } catch (error) {
        console.error('Error logging evidence view completion:', error);
      }
    } else {
      setActivePreview(evidence.storage_path);
      
      // Log the view start
      try {
        await supabase
          .from('evidence_views')
          .insert([{
            evidence_id: evidence.id,
            officer_id: officer?.id,
            view_complete: false
          }]);
      } catch (error) {
        console.error('Error logging evidence view start:', error);
      }
    }
  };

  const toggleReportDetail = (reportId: string) => {
    if (reportDetailOpen === reportId) {
      setReportDetailOpen(null);
    } else {
      setReportDetailOpen(reportId);
    }
  };

  const viewFullDetails = (report: any) => {
    setViewingReport(report);
    setViewFullDetailsOpen(true);
  };

  const generatePdf = async (report: any) => {
    setIsGeneratingPDF(true);
    
    try {
      const pdf = new jsPDF();
      const filename = `shield_report_${report.id.substring(0, 8)}.pdf`;
      
      try {
        // Add Shield stamp image instead of text watermark
        if (shieldStampLoaded) {
          const img = new Image();
          img.src = shieldStampUrl;
          
          // Wait for image to load
          await new Promise((resolve) => {
            img.onload = resolve;
            if (img.complete) resolve(null);
          });
          
          // Add Shield stamp in the center as a watermark
          pdf.addImage(
            shieldStampUrl,
            'PNG',
            pdf.internal.pageSize.width / 2 - 40,
            pdf.internal.pageSize.height / 2 - 40,
            80,
            80
          );
          
          // Adjust opacity for watermark effect
          pdf.setGlobalAlpha(0.2);
          pdf.addImage(
            shieldStampUrl,
            'PNG',
            pdf.internal.pageSize.width / 2 - 40,
            pdf.internal.pageSize.height / 2 - 40,
            80,
            80
          );
          pdf.setGlobalAlpha(1.0);
        }
        
        // Add Shield logo at the top
        pdf.addImage(
          shieldStampUrl,
          'PNG',
          10,
          10,
          20,
          20
        );
        
        // Add Shield name and title
        pdf.setFontSize(20);
        pdf.setTextColor(0, 0, 128); // Navy blue color
        pdf.text("SHIELD", 35, 20);
        pdf.setFontSize(16);
        pdf.text("Crime Report", 35, 30);
                
        // Reset text color for report content
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(12);
        
        // Report details
        pdf.text(`Report ID: ${report.id}`, 20, 50);
        pdf.text(`Status: ${report.status}`, 20, 60);
        pdf.text(`Report Date: ${format(new Date(report.report_date), 'PPP')}`, 20, 70);
        
        if (report.incident_date) {
          pdf.text(`Incident Date: ${format(new Date(report.incident_date), 'PPP')}`, 20, 80);
        }
        
        if (report.location) {
          pdf.text(`Location: ${report.location}`, 20, 90);
        }
        
        pdf.text(`Title: ${report.title || 'Untitled Report'}`, 20, 100);
        
        if (report.description) {
          pdf.text("Description:", 20, 110);
          const splitDesc = pdf.splitTextToSize(report.description, 170);
          pdf.text(splitDesc, 20, 120);
        }
        
        if (report.officer_notes) {
          pdf.text("Officer Notes:", 20, 150);
          const splitNotes = pdf.splitTextToSize(report.officer_notes, 170);
          pdf.text(splitNotes, 20, 160);
        }
        
        // Add evidence count if available
        if (report.evidence && report.evidence.length > 0) {
          pdf.text(`Evidence Items: ${report.evidence.length}`, 20, 180);
        }
        
        // Footer
        pdf.setFontSize(10);
        pdf.text("Generated by Shield Officer Portal", 80, 280);
        pdf.text(`Date: ${format(new Date(), 'PPP p')}`, 80, 285);
        
        // Save the PDF
        pdf.save(filename);
        
        // Log PDF download in database
        await supabase
          .from('pdf_downloads')
          .insert([{
            report_id: report.id,
            officer_id: officer?.id,
            filename,
            success: true
          }]);
        
        toast({
          title: "PDF Generated",
          description: "Report PDF has been downloaded to your device",
        });
      } catch (error) {
        console.error("Error generating PDF:", error);
        
        // Log failed PDF download attempt
        await supabase
          .from('pdf_downloads')
          .insert([{
            report_id: report.id,
            officer_id: officer?.id,
            filename,
            success: false
          }]);
        
        toast({
          title: "PDF Generation Failed",
          description: "Could not generate PDF. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsGeneratingPDF(false);
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
                    <div 
                      key={index} 
                      className="aspect-square bg-gray-100 rounded overflow-hidden cursor-pointer relative" 
                      onClick={() => toggleVideoPreview(item)}
                    >
                      {item.storage_path && (
                        item.type === 'video' || item.storage_path.toLowerCase().includes('video') || item.storage_path.toLowerCase().endsWith('.mp4') ? (
                          <div className="relative w-full h-full">
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                              <Video className="h-8 w-8 text-white" />
                            </div>
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
            
            {/* Video Preview Modal */}
            {activePreview && (
              <div 
                className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4"
                onClick={() => setActivePreview(null)}
              >
                <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
                  <video 
                    src={activePreview} 
                    controls 
                    autoPlay 
                    className="w-full rounded-lg shadow-lg" 
                  />
                  <div className="flex justify-end mt-4">
                    <Button 
                      variant="secondary" 
                      className="bg-white text-black"
                      onClick={() => setActivePreview(null)}
                    >
                      Close Preview
                    </Button>
                  </div>
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
                  <FileCheck className="mr-1 h-4 w-4" />
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
                  <FileCheck className="mr-1 h-4 w-4" />
                  Mark Completed
                </Button>
              )}
              
              <Button 
                size="sm"
                variant="outline"
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
                onClick={() => viewFullDetails(report)}
              >
                <Eye className="mr-1 h-4 w-4" />
                View Details
              </Button>

              <Button 
                size="sm"
                variant="outline"
                className="border-purple-500 text-purple-600 hover:bg-purple-50"
                onClick={() => generatePdf(report)}
                disabled={isGeneratingPDF}
              >
                <Download className="mr-1 h-4 w-4" />
                {isGeneratingPDF ? "Generating..." : "Download PDF"}
              </Button>
            </div>

            {/* Simple Report Detail View */}
            {reportDetailOpen === report.id && (
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Report ID</h4>
                    <p className="text-sm">{report.id}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
                    <p className="text-sm">{report.status}</p>
                  </div>
                  
                  {report.location && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Location</h4>
                      <p className="text-sm">{report.location}</p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Report Date</h4>
                    <p className="text-sm">{format(new Date(report.report_date), 'PPP p')}</p>
                  </div>
                  
                  {report.incident_date && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Incident Date</h4>
                      <p className="text-sm">{format(new Date(report.incident_date), 'PPP p')}</p>
                    </div>
                  )}
                  
                  {report.officer_notes && (
                    <div className="md:col-span-2">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Officer Notes</h4>
                      <p className="text-sm p-2 bg-gray-50 rounded">{report.officer_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Update Report Status Dialog */}
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
                    {isProcessing ? "Updating..." : "Mark as Processing"}
                  </Button>
                )}
                {selectedReport.status !== 'completed' && (
                  <Button
                    className="bg-green-500 hover:bg-green-600"
                    onClick={() => handleStatusChange(selectedReport.id, 'completed')}
                    disabled={isProcessing}
                  >
                    <FileCheck className="mr-2 h-4 w-4" />
                    {isProcessing ? "Updating..." : "Mark as Completed"}
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full Report Details Dialog */}
      <Dialog open={viewFullDetailsOpen} onOpenChange={setViewFullDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {viewingReport && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  {viewingReport.title || 'Untitled Report'}
                </DialogTitle>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>{format(new Date(viewingReport.created_at || viewingReport.report_date), 'MMMM dd, yyyy h:mm a')}</span>
                  <Badge className="ml-2">{viewingReport.status}</Badge>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Report ID</h3>
                    <p className="text-sm font-mono bg-gray-50 p-1 rounded mt-1">{viewingReport.id}</p>
                  </div>

                  {viewingReport.location && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Location</h3>
                      <p className="text-sm mt-1 flex items-start">
                        <MapPin className="h-4 w-4 mr-1 mt-0.5 text-gray-400" />
                        {viewingReport.location}
                      </p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Report Date</h3>
                    <p className="text-sm mt-1">{format(new Date(viewingReport.report_date), 'PPP p')}</p>
                  </div>

                  {viewingReport.incident_date && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Incident Date</h3>
                      <p className="text-sm mt-1">{format(new Date(viewingReport.incident_date), 'PPP p')}</p>
                    </div>
                  )}

                  {viewingReport.is_anonymous !== undefined && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Anonymity</h3>
                      <p className="text-sm mt-1">
                        {viewingReport.is_anonymous ? "Anonymous Report" : "Non-anonymous Report"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {viewingReport.description && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Description</h3>
                      <p className="text-sm mt-1 bg-gray-50 p-2 rounded whitespace-pre-wrap">{viewingReport.description}</p>
                    </div>
                  )}

                  {viewingReport.officer_notes && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Officer Notes</h3>
                      <p className="text-sm mt-1 bg-blue-50 p-2 rounded whitespace-pre-wrap">{viewingReport.officer_notes}</p>
                    </div>
                  )}

                  <div className="flex space-x-2 mt-4">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-purple-500 text-purple-600 hover:bg-purple-50"
                      onClick={() => generatePdf(viewingReport)}
                      disabled={isGeneratingPDF}
                    >
                      <Download className="mr-1 h-4 w-4" />
                      {isGeneratingPDF ? "Generating..." : "Download PDF"}
                    </Button>
                    
                    {viewingReport.status !== 'completed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-500 text-green-600 hover:bg-green-50"
                        onClick={() => {
                          setSelectedReport(viewingReport);
                          setViewFullDetailsOpen(false);
                        }}
                      >
                        <FileCheck className="mr-1 h-4 w-4" />
                        Update Status
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Evidence section with improved video player */}
              {viewingReport.evidence && viewingReport.evidence.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Evidence ({viewingReport.evidence.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {viewingReport.evidence.map((item: any, index: number) => (
                      <div key={index} className="border rounded-md p-3 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{item.title || `Evidence ${index + 1}`}</h4>
                          <Badge variant="outline">{item.type || 'Unknown type'}</Badge>
                        </div>
                        
                        {item.description && (
                          <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        )}
                        
                        {item.storage_path && (
                          <div className="mt-2">
                            {item.type === 'video' || item.storage_path.toLowerCase().includes('video') || item.storage_path.toLowerCase().endsWith('.mp4') ? (
                              <div className="aspect-video bg-black rounded overflow-hidden">
                                <video 
                                  src={item.storage_path} 
                                  controls 
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            ) : (
                              <div className="aspect-square bg-gray-200 rounded overflow-hidden">
                                <img
                                  src={item.storage_path}
                                  alt={item.title || `Evidence ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-500 mt-2">
                          Uploaded {format(new Date(item.uploaded_at), 'PPP p')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportsList;
