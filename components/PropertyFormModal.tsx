import React, { useState, useEffect } from 'react';
import type { Property } from '../types';

interface PropertyFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (propertyData: { name: string; location: string }) => void;
    propertyToEdit?: Property | null;
}

const PropertyFormModal: React.FC<PropertyFormModalProps> = ({ isOpen, onClose, onSave, propertyToEdit }) => {
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (propertyToEdit) {
                setName(propertyToEdit.name);
                setLocation(propertyToEdit.location);
            } else {
                setName('');
                setLocation('');
            }
        }
    }, [propertyToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !location) {
            return;
        }
        onSave({ name, location });
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-surface p-8 rounded-xl border border-border w-full max-w-md animate-fade-in" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-text-primary">{propertyToEdit ? 'Edit Property' : 'Create New Property'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-2">Property Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-900 text-text-primary p-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary transition"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="location" className="block text-sm font-medium text-text-secondary mb-2">Location</label>
                        <input
                            type="text"
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full bg-slate-900 text-text-primary p-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary transition"
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-text-primary bg-slate-600 hover:bg-slate-500 font-semibold transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 rounded-lg text-white bg-primary hover:bg-primary-focus font-semibold transition-colors">
                            {propertyToEdit ? 'Save Changes' : 'Create Property'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PropertyFormModal;