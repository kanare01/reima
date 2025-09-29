import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getProperties, getRentRollReport, getArrearsReport, getVacancyReport } from '../services/mockApiService';
import type { Property, RentRollReportItem, ArrearsReportItem, VacancyReportItem } from '../types';
import { ArrowDownTrayIcon, ChartPieIcon } from '../components/icons/Icons';

const currencyFormatter = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 2 });
const today = new Date().toISOString().split('T')[0];

const ReportsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('rentRoll');
    const [properties, setProperties] = useState<Property[]>([]);
    const [selectedProperty, setSelectedProperty] = useState('all');
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [reportData, setReportData] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [generatedReportType, setGeneratedReportType] = useState<string | null>(null);

    useEffect(() => {
        const fetchProps = async () => {
            const data = await getProperties();
            setProperties(data);
        };
        fetchProps();
    }, []);

    const handleGenerateReport = async () => {
        setLoading(true);
        setReportData(null);
        try {
            if (activeTab === 'rentRoll') {
                const data = await getRentRollReport(selectedProperty, startDate, endDate);
                setReportData(data);
            } else if (activeTab === 'arrears') {
                const data = await getArrearsReport(selectedProperty, startDate, endDate);
                setReportData(data);
            } else if (activeTab === 'vacancy') {
                const data = await getVacancyReport(selectedProperty);
                setReportData(data);
            }
            setGeneratedReportType(activeTab);
        } catch (error) {
            console.error('Failed to generate report', error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleExportPdf = () => {
        if (!reportData || !generatedReportType) return;
        const doc = new jsPDF();
        
        const titleMap: { [key: string]: string } = {
            rentRoll: 'Rent Roll Report',
            arrears: 'Arrears Report',
            vacancy: 'Vacancy Report',
        };
        const title = titleMap[generatedReportType] || 'Report';
        const propertyName = selectedProperty === 'all' ? 'All Properties' : properties.find(p => p.id === selectedProperty)?.name;
        const dateRange = generatedReportType !== 'vacancy' ? `${startDate} to ${endDate}` : `As of ${today}`;

        doc.setFontSize(18);
        doc.text(title, 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Property: ${propertyName}`, 14, 30);
        if (generatedReportType !== 'vacancy') {
            doc.text(`Date Range: ${dateRange}`, 14, 36);
        } else {
             doc.text(`Date: ${today}`, 14, 36);
        }


        let head: string[][] = [];
        let body: any[][] = [];

        if (generatedReportType === 'rentRoll') {
            head = [['Tenant', 'Property', 'Unit', 'Rent', 'Paid', 'Balance']];
            body = (reportData as RentRollReportItem[]).map(item => [
                item.tenantName,
                item.propertyName,
                item.unitNumber,
                currencyFormatter.format(item.monthlyRent),
                currencyFormatter.format(item.amountPaid),
                currencyFormatter.format(item.balance)
            ]);
        } else if (generatedReportType === 'arrears') {
            head = [['Tenant', 'Property', 'Unit', 'Total Billed', 'Total Paid', 'Arrears']];
            body = (reportData as ArrearsReportItem[]).map(item => [
                item.tenantName,
                item.propertyName,
                item.unitNumber,
                currencyFormatter.format(item.totalBilled),
                currencyFormatter.format(item.totalPaid),
                currencyFormatter.format(item.arrears)
            ]);
        } else if (generatedReportType === 'vacancy') {
            head = [['Property', 'Unit', 'Category', 'Potential Rent']];
            body = (reportData as VacancyReportItem[]).map(item => [
                item.propertyName,
                item.unitNumber,
                item.categoryName,
                currencyFormatter.format(item.monthlyRent),
            ]);
        }
        
        (doc as any).autoTable({
            startY: 42,
            head: head,
            body: body,
            theme: 'striped',
            headStyles: { fillColor: [16, 185, 129] }
        });
        
        doc.save(`${generatedReportType}_report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const TabButton = ({ id, label }: { id: string; label: string }) => (
        <button
            onClick={() => {
                setActiveTab(id);
                setReportData(null);
                setGeneratedReportType(null);
            }}
            className={`px-6 py-3 text-sm font-medium rounded-md transition-colors duration-200
                ${activeTab === id ? 'bg-primary text-white shadow' : 'text-text-secondary hover:text-text-primary'}`}
        >
            {label}
        </button>
    );
    
    const renderContent = () => {
        if (loading) {
            return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
        }
        if (reportData) {
            if (reportData.length === 0) {
                 return <div className="text-center text-text-secondary">No data found for the selected criteria.</div>
            }
            if (generatedReportType === 'rentRoll') return <RentRollTable data={reportData as RentRollReportItem[]} />;
            if (generatedReportType === 'arrears') return <ArrearsTable data={reportData as ArrearsReportItem[]} />;
            if (generatedReportType === 'vacancy') return <VacancyTable data={reportData as VacancyReportItem[]} />;
        }
        return (
            <div className="text-center p-8">
                <ChartPieIcon className="mx-auto h-12 w-12 text-text-secondary" />
                <h2 className="text-xl font-semibold text-text-primary mt-4">Generate a Report</h2>
                <p className="text-text-secondary mt-2 max-w-sm mx-auto">Select your desired filters above and click "Generate Report" to view the data.</p>
            </div>
        )
    }

    return (
        <div className="animate-fade-in space-y-6">
             <div className="flex justify-between items-center">
                 <h1 className="text-3xl font-bold text-text-primary">Reports</h1>
                 <button 
                    onClick={handleExportPdf}
                    disabled={!reportData || reportData.length === 0}
                    className="flex items-center bg-secondary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-slate-500 disabled:cursor-not-allowed"
                >
                    <ArrowDownTrayIcon className="w-5 h-5 mr-2"/>
                    Download PDF
                 </button>
             </div>
            <div className="p-2 bg-surface rounded-lg border border-border flex space-x-2">
                <TabButton id="rentRoll" label="Rent Roll" />
                <TabButton id="arrears" label="Arrears" />
                <TabButton id="vacancy" label="Vacancy" />
            </div>

            <div className="bg-surface p-4 rounded-xl border border-border">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className={activeTab === 'vacancy' ? 'md:col-span-3' : 'md:col-span-2'}>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Property</label>
                        <select value={selectedProperty} onChange={(e) => setSelectedProperty(e.target.value)} className="w-full bg-slate-900 text-text-primary p-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary transition">
                            <option value="all">All Properties</option>
                            {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    {activeTab !== 'vacancy' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Start Date
                                </label>
                                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-slate-900 text-text-primary p-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary transition"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">End Date</label>
                                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-slate-900 text-text-primary p-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary transition"/>
                            </div>
                        </>
                    )}
                    <div className="md:col-start-4">
                        <button onClick={handleGenerateReport} disabled={loading} className="w-full bg-primary hover:bg-primary-focus text-white font-bold py-2.5 px-4 rounded-lg transition-colors disabled:bg-slate-500">
                            {loading ? 'Generating...' : 'Generate Report'}
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="bg-surface p-6 rounded-xl border border-border min-h-[400px] flex items-center justify-center">
                {renderContent()}
            </div>
        </div>
    );
};


const RentRollTable: React.FC<{data: RentRollReportItem[]}> = ({ data }) => (
    <div className="w-full overflow-x-auto">
        <table className="w-full text-left">
            <thead className="text-sm uppercase text-text-secondary bg-slate-900/50">
                <tr>
                    <th className="p-4">Tenant</th>
                    <th className="p-4">Property</th>
                    <th className="p-4">Unit</th>
                    <th className="p-4 text-right">Rent</th>
                    <th className="p-4 text-right">Paid</th>
                    <th className="p-4 text-right">Balance</th>
                </tr>
            </thead>
            <tbody>
                {data.map((item, index) => (
                    <tr key={index} className="border-b border-border last:border-0 hover:bg-slate-800/50">
                        <td className="p-4 font-medium text-text-primary">{item.tenantName}</td>
                        <td className="p-4 text-text-secondary">{item.propertyName}</td>
                        <td className="p-4 text-text-secondary">{item.unitNumber}</td>
                        <td className="p-4 text-right text-text-primary">{currencyFormatter.format(item.monthlyRent)}</td>
                        <td className="p-4 text-right text-success">{currencyFormatter.format(item.amountPaid)}</td>
                        <td className={`p-4 text-right font-semibold ${item.balance > 0 ? 'text-danger' : 'text-text-primary'}`}>{currencyFormatter.format(item.balance)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const ArrearsTable: React.FC<{data: ArrearsReportItem[]}> = ({ data }) => (
     <div className="w-full overflow-x-auto">
        <table className="w-full text-left">
            <thead className="text-sm uppercase text-text-secondary bg-slate-900/50">
                <tr>
                    <th className="p-4">Tenant</th>
                    <th className="p-4">Property</th>
                    <th className="p-4">Unit</th>
                    <th className="p-4 text-right">Total Billed</th>
                    <th className="p-4 text-right">Total Paid</th>
                    <th className="p-4 text-right">Arrears</th>
                </tr>
            </thead>
            <tbody>
                {data.map((item, index) => (
                    <tr key={index} className="border-b border-border last:border-0 hover:bg-slate-800/50">
                        <td className="p-4 font-medium text-text-primary">{item.tenantName}</td>
                        <td className="p-4 text-text-secondary">{item.propertyName}</td>
                        <td className="p-4 text-text-secondary">{item.unitNumber}</td>
                        <td className="p-4 text-right text-text-primary">{currencyFormatter.format(item.totalBilled)}</td>
                        <td className="p-4 text-right text-success">{currencyFormatter.format(item.totalPaid)}</td>
                        <td className="p-4 text-right font-semibold text-danger">{currencyFormatter.format(item.arrears)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const VacancyTable: React.FC<{data: VacancyReportItem[]}> = ({ data }) => (
    <div className="w-full overflow-x-auto">
       <table className="w-full text-left">
           <thead className="text-sm uppercase text-text-secondary bg-slate-900/50">
               <tr>
                   <th className="p-4">Property</th>
                   <th className="p-4">Unit #</th>
                   <th className="p-4">Category</th>
                   <th className="p-4 text-right">Potential Rent</th>
               </tr>
           </thead>
           <tbody>
               {data.map((item, index) => (
                   <tr key={index} className="border-b border-border last:border-0 hover:bg-slate-800/50">
                       <td className="p-4 font-medium text-text-primary">{item.propertyName}</td>
                       <td className="p-4 text-text-secondary">{item.unitNumber}</td>
                       <td className="p-4 text-text-secondary">{item.categoryName}</td>
                       <td className="p-4 text-right text-warning">{currencyFormatter.format(item.monthlyRent)}</td>
                   </tr>
               ))}
           </tbody>
       </table>
   </div>
);


export default ReportsPage;