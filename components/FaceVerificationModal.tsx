import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import Spinner from './common/Spinner';

interface IdVerificationModalProps {
    seller: User;
    onClose: () => void;
    onVerificationSuccess: () => void;
}

const IdVerificationModal: React.FC<IdVerificationModalProps> = ({ seller, onClose, onVerificationSuccess }) => {
    const [view, setView] = useState<'intro' | 'result'>('intro');
    const [enteredIdNumber, setEnteredIdNumber] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    const handleVerifyNumber = () => {
        setError(null);
        if (enteredIdNumber.trim() === '') {
            setError("Please enter the ID number.");
            return;
        }
        setIsVerifying(true);
        // Mock API call
        setTimeout(() => {
            if (enteredIdNumber.trim().toLowerCase() === seller.idNumber?.toLowerCase()) {
                setView('result');
            } else {
                setError("The ID number entered does not match the record. Please check and try again.");
            }
            setIsVerifying(false);
        }, 500);
    };

    const renderContent = () => {
        switch (view) {
            case 'intro':
                return (
                    <div className="p-8 text-center">
                        <h2 className="text-2xl font-bold mb-2">Verify ID</h2>
                        <p className="text-base-content/70 dark:text-dark-base-content/70 mb-6">Enter their ID Number below to see their verified ID document.</p>
                        <div className="flex items-center justify-center gap-3 bg-base-200 dark:bg-dark-base-300 p-3 rounded-lg shadow-inner max-w-sm mx-auto mb-6">
                            <img src={seller.avatarUrl} alt={seller.username} className="w-10 h-10 rounded-full" />
                            <span className="font-semibold text-base-content dark:text-dark-base-content">{seller.username}</span>
                        </div>
                        <div className="space-y-3">
                            <input
                                type="text"
                                value={enteredIdNumber}
                                onChange={(e) => setEnteredIdNumber(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !isVerifying && handleVerifyNumber()}
                                placeholder="Enter seller's ID Number"
                                className="w-full px-4 py-3 bg-base-200 dark:bg-dark-base-200 border border-base-300 dark:border-dark-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-center"
                            />
                             {error && <p className="text-sm text-center text-error">{error}</p>}
                            <button onClick={handleVerifyNumber} disabled={isVerifying} className="w-full bg-primary text-primary-content font-bold py-3 px-5 rounded-lg hover:bg-primary-focus transition-colors disabled:bg-base-300">
                                {isVerifying ? <Spinner size="sm" /> : "Verify & View Document"}
                            </button>
                        </div>
                    </div>
                );
            case 'result':
                 return (
                    <div className="p-8 text-center">
                        <h2 className="text-2xl font-bold mb-2">Final Confirmation</h2>
                        <p className="text-base-content/70 dark:text-dark-base-content/70 mb-6">Does their physical ID match the official document on file shown below?</p>
                        <img src={seller.idDocumentUrl} alt="Official ID on file" className="w-full h-auto rounded-lg mx-auto mb-6 shadow-lg border-4 border-success"/>
                        <div className="flex gap-2">
                             <button onClick={onClose} className="flex-1 bg-error text-white font-bold py-3 px-5 rounded-lg hover:bg-red-700 transition-colors">
                                No, it's a Mismatch
                            </button>
                            <button onClick={onVerificationSuccess} className="flex-1 bg-success text-white font-bold py-3 px-5 rounded-lg hover:bg-green-700 transition-colors">
                                Yes, it Matches
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="verification-modal-title">
            <div className="bg-base-100 dark:bg-dark-base-200 rounded-2xl shadow-2xl w-full max-w-md animate-slide-in-up overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-base-300 dark:border-dark-base-300">
                    <h1 id="verification-modal-title" className="text-xl font-bold">ID Verification</h1>
                    <button onClick={onClose} aria-label="Close" className="text-base-content/50 dark:text-dark-base-content/50 hover:text-base-content dark:hover:text-dark-base-content text-3xl leading-none">&times;</button>
                </div>
                <div>{renderContent()}</div>
            </div>
        </div>
    );
};

export default IdVerificationModal;
