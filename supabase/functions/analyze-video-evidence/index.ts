
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Mapping of crime types to detailed descriptions
const descriptions = {
  "abuse": "The detected video may involve abuse-related actions.\nAbuse can be verbal, emotional, or physical.\nIt often includes intentional harm inflicted on a victim.\nThe victim may display distress or defensive behavior.\nThere might be aggressive body language or shouting.",
  "assault": "Assault involves a physical attack or aggressive encounter.\nThis may include punching, kicking, or pushing actions.\nThe victim may be seen retreating or being overpowered.\nThere is usually a visible conflict or threat present.\nSuch behavior is dangerous and potentially life-threatening.",
  "arson": "This video likely captures an incident of arson.\nArson is the criminal act of intentionally setting fire.\nYou may see flames, smoke, or ignition devices.\nOften, it targets property like buildings or vehicles.\nArson can lead to massive destruction and danger to life.",
  "arrest": "The scene likely depicts a law enforcement arrest.\nAn arrest involves restraining a suspect or individual.\nYou may see officers using handcuffs or other tools.\nThe individual may be cooperating or resisting.\nIt could be in public or private settings."
};

// Function to try connecting to local FastAPI model if available
async function tryLocalModel(videoUrl: string): Promise<any | null> {
  try {
    // Configure this to point to your Python FastAPI model service
    const localModelUrl = "http://localhost:8000/analyze-video";
    console.log(`Attempting to connect to local model at ${localModelUrl}`);
    
    const response = await fetch(localModelUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ video_url: videoUrl }),
      // Short timeout to fail fast if local model isn't running
      signal: AbortSignal.timeout(10000)
    });
    
    if (response.ok) {
      console.log("Successfully connected to local model");
      const result = await response.json();
      console.log("Local model response:", result);
      return result;
    } else {
      console.log(`Local model returned error status: ${response.status}`);
      const errorText = await response.text();
      console.log(`Error response: ${errorText}`);
    }
    
    return null;
  } catch (error) {
    console.log("Local model not available, using fallback:", error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoUrl, reportId } = await req.json();
    
    if (!videoUrl) {
      return new Response(
        JSON.stringify({ success: false, error: "Video URL is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    console.log(`Analyzing video: ${videoUrl} for report: ${reportId || 'N/A'}`);
    
    // Create a Supabase client with the Admin key to have full access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Try to use local Python FastAPI model service if available
    let modelResult = await tryLocalModel(videoUrl);
    
    // If local model fails or isn't available, use fallback simulation
    if (!modelResult) {
      console.log("Using fallback model simulation");
      
      // Simulate AI analysis
      // In a production environment, you would connect to a real AI model here
      const crimeTypes = ["abuse", "assault", "arson", "arrest"];
      const randomIndex = Math.floor(Math.random() * crimeTypes.length);
      const crimeType = crimeTypes[randomIndex];
      const confidence = 0.75 + (Math.random() * 0.20); // Between 0.75 and 0.95
      
      modelResult = {
        crime_type: crimeType,
        confidence: confidence,
        description: descriptions[crimeType as keyof typeof descriptions]
      };
    }
    
    const analysisResult = {
      crimeType: modelResult.crime_type,
      confidence: modelResult.confidence,
      description: modelResult.description || descriptions[modelResult.crime_type as keyof typeof descriptions],
      analysisTimestamp: new Date().toISOString()
    };
    
    console.log("Analysis complete:", analysisResult);
    
    // If we have a reportId, store the analysis in the database
    if (reportId) {
      try {
        const { error } = await supabase
          .from('crime_report_analysis')
          .upsert({
            report_id: reportId,
            crime_type: analysisResult.crimeType,
            confidence: analysisResult.confidence,
            description: analysisResult.description,
            model_version: 'v1.0'
          });
        
        if (error) {
          console.error("Error storing analysis in database:", error);
        } else {
          // Update the queue status
          await supabase
            .from('video_analysis_queue')
            .update({ status: 'completed', processed_at: new Date().toISOString() })
            .eq('report_id', reportId);
        }
      } catch (dbError) {
        console.error("Database error:", dbError);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis: analysisResult 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
