
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
    
    return data;
  } catch (error: any) {
    console.error("Error in analyzeVideoEvidence:", error);
    toast.error(`Analysis error: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Get analysis result for a specific report
 * Since we don't have a crime_report_analysis table in the database schema,
 * this is a mock implementation that would normally fetch from the database.
 * 
 * @param reportId Report ID
 * @returns Analysis result
 */
export const getReportAnalysis = async (reportId: string): Promise<VideoAnalysisResult | null> => {
  try {
    // In a real implementation, we would query the database for the analysis
    // For now, simulate getting the analysis from evidence metadata
    const { data, error } = await supabase
      .from('evidence')
      .select('*')
      .eq('report_id', reportId)
      .order('uploaded_at', { ascending: false })
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    if (!data || data.length === 0) {
      return null;
    }
    
    // For demo purposes, simulate an analysis result
    // In production, you would store and retrieve actual analysis data
    const mockAnalysis: VideoAnalysisResult = {
      crimeType: ['abuse', 'assault', 'arson', 'arrest'][Math.floor(Math.random() * 4)],
      confidence: 0.75 + (Math.random() * 0.2),
      description: "This video shows potential evidence of a crime. The AI has analyzed the content and detected suspicious activity that requires further investigation.",
      analysisTimestamp: new Date().toISOString()
    };
    
    return mockAnalysis;
  } catch (error: any) {
    console.error("Error in getReportAnalysis:", error);
    toast.error(`Failed to retrieve analysis: ${error.message}`);
    return null;
  }
};
