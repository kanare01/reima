import React, { useState, useEffect } from 'react';
import type { Unit } from '../types';

interface UnitFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (unitData: { unitNumber: string }) => void;
    unitToEdit?: Unit | null;
}

const UnitFormModal: React.FC<UnitFormModalProps> = ({ isOpen, onClose, onSave, unitToEdit }) => {
    const [unitNumber, setUnitNumber] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (unitToEdit) {
                setUnitNumber(unitToEdit.unitNumber);
            } else {
                setUnitNumber('');
            }
        }
    }, [unitToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!unitNumber.trim()) return;
        onSave({ unitNumber });
    };

    if (!isOpen) {
        return null;
    }

    const isEditing = !!unitToEdit;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-surface p-8 rounded-xl border border-border w-full max-w-md animate-fade-in" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-text-primary">{isEditing ? 'Edit Unit' : 'Add New Unit'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label htmlFor="unitNumber" className="block text-sm font-medium text-text-secondary mb-2">Unit Number / Name</label>
                        <input
                            type="text"
                            id="unitNumber"
                            value={unitNumber}
                            onChange={(e) => setUnitNumber(e.target.value)}
                            placeholder="e.g., A1, Block C - 102"
                            className="w-full bg-slate-900 text-text-primary p-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary transition"
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-text-primary bg-slate-600 hover:bg-slate-500 font-semibold transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 rounded-lg text-white bg-primary hover:bg-primary-focus font-semibold transition-colors">
                           {isEditing ? 'Save Changes' : 'Add Unit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UnitFormModal;