
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const resendApiKey = Deno.env.get('RESEND_API_KEY') || '';

if (!resendApiKey) {
  console.error("RESEND_API_KEY environment variable is not set!");
}

const resend = new Resend(resendApiKey);

interface EmailShareRequest {
  reportId: string;
  pdfUrl: string;
  recipientEmail: string;
  subject: string;
  message: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reportId, pdfUrl, recipientEmail, subject, message }: EmailShareRequest = await req.json();

    if (!reportId || !pdfUrl || !recipientEmail) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing required parameters: reportId, pdfUrl, or recipientEmail" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get report details from the database
    const { data: reportData, error: reportError } = await supabase
      .from('crime_reports')
      .select('*, crime_report_analysis(*)')
      .eq('id', reportId)
      .single();
    
    if (reportError) {
      console.error("Error fetching report:", reportError);
    }
    
    // Send email with report PDF
    const emailResponse = await resend.emails.send({
      from: "Shield <reports@shield-security.com>",
      to: [recipientEmail],
      subject: subject,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #003366; color: white; padding: 20px; text-align: center;">
          <h1>Shield Crime Report</h1>
        </div>
        
        <div style="padding: 20px; border: 1px solid #eaeaea; border-top: none;">
          <p>Hello,</p>
          <p>${message}</p>
          
          ${reportData ? `
          <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #003366;">
            <p><strong>Report Details:</strong></p>
            <ul>
              <li>Report ID: ${reportId}</li>
              <li>Report Date: ${new Date(reportData.report_date).toLocaleDateString()}</li>
              ${reportData.crime_report_analysis ? `<li>Detected Crime: ${reportData.crime_report_analysis.crime_type}</li>` : ''}
              ${reportData.detailed_location ? `<li>Location: ${reportData.detailed_location}</li>` : ''}
            </ul>
          </div>
          ` : ''}
          
          <p>You can view and download the full report by clicking the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${pdfUrl}" style="background-color: #003366; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px;">
              View Report PDF
            </a>
          </div>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; font-size: 12px;">${pdfUrl}</p>
          
          <p>Sincerely,<br>The Shield Team</p>
        </div>
        
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>&copy; ${new Date().getFullYear()} Shield. All rights reserved.</p>
          <p>This email was sent as a result of a share request from a Shield user.</p>
        </div>
      </div>
      `,
    });
    
    if (emailResponse.error) {
      console.error("Error sending email:", emailResponse.error);
      return new Response(
        JSON.stringify({ success: false, error: emailResponse.error }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email sent successfully" 
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
