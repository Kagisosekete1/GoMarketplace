import React, { useState, useMemo } from 'react';

const ALL_LOCATIONS = [
    // South Africa (All 9 Provinces represented)
    'Bloemfontein, FS',
    'Cape Town, WC',
    'Durban, KZN',
    'East London, EC',
    'Johannesburg, GP',
    'Kimberley, NC',
    'Mahikeng, NW',
    'Nelspruit, MP',
    'Polokwane, LP',
    'Port Elizabeth, EC',
    'Pretoria, GP',
    'Rustenburg, NW',
    'Stellenbosch, WC',
    // Southern African Countries
    'Gaborone, Botswana',
    'Harare, Zimbabwe',
    'Lusaka, Zambia',
    'Maputo, Mozambique',
    'Maseru, Lesotho',
    'Windhoek, Namibia',
    // Other Major African Cities
    'Lagos, NG',
    'Nairobi, KE',
].sort();

interface LocationSelectModalProps {
    currentLocation: string;
    onClose: () => void;
    onLocationSelect: (location: string) => void;
}

const LocationSelectModal: React.FC<LocationSelectModalProps> = ({ currentLocation, onClose, onLocationSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLocations = useMemo(() => {
        const baseLocations = ['All Locations', ...ALL_LOCATIONS];
        if (!searchTerm.trim()) {
            return baseLocations;
        }
        return baseLocations.filter(loc =>
            loc.toLowerCase().includes(searchTerm.trim().toLowerCase())
        );
    }, [searchTerm]);

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" 
            onClick={onClose} 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="location-modal-title"
        >
            <div 
                className="bg-base-100 dark:bg-dark-base-100 rounded-2xl shadow-2xl w-full max-w-md h-[70vh] flex flex-col animate-slide-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-4 border-b border-base-300 dark:border-dark-base-300 flex justify-between items-center flex-shrink-0">
                    <h2 id="location-modal-title" className="text-xl font-bold">Change Location</h2>
                    <button onClick={onClose} aria-label="Close" className="text-base-content/50 dark:text-dark-base-content/50 hover:text-base-content dark:hover:text-dark-base-content text-3xl leading-none">&times;</button>
                </header>

                <div className="p-4 flex-shrink-0">
                    <div className="relative">
                        <input
                            type="search"
                            placeholder="Search for a city..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 pl-10 bg-base-200 dark:bg-dark-base-200 border border-base-300 dark:border-dark-base-300 rounded-lg text-base-content dark:text-dark-base-content focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50 dark:text-dark-base-content/50">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>

                <main className="flex-1 overflow-y-auto">
                    <ul role="listbox">
                        {filteredLocations.map(location => (
                            <li key={location}>
                                <button
                                    onClick={() => onLocationSelect(location)}
                                    className={`w-full text-left px-6 py-3 transition-colors ${
                                        location === currentLocation 
                                        ? 'bg-primary/20 text-primary font-semibold' 
                                        : 'hover:bg-base-200 dark:hover:bg-dark-base-200'
                                    }`}
                                    role="option"
                                    aria-selected={location === currentLocation}
                                >
                                    {location}
                                </button>
                            </li>
                        ))}
                        {filteredLocations.length === 0 && (
                            <li className="text-center p-6 text-base-content/70 dark:text-dark-base-content/70">
                                No locations found.
                            </li>
                        )}
                    </ul>
                </main>
            </div>
        </div>
    );
};

export default LocationSelectModal;