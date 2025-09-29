
import React from 'react';
import GoMarketLogo from './common/GoMarketLogo';

const SplashScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-base-100 dark:bg-dark-base-100 animate-fade-in">
        <div className="animate-pulse-slow">
            <GoMarketLogo iconSize={96} textSize="text-5xl" />
        </div>
        <p className="text-base-content/70 dark:text-dark-base-content/70 mt-4">Your AI-Powered Marketplace</p>
    </div>
  );
};

export default SplashScreen;
