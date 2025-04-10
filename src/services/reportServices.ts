
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
export const logEvidenceView = async (evidenceId: string, officerId: string | number, viewComplete: boolean) => {
  try {
    // Convert officerId to string if it's a number
    const officerIdStr = officerId?.toString();
    
    const { error } = await supabase
      .from('evidence_views')
      .insert({
        evidence_id: evidenceId,
        officer_id: officerIdStr,
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
export const logPdfDownload = async (reportId: string, officerId: string | number, filename: string, success: boolean) => {
  try {
    // Convert officerId to string if it's a number
    const officerIdStr = officerId?.toString();
    
    const { error } = await supabase
      .from('pdf_downloads')
      .insert({
        report_id: reportId,
        officer_id: officerIdStr,
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
