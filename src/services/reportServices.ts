
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { addMockEvidenceToReports } from './mockEvidenceService';

// Submit a report to officer
export const submitReportToOfficer = async (reportId: string) => {
  try {
    // First check if report exists
    const { data: reportCheck, error: checkError } = await supabase
      .from('crime_reports')
      .select('*')
      .eq('id', reportId)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        throw new Error("Report not found. Please verify the report ID.");
      }
      throw checkError;
    }
    
    // Update report status
    const { data, error } = await supabase
      .from('crime_reports')
      .update({
        status: 'submitted',
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId)
      .select('*');
    
    if (error) {
      throw error;
    }
    
    // Create notification in officer_notifications table
    const { error: notificationError } = await supabase
      .from('officer_notifications')
      .insert([
        {
          report_id: reportId,
          notification_type: 'new_report',
          is_read: false,
          message: 'New crime report submitted for review'
        }
      ]);
    
    if (notificationError) {
      console.error('Error creating notification:', notificationError);
    }
    
    return data;
  } catch (error: any) {
    console.error('Error submitting report to officer:', error);
    toast.error(`Failed to submit report: ${error.message}`);
    throw error;
  }
};

// Get reports for officer
export const getOfficerReports = async () => {
  try {
    const { data, error } = await supabase
      .from('crime_reports')
      .select('*, evidence(*)')
      .in('status', ['submitted', 'processing', 'completed'])
      .order('updated_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // Add mock evidence to reports that don't have any (for demo purposes)
    const reportsWithEvidence = addMockEvidenceToReports(data || []);
    
    console.log("Reports with evidence:", reportsWithEvidence);
    
    return reportsWithEvidence;
  } catch (error: any) {
    console.error('Error fetching officer reports:', error);
    throw error;
  }
};

// Update report status by officer
export const updateReportStatus = async (reportId: string, status: string, officerNotes?: string) => {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };
    
    if (officerNotes) {
      updateData.officer_notes = officerNotes;
    }
    
    const { data, error } = await supabase
      .from('crime_reports')
      .update(updateData)
      .eq('id', reportId)
      .select();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error: any) {
    console.error('Error updating report status:', error);
    toast.error(`Failed to update status: ${error.message}`);
    throw error;
  }
};

// Log evidence view to database
export const logEvidenceView = async (evidenceId: string, officerId: string, viewComplete: boolean) => {
  try {
    const { error } = await supabase
      .from('evidence_views')
      .insert({
        evidence_id: evidenceId,
        officer_id: officerId,
        view_complete: viewComplete
      });
      
    if (error) {
      console.error('Error logging evidence view:', error);
    }
  } catch (error) {
    console.error('Failed to log evidence view:', error);
  }
};

// Log PDF download to database
export const logPdfDownload = async (reportId: string, officerId: string, filename: string, success: boolean) => {
  try {
    const { error } = await supabase
      .from('pdf_downloads')
      .insert({
        report_id: reportId,
        officer_id: officerId,
        filename: filename,
        success: success
      });
      
    if (error) {
      console.error('Error logging PDF download:', error);
    }
  } catch (error) {
    console.error('Failed to log PDF download:', error);
  }
};

// Helper function to add watermark to PDF
export const addWatermarkToPdf = (pdf: any, imageUrl: string) => {
  // Add Shield stamp in the center as a watermark
  pdf.addImage(
    imageUrl,
    'PNG',
    pdf.internal.pageSize.width / 2 - 40,
    pdf.internal.pageSize.height / 2 - 40,
    80,
    80
  );
  
  // For the transparent version, we need to use a different approach
  // since setFillOpacity isn't available in all jsPDF versions
  // We'll create a more subtle version by using lighter colors
  const drawParams = pdf.context2d || {};
  if (drawParams.globalAlpha !== undefined) {
    const currentAlpha = drawParams.globalAlpha;
    drawParams.globalAlpha = 0.2;
    
    pdf.addImage(
      imageUrl,
      'PNG',
      pdf.internal.pageSize.width / 2 - 40,
      pdf.internal.pageSize.height / 2 - 40,
      80,
      80
    );
    
    drawParams.globalAlpha = currentAlpha;
  }
};

