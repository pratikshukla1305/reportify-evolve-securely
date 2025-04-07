
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Features from './pages/Features';
import GetStarted from './pages/GetStarted';
import HowItWorks from './pages/HowItWorks';
import AboutUs from './pages/AboutUs';
import NotFound from './pages/NotFound';
import RequestDemo from './pages/RequestDemo';
import LearnMore from './pages/LearnMore';
import SignIn from './pages/SignIn';
import Profile from './pages/Profile';
import { AuthProvider } from './contexts/AuthContext';
import { OfficerAuthProvider } from './contexts/OfficerAuthContext';
import { Toaster } from './components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';
import PoliceStationsMap from './pages/PoliceStationsMap';
import PoliceStationDetail from './pages/PoliceStationDetail';
import AdvisoryPage from './pages/AdvisoryPage';
import OfficerDashboard from './pages/OfficerDashboard';
import OfficerLogin from './pages/OfficerLogin';
import OfficerProfile from './pages/OfficerProfile';
import OfficerSettings from './pages/OfficerSettings';
import OfficerRegistration from './pages/OfficerRegistration';
import ProtectedOfficerRoute from './components/officer/ProtectedOfficerRoute';
import EKycPage from './pages/EKycPage';
import ConnectWallet from './pages/ConnectWallet';
import MyReports from './pages/MyReports';
import GenerateDetailedReport from './pages/GenerateDetailedReport';
import ViewDraftReport from './pages/ViewDraftReport';
import ContinueReport from './pages/ContinueReport';
import CancelReport from './pages/CancelReport';
import LearnAboutRewards from './pages/LearnAboutRewards';
import ViewAllRewards from './pages/ViewAllRewards';
import HelpUsPage from './pages/HelpUsPage';
import SubmitTipPage from './pages/SubmitTipPage';
import CaseHeatmap from './pages/CaseHeatmap';
import CaseDensityMap from './pages/CaseDensityMap';

function App() {
  return (
    <Router>
      <AuthProvider>
        <OfficerAuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/features" element={<Features />} />
            <Route path="/get-started" element={<GetStarted />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/request-demo" element={<RequestDemo />} />
            <Route path="/learn-more" element={<LearnMore />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/police-stations" element={<PoliceStationsMap />} />
            <Route path="/police-stations/:id" element={<PoliceStationDetail />} />
            <Route path="/advisories" element={<AdvisoryPage />} />
            <Route path="/officer-login" element={<OfficerLogin />} />
            <Route path="/officer-registration" element={<OfficerRegistration />} />
            <Route path="/connect-wallet" element={<ConnectWallet />} />
            <Route path="/e-kyc" element={<EKycPage />} />
            <Route path="/case-heatmap" element={<CaseHeatmap />} />
            <Route path="/case-density-map" element={<CaseDensityMap />} />
            <Route path="/help-us" element={<HelpUsPage />} />
            <Route path="/submit-tip" element={<SubmitTipPage />} />

            {/* User Protected Routes */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/my-reports" element={<MyReports />} />
            <Route path="/generate-detailed-report" element={<GenerateDetailedReport />} />
            <Route path="/view-draft-report" element={<ViewDraftReport />} />
            <Route path="/continue-report" element={<ContinueReport />} />
            <Route path="/cancel-report" element={<CancelReport />} />
            <Route path="/learn-about-rewards" element={<LearnAboutRewards />} />
            <Route path="/view-all-rewards" element={<ViewAllRewards />} />

            {/* Officer Protected Routes */}
            <Route path="/officer-dashboard" element={<ProtectedOfficerRoute><OfficerDashboard /></ProtectedOfficerRoute>} />
            <Route path="/officer-profile" element={<ProtectedOfficerRoute><OfficerProfile /></ProtectedOfficerRoute>} />
            <Route path="/officer-settings" element={<ProtectedOfficerRoute><OfficerSettings /></ProtectedOfficerRoute>} />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          <SonnerToaster position="top-right" />
        </OfficerAuthProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
