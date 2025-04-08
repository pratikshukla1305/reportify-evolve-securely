
import React from 'react';
import { MapPin } from 'lucide-react';
import StaticMap from '@/components/maps/StaticMap';

const OfficerCaseMap = () => {
  // Generate Google Maps URL for Chennai
  const googleMapsUrl = "https://www.google.com/maps/search/Chennai+crime+hotspots";
  
  return (
    <div className="h-full">
      <StaticMap 
        altText="Case Distribution Map" 
        redirectPath={googleMapsUrl}
        buttonText="View Crime Hotspots Map"
        description="Click to see detailed crime locations in Google Maps"
      />
    </div>
  );
};

export default OfficerCaseMap;
