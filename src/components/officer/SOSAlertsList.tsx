
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getSosAlerts, updateSosAlertStatus } from '@/services/officerServices';
import { SOSAlert } from '@/types/officer';
import AlertCard from './AlertCard';

interface SOSAlertsListProps {
  limit?: number;
}

const SOSAlertsList: React.FC<SOSAlertsListProps> = ({ limit }) => {
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const data = await getSosAlerts();
      console.log("Fetched SOS alerts:", data);
      const limitedData = limit ? data.slice(0, limit) : data;
      setAlerts(limitedData);
    } catch (error: any) {
      console.error("Error fetching SOS alerts:", error);
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
  }, [limit]);

  const handleStatusUpdate = async (alertId: string, status: string) => {
    try {
      await updateSosAlertStatus(alertId, status);
      toast({
        title: "Status updated",
        description: `Alert status updated to ${status}`,
      });
      fetchAlerts(); // Refresh the alerts after updating
    } catch (error: any) {
      console.error("Error updating SOS alert status:", error);
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
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
        <AlertCard 
          key={alert.alert_id} 
          alert={alert} 
          onStatusUpdate={handleStatusUpdate} 
        />
      ))}
    </div>
  );
};

export default SOSAlertsList;
