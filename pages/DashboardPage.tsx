import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getDashboardStats, getMonthlyIncomeTrend, getPropertySummaries } from '../services/mockApiService';
import type { DashboardStats, PropertySummary } from '../types';
import DashboardCard from '../components/DashboardCard';
import { UsersIcon, BuildingOffice2Icon, CurrencyDollarIcon, ChartPieIcon } from '../components/icons/Icons';

const currencyFormatter = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 });

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [incomeTrend, setIncomeTrend] = useState<any[]>([]);
  const [propertySummaries, setPropertySummaries] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsData, trendData, summariesData] = await Promise.all([
          getDashboardStats(new Date()),
          getMonthlyIncomeTrend(),
          getPropertySummaries(),
        ]);
        setStats(statsData);
        setIncomeTrend(trendData);
        setPropertySummaries(summariesData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-danger text-center p-8 bg-surface rounded-xl">Failed to load dashboard data.</div>;
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="Occupancy Rate"
          value={`${stats.occupancyRate.toFixed(1)}%`}
          icon={<ChartPieIcon className="w-7 h-7 text-secondary"/>}
          colorClass="border-secondary"
        />
        <DashboardCard 
          title="Total Arrears"
          value={currencyFormatter.format(stats.totalArrears)}
          icon={<CurrencyDollarIcon className="w-7 h-7 text-danger"/>}
          colorClass="border-danger"
        />
        <DashboardCard 
          title="Collected This Month"
          value={currencyFormatter.format(stats.actualIncome)}
          icon={<CurrencyDollarIcon className="w-7 h-7 text-success"/>}
          colorClass="border-success"
        />
        <DashboardCard 
          title="Vacant Units"
          value={stats.vacantUnits}
          icon={<BuildingOffice2Icon className="w-7 h-7 text-warning"/>}
          colorClass="border-warning"
        />
      </div>

      <div className="bg-surface p-6 rounded-xl border border-border">
        <h2 className="text-xl font-semibold mb-4 text-text-primary">6-Month Income Trend</h2>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <BarChart data={incomeTrend} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" tick={{ fill: '#9ca3af' }}/>
              <YAxis tickFormatter={(value) => `Ksh ${Number(value)/1000}k`} tick={{ fill: '#9ca3af' }}/>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.75rem', color: '#f1f5f9' }}
                cursor={{fill: 'rgba(16, 185, 129, 0.1)'}}
                formatter={(value: number) => currencyFormatter.format(value)}
              />
              <Legend wrapperStyle={{ color: '#f1f5f9', paddingTop: '10px' }} />
              <Bar dataKey="expected" fill="#3b82f6" name="Expected Income" radius={[4, 4, 0, 0]}/>
              <Bar dataKey="actual" fill="#10b981" name="Actual Collected" radius={[4, 4, 0, 0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

       <div>
            <h2 className="text-xl font-semibold mb-4 text-text-primary">Property Summary</h2>
            {propertySummaries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {propertySummaries.map(summary => (
                        <Link to={`/properties/${summary.id}`} key={summary.id} className="bg-surface p-6 rounded-xl border border-border transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 block">
                            <h3 className="font-bold text-lg text-text-primary truncate mb-4">{summary.name}</h3>
                            <div className="flex justify-between items-center">
                                <div className="text-center px-2">
                                    <p className="text-sm text-text-secondary">Occupancy</p>
                                    <p className="text-2xl font-bold text-primary">{summary.occupancyRate.toFixed(1)}%</p>
                                </div>
                                <div className="border-l border-border h-10"></div>
                                <div className="text-center px-2">
                                    <p className="text-sm text-text-secondary">Total Arrears</p>
                                    <p className="text-2xl font-bold text-danger">{currencyFormatter.format(summary.totalArrears)}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="bg-surface p-6 rounded-xl border border-border text-center text-text-secondary">
                    No properties available to summarize.
                </div>
            )}
        </div>
    </div>
  );
};

export default DashboardPage;