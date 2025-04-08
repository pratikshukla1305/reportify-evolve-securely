
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SOSAlert } from '@/types/officer';
import { AlertTriangle, MapPin, Clock, PhoneCall, MessageSquare } from 'lucide-react';
import VoiceRecordingPlayer from './VoiceRecordingPlayer';
import AlertStatusButtons from './AlertStatusButtons';

interface AlertCardProps {
  alert: SOSAlert;
  onStatusUpdate: (alertId: string, status: string) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onStatusUpdate }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getUrgencyBadge = (level: string | undefined) => {
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

  const getStatusBadge = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
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
  
  return (
    <div className="border rounded-lg p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <h3 className="font-medium text-lg">{alert.reported_by}</h3>
          {alert.urgency_level && getUrgencyBadge(alert.urgency_level)}
          {alert.status && getStatusBadge(alert.status)}
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
          <VoiceRecordingPlayer recordingUrl={alert.voice_recording} />
        )}
      </div>
      
      <AlertStatusButtons 
        status={alert.status} 
        contactInfo={alert.contact_info}
        onUpdateStatus={(status) => onStatusUpdate(alert.alert_id, status)} 
      />
    </div>
  );
};

export default AlertCard;
