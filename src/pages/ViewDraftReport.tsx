
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Edit, Download, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const ViewDraftReport = () => {
  const navigate = useNavigate();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  useEffect(() => {
    const savedImages = sessionStorage.getItem('uploadedImages');
    if (savedImages) {
      setUploadedImages(JSON.parse(savedImages));
    } else {
      // Use placeholder images if no uploads
      setUploadedImages([
        "https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1576482316642-48cf1c400f14?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1594717527389-a590b56e331d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
      ]);
    }
  }, []);
  
  const handleDownloadDraft = () => {
    toast.success("Draft report downloaded successfully");
  };
  
  const handleEditReport = () => {
    navigate("/continue-report");
  };
  
  const handleGenerateFullReport = () => {
    navigate("/generate-detailed-report");
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <section className="pt-24 pb-16">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <Link to="/continue-report" className="mr-4">
                <Button variant="ghost" size="sm" className="text-gray-600">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold">Draft Report #1042</h1>
            </div>
            
            <div className="flex items-center">
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Draft</span>
            </div>
          </div>
          
          <div className="glass-card p-8 mb-8">
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Report Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Incident Date</p>
                  <p className="font-medium">{new Date().toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Location</p>
                  <p className="font-medium">Downtown Central Square</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Report Type</p>
                  <p className="font-medium">Public Disturbance</p>
                </div>
              </div>
              
              <h3 className="text-lg font-medium mb-2">Incident Description</h3>
              <p className="text-gray-700 mb-6">
                At approximately 8:30 PM, a group of individuals were observed vandalizing public property in 
                the central square area. Multiple witnesses were present, and several photographs were taken 
                of the incident in progress. The perpetrators appeared to be in their early twenties and fled 
                the scene when approached by security personnel.
              </p>
              
              <h3 className="text-lg font-medium mb-2">Submitted Evidence</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {uploadedImages.map((img, index) => (
                  <img 
                    key={index}
                    src={img} 
                    alt={`Evidence ${index + 1}`} 
                    className="aspect-square object-cover rounded-lg border border-gray-200"
                  />
                ))}
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium mb-2">AI Analysis (Preliminary)</h3>
                <p className="text-gray-700 italic">
                  Initial analysis indicates the presence of 4-5 individuals engaged in defacement of public 
                  property. Identified tools include spray paint canisters and markers. Facial recognition 
                  is incomplete at this stage and requires further processing.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="w-full bg-shield-blue text-white hover:bg-blue-600 transition-all"
                onClick={handleEditReport}
              >
                <Edit className="mr-2 h-4 w-4" /> Continue Editing
              </Button>
              
              <Button 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all flex-1"
                onClick={handleDownloadDraft}
              >
                <Download className="mr-2 h-4 w-4" /> Download Draft
              </Button>
              
              <Button 
                className="w-full bg-green-600 text-white hover:bg-green-700 transition-all"
                onClick={handleGenerateFullReport}
              >
                <FileText className="mr-2 h-4 w-4" /> Generate Full Report
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default ViewDraftReport;
