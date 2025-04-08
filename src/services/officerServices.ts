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
  // First, get all alerts
  const { data: alerts, error } = await supabase
    .from('sos_alerts')
    .select('*')
    .order('reported_time', { ascending: false });
  
  if (error) {
    throw error;
  }
  
  // Get all voice recordings in a single batch query
  const alertIds = alerts.map(alert => alert.alert_id);
  
  if (alertIds.length > 0) {
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
        recordingsMap.set(rec.alert_id, rec.recording_url);
      });
      
      // Attach recordings to corresponding alerts
      alerts.forEach(alert => {
        if (recordingsMap.has(alert.alert_id)) {
          alert.voice_recording = recordingsMap.get(alert.alert_id);
        }
      });
    }
  }
  
  return alerts || [];
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
  const { data, error } = await supabase
    .from('kyc_verifications')
    .select('*')
    .order('submission_date', { ascending: false });
  
  if (error) {
    throw error;
  }
  
  // For each verification, check if there are additional documents
  for (let verification of data) {
    const { data: documents, error: docError } = await supabase
      .from('kyc_documents')
      .select('*')
      .eq('verification_id', verification.id);
    
    if (docError) {
      console.error('Error fetching KYC documents:', docError);
    }
    
    // If documents found, attach them to the verification object
    if (documents && documents.length > 0) {
      // Using type assertion to ensure TypeScript knows documents exists
      (verification as KycVerification).documents = documents as KycDocument[];
    } else {
      // Initialize with empty array to avoid undefined errors
      (verification as KycVerification).documents = [];
    }
  }
  
  return data || [];
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
  
  return data || [];
};

// Advisories
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

// Criminal Profiles
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

// Cases for mapping
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

// Criminal Tips
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
