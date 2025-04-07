
import React, { useState } from 'react';
import { 
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  Map, 
  Plus, 
  MapPin, 
  Calendar, 
  Clock,
  Edit,
  Trash2,
  Save,
  XCircle,
  Eye
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { caseDensityData, CaseDensityData } from '@/data/caseDensityData';

const OfficerCaseMap = () => {
  const [caseData, setCaseData] = useState<CaseDensityData[]>(caseDensityData);
  const [selectedCase, setSelectedCase] = useState<CaseDensityData | null>(null);
  const [addEditOpen, setAddEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [filterRegion, setFilterRegion] = useState('all');
  
  // Form state for adding/editing cases
  const [formData, setFormData] = useState({
    id: '',
    region: '',
    location: { lat: 0, lng: 0, address: '' },
    description: '',
    date: '',
    time: '',
    caseType: 'theft',
    caseNumber: '',
    status: 'open',
    reporterId: ''
  });
  
  // Get unique regions for filtering
  const regions = ['all', ...new Set(caseData.map(c => c.region))];
  
  const getFilteredCases = () => {
    if (filterRegion === 'all') return caseData;
    return caseData.filter(c => c.region === filterRegion);
  };
  
  const handleViewCase = (caseItem: CaseDensityData) => {
    setSelectedCase(caseItem);
  };
  
  const handleAddCase = () => {
    // Reset form
    setFormData({
      id: '',
      region: '',
      location: { lat: 0, lng: 0, address: '' },
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      caseType: 'theft',
      caseNumber: `CASE-${Date.now().toString().slice(-6)}`,
      status: 'open',
      reporterId: ''
    });
    setIsEditing(false);
    setAddEditOpen(true);
  };
  
  const handleEditCase = (caseItem: CaseDensityData) => {
    // Format date and time from timestamp if available
    let dateStr = '';
    let timeStr = '';
    
    if (caseItem.timestamp) {
      const date = new Date(caseItem.timestamp);
      dateStr = date.toISOString().split('T')[0];
      timeStr = date.toTimeString().slice(0, 5);
    }
    
    setFormData({
      id: caseItem.id,
      region: caseItem.region,
      location: {
        lat: caseItem.location.lat,
        lng: caseItem.location.lng,
        address: caseItem.location.address || ''
      },
      description: caseItem.description || '',
      date: dateStr,
      time: timeStr,
      caseType: caseItem.caseType || 'theft',
      caseNumber: caseItem.caseNumber || `CASE-${Date.now().toString().slice(-6)}`,
      status: caseItem.status || 'open',
      reporterId: caseItem.reporterId || ''
    });
    setIsEditing(true);
    setAddEditOpen(true);
  };
  
  const handleDeleteClick = (caseItem: CaseDensityData) => {
    setSelectedCase(caseItem);
    setDeleteConfirmOpen(true);
  };
  
  const handleDeleteConfirm = () => {
    if (selectedCase) {
      // Filter out the case to delete
      const updatedCases = caseData.filter(c => c.id !== selectedCase.id);
      setCaseData(updatedCases);
      
      toast({
        title: "Case deleted",
        description: `Case #${selectedCase.caseNumber || selectedCase.id} has been deleted.`,
      });
      
      setDeleteConfirmOpen(false);
      setSelectedCase(null);
    }
  };
  
  const handleSaveCase = () => {
    // Validate form
    if (!formData.region || !formData.description || !formData.date) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    // Create timestamp from date and time
    const timestamp = new Date(`${formData.date}T${formData.time || '00:00'}`).toISOString();
    
    if (isEditing) {
      // Update existing case
      const updatedCases = caseData.map(c => 
        c.id === formData.id ? { 
          ...c,
          region: formData.region,
          location: formData.location,
          description: formData.description,
          caseType: formData.caseType,
          caseNumber: formData.caseNumber,
          status: formData.status,
          reporterId: formData.reporterId,
          timestamp
        } : c
      );
      setCaseData(updatedCases);
      
      toast({
        title: "Case updated",
        description: `Case #${formData.caseNumber} has been updated.`,
      });
    } else {
      // Add new case
      const newCase: CaseDensityData = {
        id: `case-${Date.now()}`,
        region: formData.region,
        location: formData.location,
        description: formData.description,
        caseType: formData.caseType,
        caseNumber: formData.caseNumber,
        status: formData.status,
        reporterId: formData.reporterId,
        timestamp,
        count: 1 // For case density visualization
      };
      
      setCaseData([...caseData, newCase]);
      
      toast({
        title: "Case created",
        description: `New case #${formData.caseNumber} has been created.`,
      });
    }
    
    setAddEditOpen(false);
  };
  
  const getCaseTypeDisplay = (type: string | undefined) => {
    if (!type) return 'Unknown';
    
    const typeMap: {[key: string]: string} = {
      'theft': 'Theft',
      'assault': 'Assault',
      'burglary': 'Burglary',
      'vandalism': 'Vandalism',
      'fraud': 'Fraud',
      'other': 'Other'
    };
    
    return typeMap[type] || type;
  };
  
  const getCaseStatusDisplay = (status: string | undefined) => {
    if (!status) return 'Unknown';
    
    const statusMap: {[key: string]: string} = {
      'open': 'Open',
      'investigating': 'Investigating',
      'closed': 'Closed',
      'resolved': 'Resolved'
    };
    
    return statusMap[status] || status;
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Select value={filterRegion} onValueChange={setFilterRegion}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by region" />
            </SelectTrigger>
            <SelectContent>
              {regions.map(region => (
                <SelectItem key={region} value={region}>
                  {region === 'all' ? 'All Regions' : region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button 
          onClick={handleAddCase}
          className="bg-blue-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Register New Case
        </Button>
      </div>
      
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Case Density Map</CardTitle>
          </CardHeader>
          <CardContent className="p-0 aspect-[16/9] min-h-[400px] relative bg-gray-100 rounded-md">
            <div className="absolute inset-0 flex items-center justify-center">
              <Map className="h-16 w-16 text-gray-300" />
              <div className="absolute text-gray-500">Interactive map visualization would go here</div>
            </div>
            
            {/* This is a placeholder for the actual map component */}
            {/* In a real implementation, you would integrate a mapping library like Leaflet or Google Maps */}
            {/* and plot the case data points on the map */}
          </CardContent>
        </Card>
      </div>
      
      <h3 className="text-lg font-medium mb-4">Case Registry</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {getFilteredCases().map(caseItem => (
          <Card key={caseItem.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <FileText className="h-4 w-4 mr-2 text-blue-500" />
                {caseItem.caseNumber || `Case #${caseItem.id.split('-')[1]}`}
              </CardTitle>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                <span>{caseItem.region}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {caseItem.description && (
                  <p className="text-sm line-clamp-2">{caseItem.description}</p>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>
                      {caseItem.timestamp 
                        ? new Date(caseItem.timestamp).toLocaleDateString() 
                        : 'Date not specified'}
                    </span>
                  </div>
                  
                  {caseItem.caseType && (
                    <span>{getCaseTypeDisplay(caseItem.caseType)}</span>
                  )}
                </div>
                
                {caseItem.status && (
                  <div className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full inline-block">
                    Status: {getCaseStatusDisplay(caseItem.status)}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-0 flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => handleViewCase(caseItem)}
              >
                <Eye className="h-3.5 w-3.5 mr-1.5" />
                View
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => handleEditCase(caseItem)}
              >
                <Edit className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleDeleteClick(caseItem)}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
        
        {getFilteredCases().length === 0 && (
          <div className="col-span-3 text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-600">No cases found</h3>
            <p className="text-gray-500 mt-1">
              {filterRegion !== 'all'
                ? `There are no cases registered in the ${filterRegion} region.`
                : "There are no cases registered in the system."
              }
            </p>
            <Button 
              onClick={handleAddCase}
              className="mt-4 bg-blue-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Register New Case
            </Button>
          </div>
        )}
      </div>

      {/* View Case Details Dialog */}
      <Dialog open={!!selectedCase && !deleteConfirmOpen} onOpenChange={(open) => !open && setSelectedCase(null)}>
        {selectedCase && (
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Case Details</DialogTitle>
              <DialogDescription>
                {selectedCase.caseNumber || `Case #${selectedCase.id.split('-')[1]}`}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium">Region</div>
                  <div className="text-sm">{selectedCase.region}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium">Date & Time</div>
                  <div className="text-sm">
                    {selectedCase.timestamp 
                      ? new Date(selectedCase.timestamp).toLocaleString() 
                      : 'Not specified'}
                  </div>
                </div>
                
                {selectedCase.caseType && (
                  <div>
                    <div className="text-sm font-medium">Case Type</div>
                    <div className="text-sm">{getCaseTypeDisplay(selectedCase.caseType)}</div>
                  </div>
                )}
                
                {selectedCase.status && (
                  <div>
                    <div className="text-sm font-medium">Status</div>
                    <div className="text-sm">{getCaseStatusDisplay(selectedCase.status)}</div>
                  </div>
                )}
                
                {selectedCase.reporterId && (
                  <div>
                    <div className="text-sm font-medium">Reporter ID</div>
                    <div className="text-sm">{selectedCase.reporterId}</div>
                  </div>
                )}
              </div>
              
              {selectedCase.description && (
                <div>
                  <div className="text-sm font-medium">Description</div>
                  <div className="p-3 bg-gray-50 rounded-md text-sm">
                    {selectedCase.description}
                  </div>
                </div>
              )}
              
              <div>
                <div className="text-sm font-medium">Location</div>
                <div className="text-sm">
                  {selectedCase.location.address && (
                    <div className="mb-1">{selectedCase.location.address}</div>
                  )}
                  <div>Coordinates: {selectedCase.location.lat.toFixed(6)}, {selectedCase.location.lng.toFixed(6)}</div>
                </div>
                <div className="mt-2 aspect-video bg-gray-100 rounded-md flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-gray-300" />
                  <span className="text-sm text-gray-500 ml-2">Location map would go here</span>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button 
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => setSelectedCase(null)}
              >
                Close
              </Button>
              <Button 
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => handleDeleteClick(selectedCase)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Case
              </Button>
              <Button 
                className="w-full sm:w-auto"
                onClick={() => {
                  setSelectedCase(null);
                  handleEditCase(selectedCase);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Case
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
      
      {/* Add/Edit Case Dialog */}
      <Dialog open={addEditOpen} onOpenChange={setAddEditOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Case' : 'Register New Case'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Update the information for this case' 
                : 'Fill in the details to register a new case'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Case Number</label>
                <Input 
                  value={formData.caseNumber}
                  onChange={(e) => setFormData({...formData, caseNumber: e.target.value})}
                  placeholder="Enter case number"
                  disabled={!isEditing} // Auto-generated for new cases
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Region</label>
                <Input 
                  value={formData.region}
                  onChange={(e) => setFormData({...formData, region: e.target.value})}
                  placeholder="Enter region name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Latitude</label>
                  <Input 
                    type="number"
                    value={formData.location.lat}
                    onChange={(e) => setFormData({
                      ...formData, 
                      location: {
                        ...formData.location,
                        lat: parseFloat(e.target.value)
                      }
                    })}
                    placeholder="Latitude"
                    step="0.000001"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Longitude</label>
                  <Input 
                    type="number"
                    value={formData.location.lng}
                    onChange={(e) => setFormData({
                      ...formData, 
                      location: {
                        ...formData.location,
                        lng: parseFloat(e.target.value)
                      }
                    })}
                    placeholder="Longitude"
                    step="0.000001"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Address</label>
                <Input 
                  value={formData.location.address}
                  onChange={(e) => setFormData({
                    ...formData, 
                    location: {
                      ...formData.location,
                      address: e.target.value
                    }
                  })}
                  placeholder="Enter address"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Case Type</label>
                <Select 
                  value={formData.caseType}
                  onValueChange={(value) => setFormData({...formData, caseType: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select case type" />
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
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input 
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time</label>
                  <Input 
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select 
                  value={formData.status}
                  onValueChange={(value) => setFormData({...formData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select case status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Reporter ID (Optional)</label>
                <Input 
                  value={formData.reporterId}
                  onChange={(e) => setFormData({...formData, reporterId: e.target.value})}
                  placeholder="Enter reporter ID if applicable"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2 mt-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Enter case description"
              rows={4}
            />
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button 
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setAddEditOpen(false)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
              onClick={handleSaveCase}
            >
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Update Case' : 'Register Case'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        {selectedCase && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this case? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            <div className="p-3 bg-red-50 rounded-md border border-red-100 my-2">
              <p className="font-medium text-red-800">
                {selectedCase.caseNumber || `Case #${selectedCase.id.split('-')[1]}`}
              </p>
              <p className="text-sm text-red-600 mt-1">
                {selectedCase.region} - {selectedCase.description?.substring(0, 50) || 'No description'}
                {selectedCase.description && selectedCase.description.length > 50 ? '...' : ''}
              </p>
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button 
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => setDeleteConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
                onClick={handleDeleteConfirm}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Case
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default OfficerCaseMap;
