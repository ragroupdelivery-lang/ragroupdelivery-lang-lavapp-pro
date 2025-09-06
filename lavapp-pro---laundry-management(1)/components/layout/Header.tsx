import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BellIcon, UserCircleIcon } from '../icons/Icons';
import { useAuth } from '../../hooks/useAuth';

const getTitleFromPathname = (pathname: string): string => {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length > 1) {
    const title = parts[parts.length - 1];
    // Simple check for UUID or number for detail pages
    if (title.match(/(\d+)|([a-f0-9-]+)/) && parts.length > 2) {
      return `${parts[parts.length - 2].charAt(0).toUpperCase() + parts[parts.length - 2].slice(1)} Detail`;
    }
    return title.charAt(0).toUpperCase() + title.slice(1);
  }
  return 'Dashboard';
};

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const title = getTitleFromPathname(location.pathname);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  }

  return (
    <header className="flex items-center justify-between h-20 px-6 md:px-8 bg-white border-b border-brand-gray-200">
      <h1 className="text-2xl font-semibold text-brand-gray-800">{title}</h1>
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full text-brand-gray-500 hover:bg-brand-gray-100 hover:text-brand-gray-700">
          <BellIcon className="h-6 w-6" />
        </button>
        <div className="relative">
          <div className="flex items-center space-x-2 cursor-pointer group">
            <UserCircleIcon className="h-9 w-9 text-brand-gray-400" />
            <div>
              <p className="font-medium text-sm text-brand-gray-700">{user?.name || 'Admin'}</p>
              <p className="text-xs text-brand-gray-500">{user?.role === 'admin' ? 'Laundry Manager' : 'Customer'}</p>
            </div>
          </div>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-brand-gray-700 hover:bg-brand-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
