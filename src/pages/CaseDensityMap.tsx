
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { MapPin, List, ArrowLeft, Loader2 } from 'lucide-react';
import { caseDensityData } from '@/data/caseDensityData';

const CaseDensityMap = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'map' | 'list'>('map');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const filteredCases = filter === 'all' 
    ? caseDensityData 
    : caseDensityData.filter(item => item.type === filter);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow mt-16 md:mt-20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/case-heatmap')} 
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold text-shield-dark">Detailed Case Map</h1>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
            <Select
              value={filter}
              onValueChange={setFilter}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter Cases" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cases</SelectItem>
                <SelectItem value="theft">Theft</SelectItem>
                <SelectItem value="assault">Assault</SelectItem>
                <SelectItem value="cybercrime">Cybercrime</SelectItem>
                <SelectItem value="fraud">Fraud</SelectItem>
              </SelectContent>
            </Select>

            <Tabs value={view} onValueChange={(v) => setView(v as 'map' | 'list')} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="map" className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Map
                </TabsTrigger>
                <TabsTrigger value="list" className="flex items-center">
                  <List className="h-4 w-4 mr-1" />
                  List
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {loading ? (
            <div className="h-[600px] flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="flex flex-col items-center">
                <Loader2 className="h-12 w-12 text-shield-blue animate-spin mb-4" />
                <p className="text-gray-500">Loading case locations...</p>
              </div>
            </div>
          ) : (
            <>
              <TabsContent value="map" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Case Density Map</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="relative h-[600px] bg-gray-100">
                      <img 
                        src="/lovable-uploads/3f2bac0b-2cf4-41fa-83d0-9da0d44ca7c5.png" 
                        alt="Case Density Map" 
                        className="w-full h-full object-cover"
                      />
                      {/* Display pins for each case */}
                      {filteredCases.map((item, index) => (
                        <div 
                          key={index} 
                          className="absolute"
                          style={{ 
                            // Random positions for demonstration - in a real implementation
                            // these would be mapped to actual coordinates
                            left: `${Math.random() * 90}%`, 
                            top: `${Math.random() * 90}%` 
                          }}
                        >
                          <div className="relative group">
                            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                            <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black/75 text-white text-xs rounded px-2 py-1 whitespace-nowrap transition-opacity">
                              {item.region} ({item.count} cases)
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            
              <TabsContent value="list" className="mt-0">
                <div className="bg-white rounded-lg shadow">
                  <div className="p-4 border-b">
                    <h2 className="font-medium">Cases by Region</h2>
                  </div>
                  <div className="divide-y">
                    {filteredCases.map((item) => (
                      <div key={item.id} className="p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">{item.region}</h3>
                            <p className="text-sm text-gray-500">
                              {item.count} {item.count === 1 ? 'case' : 'cases'}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <span className="px-2 py-1 text-xs bg-shield-blue/10 text-shield-blue rounded-full">
                              {item.type || 'Unknown'}
                            </span>
                            <MapPin className="h-4 w-4 text-gray-400 ml-2" />
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredCases.length === 0 && (
                      <div className="p-8 text-center">
                        <p className="text-gray-500">No cases match your filter criteria</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CaseDensityMap;
