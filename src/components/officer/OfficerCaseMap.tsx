
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StaticMap from '@/components/maps/StaticMap';

const OfficerCaseMap = () => {
  const navigate = useNavigate();
  
  const handleMapClick = () => {
    navigate('/case-density-map');
  };
  
  return (
    <div className="h-full">
      <StaticMap 
        altText="Case Distribution Map" 
        redirectPath="/case-density-map"
        buttonText="View Interactive Case Map"
        description="Click to see detailed case analytics"
      />
    </div>
  );
};

export default OfficerCaseMap;
