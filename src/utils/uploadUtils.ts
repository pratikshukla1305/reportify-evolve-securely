
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Upload files to Supabase storage
export const uploadFilesToSupabase = async (
  files: File[],
  userId: string
): Promise<string[]> => {
  const uploadedUrls: string[] = [];

  for (const file of files) {
    try {
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from('evidences')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });
      
      if (error) {
        console.error('Error uploading file:', error);
        continue;
      }
      
      // Get public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('evidences')
        .getPublicUrl(filePath);
      
      if (urlData && urlData.publicUrl) {
        uploadedUrls.push(urlData.publicUrl);
      }
    } catch (error) {
      console.error('Error in uploadFilesToSupabase:', error);
    }
  }
  
  return uploadedUrls;
};

// Create a draft report
export const createDraftReport = async (
  userId: string,
  reportId: string,
  fileUrls: string[]
): Promise<boolean> => {
  try {
    // Insert the report
    const { error: reportError } = await supabase
      .from('crime_reports')
      .insert({
        id: reportId,
        user_id: userId,
        status: 'draft',
        title: 'Untitled Crime Report',
      });
    
    if (reportError) {
      console.error('Error creating draft report:', reportError);
      return false;
    }
    
    // Insert evidence items
    for (const fileUrl of fileUrls) {
      const { error } = await supabase
        .from('evidence')
        .insert({
          report_id: reportId,
          user_id: userId,
          storage_path: fileUrl,
          type: fileUrl.toLowerCase().includes('video') ? 'video' : 'image',
          title: `Evidence ${fileUrls.indexOf(fileUrl) + 1}`
        });
      
      if (error) {
        console.error('Error adding evidence:', error);
      }
      
      // Also insert into analysis_videos if it's a video
      if (fileUrl.toLowerCase().includes('video') || 
          fileUrl.toLowerCase().endsWith('.mp4') || 
          fileUrl.toLowerCase().endsWith('.mov')) {
        await supabase
          .from('analysis_videos')
          .insert({
            report_id: reportId,
            file_name: fileUrl.split('/').pop() || 'video.mp4',
            file_url: fileUrl,
            mime_type: 'video/mp4',
            status: 'pending'
          });
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in createDraftReport:', error);
    return false;
  }
};
