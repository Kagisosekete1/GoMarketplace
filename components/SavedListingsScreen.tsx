import React, { useMemo } from 'react';
import type { User, Listing } from '../types';
import ListingCard from './common/ListingCard';

interface SavedListingsScreenProps {
    user: User;
    listings: Listing[];
    savedListingIds: Set<string>;
    onToggleSave: (listingId: string) => void;
    onBack: () => void;
    onSelectListing: (listing: Listing) => void;
}

const SavedListingsScreen: React.FC<SavedListingsScreenProps> = ({
    user,
    listings,
    savedListingIds,
    onToggleSave,
    onBack,
    onSelectListing
}) => {
    const savedListings = useMemo(() => {
        return listings.filter(listing => savedListingIds.has(listing.id));
    }, [listings, savedListingIds]);

    return (
        <div className="min-h-screen bg-base-200 dark:bg-dark-base-200 animate-fade-in">
            <header className="bg-base-100 dark:bg-dark-base-100 shadow-md sticky top-0 z-10">
                <div className="container mx-auto p-4 flex items-center">
                    <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-base-200 dark:hover:bg-dark-base-300 transition-colors" aria-label="Go back">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-2xl font-bold">Saved Items</h1>
                </div>
            </header>
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                {savedListings.length > 0 ? (
                    <div className="flex flex-wrap justify-center gap-6">
                        {savedListings.map(listing => (
                            <ListingCard
                                key={listing.id}
                                listing={listing}
                                onClick={() => onSelectListing(listing)}
                                currentUser={user}
                                isSaved={savedListingIds.has(listing.id)}
                                onToggleSave={() => onToggleSave(listing.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-base-content/30 dark:text-dark-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.5 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                        </svg>
                        <h2 className="mt-4 text-2xl font-bold">No Saved Items Yet</h2>
                        <p className="mt-2 text-base-content/70 dark:text-dark-base-content/70">
                            Tap the bookmark icon on any listing to save it for later.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default SavedListingsScreen;