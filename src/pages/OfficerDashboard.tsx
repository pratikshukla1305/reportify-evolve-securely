
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOfficerAuth } from '@/contexts/OfficerAuthContext';
import OfficerNavbar from '@/components/officer/OfficerNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, UserCheck, FileWarning, Bell, AlertTriangle, Users, Map } from 'lucide-react';
import SOSAlertsList from '@/components/officer/SOSAlertsList';
import KycVerificationList from '@/components/officer/KycVerificationList';
import OfficerCriminalPanel from '@/components/officer/OfficerCriminalPanel';
import OfficerCaseMap from '@/components/officer/OfficerCaseMap';
import ReportsList from '@/components/officer/ReportsList';
import { getOfficerReports } from '@/services/reportServices';
import { getSosAlerts } from '@/services/officerServices';
import { getKycVerifications } from '@/services/officerServices';

const OfficerDashboard = () => {
  const { officer, isAuthenticated } = useOfficerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('alerts');
  const [alertsCount, setAlertsCount] = useState({ total: 0, highPriority: 0 });
  const [kycCount, setKycCount] = useState({ total: 0, lastUpdated: '' });
  const [reportsCount, setReportsCount] = useState({ total: 0, todaySubmissions: 0 });

  // Get the tab parameter from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/officer-login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch counts for dashboard cards
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Fetch SOS alerts count
        const alertsData = await getSosAlerts();
        const highPriorityAlerts = alertsData.filter(alert => 
          alert.urgency_level?.toLowerCase() === 'high').length;
        setAlertsCount({
          total: alertsData.length,
          highPriority: highPriorityAlerts
        });

        // Fetch KYC verifications count
        const kycData = await getKycVerifications();
        setKycCount({
          total: kycData.length,
          lastUpdated: kycData.length > 0 ? '1h ago' : 'N/A'
        });

        // Fetch reports count
        const reportsData = await getOfficerReports();
        
        // Calculate today's submissions
        const today = new Date().toISOString().split('T')[0];
        const todaySubmissions = reportsData.filter(report => {
          const reportDate = new Date(report.report_date).toISOString().split('T')[0];
          return reportDate === today;
        }).length;

        setReportsCount({
          total: reportsData.length,
          todaySubmissions
        });
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };

    fetchCounts();
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL without reloading page
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('tab', value);
    navigate({
      pathname: location.pathname,
      search: searchParams.toString()
    }, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <OfficerNavbar />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Officer Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, Officer {officer?.full_name || ''}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                Alerts
              </CardTitle>
              <CardDescription>
                Handle emergency SOS alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{alertsCount.total}</p>
              <p className="text-sm text-red-500">
                {alertsCount.highPriority > 0 ? `${alertsCount.highPriority} high priority` : 'No high priority alerts'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <UserCheck className="mr-2 h-5 w-5 text-blue-500" />
                KYC Verifications
              </CardTitle>
              <CardDescription>
                Pending verifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{kycCount.total}</p>
              <p className="text-sm text-gray-500">Last updated {kycCount.lastUpdated}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <FileWarning className="mr-2 h-5 w-5 text-yellow-500" />
                Reports
              </CardTitle>
              <CardDescription>
                Citizen-submitted reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{reportsCount.total}</p>
              <p className="text-sm text-gray-500">
                {reportsCount.todaySubmissions > 0 ? `${reportsCount.todaySubmissions} submitted today` : 'No submissions today'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-8">
          <TabsList className="w-full max-w-md grid grid-cols-5">
            <TabsTrigger value="alerts">SOS Alerts</TabsTrigger>
            <TabsTrigger value="kyc">KYC</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="criminals">Criminals</TabsTrigger>
            <TabsTrigger value="map">Map</TabsTrigger>
          </TabsList>
          
          <div className="pt-4">
            <TabsContent value="alerts">
              <Card>
                <CardHeader>
                  <CardTitle>Recent SOS Alerts</CardTitle>
                  <CardDescription>
                    Manage and respond to emergency alerts from citizens
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SOSAlertsList limit={5} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="kyc">
              <Card>
                <CardHeader>
                  <CardTitle>KYC Verifications</CardTitle>
                  <CardDescription>
                    Review and approve user identity verification requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <KycVerificationList limit={5} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Citizen Reports</CardTitle>
                  <CardDescription>
                    Review and process reports submitted by citizens
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ReportsList limit={5} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="criminals">
              <Card>
                <CardHeader>
                  <CardTitle>Criminal Profiles</CardTitle>
                  <CardDescription>
                    Manage wanted criminal profiles and tips
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <OfficerCriminalPanel />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="map">
              <Card>
                <CardHeader>
                  <CardTitle>Crime Map</CardTitle>
                  <CardDescription>
                    View geographical distribution of crime reports
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[500px]">
                    <OfficerCaseMap />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

      </div>
    </div>
  );
};

export default OfficerDashboard;
