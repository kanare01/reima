import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, BuildingOffice2Icon, ChartPieIcon, BuildingIcon } from './icons/Icons';

const Sidebar: React.FC = () => {
  const baseClasses = 'flex items-center px-4 py-3 rounded-lg transition-colors duration-200 group';
  const inactiveClasses = 'text-text-secondary hover:bg-surface hover:text-text-primary';
  const activeClasses = 'bg-primary/10 text-primary font-semibold';

  return (
    <aside className="w-64 flex-shrink-0 bg-surface/50 border-r border-border hidden md:block">
      <div className="flex flex-col h-full">
        <div className="h-20 flex items-center justify-center px-4 border-b border-border">
            <BuildingIcon className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold ml-2 text-text-primary">NyumbaSys</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
          >
            <HomeIcon className="h-6 w-6 mr-4 transition-colors group-hover:text-primary" />
            Dashboard
          </NavLink>
          <NavLink 
            to="/properties" 
            className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
          >
            <BuildingOffice2Icon className="h-6 w-6 mr-4 transition-colors group-hover:text-primary" />
            Properties
          </NavLink>
          <NavLink 
            to="/reports" 
            className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
          >
            <ChartPieIcon className="h-6 w-6 mr-4 transition-colors group-hover:text-primary" />
            Reports
          </NavLink>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;