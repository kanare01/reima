import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass: 'border-secondary' | 'border-danger' | 'border-success' | 'border-warning';
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, colorClass, className }) => {
  return (
    <div className={`bg-surface p-6 rounded-xl border border-border flex flex-col justify-between transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 ${className}`}>
      <div className={`w-full h-1 ${colorClass.replace('border', 'bg')} rounded-t-lg absolute top-0 left-0`}></div>
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="text-text-secondary font-medium mb-2">{title}</span>
          <h3 className="text-3xl font-bold text-text-primary">{value}</h3>
        </div>
        <div className="p-3 bg-slate-900/50 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;