
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
    
    // Create notification in officer_notifications table using type assertion
    const { error: notificationError } = await supabase
      .from('officer_notifications')
      .insert([
        {
          report_id: reportId,
          notification_type: 'new_report',
          is_read: false,
          message: 'New crime report submitted for review'
        }
      ]) as unknown as { data: any; error: any };
    
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
    
    return data;
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
