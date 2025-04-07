import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

export const uploadFilesToSupabase = async (
  files: File[], 
  userId: string | undefined, 
  fileType: 'image' | 'video' | 'audio' = 'video'
): Promise<string[]> => {
  if (!userId) {
    toast.error("You must be logged in to upload files");
    return [];
  }
  
  if (files.length === 0) return [];
  
  const reportId = uuidv4();
  const uploadedUrls: string[] = [];
  
  try {
    // Check if evidence bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const evidenceBucketExists = buckets?.some(bucket => bucket.name === 'evidence');
    
    if (!evidenceBucketExists) {
      // Create the bucket if it doesn't exist
      await supabase.storage.createBucket('evidence', {
        public: false,
      });
    }
    
    // Upload each file
    for (const [index, file] of files.entries()) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${reportId}-${index}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      const { error } = await supabase.storage
        .from('evidence')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (error) throw error;
      
      // Get the public URL
      const { data } = supabase.storage
        .from('evidence')
        .getPublicUrl(filePath);
        
      uploadedUrls.push(data.publicUrl);
      
      // Create evidence record
      await supabase
        .from('evidence')
        .insert({
          user_id: userId,
          report_id: reportId,
          storage_path: data.publicUrl,
          type: fileType,
          title: file.name,
          description: `Auto-uploaded ${fileType} evidence`
        });
    }
    
    // Return report ID along with URLs
    return uploadedUrls;
  } catch (error: any) {
    console.error('Error uploading files:', error);
    toast.error(`Upload failed: ${error.message}`);
    return [];
  }
};

export const createDraftReport = async (userId: string, reportId: string, uploadedUrls: string[]): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('crime_reports')
      .insert({
        id: reportId,
        user_id: userId,
        title: "Draft Report",
        status: "draft",
        report_date: new Date().toISOString(),
        is_anonymous: false
      });
      
    if (error) throw error;
    
    return true;
  } catch (error: any) {
    console.error('Error creating report:', error);
    toast.error(`Error: ${error.message}`);
    return false;
  }
};

export const uploadVoiceMessage = async (
  audioBlob: Blob, 
  userId: string | undefined, 
  alertId: string
): Promise<string | null> => {
  if (!userId) {
    toast.error("You must be logged in to upload voice messages");
    return null;
  }
  
  try {
    const fileExt = 'mp3';
    const fileName = `voice-${alertId}-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/voice/${fileName}`;
    
    // Check if evidence bucket exists and create if needed
    const { data: buckets } = await supabase.storage.listBuckets();
    const evidenceBucketExists = buckets?.some(bucket => bucket.name === 'evidence');
    
    if (!evidenceBucketExists) {
      await supabase.storage.createBucket('evidence', {
        public: false,
      });
    }
    
    // Upload voice recording
    const { error } = await supabase.storage
      .from('evidence')
      .upload(filePath, audioBlob, {
        contentType: 'audio/mpeg',
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) {
      console.error('Voice upload error:', error);
      throw error;
    }
    
    // Get public URL
    const { data } = supabase.storage
      .from('evidence')
      .getPublicUrl(filePath);
      
    return data.publicUrl;
  } catch (error: any) {
    console.error('Error uploading voice message:', error);
    toast.error(`Voice upload failed: ${error.message}`);
    return null;
  }
};

export const getReportEvidence = async (reportId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('evidence')
      .select('*')
      .eq('report_id', reportId);
      
    if (error) throw error;
    
    return data || [];
  } catch (error: any) {
    console.error('Error fetching evidence:', error);
    return [];
  }
};

export const uploadCriminalPhoto = async (
  photoFile: File,
  userId: string | undefined
): Promise<string | null> => {
  if (!userId) {
    toast.error("You must be logged in to upload photos");
    return null;
  }
  
  try {
    const fileExt = photoFile.name.split('.').pop() || 'jpg';
    const fileName = `criminal-${Date.now()}.${fileExt}`;
    const filePath = `criminal-photos/${fileName}`;
    
    // Check if evidence bucket exists and create if needed
    const { data: buckets } = await supabase.storage.listBuckets();
    const evidenceBucketExists = buckets?.some(bucket => bucket.name === 'evidence');
    
    if (!evidenceBucketExists) {
      await supabase.storage.createBucket('evidence', {
        public: true,
      });
    }
    
    console.log(`Uploading file: ${filePath}, size: ${photoFile.size} bytes`);
    
    // Upload photo
    const { error, data } = await supabase.storage
      .from('evidence')
      .upload(filePath, photoFile, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (error) {
      console.error('Photo upload error:', error);
      throw error;
    }
    
    console.log('File uploaded successfully:', data?.path);
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('evidence')
      .getPublicUrl(filePath);
      
    console.log('Generated public URL:', urlData.publicUrl);
    
    return urlData.publicUrl;
  } catch (error: any) {
    console.error('Error uploading criminal photo:', error);
    toast.error(`Photo upload failed: ${error.message}`);
    return null;
  }
};
