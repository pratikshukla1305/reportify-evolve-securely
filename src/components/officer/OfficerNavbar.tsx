
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useOfficerAuth } from '@/contexts/OfficerAuthContext';
import {
  Shield,
  LogOut,
  Settings,
  User,
  ChevronDown,
  FileText
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import NotificationBell from '@/components/officer/NotificationBell';

const OfficerNavbar = () => {
  const { officer, isAuthenticated, signOut } = useOfficerAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate('/officer-login');
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return 'O';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-80 backdrop-blur-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/officer-dashboard" className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">SHIELD</span>
              <span className="ml-2 text-sm font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Officer</span>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link to="/officer-dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">Dashboard</Link>
            <Link to="/officer-dashboard?tab=alerts" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">Alerts</Link>
            <Link to="/officer-dashboard?tab=reports" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium flex items-center">
              <FileText className="mr-1 h-4 w-4" />
              Reports
            </Link>
            <Link to="/officer-dashboard?tab=kyc" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">KYC</Link>
            <Link to="/officer-dashboard?tab=criminals" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">Criminals</Link>
            <Link to="/officer-dashboard?tab=map" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">Map</Link>
          </div>

          <div className="hidden md:flex items-center">
            <NotificationBell />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarFallback className="bg-blue-600 text-white">
                      {getInitials(officer?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium mr-1">
                    {officer?.full_name?.split(' ')[0] || 'Officer'}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Officer Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/officer-profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/officer-settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              <svg 
                className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg 
                className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden bg-white border-t border-gray-200`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link 
            to="/officer-dashboard" 
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>
          <Link 
            to="/officer-dashboard?tab=alerts" 
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            onClick={() => setIsOpen(false)}
          >
            Alerts
          </Link>
          <Link 
            to="/officer-dashboard?tab=reports" 
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 flex items-center"
            onClick={() => setIsOpen(false)}
          >
            <FileText className="mr-2 h-4 w-4" />
            Reports
          </Link>
          <Link 
            to="/officer-dashboard?tab=kyc" 
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            onClick={() => setIsOpen(false)}
          >
            KYC
          </Link>
          <Link 
            to="/officer-dashboard?tab=criminals" 
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            onClick={() => setIsOpen(false)}
          >
            Criminals
          </Link>
          <Link 
            to="/officer-dashboard?tab=map" 
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            onClick={() => setIsOpen(false)}
          >
            Map
          </Link>
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="flex items-center px-5">
            <div className="flex-shrink-0">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-600 text-white">
                  {getInitials(officer?.full_name)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="ml-3">
              <div className="text-base font-medium text-gray-800">{officer?.full_name || 'Officer'}</div>
              <div className="text-sm font-medium text-gray-500">{officer?.department_email || ''}</div>
            </div>
            <div className="ml-auto">
              <NotificationBell />
            </div>
          </div>
          <div className="mt-3 px-2 space-y-1">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/officer-profile');
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Your Profile
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/officer-settings');
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Settings
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default OfficerNavbar;
