import React, { useState, useEffect, useMemo } from 'react';

interface BulkUnitFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (unitNumbers: string[]) => void;
}

const BulkUnitFormModal: React.FC<BulkUnitFormModalProps> = ({ isOpen, onClose, onSave }) => {
    const [prefix, setPrefix] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setPrefix('');
            setStart('');
            setEnd('');
            setError(null);
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        const startNum = parseInt(start, 10);
        const endNum = parseInt(end, 10);

        if (isNaN(startNum) || isNaN(endNum)) {
            setError('Start and end numbers must be valid integers.');
            return;
        }

        if (startNum > endNum) {
            setError('The starting number cannot be greater than the ending number.');
            return;
        }

        if (endNum - startNum > 100) {
            setError('You can create a maximum of 100 units at a time.');
            return;
        }

        const unitNumbers: string[] = [];
        for (let i = startNum; i <= endNum; i++) {
            unitNumbers.push(`${prefix}${i}`);
        }
        
        onSave(unitNumbers);
    };
    
    const previewText = useMemo(() => {
        const startNum = parseInt(start, 10);
        const endNum = parseInt(end, 10);
        if (isNaN(startNum) || isNaN(endNum) || startNum > endNum) {
            return 'Enter a valid range to see a preview.';
        }
        const total = endNum - startNum + 1;
        const firstUnit = `${prefix}${startNum}`;
        const lastUnit = `${prefix}${endNum}`;

        if (total === 1) {
            return `This will create 1 unit: ${firstUnit}.`;
        }

        return `This will create ${total} units, from ${firstUnit} to ${lastUnit}.`;

    }, [prefix, start, end]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-surface p-8 rounded-xl border border-border w-full max-w-lg animate-fade-in" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-text-primary">Add Multiple Units</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="md:col-span-1">
                            <label htmlFor="prefix" className="block text-sm font-medium text-text-secondary mb-2">Prefix (Optional)</label>
                            <input
                                type="text"
                                id="prefix"
                                value={prefix}
                                onChange={(e) => setPrefix(e.target.value)}
                                placeholder="e.g., A-"
                                className="w-full bg-slate-900 text-text-primary p-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary transition"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label htmlFor="start" className="block text-sm font-medium text-text-secondary mb-2">Starting Number</label>
                            <input
                                type="number"
                                id="start"
                                value={start}
                                onChange={(e) => setStart(e.target.value)}
                                placeholder="e.g., 101"
                                className="w-full bg-slate-900 text-text-primary p-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary transition"
                                required
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label htmlFor="end" className="block text-sm font-medium text-text-secondary mb-2">Ending Number</label>
                            <input
                                type="number"
                                id="end"
                                value={end}
                                onChange={(e) => setEnd(e.target.value)}
                                placeholder="e.g., 110"
                                className="w-full bg-slate-900 text-text-primary p-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary transition"
                                required
                            />
                        </div>
                    </div>

                    <div className="h-10 mb-4 px-3 py-2 bg-slate-900/50 rounded-lg text-sm text-text-secondary italic">
                        {previewText}
                    </div>

                    {error && <p className="text-danger text-sm mb-4">{error}</p>}

                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-text-primary bg-slate-600 hover:bg-slate-500 font-semibold transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 rounded-lg text-white bg-primary hover:bg-primary-focus font-semibold transition-colors">
                            Create Units
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BulkUnitFormModal;
