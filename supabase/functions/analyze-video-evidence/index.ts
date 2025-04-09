
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

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

    // Simulate AI analysis
    // In a production environment, you would connect to a real AI model here
    const crimeTypes = ["abuse", "assault", "arson", "arrest"];
    const randomIndex = Math.floor(Math.random() * crimeTypes.length);
    const crimeType = crimeTypes[randomIndex];
    const confidence = 0.75 + (Math.random() * 0.20); // Between 0.75 and 0.95
    
    // Import descriptions from our helper file
    const descriptions = {
      "abuse": "The detected video may involve abuse-related actions.\nAbuse can be verbal, emotional, or physical.\nIt often includes intentional harm inflicted on a victim.\nThe victim may display distress or defensive behavior.\nThere might be aggressive body language or shouting.",
      "assault": "Assault involves a physical attack or aggressive encounter.\nThis may include punching, kicking, or pushing actions.\nThe victim may be seen retreating or being overpowered.\nThere is usually a visible conflict or threat present.\nSuch behavior is dangerous and potentially life-threatening.",
      "arson": "This video likely captures an incident of arson.\nArson is the criminal act of intentionally setting fire.\nYou may see flames, smoke, or ignition devices.\nOften, it targets property like buildings or vehicles.\nArson can lead to massive destruction and danger to life.",
      "arrest": "The scene likely depicts a law enforcement arrest.\nAn arrest involves restraining a suspect or individual.\nYou may see officers using handcuffs or other tools.\nThe individual may be cooperating or resisting.\nIt could be in public or private settings."
    };
    
    const description = descriptions[crimeType as keyof typeof descriptions] || 
      "The video content requires further investigation.";
    
    const analysisResult = {
      crimeType,
      confidence,
      description,
      analysisTimestamp: new Date().toISOString()
    };
    
    console.log("Analysis complete:", analysisResult);
    
    // In a real scenario, you might want to store this analysis result in your database
    // For now, we'll just return the result
    
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
