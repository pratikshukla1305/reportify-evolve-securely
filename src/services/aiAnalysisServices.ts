
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
      await supabase.from('video_analysis_queue').insert({
        report_id: reportId,
        video_url: videoUrl,
        status: 'processing'
      });
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
      await supabase.from('crime_report_analysis').upsert({
        report_id: reportId,
        crime_type: data.analysis.crimeType,
        confidence: data.analysis.confidence,
        description: data.analysis.description,
        model_version: 'v1.0'
      });
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
    // Query the crime_report_analysis table for this report
    const { data, error } = await supabase
      .from('crime_report_analysis')
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
    
    // Map database fields to VideoAnalysisResult
    const result: VideoAnalysisResult = {
      crimeType: data.crime_type,
      confidence: Number(data.confidence),
      description: data.description,
      analysisTimestamp: data.created_at
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
