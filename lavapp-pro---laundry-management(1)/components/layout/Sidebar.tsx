import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, PackageIcon, UsersIcon, WrenchScrewdriverIcon, Cog6ToothIcon, SwatchIcon } from '../icons/Icons';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => (
  <NavLink
    to={to}
    end={to === "/admin"}
    className={({ isActive }) =>
      `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-brand-blue text-white'
          : 'text-brand-gray-300 hover:bg-brand-gray-700 hover:text-white'
      }`
    }
  >
    {icon}
    <span className="ml-3">{label}</span>
  </NavLink>
);

const Sidebar: React.FC = () => {
  return (
    <div className="hidden md:flex flex-col w-64 bg-brand-gray-800 text-white">
      <div className="flex items-center justify-center h-20 border-b border-brand-gray-700">
        <SwatchIcon className="h-8 w-8 text-brand-blue" />
        <h1 className="text-2xl font-bold ml-2">Lavapp Pro</h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        <NavItem to="/admin" icon={<HomeIcon className="h-6 w-6" />} label="Dashboard" />
        <NavItem to="/admin/orders" icon={<PackageIcon className="h-6 w-6" />} label="Orders" />
        <NavItem to="/admin/customers" icon={<UsersIcon className="h-6 w-6" />} label="Customers" />
        <NavItem to="/admin/services" icon={<WrenchScrewdriverIcon className="h-6 w-6" />} label="Services" />
        <NavItem to="/admin/settings" icon={<Cog6ToothIcon className="h-6 w-6" />} label="Settings" />
      </nav>
      <div className="px-4 py-4 border-t border-brand-gray-700">
          <p className="text-xs text-brand-gray-400">&copy; 2024 Lavapp Pro</p>
      </div>
    </div>
  );
};

export default Sidebar;