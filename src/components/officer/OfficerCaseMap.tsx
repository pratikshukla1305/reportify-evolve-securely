
import React, { useState, useEffect } from 'react';
import { MapPin, Plus, PlusCircle } from 'lucide-react';
import StaticMap from '@/components/maps/StaticMap';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { caseDensityData } from '@/data/caseDensityData'; 
import { createCase, getCases } from '@/services/officerServices';
import { CaseData } from '@/types/officer';

const OfficerCaseMap = () => {
  // Generate Google Maps URL for Chennai
  const googleMapsUrl = "https://www.google.com/maps/search/Chennai+crime+hotspots";
  const [cases, setCases] = useState<CaseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCaseData, setNewCaseData] = useState({
    case_number: '',
    region: '',
    address: '',
    latitude: '',
    longitude: '',
    case_type: '',
    description: '',
    case_date: '',
    case_time: '',
    status: 'Open'
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const loadCases = async () => {
      try {
        setIsLoading(true);
        const data = await getCases();
        setCases(data);
      } catch (error) {
        console.error("Error fetching cases:", error);
        toast.error("Failed to load case data");
      } finally {
        setIsLoading(false);
      }
    };

    loadCases();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCaseData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewCaseData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!newCaseData.case_number || !newCaseData.address || !newCaseData.case_type || !newCaseData.case_date) {
      toast.error("Please fill all required fields");
      return;
    }
    
    try {
      // Parse latitude and longitude if provided
      const formattedData = {
        ...newCaseData,
        latitude: newCaseData.latitude ? parseFloat(newCaseData.latitude) : null,
        longitude: newCaseData.longitude ? parseFloat(newCaseData.longitude) : null
      };
      
      await createCase(formattedData);
      
      toast.success("Case added successfully");
      setDialogOpen(false);
      
      // Refresh cases
      const updatedCases = await getCases();
      setCases(updatedCases);
      
      // Reset form
      setNewCaseData({
        case_number: '',
        region: '',
        address: '',
        latitude: '',
        longitude: '',
        case_type: '',
        description: '',
        case_date: '',
        case_time: '',
        status: 'Open'
      });
    } catch (error) {
      console.error("Error creating case:", error);
      toast.error("Failed to add case");
    }
  };

  const generateMapUrl = () => {
    let baseUrl = "https://www.google.com/maps/search/?api=1&query=";
    
    // If we have cases with coordinates, add them to the map
    if (cases.length > 0) {
      const locationsParam = cases
        .filter(c => c.latitude && c.longitude)
        .map(c => {
          const label = encodeURIComponent(`${c.case_type} - ${c.case_number}`);
          return `${c.latitude},${c.longitude}(${label})`;
        })
        .join('|');
      
      if (locationsParam) {
        return `https://www.google.com/maps/dir/?api=1&destination=${locationsParam}&travelmode=driving`;
      }
    }
    
    // Fallback to general search
    return baseUrl + "crime+locations+chennai";
  };
  
  // Determine if we should show the map or loading state
  const mapUrl = generateMapUrl();
  
  return (
    <div className="h-full relative">
      <StaticMap 
        altText="Case Distribution Map" 
        redirectPath={mapUrl}
        buttonText="View Crime Locations Map"
        description="Click to see detailed crime locations in Google Maps"
      />
      
      <div className="absolute bottom-4 right-4">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full h-12 w-12 p-0 bg-blue-500 hover:bg-blue-600">
              <PlusCircle className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Case Location</DialogTitle>
              <DialogDescription>
                Add details about a new crime case to the map.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="case_number">Case Number *</Label>
                  <Input
                    id="case_number"
                    name="case_number"
                    value={newCaseData.case_number}
                    onChange={handleInputChange}
                    placeholder="e.g. CR-2025-001"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="case_type">Case Type *</Label>
                  <Select
                    value={newCaseData.case_type}
                    onValueChange={(value) => handleSelectChange('case_type', value)}
                  >
                    <SelectTrigger id="case_type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="theft">Theft</SelectItem>
                      <SelectItem value="assault">Assault</SelectItem>
                      <SelectItem value="burglary">Burglary</SelectItem>
                      <SelectItem value="vandalism">Vandalism</SelectItem>
                      <SelectItem value="fraud">Fraud</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Input
                    id="region"
                    name="region"
                    value={newCaseData.region}
                    onChange={handleInputChange}
                    placeholder="e.g. Downtown"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newCaseData.status}
                    onValueChange={(value) => handleSelectChange('status', value)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="Investigating">Investigating</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  name="address"
                  value={newCaseData.address}
                  onChange={handleInputChange}
                  placeholder="Full address of the crime scene"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    value={newCaseData.latitude}
                    onChange={handleInputChange}
                    placeholder="e.g. 13.0827"
                    type="number"
                    step="any"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    name="longitude"
                    value={newCaseData.longitude}
                    onChange={handleInputChange}
                    placeholder="e.g. 80.2707"
                    type="number"
                    step="any"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="case_date">Date *</Label>
                  <Input
                    id="case_date"
                    name="case_date"
                    value={newCaseData.case_date}
                    onChange={handleInputChange}
                    type="date"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="case_time">Time</Label>
                  <Input
                    id="case_time"
                    name="case_time"
                    value={newCaseData.case_time}
                    onChange={handleInputChange}
                    type="time"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={newCaseData.description}
                  onChange={handleInputChange}
                  placeholder="Provide details about the case"
                  className="min-h-[100px]"
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Case to Map</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default OfficerCaseMap;
