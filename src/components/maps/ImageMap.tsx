
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

const ImageMap = () => {
  const navigate = useNavigate();
  
  const handleMapClick = () => {
    navigate('/police-stations');
  };
  
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleMapClick}>
      <CardContent className="p-0 relative">
        <div className="aspect-video bg-gray-200 flex items-center justify-center">
          <img 
            src="/police-map.jpg" 
            alt="Police Stations Map" 
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
              target.style.padding = '2rem';
            }}
          />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
          <MapPin className="h-12 w-12 text-white mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">Find Police Stations</h3>
          <Button className="bg-shield-blue hover:bg-blue-700">
            View on Map
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageMap;
