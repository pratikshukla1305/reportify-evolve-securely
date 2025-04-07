
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OfficerCaseMap = () => {
  const navigate = useNavigate();
  
  const handleMapClick = () => {
    navigate('/case-density-map');
  };
  
  return (
    <div className="relative h-full cursor-pointer" onClick={handleMapClick}>
      <img 
        src="/lovable-uploads/3f2bac0b-2cf4-41fa-83d0-9da0d44ca7c5.png" 
        alt="Case Distribution Map" 
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex flex-col items-center justify-end p-6">
        <MapPin className="h-10 w-10 text-white mb-2" />
        <Button className="bg-shield-blue hover:bg-blue-700">
          View Interactive Case Map
        </Button>
        <p className="text-white text-sm mt-2">Click to see detailed case analytics</p>
      </div>
    </div>
  );
};

export default OfficerCaseMap;
