
import { supabase } from '@/integrations/supabase/client';
import { 
  SOSAlert, 
  KycVerification, 
  Advisory, 
  CriminalProfile, 
  CaseData,
  CriminalTip
} from '@/types/officer';

// SOS Alerts
export const getSosAlerts = async (): Promise<SOSAlert[]> => {
  const { data, error } = await supabase
    .from('sos_alerts')
    .select('*')
    .order('reported_time', { ascending: false });
  
  if (error) {
    throw error;
  }
  
  // For each alert, check if there's a voice recording
  for (let alert of data) {
    if (alert.voice_recording) {
      // We already have the voice recording URL in the alert object
      continue;
    }
    
    // Look for voice recordings in the voice_recordings table
    const { data: voiceRecordings } = await supabase
      .from('voice_recordings')
      .select('recording_url')
      .eq('alert_id', alert.alert_id)
      .limit(1);
    
    // If found, add to the alert object
    if (voiceRecordings && voiceRecordings.length > 0) {
      alert.voice_recording = voiceRecordings[0].recording_url;
    }
  }
  
  return data || [];
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
    const { data: documents } = await supabase
      .from('kyc_documents')
      .select('*')
      .eq('verification_id', verification.id);
    
    // If documents found, attach them to the verification object
    if (documents && documents.length > 0) {
      verification.documents = documents;
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
