import React, { useEffect, useState, useMemo } from 'react';
import { getPaymentsForTenant } from '../services/mockApiService';
import type { Tenant, Payment } from '../types';

interface PaymentHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    tenant: Tenant | null;
}

const currencyFormatter = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 });

const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({ isOpen, onClose, tenant }) => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && tenant) {
            const fetchPayments = async () => {
                setLoading(true);
                try {
                    const data = await getPaymentsForTenant(tenant.id);
                    setPayments(data.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()));
                } catch (error) {
                    console.error("Failed to fetch payments", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchPayments();
        }
    }, [isOpen, tenant]);

    const groupedPayments = useMemo(() => {
        return payments.reduce((acc, payment) => {
            const monthKey = payment.monthPaidFor; // "YYYY-MM"
            if (!acc[monthKey]) {
                acc[monthKey] = [];
            }
            acc[monthKey].push(payment);
            return acc;
        }, {} as Record<string, Payment[]>);
    }, [payments]);

    const sortedMonths = useMemo(() => {
        return Object.keys(groupedPayments).sort((a, b) => b.localeCompare(a));
    }, [groupedPayments]);

    if (!isOpen) {
        return null;
    }
    
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    
    const formatMonthYear = (monthKey: string) => {
        const [year, month] = monthKey.split('-');
        const date = new Date(Number(year), Number(month) - 1);
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-surface p-8 rounded-xl border border-border w-full max-w-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-2 text-text-primary">Payment History</h2>
                <p className="text-text-secondary mb-6">for <span className="font-semibold text-primary">{tenant?.name}</span></p>

                <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {loading ? (
                        <div className="text-center py-8">Loading history...</div>
                    ) : payments.length === 0 ? (
                        <div className="text-center py-8 text-text-secondary">No payments recorded for this tenant.</div>
                    ) : (
                         <table className="w-full text-left">
                            <thead className="text-sm uppercase text-text-secondary sticky top-0 bg-surface z-10">
                                <tr>
                                    <th className="p-3">Payment Date</th>
                                    <th className="p-3">Description</th>
                                    <th className="p-3 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedMonths.map(monthKey => {
                                    const monthPayments = groupedPayments[monthKey];
                                    const monthTotal = monthPayments.reduce((sum, p) => sum + p.amount, 0);
                                    return (
                                        <React.Fragment key={monthKey}>
                                            <tr className="bg-slate-900/50">
                                                <td colSpan={2} className="p-3 font-semibold text-text-primary">{formatMonthYear(monthKey)}</td>
                                                <td className="p-3 text-right font-semibold text-text-primary">{currencyFormatter.format(monthTotal)}</td>
                                            </tr>
                                            {monthPayments.map(payment => (
                                                <tr key={payment.id} className="border-b border-border last:border-b-0 hover:bg-slate-800/50">
                                                    <td className="p-3 pl-6 text-text-secondary">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                                                    <td className="p-3 pl-6 text-text-secondary">Payment Received</td>
                                                    <td className="p-3 text-right font-medium text-text-primary">{currencyFormatter.format(payment.amount)}</td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    )
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                 <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
                    <span className="font-bold text-text-primary text-lg">Total Paid (All Time)</span>
                    <span className="font-bold text-success text-lg">{currencyFormatter.format(totalPaid)}</span>
                </div>

                <div className="flex justify-end mt-6">
                     <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg text-white bg-primary hover:bg-primary-focus font-semibold transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentHistoryModal;