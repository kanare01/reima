import React, { useState, useEffect } from 'react';
import type { Unit } from '../types';

interface TenantFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (tenantData: { name: string; phone: string; email: string; moveInDate: string; }) => void;
    unit: Unit | null;
}

const TenantFormModal: React.FC<TenantFormModalProps> = ({ isOpen, onClose, onSave, unit }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [moveInDate, setMoveInDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (!isOpen) {
           setName('');
           setPhone('');
           setEmail('');
           setMoveInDate(new Date().toISOString().split('T')[0]);
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, phone, email, moveInDate });
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-surface p-8 rounded-xl border border-border w-full max-w-md animate-fade-in" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-2 text-text-primary">Assign Tenant</h2>
                <p className="text-text-secondary mb-6">to Unit <span className="font-semibold text-primary">{unit?.unitNumber}</span></p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-2">Full Name</label>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-900 text-text-primary p-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary transition" required />
                    </div>
                     <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-text-secondary mb-2">Phone Number</label>
                        <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-900 text-text-primary p-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary transition" required />
                    </div>
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-900 text-text-primary p-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary transition" required />
                    </div>
                     <div>
                        <label htmlFor="moveInDate" className="block text-sm font-medium text-text-secondary mb-2">Move-in Date</label>
                        <input type="date" id="moveInDate" value={moveInDate} onChange={(e) => setMoveInDate(e.target.value)} className="w-full bg-slate-900 text-text-primary p-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary transition" required />
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-text-primary bg-slate-600 hover:bg-slate-500 font-semibold transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 rounded-lg text-white bg-primary hover:bg-primary-focus font-semibold transition-colors">
                           Assign Tenant
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TenantFormModal;