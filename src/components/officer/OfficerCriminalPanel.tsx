import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  User, 
  Upload,
  Loader2
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { createCriminalProfile, getCriminalProfiles } from '@/services/officerServices';
import { uploadCriminalPhoto } from '@/utils/uploadUtils';
import { useOfficerAuth } from '@/contexts/OfficerAuthContext';
import { CriminalProfile } from '@/types/officer';

const OfficerCriminalPanel = () => {
  const { officer } = useOfficerAuth();
  const [criminals, setCriminals] = useState<CriminalProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    height: '',
    weight: '',
    last_known_location: '',
    case_number: '',
    risk_level: 'medium',
    charges: '',
    additional_information: ''
  });

  const fetchCriminals = async () => {
    try {
      const data = await getCriminalProfiles();
      setCriminals(data);
    } catch (error: any) {
      toast.error("Error fetching criminals", {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCriminals();
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log("Selected file:", file.name, file.type, file.size);
      setPhotoFile(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
      
      toast.success("Photo selected", {
        description: `File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.full_name || !formData.case_number) {
      toast.error("Required fields missing", {
        description: "Name and Case Number are required"
      });
      return;
    }
    
    setIsUploading(true);
    setIsLoading(true);
    
    try {
      // Upload photo first if available
      let photoUrl = null;
      if (photoFile && officer) {
        console.log("Uploading photo...");
        photoUrl = await uploadCriminalPhoto(photoFile, officer.id.toString());
        console.log("Photo uploaded, URL:", photoUrl);
      }
      
      // Create criminal profile
      await createCriminalProfile({
        full_name: formData.full_name,
        age: formData.age ? parseInt(formData.age) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        last_known_location: formData.last_known_location,
        case_number: formData.case_number,
        risk_level: formData.risk_level,
        charges: formData.charges,
        additional_information: formData.additional_information,
        photo_url: photoUrl
      });
      
      toast.success("Criminal profile created", {
        description: "The profile has been added to the database"
      });
      
      setIsDialogOpen(false);
      resetForm();
      fetchCriminals();
    } catch (error: any) {
      console.error("Error creating profile:", error);
      toast.error("Error creating profile", {
        description: error.message
      });
    } finally {
      setIsUploading(false);
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      age: '',
      height: '',
      weight: '',
      last_known_location: '',
      case_number: '',
      risk_level: 'medium',
      charges: '',
      additional_information: ''
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    
    // Clear the file input if it exists
    const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Criminal Database</h2>
        <Button onClick={() => setIsDialogOpen(true)}>Add New Criminal</Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-shield-blue"></div>
        </div>
      ) : criminals.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No criminal profiles found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {criminals.map((criminal) => (
            <div key={criminal.id} className="border rounded-lg p-4">
              <div className="flex items-start space-x-3">
                {criminal.photo_url ? (
                  <img 
                    src={criminal.photo_url} 
                    alt={criminal.full_name} 
                    className="w-20 h-20 object-cover rounded-md"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center">
                    <User className="w-10 h-10 text-gray-400" />
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">{criminal.full_name}</h3>
                    <div className={`px-2 py-1 rounded text-xs ${criminal.risk_level === 'high' ? 'bg-red-100 text-red-800' : criminal.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      {criminal.risk_level?.charAt(0).toUpperCase() + criminal.risk_level?.slice(1) || 'Unknown'} Risk
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">Case #{criminal.case_number}</div>
                  
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    {criminal.age && (
                      <div>
                        <span className="font-medium">Age:</span> {criminal.age}
                      </div>
                    )}
                    {criminal.height && (
                      <div>
                        <span className="font-medium">Height:</span> {criminal.height} cm
                      </div>
                    )}
                    {criminal.weight && (
                      <div>
                        <span className="font-medium">Weight:</span> {criminal.weight} kg
                      </div>
                    )}
                    <div className="col-span-2">
                      <span className="font-medium">Last seen:</span> {criminal.last_known_location}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-3">
                <h4 className="font-semibold">Charges:</h4>
                <p className="text-sm">{criminal.charges}</p>
              </div>
              
              {criminal.additional_information && (
                <div className="mt-2">
                  <h4 className="font-semibold">Additional Information:</h4>
                  <p className="text-sm">{criminal.additional_information}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!isUploading) {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Criminal Profile</DialogTitle>
            <DialogDescription>
              Enter the details of the wanted criminal to add to the database.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="md:col-span-2 flex flex-col items-center">
              <div className="w-32 h-32 bg-gray-100 rounded-full mb-2 overflow-hidden flex items-center justify-center">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="photo-upload" className="cursor-pointer text-sm px-3 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center">
                  <Upload className="w-4 h-4 mr-1" />
                  Upload Photo
                </Label>
                <input 
                  id="photo-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handlePhotoUpload}
                />
                {photoPreview && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(null);
                      
                      // Clear the file input
                      const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
                      if (fileInput) {
                        fileInput.value = '';
                      }
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="full_name">Full Name <span className="text-red-500">*</span></Label>
              <Input 
                id="full_name" 
                name="full_name" 
                value={formData.full_name} 
                onChange={handleInputChange} 
                required
              />
            </div>
            
            <div>
              <Label htmlFor="case_number">Case Number <span className="text-red-500">*</span></Label>
              <Input 
                id="case_number" 
                name="case_number" 
                value={formData.case_number} 
                onChange={handleInputChange} 
                required
              />
            </div>
            
            <div>
              <Label htmlFor="age">Age (Years)</Label>
              <Input 
                id="age" 
                name="age" 
                type="number" 
                value={formData.age} 
                onChange={handleInputChange} 
              />
            </div>
            
            <div>
              <Label htmlFor="height">Height (cm)</Label>
              <Input 
                id="height" 
                name="height" 
                type="number" 
                step="0.1" 
                value={formData.height} 
                onChange={handleInputChange} 
              />
            </div>
            
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input 
                id="weight" 
                name="weight" 
                type="number" 
                step="0.1" 
                value={formData.weight} 
                onChange={handleInputChange} 
              />
            </div>
            
            <div>
              <Label htmlFor="risk_level">Risk Level</Label>
              <Select 
                value={formData.risk_level} 
                onValueChange={(value) => handleSelectChange('risk_level', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="last_known_location">Last Known Location</Label>
              <Input 
                id="last_known_location" 
                name="last_known_location" 
                value={formData.last_known_location} 
                onChange={handleInputChange} 
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="charges">Charges</Label>
              <Textarea 
                id="charges" 
                name="charges" 
                value={formData.charges} 
                onChange={handleInputChange}
                rows={2}
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="additional_information">Additional Information</Label>
              <Textarea 
                id="additional_information" 
                name="additional_information" 
                value={formData.additional_information} 
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.full_name || !formData.case_number || isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Criminal Profile'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OfficerCriminalPanel;
