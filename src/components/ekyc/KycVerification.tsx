
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { extractAadhaarData } from '@/utils/ocrUtils';

interface KycVerificationProps {
  userId: string;
  onComplete: () => void;
  formData: any;
}

const KycVerification = ({ userId, onComplete, formData }: KycVerificationProps) => {
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  
  const idFrontRef = useRef<HTMLInputElement>(null);
  const idBackRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, setFile: React.Dispatch<React.SetStateAction<File | null>>, setPreview: React.Dispatch<React.SetStateAction<string | null>>, fileType: string) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        
        // If this is the ID front and looks like an Aadhaar card, try OCR
        if (fileType === 'idFront') {
          performOcr(file);
        }
      } else {
        toast({
          title: "Invalid file",
          description: "Please upload an image file",
          variant: "destructive",
        });
      }
    }
  };

  const performOcr = async (file: File) => {
    try {
      setIsProcessingOcr(true);
      toast({
        title: "Processing document",
        description: "Extracting information from your ID card...",
      });
      
      const aadhaarData = await extractAadhaarData(file);
      
      if (aadhaarData.aadhaarNumber) {
        toast({
          title: "Document scanned",
          description: "Successfully extracted information from your Aadhaar card.",
        });
      } else {
        console.log("OCR didn't detect an Aadhaar number, might not be an Aadhaar card or poor quality image");
      }
    } catch (error) {
      console.error('OCR processing error:', error);
      toast({
        title: "OCR failed",
        description: "Could not extract information automatically from your ID. Please make sure your ID is clearly visible.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingOcr(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!idFrontFile || !idBackFile || !selfieFile) {
      toast({
        title: "Missing documents",
        description: "Please upload all required documents",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real application, you would upload these files to a server
      // Here we're just simulating the upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Documents submitted",
        description: "Your verification documents have been submitted for review",
      });
      
      onComplete();
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "There was an error submitting your documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <h3 className="font-medium">ID Front Side</h3>
                <p className="text-sm text-gray-500">
                  Upload the front side of your government issued ID
                </p>
                
                {idFrontPreview ? (
                  <div className="relative aspect-[3/2] bg-gray-100 rounded-md overflow-hidden">
                    <img
                      src={idFrontPreview}
                      alt="ID Front Preview"
                      className="w-full h-full object-cover"
                    />
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      className="absolute bottom-2 right-2"
                      onClick={() => idFrontRef.current?.click()}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50"
                    onClick={() => idFrontRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-400">PNG, JPG, or JPEG</p>
                  </div>
                )}
                
                <input
                  type="file"
                  ref={idFrontRef}
                  className="hidden"
                  onChange={(e) => handleFileChange(e, setIdFrontFile, setIdFrontPreview, 'idFront')}
                  accept="image/*"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <h3 className="font-medium">ID Back Side</h3>
                <p className="text-sm text-gray-500">
                  Upload the back side of your government issued ID
                </p>
                
                {idBackPreview ? (
                  <div className="relative aspect-[3/2] bg-gray-100 rounded-md overflow-hidden">
                    <img
                      src={idBackPreview}
                      alt="ID Back Preview"
                      className="w-full h-full object-cover"
                    />
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      className="absolute bottom-2 right-2"
                      onClick={() => idBackRef.current?.click()}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50"
                    onClick={() => idBackRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-400">PNG, JPG, or JPEG</p>
                  </div>
                )}
                
                <input
                  type="file"
                  ref={idBackRef}
                  className="hidden"
                  onChange={(e) => handleFileChange(e, setIdBackFile, setIdBackPreview, 'idBack')}
                  accept="image/*"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <h3 className="font-medium">Selfie with ID</h3>
                <p className="text-sm text-gray-500">
                  Take a selfie holding your ID next to your face
                </p>
                
                {selfiePreview ? (
                  <div className="relative aspect-[3/2] bg-gray-100 rounded-md overflow-hidden">
                    <img
                      src={selfiePreview}
                      alt="Selfie Preview"
                      className="w-full h-full object-cover"
                    />
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      className="absolute bottom-2 right-2"
                      onClick={() => selfieRef.current?.click()}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50"
                    onClick={() => selfieRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-400">PNG, JPG, or JPEG</p>
                  </div>
                )}
                
                <input
                  type="file"
                  ref={selfieRef}
                  className="hidden"
                  onChange={(e) => handleFileChange(e, setSelfieFile, setSelfiePreview, 'selfie')}
                  accept="image/*"
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Instructions</h3>
          <div className="bg-blue-50 text-blue-800 p-4 rounded-md space-y-2">
            <p>Please ensure that:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>All details in the documents are clearly visible</li>
              <li>For Indian citizens, Aadhaar card details will be automatically extracted</li>
              <li>Your face is clearly visible in the selfie along with your ID</li>
              <li>Document images are not blurred or cropped</li>
            </ul>
            <p className="text-sm mt-2">
              Your verification usually takes 24-48 hours. You will be notified once the verification is complete.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            size="lg"
            disabled={isSubmitting || isProcessingOcr || !idFrontFile || !idBackFile || !selfieFile}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <span className="loader mr-2"></span>
                Submitting...
              </>
            ) : isProcessingOcr ? (
              <>
                <span className="loader mr-2"></span>
                Processing Documents...
              </>
            ) : (
              'Submit for Verification'
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default KycVerification;
