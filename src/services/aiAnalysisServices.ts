
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
    console.log(`Starting analysis for video: ${videoUrl}, reportId: ${reportId}`);
    
    // First, check if this video has already been analyzed
    if (reportId) {
      const existingAnalysis = await getReportAnalysis(reportId);
      if (existingAnalysis) {
        console.log("Found existing analysis for this report:", existingAnalysis);
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
          
        console.log("Video queued for analysis");  
      } catch (insertError: any) {
        console.error("Error queuing analysis:", insertError);
        // Continue with analysis even if queue insert fails
      }
    }
    
    console.log("Calling FastAPI model to analyze video");
    
    try {
      // First try to use the Python FastAPI model service
      const response = await fetch('http://localhost:8000/analyze-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_url: videoUrl }),
        signal: AbortSignal.timeout(15000) // 15 second timeout for local model
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Local model analysis successful:", data);
        
        const analysis: VideoAnalysisResult = {
          crimeType: data.crime_type.toLowerCase(),
          confidence: data.confidence,
          description: data.description,
          analysisTimestamp: new Date().toISOString()
        };
        
        // Store the analysis result if we have a report ID
        if (reportId) {
          await storeAnalysisResult(reportId, analysis);
        }
        
        return { success: true, analysis };
      } else {
        console.warn("Local model service returned error, using fallback:", await response.text());
      }
    } catch (modelError) {
      console.warn("Local model service not available, using edge function:", modelError);
    }
    
    // Fallback to edge function if local model fails
    const { data, error } = await supabase.functions.invoke('analyze-video-evidence', {
      body: { videoUrl, reportId }
    });
    
    if (error) {
      console.error("Error analyzing video:", error);
      toast.error("Failed to analyze video. Please try again.");
      return { success: false, error: error.message };
    }
    
    if (!data.success) {
      console.error("Analysis unsuccessful:", data.error);
      toast.error(data.error || "Analysis failed");
      return { success: false, error: data.error };
    }
    
    console.log("Analysis completed successfully:", data);
    
    // If we have a report ID, store the analysis result in the database
    if (reportId && data.analysis) {
      await storeAnalysisResult(reportId, data.analysis);
    }
    
    return data;
  } catch (error: any) {
    console.error("Error in analyzeVideoEvidence:", error);
    toast.error(`Analysis error: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Store analysis result in the database
 * @param reportId Report ID
 * @param analysis Analysis result
 */
async function storeAnalysisResult(reportId: string, analysis: VideoAnalysisResult) {
  try {
    await supabase
      .from('crime_report_analysis' as any)
      .upsert({
        report_id: reportId,
        crime_type: analysis.crimeType,
        confidence: analysis.confidence,
        description: analysis.description,
        model_version: 'v1.0'
      });
      
    console.log("Analysis stored in database");
  } catch (upsertError: any) {
    console.error("Error storing analysis:", upsertError);
  }
}

/**
 * Get analysis result for a specific report from the database
 * 
 * @param reportId Report ID
 * @returns Analysis result
 */
export const getReportAnalysis = async (reportId: string): Promise<VideoAnalysisResult | null> => {
  try {
    console.log(`Getting analysis for report: ${reportId}`);
    
    // Use a safer approach with better type handling
    const { data, error } = await supabase
      .from('crime_report_analysis' as any)
      .select('*')
      .eq('report_id', reportId)
      .single();
    
    if (error) {
      // If the report doesn't have an analysis yet, it's not an error
      if (error.code === 'PGRST116') { // No rows returned
        console.log("No analysis found for this report");
        return null;
      }
      console.error("Error fetching report analysis:", error);
      throw error;
    }
    
    if (!data) {
      console.log("No analysis data returned");
      return null;
    }
    
    // Use type assertion after validating that data exists
    const rawData = data as any;
    
    // Type assertion with safe fallbacks
    const result: VideoAnalysisResult = {
      crimeType: rawData.crime_type || '',
      confidence: typeof rawData.confidence === 'number' ? rawData.confidence : 0,
      description: rawData.description || '',
      analysisTimestamp: rawData.created_at || new Date().toISOString()
    };
    
    console.log("Retrieved analysis:", result);
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
