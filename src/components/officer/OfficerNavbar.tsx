
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOfficerAuth } from '@/contexts/OfficerAuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import NotificationBell from '@/components/officer/NotificationBell';

const OfficerNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { officer, signOut } = useOfficerAuth();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/officer-login');
  };
  
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed w-full z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/officer-dashboard" className="flex items-center">
              <Shield className="h-8 w-8 text-shield-blue" />
              <div className="ml-2">
                <div className="text-xl font-bold text-gray-900">ShieldAI</div>
                <div className="text-xs font-medium text-blue-600 -mt-1">Officer Portal</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/officer-dashboard" className="text-gray-700 hover:text-shield-blue font-medium transition-colors">
              Dashboard
            </Link>
            <Link to="/officer-dashboard?tab=alerts" className="text-gray-700 hover:text-shield-blue font-medium transition-colors">
              SOS Alerts
            </Link>
            <Link to="/officer-dashboard?tab=reports" className="text-gray-700 hover:text-shield-blue font-medium transition-colors">
              Reports
            </Link>
            <Link to="/officer-dashboard?tab=map" className="text-gray-700 hover:text-shield-blue font-medium transition-colors">
              Crime Map
            </Link>
            
            <div className="flex items-center space-x-4">
              <NotificationBell />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center">
                    <span className="mr-2">Officer {officer?.badge_number}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="text-sm font-normal text-gray-500">Signed in as</div>
                    <div className="font-semibold">{officer?.full_name}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => navigate('/officer-profile')}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => navigate('/officer-settings')}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleSignOut}>
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              to="/officer-dashboard" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
              onClick={handleLinkClick}
            >
              Dashboard
            </Link>
            <Link 
              to="/officer-dashboard?tab=alerts" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
              onClick={handleLinkClick}
            >
              SOS Alerts
            </Link>
            <Link 
              to="/officer-dashboard?tab=reports" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
              onClick={handleLinkClick}
            >
              Reports
            </Link>
            <Link 
              to="/officer-dashboard?tab=map" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
              onClick={handleLinkClick}
            >
              Crime Map
            </Link>
            <Link 
              to="/officer-profile" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
              onClick={handleLinkClick}
            >
              Profile
            </Link>
            <div 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                handleSignOut();
                handleLinkClick();
              }}
            >
              Sign out
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default OfficerNavbar;
