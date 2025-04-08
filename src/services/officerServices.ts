import { supabase } from '@/integrations/supabase/client';
import { 
  SOSAlert, 
  KycVerification, 
  Advisory, 
  CriminalProfile, 
  CaseData,
  CriminalTip,
  KycDocument
} from '@/types/officer';

// SOS Alerts
export const getSosAlerts = async (): Promise<SOSAlert[]> => {
  try {
    // First, get all alerts
    const { data: alerts, error } = await supabase
      .from('sos_alerts')
      .select('*')
      .order('reported_time', { ascending: false });
    
    if (error) {
      console.error('Error fetching SOS alerts:', error);
      throw error;
    }
    
    // If no alerts found, return empty array
    if (!alerts || alerts.length === 0) {
      return [];
    }
    
    // Get all voice recordings in a single batch query
    const alertIds = alerts.map(alert => alert.alert_id);
    
    const { data: voiceRecordings, error: recordingError } = await supabase
      .from('voice_recordings')
      .select('alert_id, recording_url')
      .in('alert_id', alertIds);
    
    if (recordingError) {
      console.error('Error fetching voice recordings:', recordingError);
    } else if (voiceRecordings && voiceRecordings.length > 0) {
      // Create lookup map for quick access
      const recordingsMap = new Map();
      voiceRecordings.forEach(rec => {
        if (rec.recording_url) {
          recordingsMap.set(rec.alert_id, rec.recording_url);
        }
      });
      
      // Attach recordings to corresponding alerts
      alerts.forEach(alert => {
        if (recordingsMap.has(alert.alert_id)) {
          alert.voice_recording = recordingsMap.get(alert.alert_id);
        }
      });
    }
    
    return alerts;
  } catch (error) {
    console.error('Error in getSosAlerts:', error);
    throw error;
  }
};

export const updateSosAlertStatus = async (alertId: string, status: string, dispatchTeam?: string): Promise<SOSAlert[]> => {
  const updates: any = { status };
  
  if (dispatchTeam) {
    updates.dispatch_team = dispatchTeam;
  }
  
  const { data, error } = await supabase
    .from('sos_alerts')
    .update(updates)
    .eq('alert_id', alertId)
    .select();
  
  if (error) {
    throw error;
  }
  
  return data || [];
};

// KYC Verifications
export const getKycVerifications = async (): Promise<KycVerification[]> => {
  try {
    // First, get all verifications
    const { data: verifications, error } = await supabase
      .from('kyc_verifications')
      .select('*')
      .order('submission_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching KYC verifications:', error);
      throw error;
    }
    
    // If no verifications found, return empty array
    if (!verifications || verifications.length === 0) {
      return [];
    }
    
    // Prepare the result array with proper typing
    const results: KycVerification[] = verifications.map(verification => ({
      ...verification,
      documents: [] // Initialize documents array for each verification
    }));
    
    // Get the verification ids for batch query
    const verificationIds = verifications.map(v => v.id);
    
    // Get all documents in a single batch query
    const { data: allDocuments, error: docError } = await supabase
      .from('kyc_documents')
      .select('*')
      .in('verification_id', verificationIds);
    
    if (docError) {
      console.error('Error fetching KYC documents:', docError);
    } else if (allDocuments && allDocuments.length > 0) {
      // Group documents by verification_id
      const documentsByVerification = new Map<number, KycDocument[]>();
      
      allDocuments.forEach(doc => {
        const verificationId = doc.verification_id;
        if (!documentsByVerification.has(verificationId)) {
          documentsByVerification.set(verificationId, []);
        }
        documentsByVerification.get(verificationId)!.push(doc as KycDocument);
      });
      
      // Attach documents to corresponding verifications
      results.forEach(verification => {
        if (documentsByVerification.has(verification.id)) {
          verification.documents = documentsByVerification.get(verification.id)!;
        }
      });
    }
    
    return results;
  } catch (error) {
    console.error('Error in getKycVerifications:', error);
    throw error;
  }
};

export const updateKycVerificationStatus = async (id: number, status: string, officerAction?: string): Promise<KycVerification[]> => {
  const updates: any = { status };
  
  if (officerAction) {
    updates.officer_action = officerAction;
  }
  
  const { data, error } = await supabase
    .from('kyc_verifications')
    .update(updates)
    .eq('id', id)
    .select();
  
  if (error) {
    throw error;
  }
  
  // Initialize documents array for each verification
  const results: KycVerification[] = (data || []).map(item => ({
    ...item,
    documents: []
  }));
  
  // If we have results, fetch the documents for each verification
  if (results.length > 0) {
    const { data: documents, error: docError } = await supabase
      .from('kyc_documents')
      .select('*')
      .eq('verification_id', id);
    
    if (docError) {
      console.error('Error fetching KYC documents for updated verification:', docError);
    } else if (documents) {
      results[0].documents = documents as KycDocument[];
    }
  }
  
  return results;
};

export const getAdvisories = async (): Promise<Advisory[]> => {
  const { data, error } = await supabase
    .from('advisories')
    .select('*')
    .order('issue_date', { ascending: false });
  
  if (error) {
    throw error;
  }
  
  return data || [];
};

export const createAdvisory = async (advisory: any): Promise<Advisory[]> => {
  const { data, error } = await supabase
    .from('advisories')
    .insert([advisory])
    .select();
  
  if (error) {
    throw error;
  }
  
  return data || [];
};

export const updateAdvisory = async (id: number, advisory: any): Promise<Advisory[]> => {
  const { data, error } = await supabase
    .from('advisories')
    .update(advisory)
    .eq('id', id)
    .select();
  
  if (error) {
    throw error;
  }
  
  return data || [];
};

export const getCriminalProfiles = async (): Promise<CriminalProfile[]> => {
  const { data, error } = await supabase
    .from('criminal_profiles')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    throw error;
  }
  
  return data || [];
};

export const createCriminalProfile = async (profile: any): Promise<CriminalProfile[]> => {
  const { data, error } = await supabase
    .from('criminal_profiles')
    .insert([profile])
    .select();
  
  if (error) {
    throw error;
  }
  
  return data || [];
};

export const updateCriminalProfile = async (id: number, profile: any): Promise<CriminalProfile[]> => {
  const { data, error } = await supabase
    .from('criminal_profiles')
    .update(profile)
    .eq('id', id)
    .select();
  
  if (error) {
    throw error;
  }
  
  return data || [];
};

export const getCases = async (): Promise<CaseData[]> => {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .order('case_date', { ascending: false });
  
  if (error) {
    throw error;
  }
  
  return data || [];
};

export const createCase = async (caseData: any): Promise<CaseData[]> => {
  const { data, error } = await supabase
    .from('cases')
    .insert([caseData])
    .select();
  
  if (error) {
    throw error;
  }
  
  return data || [];
};

export const updateCase = async (id: number, caseData: any): Promise<CaseData[]> => {
  const { data, error } = await supabase
    .from('cases')
    .update(caseData)
    .eq('case_id', id)
    .select();
  
  if (error) {
    throw error;
  }
  
  return data || [];
};

export const getCriminalTips = async (): Promise<CriminalTip[]> => {
  const { data, error } = await supabase
    .from('criminal_tips')
    .select('*')
    .order('tip_date', { ascending: false });
  
  if (error) {
    throw error;
  }
  
  return data || [];
};

export const updateCriminalTipStatus = async (id: number, status: string): Promise<CriminalTip[]> => {
  const { data, error } = await supabase
    .from('criminal_tips')
    .update({ status })
    .eq('id', id)
    .select();
  
  if (error) {
    throw error;
  }
  
  return data || [];
};

export const registerOfficer = async (officerData: any): Promise<any> => {
  try {
    // Use RPC call to bypass RLS for registration
    const { data, error } = await supabase
      .rpc('register_officer', {
        full_name: officerData.full_name,
        badge_number: officerData.badge_number,
        department: officerData.department,
        department_email: officerData.department_email,
        phone_number: officerData.phone_number,
        password: officerData.password,
        confirm_password: officerData.confirm_password
      });
    
    if (error) {
      console.error('Error registering officer:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in registerOfficer:', error);
    throw error;
  }
};
