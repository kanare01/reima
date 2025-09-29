import React from 'react';
import { ExclamationTriangleIcon } from './icons/Icons';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message, confirmText }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50" 
            onClick={onClose}
        >
            <div 
                className="bg-surface p-8 rounded-xl border border-border w-full max-w-md animate-fade-in" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-danger/10 sm:mx-0 sm:h-10 sm:w-10">
                        <ExclamationTriangleIcon className="h-6 w-6 text-danger" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg leading-6 font-bold text-text-primary" id="modal-title">
                            {title}
                        </h3>
                        <div className="mt-2">
                            <p className="text-sm text-text-secondary">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-6 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-danger text-base font-medium text-white hover:bg-danger-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-danger sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                        onClick={onConfirm}
                    >
                        {confirmText || 'Confirm'}
                    </button>
                    <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-border shadow-sm px-4 py-2 bg-slate-600 text-base font-medium text-text-primary hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;