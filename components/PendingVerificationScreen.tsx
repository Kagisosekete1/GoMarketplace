import React, { useState } from 'react';
import type { User } from '../types';
import GoMarketLogo from './common/GoMarketLogo';
import Spinner from './common/Spinner';

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

interface PendingVerificationScreenProps {
    user: User;
    onLogout: () => void;
    onUserUpdate: (user: User) => void;
}

const PendingVerificationScreen: React.FC<PendingVerificationScreenProps> = ({ user, onLogout, onUserUpdate }) => {
    const [isChecking, setIsChecking] = useState(false);

    const handleCheckStatus = () => {
        setIsChecking(true);
        // Simulate an API call
        setTimeout(() => {
            // For demo purposes, we will force verify the user after they check.
            const updatedUser = { ...user, status: 'verified' as const };
            onUserUpdate(updatedUser);
            // The app's main logic will then redirect them.
        }, 1500);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-base-200 dark:bg-dark-base-200 p-4 animate-fade-in">
            <div className="w-full max-w-md p-8 space-y-6 bg-base-100 dark:bg-dark-base-100 rounded-2xl shadow-2xl text-center">
                <GoMarketLogo iconSize={56} textSize="text-2xl" />

                <div className="py-6">
                    <ClockIcon />
                </div>
                
                <h1 className="text-3xl font-bold">Verification in Progress</h1>

                <p className="text-base-content/70 dark:text-dark-base-content/70">
                    Thanks for submitting your documents! Your account is currently under review to ensure the safety of our community.
                </p>

                <p className="text-base-content/70 dark:text-dark-base-content/70">
                    This usually takes <strong>24-48 hours</strong>. We'll notify you once it's complete.
                </p>

                <div className="pt-4 space-y-3">
                    <button
                        onClick={handleCheckStatus}
                        disabled={isChecking}
                        className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent hover:bg-accent-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-focus disabled:bg-base-300 dark:disabled:bg-dark-base-300 disabled:cursor-not-allowed transition-colors"
                    >
                        {isChecking ? <Spinner size="sm" /> : 'Check Status Now (Demo)'}
                    </button>
                    <button
                        onClick={onLogout}
                        className="w-full text-center py-2 text-primary font-semibold text-sm hover:underline disabled:opacity-50"
                        disabled={isChecking}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PendingVerificationScreen;