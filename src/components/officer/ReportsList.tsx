
import React, { useEffect, useState } from 'react';
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, FileText, DownloadCloud, Check, X, AlertTriangle } from 'lucide-react';
import { getOfficerReports, logPdfDownload } from '@/services/reportServices';
import { getOfficerReportMaterials } from '@/services/reportPdfService';
import { format } from 'date-fns';
import { useOfficerAuth } from '@/contexts/OfficerAuthContext';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, 
  DialogTitle, DialogTrigger, DialogFooter 
} from '@/components/ui/dialog';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

type ReportListProps = {
  limit?: number;
};

const ReportsList = ({ limit }: ReportListProps) => {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [officerNotes, setOfficerNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { officer } = useOfficerAuth();
  const navigate = useNavigate();
  
  const [reportMaterials, setReportMaterials] = useState<{[key: string]: any[]}>({});

  useEffect(() => {
    fetchReports();
  }, [limit]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const fetchedReports = await getOfficerReports();
      
      if (limit) {
        setReports(fetchedReports.slice(0, limit));
      } else {
        setReports(fetchedReports);
      }
      
      // Fetch PDF materials for each report
      const materialsMap: {[key: string]: any[]} = {};
      
      for (const report of fetchedReports.slice(0, limit || fetchedReports.length)) {
        const materials = await getOfficerReportMaterials(report.id);
        materialsMap[report.id] = materials;
      }
      
      setReportMaterials(materialsMap);
      
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewReport = (report: any) => {
    setSelectedReport(report);
  };

  const handleDownloadPdf = async (report: any) => {
    // First check if we have materials for this report
    const materials = reportMaterials[report.id] || [];
    const pdfMaterial = materials.find(m => m.pdf_url);
    
    // If we have a PDF in the materials, use that
    if (pdfMaterial && pdfMaterial.pdf_url) {
      try {
        const link = document.createElement('a');
        link.href = pdfMaterial.pdf_url;
        link.target = '_blank';
        link.download = pdfMaterial.pdf_name || 'report.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Log the download
        if (officer && officer.id) {
          await logPdfDownload(
            report.id, 
            officer.id.toString(), 
            pdfMaterial.pdf_name || 'report.pdf', 
            true
          );
        }
        
        toast.success("PDF downloaded successfully");
      } catch (error) {
        console.error("Error downloading PDF:", error);
        toast.error("Failed to download PDF");
      }
      return;
    }
    
    // Check if there's a PDF in the report_pdfs array
    if (report.report_pdfs && report.report_pdfs.length > 0) {
      try {
        const pdfFile = report.report_pdfs[0];
        
        // Create a link and click it to download
        const link = document.createElement('a');
        link.href = pdfFile.file_url;
        link.target = '_blank';
        link.download = pdfFile.file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Log the download
        if (officer && officer.id) {
          await logPdfDownload(
            report.id, 
            officer.id.toString(), 
            pdfFile.file_name, 
            true
          );
        }
        
        toast.success("PDF downloaded successfully");
      } catch (error) {
        console.error("Error downloading PDF:", error);
        toast.error("Failed to download PDF");
      }
    } else {
      toast.error("No PDF available for this report");
    }
  };

  const handleUpdateStatus = (report: any) => {
    setSelectedReport(report);
    setNewStatus(report.status || '');
    setOfficerNotes(report.officer_notes || '');
    setStatusDialogOpen(true);
  };

  const submitStatusUpdate = async () => {
    if (!selectedReport || !newStatus) return;

    setIsSubmitting(true);

    try {
      // Update the report status
      const response = await fetch(`/api/reports/${selectedReport.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          officerNotes: officerNotes,
          officerId: officer?.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      toast.success(`Report status updated to ${newStatus}`);
      setStatusDialogOpen(false);
      
      // Refresh reports
      fetchReports();
      
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update report status");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-shield-blue" />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center p-8">
        <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium">No reports found</h3>
        <p className="text-gray-500">There are no submitted reports to review at this time.</p>
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableCaption>A list of citizen-submitted crime reports.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Report ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Evidence</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell className="font-medium">
                {format(new Date(report.report_date || report.created_at), 'MMM dd, yyyy')}
              </TableCell>
              <TableCell className="font-mono text-xs">
                {report.id.substring(0, 8)}
              </TableCell>
              <TableCell>{report.title || "Untitled Report"}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(report.status)}>
                  {report.status || "Unknown"}
                </Badge>
              </TableCell>
              <TableCell>
                {report.evidence ? `${report.evidence.length} items` : "None"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    title="View Report"
                    onClick={() => handleViewReport(report)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    title="Download PDF"
                    onClick={() => handleDownloadPdf(report)}
                  >
                    <DownloadCloud className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    title="Update Status"
                    onClick={() => handleUpdateStatus(report)}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Report Status</DialogTitle>
            <DialogDescription>
              Change the status of this report and add notes for the citizen.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={newStatus} 
                onValueChange={setNewStatus}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Officer Notes (visible to citizen)</Label>
              <Textarea
                id="notes"
                value={officerNotes}
                onChange={(e) => setOfficerNotes(e.target.value)}
                placeholder="Add notes about this report..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitStatusUpdate}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" /> Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report View Dialog */}
      {selectedReport && (
        <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedReport.title || "Untitled Report"}</DialogTitle>
              <DialogDescription>
                Report ID: {selectedReport.id.substring(0, 8)}
                {' · '}
                Submitted: {format(new Date(selectedReport.report_date || selectedReport.created_at), 'MMMM dd, yyyy')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedReport.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                  <p className="text-sm">{selectedReport.description}</p>
                </div>
              )}
              
              {selectedReport.location && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
                  <p className="text-sm">{selectedReport.location}</p>
                </div>
              )}
              
              {selectedReport.detailed_location && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Detailed Location</h3>
                  <p className="text-sm">{selectedReport.detailed_location}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Evidence</h3>
                {selectedReport.evidence && selectedReport.evidence.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {selectedReport.evidence.map((evidence: any, index: number) => (
                      <div key={index} className="border rounded-md p-2">
                        <div className="aspect-video bg-gray-100 rounded-md mb-2 relative overflow-hidden">
                          {evidence.type === 'video' ? (
                            <video 
                              src={evidence.storage_path} 
                              controls 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img 
                              src={evidence.storage_path} 
                              alt={evidence.title || `Evidence ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <p className="text-xs font-medium truncate">{evidence.title || `Evidence ${index + 1}`}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No evidence attached</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Officer Notes</h3>
                {selectedReport.officer_notes ? (
                  <p className="text-sm">{selectedReport.officer_notes}</p>
                ) : (
                  <p className="text-sm text-gray-500 italic">No notes added</p>
                )}
              </div>

              {/* Display PDFs */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Report PDFs</h3>
                {(selectedReport.report_pdfs && selectedReport.report_pdfs.length > 0) || 
                 (reportMaterials[selectedReport.id] && reportMaterials[selectedReport.id].some(m => m.pdf_url)) ? (
                  <div className="space-y-2">
                    {/* First check officer materials */}
                    {reportMaterials[selectedReport.id] && 
                     reportMaterials[selectedReport.id]
                      .filter(m => m.pdf_url)
                      .map((material, index) => (
                        <div key={`material-${index}`} className="flex items-center justify-between border rounded p-2">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-blue-500 mr-2" />
                            <span className="text-sm">{material.pdf_name || `Report PDF ${index + 1}`}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = material.pdf_url;
                              link.target = '_blank';
                              link.download = material.pdf_name || 'report.pdf';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                          >
                            <DownloadCloud className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    
                    {/* Then check report_pdfs array */}
                    {selectedReport.report_pdfs && selectedReport.report_pdfs.map((pdf: any, index: number) => (
                      <div key={`pdf-${index}`} className="flex items-center justify-between border rounded p-2">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-blue-500 mr-2" />
                          <span className="text-sm">{pdf.file_name || `Report PDF ${index + 1}`}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = pdf.file_url;
                            link.target = '_blank';
                            link.download = pdf.file_name;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                        >
                          <DownloadCloud className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No PDFs available</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedReport(null)}
              >
                <X className="h-4 w-4 mr-2" /> Close
              </Button>
              <Button
                onClick={() => {
                  setSelectedReport(null);
                  handleUpdateStatus(selectedReport);
                }}
              >
                <FileText className="h-4 w-4 mr-2" /> Update Status
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ReportsList;
