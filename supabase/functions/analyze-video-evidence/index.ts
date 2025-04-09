
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const crimeDescriptions = {
  "abuse": 
    `The detected video may involve abuse-related actions.
    Abuse can be verbal, emotional, or physical.
    It often includes intentional harm inflicted on a victim.
    The victim may display distress or defensive behavior.
    There might be aggressive body language or shouting.
    Such scenes usually lack mutual consent or context of play.
    These actions are violations of basic human rights.
    It is important to report such behavior to authorities.
    Detection helps in early intervention and protection.
    Please verify with human oversight for further action.`,
  "assault": 
    `Assault involves a physical attack or aggressive encounter.
    This may include punching, kicking, or pushing actions.
    The victim may be seen retreating or being overpowered.
    There is usually a visible conflict or threat present.
    Such behavior is dangerous and potentially life-threatening.
    Immediate attention from security or authorities is critical.
    Assault detection can help prevent further escalation.
    The video may include violent gestures or weapons.
    Please proceed with care while reviewing such footage.
    Confirm with experts before initiating legal steps.`,
  "arson": 
    `This video likely captures an incident of arson.
    Arson is the criminal act of intentionally setting fire.
    You may see flames, smoke, or ignition devices.
    Often, it targets property like buildings or vehicles.
    Arson can lead to massive destruction and danger to life.
    There might be a rapid spread of fire visible.
    Suspects may appear to flee the scene post-ignition.
    These cases require immediate fire and law response.
    Check for signs of accelerants or premeditated setup.
    This detection must be validated with caution.`,
  "arrest": 
    `The scene likely depicts a law enforcement arrest.
    An arrest involves restraining a suspect or individual.
    You may see officers using handcuffs or other tools.
    The individual may be cooperating or resisting.
    It could be in public or private settings.
    Often, the suspect is guided or pushed into a vehicle.
    The presence of uniforms or badges may be evident.
    These scenarios may follow legal procedures.
    Misidentification is possible — confirm context.
    Verify with official reports before assuming guilt.`
};

// This is a simplified implementation since we can't run the actual Python model in Deno
// In a real implementation, you would call an API endpoint where your Python model is deployed
async function analyzeVideo(videoUrl: string) {
  try {
    console.log(`Analyzing video: ${videoUrl}`);
    
    // In production, you would call an external API where your Python model is hosted
    // For now, we'll simulate the result based on some basic analysis of the URL or metadata
    
    // Mock implementation - in a real scenario, this would be replaced with an actual API call
    // to your deployed Python model endpoint
    
    // Simulating processing time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // For demo purposes, derive a prediction from the URL or timestamp
    const timestamp = new Date().getTime();
    const crimeTypes = ["abuse", "arson", "assault", "arrest"];
    const predictedCrimeIndex = timestamp % crimeTypes.length;
    const predictedCrime = crimeTypes[predictedCrimeIndex];
    
    const analysis = {
      crimeType: predictedCrime,
      confidence: 0.75 + (Math.random() * 0.2), // Random confidence between 75% and 95%
      description: crimeDescriptions[predictedCrime],
      analysisTimestamp: new Date().toISOString()
    };
    
    return { success: true, analysis };
  } catch (error) {
    console.error("Error analyzing video:", error);
    return { success: false, error: error.message };
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { videoUrl, reportId } = await req.json();
    
    if (!videoUrl) {
      return new Response(
        JSON.stringify({ error: "Video URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const analysisResult = await analyzeVideo(videoUrl);
    
    // If a reportId is provided, store the analysis result in the database
    if (reportId && analysisResult.success) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      );
      
      const { error } = await supabaseClient
        .from('crime_report_analysis')
        .insert({
          report_id: reportId,
          crime_type: analysisResult.analysis.crimeType,
          confidence: analysisResult.analysis.confidence,
          description: analysisResult.analysis.description,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.error("Error storing analysis result:", error);
        return new Response(
          JSON.stringify({ error: "Failed to store analysis result" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-video-evidence function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
