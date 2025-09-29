import React, { useMemo } from 'react';
import type { Listing, User } from '../../types';
import { useSettings, formatCurrency } from '../../contexts/SettingsContext';
import StarRating from './StarRating';

export const BookmarkIcon: React.FC<{ className?: string, solid?: boolean }> = ({ className, solid }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill={solid ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.5 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
    </svg>
);

const ShieldCheckIcon: React.FC<{ className?: string, title?: string }> = ({ className, title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-label={title}>
        <title>{title}</title>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" />
    </svg>
);

const getSellerRating = (seller: User): { average: number; count: number } => {
    if (!seller.reviews || seller.reviews.length === 0) {
        return { average: 0, count: 0 };
    }
    const total = seller.reviews.reduce((acc, review) => acc + review.rating, 0);
    return {
        average: total / seller.reviews.length,
        count: seller.reviews.length,
    };
};

interface ListingCardProps {
    listing: Listing;
    onClick: () => void;
    currentUser: User;
    isSaved: boolean;
    onToggleSave: () => void;
}

const PLACEHOLDER_IMAGE_URL = 'https://placehold.co/400x300/e5e7eb/a0aec0?text=No+Image';

const ListingCard: React.FC<ListingCardProps> = ({ listing, onClick, currentUser, isSaved, onToggleSave }) => {
    const { currency } = useSettings();
    const isSold = listing.status === 'sold';
    const isPending = listing.status === 'pending';
    const rating = getSellerRating(listing.seller);
    
    const primaryImageUrl = listing.imageUrls?.[0] || PLACEHOLDER_IMAGE_URL;

    const isLocal = useMemo(() => {
        if (!currentUser.location || !listing.sellerAddress) return false;
        const userCity = currentUser.location.split(',')[0].trim().toLowerCase();
        const sellerCity = listing.sellerAddress.split(',')[0].trim().toLowerCase();
        return userCity === sellerCity;
    }, [currentUser.location, listing.sellerAddress]);

    const containerClasses = isSold
        ? 'opacity-60 saturate-50'
        : isPending
        ? 'opacity-80'
        : 'transform hover:-translate-y-1 cursor-pointer';

    const handleToggleSave = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleSave();
    };

    return (
        <div 
            className={`bg-base-200 dark:bg-dark-base-200 rounded-lg overflow-hidden shadow-lg transition-all duration-300 w-80 group ${containerClasses}`}
            onClick={onClick}
            role={"button"}
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
            aria-disabled={isSold || isPending}
        >
            <div className="relative">
                {listing.videoUrl ? (
                    <video 
                        src={listing.videoUrl} 
                        className="w-full h-48 object-cover" 
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                        aria-label={`${listing.title} promo video`}
                    />
                ) : (
                    <img src={primaryImageUrl} alt={listing.title} className="w-full h-48 object-cover" />
                )}
                {isSold && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-bold text-2xl tracking-widest uppercase transform -rotate-12 border-4 border-white px-4 py-2 rounded-lg">Sold</span>
                    </div>
                )}
                {isPending && (
                     <div className="absolute inset-0 bg-amber-500/70 flex items-center justify-center">
                        <span className="text-white font-bold text-2xl tracking-widest uppercase">Pending</span>
                    </div>
                )}
                {!isSold && !isPending && (
                    <>
                        <button 
                            onClick={handleToggleSave}
                            className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 ${isSaved ? 'bg-primary/80 text-white' : 'bg-black/40 text-white/80 hover:bg-black/60'}`}
                            aria-label={isSaved ? 'Unsave item' : 'Save item'}
                        >
                            <BookmarkIcon className="w-6 h-6" solid={isSaved} />
                        </button>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <span className="text-white font-bold py-2 px-4 rounded-full bg-primary/90 text-sm">View Details</span>
                        </div>
                    </>
                )}
            </div>
            <div className="p-4">
                 <div className="flex justify-between items-center mb-1">
                    {listing.category && (
                        <p className="text-xs font-semibold text-secondary uppercase tracking-wider">{listing.category}</p>
                    )}
                    {isLocal && !isSold && !isPending && (
                         <div className="flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-2 py-0.5 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                            <span>Local</span>
                        </div>
                    )}
                </div>
                <h3 className="font-bold text-lg truncate">{listing.title}</h3>
                <p className={`text-xl font-semibold mt-1 ${isSold || isPending ? 'text-base-content/50 dark:text-dark-base-content/50 line-through' : 'text-primary'}`}>{formatCurrency(listing.price, currency)}</p>
                <div className="flex items-center mt-3 text-sm text-base-content/70 dark:text-dark-base-content/70">
                    <img src={listing.seller.avatarUrl} alt={listing.seller.username} className="w-6 h-6 rounded-full mr-2" />
                    <div className="flex items-center gap-1">
                        <span>{listing.seller.username}</span>
                        {listing.seller.status === 'verified' && (
                            <ShieldCheckIcon className="w-4 h-4 text-success" title="Verified Seller" />
                        )}
                    </div>
                    {rating.count > 0 && (
                        <div className="flex items-center ml-auto text-xs gap-1">
                            <StarRating rating={rating.average} size="xs" />
                            <span>({rating.count})</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListingCard;