
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
import { getSosAlerts, getKycVerifications } from '@/services/officerServices';
import { toast } from 'sonner';

const OfficerDashboard = () => {
  const { officer, isAuthenticated } = useOfficerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('alerts');
  const [alertsCount, setAlertsCount] = useState({ total: 0, highPriority: 0 });
  const [kycCount, setKycCount] = useState({ total: 0, lastUpdated: '' });
  const [reportsCount, setReportsCount] = useState({ total: 0, todaySubmissions: 0 });
  const [isLoading, setIsLoading] = useState(true);

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
        setIsLoading(true);
        
        // Fetch SOS alerts count
        const alertsData = await getSosAlerts();
        const highPriorityAlerts = alertsData.filter(alert => 
          alert.urgency_level?.toLowerCase() === 'high' && 
          alert.status?.toLowerCase() !== 'resolved').length;
        setAlertsCount({
          total: alertsData.filter(alert => alert.status?.toLowerCase() !== 'resolved').length,
          highPriority: highPriorityAlerts
        });

        // Fetch KYC verifications count
        const kycData = await getKycVerifications();
        const pendingKyc = kycData.filter(kyc => 
          kyc.status?.toLowerCase() === 'pending').length;
        
        // Calculate last updated time
        let lastUpdated = 'N/A';
        if (kycData.length > 0) {
          const mostRecent = new Date(Math.max(...kycData.map(k => new Date(k.submission_date).getTime())));
          const now = new Date();
          const diffMs = now.getTime() - mostRecent.getTime();
          const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
          
          if (diffHrs < 1) {
            lastUpdated = 'Just now';
          } else if (diffHrs === 1) {
            lastUpdated = '1 hour ago';
          } else if (diffHrs < 24) {
            lastUpdated = `${diffHrs} hours ago`;
          } else {
            const diffDays = Math.floor(diffHrs / 24);
            lastUpdated = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
          }
        }
        
        setKycCount({
          total: pendingKyc,
          lastUpdated
        });

        // Fetch reports count
        const reportsData = await getOfficerReports();
        
        // Calculate today's submissions
        const today = new Date().toISOString().split('T')[0];
        const todaySubmissions = reportsData.filter(report => {
          const reportDate = new Date(report.report_date).toISOString().split('T')[0];
          return reportDate === today && report.status?.toLowerCase() === 'submitted';
        }).length;

        // Only count non-completed reports for the total
        const activeReports = reportsData.filter(report => 
          report.status?.toLowerCase() !== 'completed').length;

        setReportsCount({
          total: activeReports,
          todaySubmissions
        });
      } catch (error) {
        console.error("Error fetching counts:", error);
        toast("Error fetching dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
    
    // Set up an interval to refresh counts every 3 minutes
    const intervalId = setInterval(fetchCounts, 3 * 60 * 1000);
    
    // Clean up the interval
    return () => clearInterval(intervalId);
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
              {isLoading ? (
                <div className="animate-pulse h-8 bg-gray-200 rounded"></div>
              ) : (
                <>
                  <p className="text-2xl font-bold">{alertsCount.total}</p>
                  <p className="text-sm text-red-500">
                    {alertsCount.highPriority > 0 ? `${alertsCount.highPriority} high priority` : 'No high priority alerts'}
                  </p>
                </>
              )}
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
              {isLoading ? (
                <div className="animate-pulse h-8 bg-gray-200 rounded"></div>
              ) : (
                <>
                  <p className="text-2xl font-bold">{kycCount.total}</p>
                  <p className="text-sm text-gray-500">Last updated {kycCount.lastUpdated}</p>
                </>
              )}
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
              {isLoading ? (
                <div className="animate-pulse h-8 bg-gray-200 rounded"></div>
              ) : (
                <>
                  <p className="text-2xl font-bold">{reportsCount.total}</p>
                  <p className="text-sm text-gray-500">
                    {reportsCount.todaySubmissions > 0 ? `${reportsCount.todaySubmissions} submitted today` : 'No submissions today'}
                  </p>
                </>
              )}
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
