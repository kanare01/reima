import React, { useState, useEffect } from 'react';
import type { UnitCategory } from '../types';

interface UnitCategoryFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (categoryData: { name: string; rent: number }) => void;
    categoryToEdit?: UnitCategory | null;
}

const UnitCategoryFormModal: React.FC<UnitCategoryFormModalProps> = ({ isOpen, onClose, onSave, categoryToEdit }) => {
    const [name, setName] = useState('');
    const [rent, setRent] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (categoryToEdit) {
                setName(categoryToEdit.name);
                setRent(String(categoryToEdit.rent));
            } else {
                setName('');
                setRent('');
            }
        }
    }, [categoryToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const rentNumber = parseFloat(rent);
        if (!name || isNaN(rentNumber) || rentNumber <= 0) {
            // Basic validation
            return;
        }
        onSave({ name, rent: rentNumber });
    };

    if (!isOpen) {
        return null;
    }
    
    const isEditing = !!categoryToEdit;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-surface p-8 rounded-xl border border-border w-full max-w-md animate-fade-in" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-text-primary">{isEditing ? 'Edit Unit Category' : 'Create New Category'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="categoryName" className="block text-sm font-medium text-text-secondary mb-2">Category Name</label>
                        <input
                            type="text"
                            id="categoryName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., 2 Bedroom, Studio"
                            className="w-full bg-slate-900 text-text-primary p-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary transition"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="rent" className="block text-sm font-medium text-text-secondary mb-2">Monthly Rent (KES)</label>
                        <input
                            type="number"
                            id="rent"
                            value={rent}
                            onChange={(e) => setRent(e.target.value)}
                            placeholder="e.g., 25000"
                            className="w-full bg-slate-900 text-text-primary p-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary transition"
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-text-primary bg-slate-600 hover:bg-slate-500 font-semibold transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 rounded-lg text-white bg-primary hover:bg-primary-focus font-semibold transition-colors">
                           {isEditing ? 'Save Changes' : 'Create Category'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UnitCategoryFormModal;