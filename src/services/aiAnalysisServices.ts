
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VideoAnalysisResult {
  crimeType: string;
  confidence: number;
  description: string;
  analysisTimestamp: string;
}

// Function to analyze video evidence using FastAPI
export const analyzeVideoEvidence = async (
  videoUrl: string, 
  reportId: string,
  location?: string
): Promise<{success: boolean; analysis?: VideoAnalysisResult; error?: string}> => {
  try {
    console.log("Analyzing video evidence:", videoUrl);
    
    // Record the video in our new analysis_videos table
    const { data: videoData, error: videoError } = await supabase
      .from('analysis_videos')
      .insert({
        report_id: reportId,
        file_name: videoUrl.split('/').pop() || 'video.mp4',
        file_url: videoUrl,
        status: 'processing',
        mime_type: 'video/mp4'
      })
      .select('id')
      .single();
      
    if (videoError) {
      console.error("Error recording video for analysis:", videoError);
      throw new Error(videoError.message);
    }
    
    // Call local FastAPI endpoint
    const response = await fetch("http://127.0.0.1:8000/predict", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        video_url: videoUrl,
        location: location || 'Unknown location'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Fallback to mock analysis if local API is not available
      console.warn(`FastAPI not available (${response.status}): ${errorText}`);
      toast.warning("Local API not available. Using fallback analysis.");
      return await mockAnalyzeVideo(videoUrl, reportId, videoData?.id);
    }

    const result = await response.json();
    console.log("FastAPI analysis result:", result);
    
    // Update the analysis video status
    await supabase.rpc('update_analysis_video_status', {
      p_video_id: videoData.id,
      p_status: 'analyzed'
    });
    
    // Store the analysis result in the database
    const { error: analysisError } = await supabase
      .from('crime_report_analysis')
      .insert({
        report_id: reportId,
        crime_type: result.crime_type || "Unknown",
        confidence: result.confidence || 0.75,
        description: result.description || "No description available",
        model_version: "FastAPI-Custom-v1"
      });
    
    if (analysisError) {
      console.error("Error saving analysis result:", analysisError);
    }
    
    return {
      success: true,
      analysis: {
        crimeType: result.crime_type || "Unknown",
        confidence: result.confidence || 0.75,
        description: result.description || "No description available",
        analysisTimestamp: new Date().toISOString()
      }
    };
  } catch (error: any) {
    console.error("Error with video analysis:", error);
    return await mockAnalyzeVideo(videoUrl, reportId);
  }
};

// Mock analysis function as a fallback when the FastAPI endpoint isn't available
const mockAnalyzeVideo = async (
  videoUrl: string, 
  reportId: string,
  videoId?: string
): Promise<{success: boolean; analysis?: VideoAnalysisResult; error?: string}> => {
  console.log("Using mock analysis for video:", videoUrl);
  
  // Update video status if we have a videoId
  if (videoId) {
    await supabase.rpc('update_analysis_video_status', {
      p_video_id: videoId,
      p_status: 'analyzed'
    });
  }
  
  // Generate a mock analysis
  const mockCrimeTypes = ["assault", "theft", "vandalism", "arson", "abuse"];
  const mockCrimeType = mockCrimeTypes[Math.floor(Math.random() * mockCrimeTypes.length)];
  
  const mockDescriptions = [
    "The video shows evidence of a crime where a perpetrator approaches the victim in a threatening manner. The incident appears to have occurred in an urban setting.",
    "Analysis of the video indicates signs of criminal activity taking place on public property. There are multiple individuals involved in the incident.",
    "The footage reveals a potential crime scene with evidence of property damage. The time stamp suggests this occurred during daylight hours.",
    "Examination of the video shows suspicious behavior consistent with criminal activity. The location appears to be a commercial establishment."
  ];
  
  const mockDescription = mockDescriptions[Math.floor(Math.random() * mockDescriptions.length)];
  const mockConfidence = 0.75 + (Math.random() * 0.2); // 0.75-0.95
  
  const mockAnalysis: VideoAnalysisResult = {
    crimeType: mockCrimeType,
    confidence: mockConfidence,
    description: mockDescription,
    analysisTimestamp: new Date().toISOString()
  };
  
  // Store the mock analysis in the database
  try {
    const { error: analysisError } = await supabase
      .from('crime_report_analysis')
      .insert({
        report_id: reportId,
        crime_type: mockAnalysis.crimeType,
        confidence: mockAnalysis.confidence,
        description: mockAnalysis.description,
        model_version: "Mock-Fallback-v1"
      });
    
    if (analysisError) {
      console.error("Error saving mock analysis:", analysisError);
    }
  } catch (error) {
    console.error("Database error while saving mock analysis:", error);
  }
  
  return {
    success: true,
    analysis: mockAnalysis
  };
};

// Get analysis for a report
export const getReportAnalysis = async (reportId: string): Promise<VideoAnalysisResult | null> => {
  try {
    const { data, error } = await supabase
      .from('crime_report_analysis')
      .select('*')
      .eq('report_id', reportId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      console.error("Error fetching report analysis:", error);
      return null;
    }
    
    if (!data) return null;
    
    return {
      crimeType: data.crime_type,
      confidence: data.confidence,
      description: data.description,
      analysisTimestamp: data.created_at
    };
  } catch (error) {
    console.error("Error in getReportAnalysis:", error);
    return null;
  }
};
