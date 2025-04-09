import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { crimeDescriptions, getCrimeDescriptionByType } from './crimeAnalysisData';

export type VideoAnalysisResult = {
  crimeType: string;
  confidence: number;
  description: string;
  analysisTimestamp: string;
};

export type AnalysisResponse = {
  success: boolean;
  analysis?: VideoAnalysisResult;
  error?: string;
};

/**
 * Analyze video evidence using AI
 * @param videoUrl URL of the video to analyze
 * @param reportId Optional report ID to associate the analysis with
 * @returns Analysis result
 */
export const analyzeVideoEvidence = async (videoUrl: string, reportId?: string): Promise<AnalysisResponse> => {
  try {
    // First, check if this video has already been analyzed
    if (reportId) {
      const existingAnalysis = await getReportAnalysis(reportId);
      if (existingAnalysis) {
        return { success: true, analysis: existingAnalysis };
      }
    }
    
    // If not previously analyzed, queue it for analysis
    if (reportId) {
      try {
        // Use a raw query approach with error handling
        await supabase
          .from('video_analysis_queue' as any)
          .insert({
            report_id: reportId,
            video_url: videoUrl,
            status: 'processing'
          });
      } catch (insertError: any) {
        console.error("Error queuing analysis:", insertError);
        // Continue with analysis even if queue insert fails
      }
    }
    
    // Call the edge function to analyze the video
    const { data, error } = await supabase.functions.invoke('analyze-video-evidence', {
      body: { videoUrl, reportId }
    });
    
    if (error) {
      console.error("Error analyzing video:", error);
      toast.error("Failed to analyze video. Please try again.");
      return { success: false, error: error.message };
    }
    
    if (!data.success) {
      toast.error(data.error || "Analysis failed");
      return { success: false, error: data.error };
    }
    
    // If we have a report ID, store the analysis result in the database
    if (reportId && data.analysis) {
      try {
        await supabase
          .from('crime_report_analysis' as any)
          .upsert({
            report_id: reportId,
            crime_type: data.analysis.crimeType,
            confidence: data.analysis.confidence,
            description: data.analysis.description,
            model_version: 'v1.0'
          });
      } catch (upsertError: any) {
        console.error("Error storing analysis:", upsertError);
        // Continue even if storage fails
      }
    }
    
    return data;
  } catch (error: any) {
    console.error("Error in analyzeVideoEvidence:", error);
    toast.error(`Analysis error: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Get analysis result for a specific report from the database
 * 
 * @param reportId Report ID
 * @returns Analysis result
 */
export const getReportAnalysis = async (reportId: string): Promise<VideoAnalysisResult | null> => {
  try {
    // Use a safer approach with better type handling
    const { data, error } = await supabase
      .from('crime_report_analysis' as any)
      .select('*')
      .eq('report_id', reportId)
      .single();
    
    if (error) {
      // If the report doesn't have an analysis yet, it's not an error
      if (error.code === 'PGRST116') { // No rows returned
        return null;
      }
      throw error;
    }
    
    if (!data) {
      return null;
    }
    
    // Use strong type assertion and proper type checking
    // This gives TypeScript more information about the structure
    const rawData = data as any;
    
    // Create the result object with safe access patterns
    const result: VideoAnalysisResult = {
      crimeType: typeof rawData.crime_type === 'string' ? rawData.crime_type : '',
      confidence: typeof rawData.confidence === 'number' ? rawData.confidence : 0,
      description: typeof rawData.description === 'string' ? rawData.description : '',
      analysisTimestamp: typeof rawData.created_at === 'string' ? rawData.created_at : new Date().toISOString()
    };
    
    return result;
  } catch (error: any) {
    console.error("Error in getReportAnalysis:", error);
    
    // If it's not a "no rows" error, show a toast
    if (error.code !== 'PGRST116') {
      toast.error(`Failed to retrieve analysis: ${error.message}`);
    }
    
    return null;
  }
};

/**
 * Perform a mock analysis when no real AI model is available.
 * This function provides realistic-looking results for demo purposes.
 */
export const performMockAnalysis = (videoUrl: string): VideoAnalysisResult => {
  // Simulate AI analysis
  const crimeTypes = ["abuse", "assault", "arson", "arrest"];
  const randomIndex = Math.floor(Math.random() * crimeTypes.length);
  const crimeType = crimeTypes[randomIndex];
  const confidence = 0.75 + (Math.random() * 0.20); // Between 0.75 and 0.95
  
  return {
    crimeType,
    confidence,
    description: getCrimeDescriptionByType(crimeType),
    analysisTimestamp: new Date().toISOString()
  };
};
