
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export interface ReportPdf {
  id: string;
  report_id: string;
  file_name: string;
  file_url: string;
  created_at: string;
  file_size?: number;
  is_official: boolean;
}

/**
 * Save a PDF file to storage and record in database
 * 
 * @param reportId Report ID
 * @param pdfBlob PDF file blob
 * @param fileName File name
 * @param isOfficial Whether this is an official report
 * @returns URL to the saved PDF
 */
export const saveReportPdf = async (
  reportId: string,
  pdfBlob: Blob,
  fileName: string,
  isOfficial: boolean = false
): Promise<string | null> => {
  try {
    const fileId = uuidv4();
    const filePath = `report_pdfs/${reportId}/${fileId}-${fileName}`;
    
    // Upload PDF to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('reports')
      .upload(filePath, pdfBlob, {
        contentType: 'application/pdf',
        cacheControl: '3600'
      });
    
    if (uploadError) {
      console.error("Error uploading PDF:", uploadError);
      throw uploadError;
    }
    
    // Get the URL for the uploaded file
    const { data: urlData } = await supabase.storage
      .from('reports')
      .getPublicUrl(filePath);
    
    const fileUrl = urlData?.publicUrl;
    
    // Store PDF record in database
    const { error: dbError } = await supabase
      .from('report_pdfs')
      .insert({
        report_id: reportId,
        file_name: fileName,
        file_url: fileUrl,
        file_size: pdfBlob.size,
        is_official: isOfficial
      });
    
    if (dbError) {
      console.error("Error storing PDF record:", dbError);
      throw dbError;
    }
    
    return fileUrl;
  } catch (error) {
    console.error("Error saving report PDF:", error);
    toast.error("Failed to save the PDF report");
    return null;
  }
};

/**
 * Get all PDFs for a report
 * 
 * @param reportId Report ID
 * @returns List of report PDFs
 */
export const getReportPdfs = async (reportId: string): Promise<ReportPdf[]> => {
  try {
    const { data, error } = await supabase
      .from('report_pdfs')
      .select('*')
      .eq('report_id', reportId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching report PDFs:", error);
      throw error;
    }
    
    return data as ReportPdf[];
  } catch (error) {
    console.error("Error in getReportPdfs:", error);
    return [];
  }
};

/**
 * Share a report PDF via email
 * 
 * @param reportId Report ID
 * @param pdfUrl URL to the PDF
 * @param recipientEmail Email address to send to
 * @param subject Email subject
 * @param message Email message
 * @returns Success status
 */
export const shareReportViaEmail = async (
  reportId: string,
  pdfUrl: string,
  recipientEmail: string,
  subject: string,
  message: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('share-report-email', {
      body: { 
        reportId, 
        pdfUrl, 
        recipientEmail, 
        subject, 
        message 
      }
    });
    
    if (error) {
      console.error("Error sharing report via email:", error);
      toast.error("Failed to send email. Please try again.");
      return false;
    }
    
    if (!data.success) {
      toast.error(data.error || "Failed to send email");
      return false;
    }
    
    toast.success("Report shared via email successfully");
    return true;
  } catch (error: any) {
    console.error("Error in shareReportViaEmail:", error);
    toast.error("Failed to share report: " + (error.message || "Unknown error"));
    return false;
  }
};
