import React, { useState, useEffect } from 'react';
import type { Tenant } from '../types';

interface PaymentFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (paymentData: { amount: number; paymentDate: string; monthPaidFor: string; tenantId: string }) => void;
    tenant: Tenant | null;
}

const PaymentFormModal: React.FC<PaymentFormModalProps> = ({ isOpen, onClose, onSave, tenant }) => {
    const [amount, setAmount] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [monthPaidFor, setMonthPaidFor] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);

    useEffect(() => {
        if (!isOpen) {
            setAmount('');
            setPaymentDate(new Date().toISOString().split('T')[0]);
            setMonthPaidFor(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant) return;
        onSave({ 
            amount: Number(amount), 
            paymentDate, 
            monthPaidFor, 
            tenantId: tenant.id 
        });
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-surface p-8 rounded-xl border border-border w-full max-w-md animate-fade-in" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-2 text-text-primary">Record Payment</h2>
                <p className="text-text-secondary mb-6">for <span className="font-semibold text-primary">{tenant?.name}</span></p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-text-secondary mb-2">Amount (KES)</label>
                        <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-slate-900 text-text-primary p-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary transition" required />
                    </div>
                     <div>
                        <label htmlFor="paymentDate" className="block text-sm font-medium text-text-secondary mb-2">Payment Date</label>
                        <input type="date" id="paymentDate" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="w-full bg-slate-900 text-text-primary p-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary transition" required />
                    </div>
                     <div>
                        <label htmlFor="monthPaidFor" className="block text-sm font-medium text-text-secondary mb-2">Month Paid For</label>
                        <input type="month" id="monthPaidFor" value={monthPaidFor} onChange={(e) => setMonthPaidFor(e.target.value)} className="w-full bg-slate-900 text-text-primary p-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary transition" required />
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-text-primary bg-slate-600 hover:bg-slate-500 font-semibold transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 rounded-lg text-white bg-primary hover:bg-primary-focus font-semibold transition-colors">
                           Record Payment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentFormModal;