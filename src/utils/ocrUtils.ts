
import { createWorker } from 'tesseract.js';

interface AadhaarData {
  name?: string;
  dob?: string;
  gender?: string;
  aadhaarNumber?: string;
  address?: string;
}

export const extractAadhaarData = async (imageFile: File): Promise<AadhaarData> => {
  try {
    console.log('Starting OCR for Aadhaar extraction');
    
    // Create a worker with English language
    const worker = await createWorker('eng');
    
    // Convert file to base64
    const base64Image = await fileToBase64(imageFile);
    
    // Process the image with Tesseract
    const { data } = await worker.recognize(base64Image);
    await worker.terminate();
    
    console.log('OCR Completed. Text extracted:', data.text);
    
    // Parse the extracted text to find Aadhaar details
    const extractedData = parseAadhaarText(data.text);
    
    return extractedData;
  } catch (error) {
    console.error('Error during OCR processing:', error);
    throw new Error('Failed to extract data from the Aadhaar card');
  }
};

// Convert file to base64 for OCR processing
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// Parse the OCR text to extract Aadhaar details
const parseAadhaarText = (text: string): AadhaarData => {
  const result: AadhaarData = {};
  
  // Convert to lowercase and remove extra spaces
  const normalizedText = text.toLowerCase().replace(/\s+/g, ' ');
  
  console.log('Normalized text for parsing:', normalizedText);
  
  // Extract name (typically after "Name:" or with "Govt. of India" above)
  const nameMatch = text.match(/(?:Name|नाम)\s*:\s*([A-Za-z\s.]+)/) || 
                    text.match(/(?:Government of India|Govt\.? of India|भारत सरकार)(?:\r?\n|\s)+([A-Z][A-Za-z\s.]+)/i);
  
  if (nameMatch && nameMatch[1]) {
    result.name = nameMatch[1].trim();
  }
  
  // Extract DOB
  const dobMatch = text.match(/(?:DOB|Date of Birth|जन्म तिथि|Birth)\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{2,4}[/-]\d{1,2}[/-]\d{1,2})/i);
  if (dobMatch && dobMatch[1]) {
    result.dob = dobMatch[1].trim();
  }
  
  // Extract gender
  const genderMatch = text.match(/(?:(?:male|female|MALE|FEMALE|पुरुष|महिला))/i);
  if (genderMatch && genderMatch[0]) {
    result.gender = genderMatch[0].trim();
  }
  
  // Extract Aadhaar number (12 digits, possibly separated by spaces)
  const aadhaarMatch = text.match(/\b(\d{4}\s*\d{4}\s*\d{4})\b/) || 
                       text.match(/(?:Aadhaar|आधार|UID|VID)\s*:?\s*(\d{4}\s*\d{4}\s*\d{4})/i);
  
  if (aadhaarMatch && aadhaarMatch[1]) {
    // Remove spaces from the Aadhaar number
    result.aadhaarNumber = aadhaarMatch[1].replace(/\s+/g, '').trim();
  }
  
  // Extract address (complex - typically multiple lines after "Address:" or before PIN code)
  // This is simplified and might need to be improved based on actual format
  const addressMatch = text.match(/(?:Address|पता)\s*:?\s*([^.]*(?:PIN|पिन|Pincode)?)/i);
  if (addressMatch && addressMatch[1]) {
    result.address = addressMatch[1].trim().replace(/\s+/g, ' ');
  }
  
  console.log('Extracted Aadhaar data:', result);
  return result;
};
