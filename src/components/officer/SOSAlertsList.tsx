
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { PhoneCall, MapPin, Clock, AlertTriangle, Volume2, MessageSquare, Play, Pause } from 'lucide-react';
import { getSosAlerts, updateSosAlertStatus } from '@/services/officerServices';
import { SOSAlert } from '@/types/officer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

interface SOSAlertsListProps {
  limit?: number;
}

const SOSAlertsList: React.FC<SOSAlertsListProps> = ({ limit }) => {
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<{[key: string]: HTMLAudioElement}>({});
  const { toast } = useToast();

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const data = await getSosAlerts();
      const limitedData = limit ? data.slice(0, limit) : data;
      setAlerts(limitedData);
    } catch (error: any) {
      toast({
        title: "Error fetching alerts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    
    // Pre-create audio elements for each alert when component mounts
    return () => {
      // Cleanup audio elements when component unmounts
      Object.values(audioElements).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    };
  }, [limit]);

  const handleStatusUpdate = async (alertId: string, status: string) => {
    try {
      await updateSosAlertStatus(alertId, status);
      fetchAlerts();
      toast({
        title: "Status updated",
        description: `Alert status updated to ${status}`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getUrgencyBadge = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="border-orange-500 text-orange-600">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="border-green-500 text-green-600">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return <Badge className="bg-blue-500">New</Badge>;
      case 'in progress':
        return <Badge className="bg-yellow-500">In Progress</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500">Resolved</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handlePlayPause = (alertId: string, recordingUrl: string) => {
    // Check if audio element already exists for this alert
    if (!audioElements[alertId]) {
      // Create a new audio element if it doesn't exist
      const audioElement = new Audio(recordingUrl);
      
      audioElement.addEventListener('ended', () => {
        setPlayingAudioId(null);
      });
      
      audioElement.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        toast({
          title: "Audio Error",
          description: "Could not play the voice recording. Please check the URL.",
          variant: "destructive",
        });
        setPlayingAudioId(null);
      });
      
      setAudioElements(prev => ({
        ...prev,
        [alertId]: audioElement
      }));
    }
    
    if (playingAudioId === alertId) {
      // Currently playing this audio, pause it
      audioElements[alertId]?.pause();
      setPlayingAudioId(null);
    } else {
      // Pause any currently playing audio
      if (playingAudioId && audioElements[playingAudioId]) {
        audioElements[playingAudioId]?.pause();
      }
      
      // Load and play the new audio
      if (audioElements[alertId]) {
        // Make sure the src is set correctly
        audioElements[alertId].src = recordingUrl;
        
        const playPromise = audioElements[alertId].play();
        
        // Modern browsers return a promise from play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setPlayingAudioId(alertId);
            })
            .catch(err => {
              console.error("Error playing audio:", err);
              toast({
                title: "Audio Error",
                description: "Could not play the voice recording. Please try again.",
                variant: "destructive",
              });
            });
        } else {
          setPlayingAudioId(alertId);
        }
      }
    }
  };

  // Insert voice recording into the database to ensure it's properly linked
  const ensureVoiceRecordingExists = async (alertId: string, recordingUrl: string) => {
    try {
      // Check if recording already exists
      const { data } = await supabase
        .from('voice_recordings')
        .select('*')
        .eq('alert_id', alertId)
        .single();
      
      // If not, insert it
      if (!data) {
        await supabase
          .from('voice_recordings')
          .insert([{ alert_id: alertId, recording_url: recordingUrl }]);
      }
      
      return true;
    } catch (error) {
      console.error('Error ensuring voice recording exists:', error);
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-shield-blue"></div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No SOS alerts found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div key={alert.alert_id} className="border rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
            <div className="flex items-center space-x-2 mb-2 sm:mb-0">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h3 className="font-medium text-lg">{alert.reported_by}</h3>
              {getUrgencyBadge(alert.urgency_level)}
              {getStatusBadge(alert.status)}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>{formatDate(alert.reported_time)}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div className="flex items-start space-x-2">
              <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <div className="font-medium">Location</div>
                <div className="text-gray-700">{alert.location}</div>
                {alert.latitude && alert.longitude && (
                  <div className="text-xs text-gray-500">
                    {alert.latitude.toFixed(6)}, {alert.longitude.toFixed(6)}
                  </div>
                )}
              </div>
            </div>
            
            {alert.contact_info && (
              <div className="flex items-start space-x-2">
                <PhoneCall className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <div className="font-medium">Contact</div>
                  <div className="text-gray-700">{alert.contact_info}</div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {alert.message && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
                    onClick={() => setSelectedMessage(alert.message)}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    View Message
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>SOS Message</DialogTitle>
                  </DialogHeader>
                  <div className="p-4 bg-gray-50 rounded-md max-h-96 overflow-y-auto">
                    <p className="whitespace-pre-wrap">{alert.message}</p>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            
            {alert.voice_recording && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-purple-500 text-purple-600 hover:bg-purple-50"
                    onClick={() => {
                      ensureVoiceRecordingExists(alert.alert_id, alert.voice_recording!);
                    }}
                  >
                    {playingAudioId === alert.alert_id ? (
                      <>
                        <Pause className="h-4 w-4 mr-1" />
                        Pause Recording
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-1" />
                        Play Recording
                      </>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Voice Recording</DialogTitle>
                  </DialogHeader>
                  <div className="p-4 bg-gray-50 rounded-md text-center">
                    <div className="mb-4">
                      <Button 
                        size="sm"
                        onClick={() => handlePlayPause(alert.alert_id, alert.voice_recording!)}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        {playingAudioId === alert.alert_id ? (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Play
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Click to play or pause the voice recording
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {alert.status !== "In Progress" && (
              <Button 
                size="sm" 
                variant="outline" 
                className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                onClick={() => handleStatusUpdate(alert.alert_id, "In Progress")}
              >
                Mark In Progress
              </Button>
            )}
            
            {alert.status !== "Resolved" && (
              <Button 
                size="sm" 
                variant="outline" 
                className="border-green-500 text-green-600 hover:bg-green-50"
                onClick={() => handleStatusUpdate(alert.alert_id, "Resolved")}
              >
                Mark Resolved
              </Button>
            )}
            
            <Button 
              size="sm"
              variant="outline" 
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
              disabled={!alert.contact_info}
            >
              {alert.contact_info ? "Call Citizen" : "No Contact Info"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SOSAlertsList;
