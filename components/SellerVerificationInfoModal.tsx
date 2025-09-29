import React, { useState } from 'react';
import type { Listing, User } from '../types';
import Spinner from './common/Spinner';

interface SellerVerificationInfoModalProps {
    onClose: () => void;
    onFindSeller: (seller: User) => void;
    listings: Listing[];
}

const SellerVerificationInfoModal: React.FC<SellerVerificationInfoModalProps> = ({ onClose, onFindSeller, listings }) => {
    const [idNumber, setIdNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFindUser = () => {
        setError(null);
        if (idNumber.trim() === '') {
            setError("Please enter an ID number.");
            return;
        }
        setIsLoading(true);

        // Simulate a network request to find the user.
        // For this demo, we'll create a pool of all unique users from the seller data
        // and pretend they could be buyers.
        setTimeout(() => {
            const allUsersInApp = Array.from(new Map(listings.map(l => [l.seller.username, l.seller])).values());
            const foundUser = allUsersInApp.find(u => u.idNumber?.toLowerCase() === idNumber.trim().toLowerCase());
            
            if (foundUser) {
                onFindSeller(foundUser);
            } else {
                setError(`User with ID Number "${idNumber.trim()}" not found.`);
            }
            setIsLoading(false);
        }, 500);
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" 
            onClick={onClose} 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="verify-id-title"
        >
            <div 
                className="bg-base-100 dark:bg-dark-base-200 rounded-2xl shadow-2xl w-full max-w-md animate-slide-in-up" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 text-center">
                    <h2 id="verify-id-title" className="text-2xl font-bold mb-2">Verify ID</h2>
                    <p className="text-base-content/70 dark:text-dark-base-content/70 mb-6">
                       Enter their ID Number below to see their verified ID document.
                    </p>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="id-number-input" className="sr-only">ID Number</label>
                            <input
                                id="id-number-input"
                                type="text"
                                value={idNumber}
                                onChange={e => setIdNumber(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleFindUser()}
                                placeholder="ID Number"
                                className="w-full px-4 py-3 bg-base-200 dark:bg-dark-base-200 border border-base-300 dark:border-dark-base-300 rounded-lg text-base-content dark:text-dark-base-content focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-center"
                            />
                        </div>
                        {error && <p className="text-sm text-center text-error">{error}</p>}
                        <button 
                            onClick={handleFindUser} 
                            disabled={isLoading}
                            className="w-full bg-primary text-primary-content font-bold py-3 px-5 rounded-lg hover:bg-primary-focus transition-colors disabled:bg-base-300 dark:disabled:bg-dark-base-300"
                        >
                            {isLoading ? <Spinner size="sm" /> : 'Find & Verify'}
                        </button>
                    </div>
                </div>
                <div className="p-4 bg-base-200 dark:bg-dark-base-300 text-right rounded-b-2xl">
                     <button onClick={onClose} className="font-semibold text-sm text-base-content/70 dark:text-dark-base-content/70 hover:text-primary">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SellerVerificationInfoModal;