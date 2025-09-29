import React, { useState, useEffect, useRef } from 'react';
import { useLocation, matchPath } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRightOnRectangleIcon, ChevronDownIcon } from './icons/Icons';

const Header: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          setMenuOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const getTitle = () => {
    const { pathname } = location;
    if (matchPath("/properties/:propertyId", pathname)) return 'Property Details';
    const path = pathname.split('/').pop() || 'dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  }

  return (
    <header className="h-20 flex-shrink-0 flex items-center justify-between px-6 md:px-8 bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
      <h1 className="text-2xl font-bold text-text-primary">{getTitle()}</h1>
      <div className="flex items-center space-x-4">
        {user && (
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setMenuOpen(prev => !prev)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-surface transition-colors"
            >
              <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-white font-bold ring-2 ring-slate-600">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-semibold text-text-primary">{user.email}</p>
                <p className="text-xs text-text-secondary capitalize">{user.role}</p>
              </div>
              <ChevronDownIcon className={`w-5 h-5 text-text-secondary transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-border rounded-lg shadow-lg z-20 animate-fade-in origin-top-right">
                <button 
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="w-full text-left flex items-center px-4 py-2 text-sm text-danger hover:bg-surface"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;