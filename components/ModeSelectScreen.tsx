
import React, { useState } from 'react';
import { AppMode } from '../types';

const BrowseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
);

const SellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
    </svg>
);

interface ModeSelectScreenProps {
  onModeSelect: (mode: AppMode) => void;
}

const ModeSelectScreen: React.FC<ModeSelectScreenProps> = ({ onModeSelect }) => {
  const [selectedMode, setSelectedMode] = useState<AppMode | null>(null);

  const handleContinue = () => {
    if (selectedMode !== null) {
      onModeSelect(selectedMode);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-base-200 dark:bg-dark-base-200 animate-fade-in p-4 sm:p-8">
        <div className="w-full max-w-4xl mx-auto flex flex-col h-full">
            <div className="text-center mb-8 sm:mb-12 flex-shrink-0">
                <h1 className="text-4xl font-bold text-base-content dark:text-dark-base-content">What are you doing today?</h1>
            </div>
            
            <div className="flex-grow flex flex-col md:flex-row items-center justify-center gap-8">
              <ModeCard 
                  title="Buying" 
                  description="Browse deals & finds" 
                  icon={<BrowseIcon />}
                  onClick={() => setSelectedMode(AppMode.BROWSE)}
                  isSelected={selectedMode === AppMode.BROWSE}
                  color="primary"
              />
              <ModeCard 
                  title="Selling" 
                  description="Post your item in seconds" 
                  icon={<SellIcon />}
                  onClick={() => setSelectedMode(AppMode.SELL)}
                  isSelected={selectedMode === AppMode.SELL}
                  color="secondary"
              />
            </div>

            <div className="mt-8 sm:mt-12 flex-shrink-0">
                <button 
                    onClick={handleContinue}
                    disabled={selectedMode === null}
                    className="w-full max-w-sm mx-auto flex items-center justify-center bg-accent hover:bg-accent-focus text-white font-bold py-4 px-5 rounded-lg transition-all duration-300 disabled:bg-base-300 dark:disabled:bg-dark-base-300 disabled:cursor-not-allowed disabled:hover:bg-base-300 dark:disabled:hover:bg-dark-base-300 disabled:text-base-content/50 dark:disabled:text-dark-base-content/50"
                >
                    Continue
                </button>
            </div>
      </div>
    </div>
  );
};

interface ModeCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
    isSelected: boolean;
    color: 'primary' | 'secondary';
}

const ModeCard: React.FC<ModeCardProps> = ({ title, description, icon, onClick, isSelected, color }) => {
    const colorStyles = {
        primary: { border: 'border-primary', bg: 'bg-primary/10', text: 'text-primary', ring: 'ring-primary' },
        secondary: { border: 'border-secondary', bg: 'bg-secondary/10', text: 'text-secondary', ring: 'ring-secondary' }
    };

    const selectedClasses = isSelected
        ? `border-4 ${colorStyles[color].border} ${colorStyles[color].bg} transform -translate-y-2 ring-4 ring-offset-4 ring-offset-base-200 dark:ring-offset-dark-base-200 ${colorStyles[color].ring}`
        : 'border-2 border-base-300 dark:border-dark-base-300 hover:border-base-content/50 dark:hover:border-dark-base-content/50';

    return (
        <button 
            onClick={onClick}
            className={`w-full md:max-w-sm p-6 flex flex-col items-center justify-center text-center bg-base-100 dark:bg-dark-base-100 rounded-2xl shadow-lg transition-all duration-300 ${selectedClasses}`}
        >
            <div className={`mb-4 ${isSelected ? colorStyles[color].text : 'text-base-content/80 dark:text-dark-base-content/80'}`}>{icon}</div>
            <h2 className="text-xl font-bold mb-2">{title}</h2>
            <p className="text-base-content/70 dark:text-dark-base-content/70">{description}</p>
        </button>
    )
};

export default ModeSelectScreen;
