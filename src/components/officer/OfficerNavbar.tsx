
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useOfficerAuth } from '@/contexts/OfficerAuthContext';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Menu, 
  X, 
  LogOut, 
  User, 
  Settings, 
  Bell,
  FileText,
  AlertTriangle,
  UserCheck,
  Map,
  Users
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import NotificationBell from './NotificationBell';

const OfficerNavbar = () => {
  const { officer, signOut } = useOfficerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/officer-login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const isActiveRoute = (path: string) => {
    if (path === '/officer-dashboard' && location.pathname === '/officer-dashboard') return true;
    return location.pathname === path;
  };

  const navItems = [
    { name: 'Dashboard', path: '/officer-dashboard', icon: <Shield className="h-5 w-5" /> },
    { name: 'SOS Alerts', path: '/officer-dashboard?tab=alerts', icon: <AlertTriangle className="h-5 w-5" /> },
    { name: 'Reports', path: '/officer-dashboard?tab=reports', icon: <FileText className="h-5 w-5" /> },
    { name: 'KYC Verifications', path: '/officer-dashboard?tab=kyc', icon: <UserCheck className="h-5 w-5" /> },
    { name: 'Criminals', path: '/officer-dashboard?tab=criminals', icon: <Users className="h-5 w-5" /> },
    { name: 'Crime Map', path: '/officer-dashboard?tab=map', icon: <Map className="h-5 w-5" /> }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm text-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/officer-dashboard" className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-shield-blue" />
            <span className="font-bold text-xl text-shield-blue">Shield</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-4">
            {navItems.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className={`hover:bg-gray-100/80 text-gray-800 ${
                  isActiveRoute(item.path) ? 'bg-gray-100/80' : ''
                }`}
                onClick={() => handleNavigation(item.path)}
              >
                {item.icon}
                <span className="ml-2">{item.name}</span>
              </Button>
            ))}
          </div>

          {/* Right Side - User Menu & Notifications */}
          <div className="flex items-center space-x-4">
            <NotificationBell />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Avatar className="h-8 w-8 bg-shield-blue">
                    <AvatarFallback>
                      {officer ? getInitials(officer.full_name) : 'OP'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="text-sm">{officer?.full_name}</div>
                  <div className="text-xs text-gray-500">{officer?.badge_number}</div>
                </DropdownMenuLabel>
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
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/90 backdrop-blur-md border-t border-gray-200">
          <div className="container mx-auto px-4 py-4 flex flex-col">
            {navItems.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className={`justify-start mb-2 text-gray-800 ${
                  isActiveRoute(item.path) ? 'bg-gray-100/80' : ''
                }`}
                onClick={() => handleNavigation(item.path)}
              >
                {item.icon}
                <span className="ml-2">{item.name}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default OfficerNavbar;
