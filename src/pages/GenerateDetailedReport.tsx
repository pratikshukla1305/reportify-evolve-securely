import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FileText, Check, RotateCcw, Download, Share2, 
  ArrowLeft, Send, ShieldAlert, MessageCircle, Phone 
} from 'lucide-react';
import { toast } from 'sonner';
import { submitReportToOfficer } from '@/services/reportServices';
import { analyzeVideoEvidence, VideoAnalysisResult } from '@/services/aiAnalysisServices';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import jsPDF from 'jspdf';

const GenerateDetailedReport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<VideoAnalysisResult | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState<string>('preparing');
  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id');
    if (id) {
      setReportId(id);
    }
    
    const savedImages = sessionStorage.getItem('uploadedImages');
    if (savedImages) {
      setUploadedImages(JSON.parse(savedImages));
    }
  }, [location.search]);
  
  const simulateProgress = () => {
    let progress = 0;
    const steps = ['preparing', 'extracting', 'analyzing', 'generating'];
    
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 5) + 1;
      setAnalysisProgress(Math.min(progress, 100));
      
      if (progress >= 25 && progress < 50) {
        setAnalysisStep(steps[1]);
      } else if (progress >= 50 && progress < 75) {
        setAnalysisStep(steps[2]);
      } else if (progress >= 75 && progress < 100) {
        setAnalysisStep(steps[3]);
      }
      
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 200);
    
    return () => clearInterval(interval);
  };
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    simulateProgress();
    
    try {
      if (uploadedImages.length > 0 && reportId) {
        console.log("Analyzing video evidence:", uploadedImages[0]);
        const videoUrl = uploadedImages[0];
        const result = await analyzeVideoEvidence(videoUrl, reportId);
        
        if (result.success && result.analysis) {
          setAnalysisResult(result.analysis);
          console.log("AI analysis completed successfully:", result.analysis);
          toast.success("AI analysis completed successfully!");
        } else {
          console.error("Analysis failed:", result.error);
          toast.error(`Analysis failed: ${result.error}`);
        }
      } else {
        console.warn("No uploaded images or report ID available for analysis");
      }
      
      setTimeout(() => {
        setIsGenerating(false);
        setIsComplete(true);
        setAnalysisProgress(100);
        toast.success("Report generated successfully!");
      }, 3000);
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report. Please try again.");
      setIsGenerating(false);
    }
  };
  
  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      
      const logoUrl = "https://www.reportify.app/logo.png";
      doc.addImage(logoUrl, 'PNG', 10, 10, 50, 20);
      
      doc.setFontSize(22);
      doc.setTextColor(0, 51, 102);
      doc.text("REPORTIFY", 105, 20, { align: "center" });
      
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text("Crime Incident Report", 105, 40, { align: "center" });
      
      doc.setFontSize(11);
      doc.text(`Report ID: ${reportId || "Unknown"}`, 20, 50);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 57);
      doc.text(`Time: ${new Date().toLocaleTimeString()}`, 20, 64);
      doc.text(`Location: Downtown Central Square`, 20, 71);
      
      doc.setFontSize(14);
      doc.setTextColor(0, 51, 102);
      doc.text("AI Analysis Results", 20, 90);
      
      if (analysisResult) {
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`Incident Type: ${analysisResult.crimeType}`, 20, 100);
        doc.text(`Detection Confidence: ${Math.round(analysisResult.confidence * 100)}%`, 20, 107);
        
        doc.setFontSize(12);
        doc.setTextColor(0, 51, 102);
        doc.text("Incident Description:", 20, 120);
        
        const descriptionLines = analysisResult.description.split('\n');
        let yPosition = 130;
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        descriptionLines.forEach(line => {
          doc.text(line, 20, yPosition);
          yPosition += 6;
        });
        
        doc.setFontSize(12);
        doc.setTextColor(0, 51, 102);
        doc.text("Evidence Submitted:", 20, yPosition + 10);
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`${uploadedImages.length} video/image files`, 20, yPosition + 20);
      } else {
        doc.text("No analysis data available", 20, 100);
      }
      
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text("This report was generated by Reportify - Securely report incidents with confidence", 105, 280, { align: "center" });
      
      doc.save(`Reportify-Crime-Report-${reportId}.pdf`);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };
  
  const handleDownload = () => {
    generatePDF();
  };
  
  const handleShare = (platform: string) => {
    const reportUrl = `https://reportify.app/report/${reportId}`;
    let shareUrl = "";
    
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=Check%20out%20this%20incident%20report:%20${encodeURIComponent(reportUrl)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(reportUrl)}&text=Check%20out%20this%20incident%20report`;
        break;
      default:
        shareUrl = reportUrl;
    }
    
    window.open(shareUrl, '_blank');
    toast.success(`Report shared via ${platform}`);
  };
  
  const handleSendToOfficer = async () => {
    if (!reportId) {
      toast.error("Report ID not found. Cannot send to officer.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await submitReportToOfficer(reportId);
      
      toast.success("Report sent to officer for further processing");
      
      setTimeout(() => {
        navigate("/home");
      }, 1500);
    } catch (error) {
      console.error("Error sending report to officer:", error);
      toast.error("Failed to send report to officer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getAnalysisStepLabel = () => {
    switch (analysisStep) {
      case 'preparing':
        return 'Preparing Video Data';
      case 'extracting':
        return 'Extracting Video Features';
      case 'analyzing':
        return 'Analyzing Crime Pattern';
      case 'generating':
        return 'Generating AI Report';
      default:
        return 'Processing';
    }
  };
  
  const renderAnalysisResult = () => {
    if (!analysisResult) return null;
    
    const confidencePercentage = Math.round(analysisResult.confidence * 100);
    const crimeTypeColor = getCrimeTypeColor(analysisResult.crimeType);
    
    return (
      <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h3 className="text-lg font-medium mb-2 sm:mb-0">AI Analysis Results</h3>
          <Badge className={`${crimeTypeColor} capitalize`}>
            {analysisResult.crimeType}
          </Badge>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between mb-1 text-sm">
            <span>Detection Confidence</span>
            <span className="font-medium">{confidencePercentage}%</span>
          </div>
          <Progress value={confidencePercentage} className="h-2" />
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="description">
            <AccordionTrigger>Crime Description</AccordionTrigger>
            <AccordionContent>
              <div className="whitespace-pre-line text-sm text-gray-700 bg-white p-4 rounded border border-gray-100">
                {analysisResult.description}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <div className="mt-4 text-xs text-gray-500 flex items-center">
          <ShieldAlert className="h-3 w-3 mr-1" />
          Analysis completed on {new Date(analysisResult.analysisTimestamp).toLocaleString()}
        </div>
      </div>
    );
  };
  
  const getCrimeTypeColor = (crimeType: string): string => {
    switch (crimeType.toLowerCase()) {
      case 'abuse':
        return 'bg-orange-100 text-orange-800';
      case 'assault':
        return 'bg-red-100 text-red-800';
      case 'arson':
        return 'bg-amber-100 text-amber-800';
      case 'arrest':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const renderEvidencePreview = () => {
    if (!uploadedImages || uploadedImages.length === 0) {
      return (
        <div className="bg-gray-50 p-4 rounded text-gray-500 text-center">
          No evidence uploaded
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-2 gap-2 mt-2">
        {uploadedImages.map((url, index) => (
          <div key={index} className="relative aspect-video rounded-md overflow-hidden border border-gray-200">
            {url.toLowerCase().endsWith('.mp4') || 
             url.toLowerCase().endsWith('.mov') || 
             url.toLowerCase().includes('video') ? (
              <video 
                src={url} 
                controls 
                className="w-full h-full object-cover"
                poster="/placeholder.svg"
              />
            ) : (
              <img 
                src={url} 
                alt={`Evidence ${index + 1}`} 
                className="w-full h-full object-cover" 
              />
            )}
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <section className="pt-24 pb-16">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-8">
            <Link to="/continue-report" className="mr-4">
              <Button variant="ghost" size="sm" className="text-gray-600">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold">Generate Detailed Report</h1>
          </div>
          
          <div className="glass-card p-8 mb-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-shield-light mb-4">
                <FileText className="h-8 w-8 text-shield-blue" />
              </div>
              <h2 className="text-xl font-semibold mb-2">AI-Powered Report Generation</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our advanced AI will analyze all submitted video evidence to identify potential crimes
                and create a comprehensive, detailed report ready for official use. This process ensures accuracy 
                and thoroughness while saving you valuable time.
              </p>
            </div>
            
            <div className="bg-shield-light rounded-lg p-6 mb-8">
              <h3 className="text-lg font-medium mb-4">Report Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Report ID</p>
                  <p className="font-medium">{reportId || '#1042'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Incident Type</p>
                  <p className="font-medium">{analysisResult?.crimeType || "Under Analysis"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Evidence Items</p>
                  <p className="font-medium">{uploadedImages.length} Videos/Images, 1 Description</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Blockchain Status</p>
                  <p className="font-medium flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-1" /> Verified
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-1">Uploaded Evidence</p>
                {renderEvidencePreview()}
              </div>
            </div>
            
            {isGenerating && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                <h3 className="text-lg font-medium mb-4">AI Analysis in Progress</h3>
                
                <div className="mb-6">
                  <div className="flex justify-between mb-2 text-sm">
                    <span>{getAnalysisStepLabel()}</span>
                    <span>{analysisProgress}%</span>
                  </div>
                  <Progress value={analysisProgress} className="h-2" />
                </div>
                
                <div className="text-sm text-gray-600 italic">
                  Our AI model is analyzing your video evidence for potential crime identification. 
                  This may take a few moments.
                </div>
              </div>
            )}
            
            {isComplete && analysisResult && renderAnalysisResult()}
            
            {!isComplete ? (
              <div className="text-center">
                <Button 
                  size="lg"
                  className="bg-shield-blue text-white hover:bg-blue-600 transition-all"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing & Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Report with AI Analysis
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-2">
                    <Check className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="text-lg font-medium text-green-700">Report Generated Successfully!</h3>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                  <Button 
                    className="bg-shield-blue text-white hover:bg-blue-600 transition-all"
                    onClick={handleDownload}
                  >
                    <Download className="mr-2 h-4 w-4" /> Download PDF Report
                  </Button>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="border-shield-blue text-shield-blue hover:bg-shield-blue hover:text-white transition-all"
                      >
                        <Share2 className="mr-2 h-4 w-4" /> Share Report
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                      <div className="flex flex-col">
                        <Button 
                          variant="ghost"
                          className="justify-start rounded-none"
                          onClick={() => handleShare('whatsapp')}
                        >
                          <div className="bg-green-500 rounded-full p-1 mr-2">
                            <MessageCircle size={14} color="white" />
                          </div>
                          WhatsApp
                        </Button>
                        <Button 
                          variant="ghost"
                          className="justify-start rounded-none"
                          onClick={() => handleShare('telegram')}
                        >
                          <div className="bg-blue-500 rounded-full p-1 mr-2">
                            <Send size={14} color="white" />
                          </div>
                          Telegram
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <p className="text-gray-700 mb-4">Send this report to an officer for further processing</p>
                  <Button 
                    className="bg-green-600 text-white hover:bg-green-700 transition-all"
                    onClick={handleSendToOfficer}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <RotateCcw className="mr-2 h-4 w-4 animate-spin" /> Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" /> Send to Officer
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default GenerateDetailedReport;
