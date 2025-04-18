
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
    
    console.log(`Uploading PDF to path: ${filePath}`);
    
    // Upload PDF to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('evidences')  // Using the evidences bucket
      .upload(filePath, pdfBlob, {
        contentType: 'application/pdf',
        cacheControl: '3600'
      });
    
    if (uploadError) {
      console.error("Error uploading PDF:", uploadError);
      toast.error(`PDF upload failed: ${uploadError.message}`);
      throw uploadError;
    }
    
    console.log("PDF uploaded successfully, getting public URL");
    
    // Get the URL for the uploaded file
    const { data: urlData } = await supabase.storage
      .from('evidences')
      .getPublicUrl(filePath);
    
    const fileUrl = urlData?.publicUrl;
    
    if (!fileUrl) {
      throw new Error("Failed to get public URL for PDF");
    }
    
    console.log(`PDF public URL: ${fileUrl}`);
    
    // Store PDF record in database
    const { data: pdfData, error: dbError } = await supabase
      .from('report_pdfs')
      .insert({
        report_id: reportId,
        file_name: fileName,
        file_url: fileUrl,
        file_size: pdfBlob.size,
        is_official: isOfficial
      })
      .select('id')
      .single();
    
    if (dbError) {
      console.error("Error storing PDF record:", dbError);
      throw dbError;
    }
    
    console.log("PDF record stored in database successfully:", pdfData);
    
    try {
      // Call the edge function for updating officer materials
      const { data, error } = await supabase.functions.invoke('update-officer-materials', {
        body: {
          reportId,
          pdfId: pdfData.id,
          pdfName: fileName,
          pdfUrl: fileUrl,
          pdfIsOfficial: isOfficial
        }
      });
      
      if (error) {
        console.error("Error calling update-officer-materials function:", error);
      } else {
        console.log("Updated officer_report_materials successfully:", data);
      }
    } catch (materialError) {
      console.error("Error updating officer_report_materials:", materialError);
    }
    
    toast.success("PDF saved successfully");
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
    console.log(`Fetching PDFs for report: ${reportId}`);
    const { data, error } = await supabase
      .from('report_pdfs')
      .select('*')
      .eq('report_id', reportId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching report PDFs:", error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} PDFs for the report`);
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
    console.log(`Attempting to share report via email.
    Report ID: ${reportId}
    PDF URL: ${pdfUrl}
    Recipient: ${recipientEmail}
    Subject: ${subject}`);
    
    if (!pdfUrl || pdfUrl.trim() === '') {
      toast.error("No PDF URL provided for email sharing");
      return false;
    }
    
    // Call the edge function to send the email
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
    
    // Record the email sharing in the database using the RPC function we created
    try {
      const { error: shareError } = await supabase.rpc(
        'record_report_share',
        {
          p_report_id: reportId,
          p_shared_to: recipientEmail,
          p_share_type: 'email'
        }
      );
      
      if (shareError) {
        console.error("Error recording share:", shareError);
      }
    } catch (recordError) {
      console.error("Failed to record sharing:", recordError);
    }
    
    toast.success("Report shared via email successfully");
    return true;
  } catch (error: any) {
    console.error("Error in shareReportViaEmail:", error);
    toast.error("Failed to share report: " + (error.message || "Unknown error"));
    return false;
  }
};

/**
 * Get officer report materials including PDFs
 * 
 * @param reportId Report ID
 * @returns List of officer report materials
 */
export const getOfficerReportMaterials = async (reportId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('officer_report_materials')
      .select('*')
      .eq('report_id', reportId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching officer report materials:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getOfficerReportMaterials:", error);
    return [];
  }
};

// Note: We've removed the applyShieldWatermark function since it was causing issues
