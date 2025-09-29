import React, { useState, useEffect, useCallback } from 'react';
import type { UnitCategory, BulkAssignmentPayload } from '../types';
import { UserGroupIcon, DocumentArrowDownIcon } from './icons/Icons';

interface BulkTenantAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (assignments: BulkAssignmentPayload) => void;
    category: UnitCategory | null;
}

type ParsedRow = {
    unitNumber: string;
    name: string;
    phone: string;
    email: string;
    moveInDate: string;
};

type ValidationResult = {
    valid: ParsedRow[];
    errors: string[];
}

const BulkTenantAssignmentModal: React.FC<BulkTenantAssignmentModalProps> = ({ isOpen, onClose, onSave, category }) => {
    const [file, setFile] = useState<File | null>(null);
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setFile(null);
            setValidationResult(null);
            setIsProcessing(false);
        }
    }, [isOpen]);
    
    const handleDownloadTemplate = () => {
        const headers = "unitNumber,name,phone,email,moveInDate";
        const content = "data:text/csv;charset=utf-8," + headers;
        const encodedUri = encodeURI(content);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "tenant_assignment_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const processFile = useCallback((fileToProcess: File) => {
        setIsProcessing(true);
        setValidationResult(null);
        const reader = new FileReader();

        reader.onload = (e) => {
            const text = e.target?.result as string;
            if (!text) {
                setValidationResult({ valid: [], errors: ["File is empty or could not be read."] });
                setIsProcessing(false);
                return;
            }

            const rows = text.split('\n').map(row => row.trim()).filter(row => row);
            const header = rows.shift()?.split(',').map(h => h.trim());
            
            const expectedHeaders = ['unitNumber', 'name', 'phone', 'email', 'moveInDate'];
            if (!header || JSON.stringify(header) !== JSON.stringify(expectedHeaders)) {
                 setValidationResult({ valid: [], errors: ["Invalid CSV headers. Please use the template."] });
                 setIsProcessing(false);
                 return;
            }

            const vacantUnitNumbers = new Set(category?.units.filter(u => !u.tenantId).map(u => u.unitNumber) || []);
            const result: ValidationResult = { valid: [], errors: [] };

            rows.forEach((row, index) => {
                const values = row.split(',');
                if (values.length !== 5) {
                    result.errors.push(`Row ${index + 1}: Incorrect number of columns.`);
                    return;
                }
                
                const [unitNumber, name, phone, email, moveInDate] = values.map(v => v.trim());

                if (!unitNumber || !name || !phone || !email || !moveInDate) {
                     result.errors.push(`Row ${index + 1} (${unitNumber}): Missing one or more required fields.`);
                     return;
                }
                
                if (!vacantUnitNumbers.has(unitNumber)) {
                     result.errors.push(`Row ${index + 1}: Unit "${unitNumber}" is not vacant, does not exist in this category, or is already in this upload.`);
                     return;
                }
                // Prevent duplicate unit assignments in the same file
                vacantUnitNumbers.delete(unitNumber);

                result.valid.push({ unitNumber, name, phone, email, moveInDate });
            });
            
            setValidationResult(result);
            setIsProcessing(false);
        };
        
        reader.onerror = () => {
            setValidationResult({ valid: [], errors: ["Error reading file."] });
            setIsProcessing(false);
        };

        reader.readAsText(fileToProcess);
    }, [category]);
    
    useEffect(() => {
        if (file) {
            processFile(file);
        }
    }, [file, processFile]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };
    
    const handleSubmit = () => {
        if (validationResult && validationResult.valid.length > 0) {
            onSave(validationResult.valid);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-surface p-8 rounded-xl border border-border w-full max-w-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-2 text-text-primary">Bulk Assign Tenants</h2>
                <p className="text-text-secondary mb-6">to <span className="font-semibold text-primary">{category?.name}</span> category</p>

                <div className="space-y-4">
                    <p className="text-sm text-text-secondary">
                        1. Download the CSV template, fill in the tenant details, and upload the file.
                    </p>
                    <button onClick={handleDownloadTemplate} className="inline-flex items-center text-sm text-primary hover:underline font-semibold">
                        <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                        Download CSV Template
                    </button>
                    <div>
                        <label htmlFor="csv-upload" className="block text-sm font-medium text-text-secondary mb-2">2. Upload your completed CSV file</label>
                        <input
                            id="csv-upload"
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
                        />
                    </div>
                </div>

                {(isProcessing || validationResult) && (
                    <div className="mt-6 p-4 bg-slate-900/50 rounded-lg max-h-64 overflow-y-auto">
                        <h3 className="font-semibold text-text-primary mb-2">Validation Preview</h3>
                        {isProcessing ? (
                            <p className="text-text-secondary">Processing file...</p>
                        ) : validationResult ? (
                            <div className="space-y-4">
                                {validationResult.valid.length > 0 && (
                                    <div>
                                        <p className="text-sm text-success font-medium">{validationResult.valid.length} valid assignment(s) found.</p>
                                        <ul className="text-xs text-text-secondary list-disc pl-5 mt-1">
                                           {validationResult.valid.slice(0, 3).map(v => <li key={v.unitNumber}>Assign <strong>{v.name}</strong> to unit <strong>{v.unitNumber}</strong></li>)}
                                           {validationResult.valid.length > 3 && <li>...and {validationResult.valid.length - 3} more.</li>}
                                        </ul>
                                    </div>
                                )}
                                {validationResult.errors.length > 0 && (
                                    <div>
                                        <p className="text-sm text-danger font-medium">{validationResult.errors.length} error(s) found.</p>
                                         <ul className="text-xs text-danger/80 list-disc pl-5 mt-1">
                                           {validationResult.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                                            {validationResult.errors.length > 5 && <li>...and {validationResult.errors.length - 5} more errors.</li>}
                                        </ul>
                                    </div>
                                )}
                                {validationResult.valid.length === 0 && validationResult.errors.length === 0 && (
                                    <p className="text-text-secondary text-sm">No data found in file, or file is empty.</p>
                                )}
                            </div>
                        ) : null}
                    </div>
                )}


                <div className="flex justify-end space-x-4 mt-8">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-text-primary bg-slate-600 hover:bg-slate-500 font-semibold transition-colors">
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        onClick={handleSubmit}
                        disabled={isProcessing || !validationResult || validationResult.valid.length === 0}
                        className="flex items-center px-4 py-2 rounded-lg text-white bg-primary hover:bg-primary-focus font-semibold transition-colors disabled:bg-slate-500 disabled:cursor-not-allowed">
                       <UserGroupIcon className="w-5 h-5 mr-2" />
                       Assign {validationResult?.valid.length || ''} Tenant(s)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkTenantAssignmentModal;