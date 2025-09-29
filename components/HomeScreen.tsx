
import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { AppMode } from '../types';
import type { User, Listing, BuyingGuide, Review, ChatMessage, SavedSearch } from '../types';
import PostItemFlow from './PostItemFlow';
import { generateSearchSuggestions, generateBuyingGuide } from '../services/geminiService';
import Spinner from './common/Spinner';
import VisualSearchModal from './VisualSearchModal';
import GoMarketLogo from './common/GoMarketLogo';
import UserMenu from './common/UserMenu';
import { useSettings } from '../contexts/SettingsContext';
import SellerVerificationInfoModal from './SellerVerificationInfoModal';
import IdVerificationModal from './FaceVerificationModal';
import Advertisement, { AdType } from './common/Advertisement';
import FloatingAssistant from './FloatingAssistant';
import LocationSelectModal from './common/LocationSelectModal';
import ListingCard, { BookmarkIcon } from './common/ListingCard';

const ShieldCheckIcon: React.FC<{ className?: string, title?: string }> = ({ className, title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-label={title}>
        <title>{title}</title>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" />
    </svg>
);

const MailIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
);


const Header: React.FC<{
    user: User;
    mode: AppMode;
    onSellClick: () => void;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    suggestions: string[];
    isSuggestionsLoading: boolean;
    onSuggestionClick: (suggestion: string) => void;
    onVisualSearchClick: () => void;
    onNavigateToSettings: () => void;
    onNavigateToSaved: () => void;
    onNavigateToInbox: () => void;
    browsingLocation: string;
    onLocationClick: () => void;
    onLogout: () => void;
    onLogoClick: () => void;
    onVerifySellerClick: () => void;
    unreadCount: number;
}> = ({ user, mode, onSellClick, searchTerm, onSearchChange, suggestions, isSuggestionsLoading, onSuggestionClick, onVisualSearchClick, onNavigateToSettings, onNavigateToSaved, onNavigateToInbox, browsingLocation, onLocationClick, onLogout, onLogoClick, onVerifySellerClick, unreadCount }) => (
    <header className="bg-base-100/80 dark:bg-dark-base-200/80 backdrop-blur-md sticky top-0 z-20 shadow-md p-4 animate-fade-in">
        <div className="container mx-auto">
            <div className="flex items-center justify-between gap-4">
                <GoMarketLogo iconSize={32} textSize="text-2xl" direction="row" onClick={onLogoClick} />
                <div className="flex-1 max-w-xl relative">
                    <input
                        type="search"
                        placeholder="Search for anything..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full px-4 py-2 rounded-full bg-base-200 dark:bg-dark-base-100 border border-transparent focus:outline-none focus:ring-2 focus:ring-primary transition-all pr-20"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                        {isSuggestionsLoading && (
                            <Spinner size="sm" />
                        )}
                        <button 
                            onClick={onVisualSearchClick}
                            className="text-base-content/60 dark:text-dark-base-content/60 hover:text-base-content dark:hover:text-dark-base-content transition-colors"
                            aria-label="Search by image"
                            title="Search by image"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                    </div>
                    {suggestions.length > 0 && !isSuggestionsLoading && (
                        <div className="absolute top-full mt-2 w-full bg-base-200 dark:bg-dark-base-300 rounded-lg shadow-lg z-30 animate-fade-in p-2">
                            <ul role="listbox">
                                {suggestions.map((s, i) => (
                                    <li key={i}
                                        onClick={() => onSuggestionClick(s)}
                                        className="px-4 py-2 hover:bg-primary/20 rounded-md cursor-pointer transition-colors duration-150"
                                        role="option"
                                        aria-selected="false"
                                    >
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {mode === AppMode.SELL && (
                        <button 
                            onClick={onSellClick}
                            className="bg-secondary hover:bg-secondary-focus text-secondary-content font-bold py-2 px-5 rounded-full transition-colors flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Sell
                        </button>
                    )}
                     <button
                        onClick={onNavigateToInbox}
                        className="relative text-base-content/60 dark:text-dark-base-content/60 hover:text-primary transition-colors p-2 rounded-full"
                        aria-label={`View Inbox${unreadCount > 0 ? ` (${unreadCount} unread messages)` : ''}`}
                        title="View Inbox"
                    >
                        <MailIcon className="w-7 h-7" />
                        {unreadCount > 0 && (
                             <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-600 text-white text-xs font-bold ring-2 ring-base-100 dark:ring-dark-base-100 flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={onVerifySellerClick}
                        className="text-base-content/60 dark:text-dark-base-content/60 hover:text-primary transition-colors p-2 rounded-full"
                        aria-label="Verify a Seller's Identity"
                        title="Verify a Seller's Identity"
                    >
                        <ShieldCheckIcon className="w-7 h-7" />
                    </button>
                    <button
                        onClick={onNavigateToSaved}
                        className="text-base-content/60 dark:text-dark-base-content/60 hover:text-primary transition-colors p-2 rounded-full"
                        aria-label="View saved items"
                        title="View saved items"
                    >
                        <BookmarkIcon className="w-7 h-7" />
                    </button>
                    <UserMenu user={user} onSettings={onNavigateToSettings} onLogout={onLogout} />
                </div>
            </div>
             {browsingLocation && (
                <div className="mt-2 text-center sm:text-left">
                    <button onClick={onLocationClick} className="text-xs text-base-content/70 dark:text-dark-base-content/70 hover:text-primary transition-colors flex items-center gap-1 mx-auto sm:mx-0 rounded-md p-1">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                        <span>
                            {browsingLocation === 'All Locations'
                                ? 'Showing listings from All Locations'
                                : <>Showing listings near <strong>{browsingLocation}</strong></>
                            }. Change?
                        </span>
                    </button>
                </div>
            )}
        </div>
    </header>
);

const BuyingGuideCard: React.FC<{ guide: BuyingGuide; searchTerm: string }> = ({ guide, searchTerm }) => (
    <div className="bg-base-200 dark:bg-dark-base-200 rounded-lg p-6 shadow-lg border-l-4 border-secondary animate-fade-in">
        <h3 className="text-xl font-bold flex items-center gap-3">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>AI Buying Guide for "{searchTerm}"</span>
        </h3>
        <p className="mt-3 text-base-content/80 dark:text-dark-base-content/80 whitespace-pre-wrap">{guide.guide}</p>
        {guide.sources.length > 0 && (
             <div className="mt-4">
                <h4 className="text-sm font-semibold text-base-content/70 dark:text-dark-base-content/70">Sources from the web:</h4>
                <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                    {guide.sources.map((source, index) => (
                        <li key={index}>
                            <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline">
                                {source.title || source.uri}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        )}
    </div>
);

const VerificationPromptModal: React.FC<{
    onClose: () => void;
    onGoToSettings: () => void;
}> = ({ onClose, onGoToSettings }) => (
    <div 
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" 
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="verification-prompt-title"
    >
        <div 
            className="bg-base-100 dark:bg-dark-base-100 rounded-2xl shadow-2xl w-full max-w-md p-8 text-center animate-slide-in-up" 
            onClick={(e) => e.stopPropagation()}
        >
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-warning/20 text-warning mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h2 id="verification-prompt-title" className="text-2xl font-bold mb-2">Verification Required to Sell</h2>
            <p className="text-base-content/70 dark:text-dark-base-content/70 mb-6">
                For the safety of our community, only verified users can post items for sale. Please complete your profile verification to get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
                <button 
                    onClick={onClose} 
                    className="flex-1 bg-base-200 dark:bg-dark-base-200 text-base-content dark:text-dark-base-content font-bold py-3 px-5 rounded-lg hover:bg-base-300 dark:hover:bg-dark-base-300 transition-colors"
                >
                    Maybe Later
                </button>
                <button 
                    onClick={onGoToSettings}
                    className="flex-1 bg-accent hover:bg-accent-focus text-white font-bold py-3 px-5 rounded-lg transition-colors"
                >
                    Go to Verification
                </button>
            </div>
        </div>
    </div>
);


interface HomeScreenProps {
  user: User;
  initialMode: AppMode;
  listings: Listing[];
  savedListingIds: Set<string>;
  onToggleSave: (listingId: string) => void;
  onPostItem: (newListingData: Omit<Listing, 'id' | 'seller' | 'status'>) => void;
  onNavigateToSettings: () => void;
  onNavigateToSavedListings: () => void;
  onNavigateToInbox: () => void;
  onLogout: () => void;
  onNavigateToProfile: (user: User) => void;
  onUserUpdate: (user: User) => void;
  onSelectListing: (listing: Listing) => void;
  unreadCount: number;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ 
    user, 
    initialMode, 
    listings,
    savedListingIds,
    onToggleSave,
    onPostItem,
    onNavigateToSettings, 
    onNavigateToSavedListings,
    onNavigateToInbox,
    onLogout, 
    onNavigateToProfile, 
    onUserUpdate,
    onSelectListing,
    unreadCount
}) => {
    const [isPosting, setIsPosting] = useState(() => {
        if (initialMode === AppMode.SELL && user.status !== 'verified') {
            return false;
        }
        return initialMode === AppMode.SELL;
    });

    const [searchTerm, setSearchTerm] = useState('');
    
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
    const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
    const debounceTimeoutRef = useRef<number | null>(null);
    const [activeListing, setActiveListing] = useState<Listing | null>(null);

    const [buyingGuide, setBuyingGuide] = useState<BuyingGuide | null>(null);
    const [isGuideLoading, setIsGuideLoading] = useState(false);
    
    const [isVerificationPromptOpen, setIsVerificationPromptOpen] = useState(false);

    // State for header-initiated verification
    const [isVerificationInfoModalOpen, setIsVerificationInfoModalOpen] = useState(false);
    const [sellerToVerify, setSellerToVerify] = useState<User | null>(null);

    const [homeScreenAds] = useState<AdType[]>(['mtn', 'takealot', 'vodacom', 'shoprite', 'picknpay']);

    // State for Saved Searches
    const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);
    const saveSuccessTimeoutRef = useRef<number | null>(null);

    // State for Location Modal and browsing location
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [browsingLocation, setBrowsingLocation] = useState(user.location || 'All Locations');

    // Load saved searches from local storage on mount
    useEffect(() => {
        const storedSearches = localStorage.getItem('gomarket_saved_searches');
        if (storedSearches) {
            setSavedSearches(JSON.parse(storedSearches));
        }
    }, []);

    // Check if user selected Sell mode while unverified
    useEffect(() => {
        if (initialMode === AppMode.SELL && user.status !== 'verified') {
            setIsVerificationPromptOpen(true);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialMode, user.status]);

    // Effect to check for deep links and applied searches from settings
    useEffect(() => {
        // Check for search term applied from settings
        const termToApply = localStorage.getItem('gomarket_apply_search');
        if (termToApply) {
            handleSearchChange(termToApply);
            localStorage.removeItem('gomarket_apply_search');
            return; // Prioritize applied search over deep link
        }
        
        // Check for deep-linked listing ID
        const urlParams = new URLSearchParams(window.location.search);
        const listingId = urlParams.get('listingId');
        if (listingId) {
            const listingToShow = listings.find(l => l.id === listingId);
            if (listingToShow) {
                onSelectListing(listingToShow);
                // Clean up the URL to prevent re-triggering on refresh
                const newUrl = window.location.pathname;
                window.history.replaceState({}, '', newUrl);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount to handle deep links & applied searches

    const handleLogoClick = useCallback(() => {
        setSearchTerm('');
        setSuggestions([]);
        setBuyingGuide(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleSearchChange = useCallback((term: string) => {
        setSearchTerm(term);

        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        if (term.trim().length < 3) {
            setSuggestions([]);
            setBuyingGuide(null);
            return;
        }
        
        setIsSuggestionsLoading(true);
        setIsGuideLoading(true);

        debounceTimeoutRef.current = window.setTimeout(async () => {
            try {
                const [suggestionsResult, guideResult] = await Promise.all([
                    generateSearchSuggestions(term),
                    generateBuyingGuide(term)
                ]);
                setSuggestions(suggestionsResult);
                setBuyingGuide(guideResult);
            } catch (error) {
                console.error("Failed to fetch search data:", error);
                setSuggestions([]);
                setBuyingGuide(null);
            } finally {
                setIsSuggestionsLoading(false);
                setIsGuideLoading(false);
            }
        }, 700); // 700ms delay
    }, []);
    
    const handleSaveSearch = useCallback(() => {
        if (searchTerm.trim() === '') return;
        
        const isAlreadySaved = savedSearches.some(s => s.term.toLowerCase() === searchTerm.toLowerCase());
        if (isAlreadySaved) return;

        const newSearch: SavedSearch = {
            id: Date.now().toString(),
            term: searchTerm.trim(),
            createdAt: new Date().toISOString()
        };

        const updatedSearches = [newSearch, ...savedSearches];
        setSavedSearches(updatedSearches);
        localStorage.setItem('gomarket_saved_searches', JSON.stringify(updatedSearches));

        setShowSaveSuccess(true);
        if (saveSuccessTimeoutRef.current) clearTimeout(saveSuccessTimeoutRef.current);
        saveSuccessTimeoutRef.current = window.setTimeout(() => setShowSaveSuccess(false), 3000);

    }, [searchTerm, savedSearches]);

    const isCurrentSearchSaved = useMemo(() => {
        return savedSearches.some(s => s.term.toLowerCase() === searchTerm.toLowerCase());
    }, [searchTerm, savedSearches]);


    const handleSuggestionClick = (suggestion: string) => {
        setSearchTerm(suggestion);
        setSuggestions([]);
    };

    const filteredListings = useMemo(() => {
        // 1. Filter by search term
        const searchFiltered = listings.filter(listing => 
            listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            listing.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    
        // 2. Filter by browsing location
        if (browsingLocation && browsingLocation !== 'All Locations') {
            const browsingCity = browsingLocation.split(',')[0].trim().toLowerCase();
            return searchFiltered.filter(listing => {
                if (!listing.sellerAddress) return false;
                const sellerCity = listing.sellerAddress.split(',')[0].trim().toLowerCase();
                return browsingCity === sellerCity;
            });
        }
    
        // 3. For "All Locations", sort by local (relative to user's PROFILE location)
        if (!user.location) {
            return searchFiltered; // No profile location, so no special sorting.
        }
    
        const userProfileCity = user.location.split(',')[0].trim().toLowerCase();
    
        return [...searchFiltered].sort((a, b) => {
            const aCity = a.sellerAddress ? a.sellerAddress.split(',')[0].trim().toLowerCase() : '';
            const bCity = b.sellerAddress ? b.sellerAddress.split(',')[0].trim().toLowerCase() : '';
    
            const aIsLocal = aCity === userProfileCity;
            const bIsLocal = bCity === userProfileCity;
    
            if (aIsLocal && !bIsLocal) return -1;
            if (!aIsLocal && bIsLocal) return 1;
            return 0; // Maintain original relative order otherwise
        });
    }, [listings, searchTerm, browsingLocation, user.location]);
    
    const handlePostAndClose = (newListingData: Omit<Listing, 'id' | 'seller' | 'status'>) => {
        onPostItem(newListingData);
        setIsPosting(false);
    };

    const handleSearchTermFound = (term: string) => {
        setSearchTerm(term);
        setSuggestions([]);
        setIsVisualSearchOpen(false);
        handleSearchChange(term); // Trigger full search with guide
    };
    
    const handleSellClick = () => {
        if (user.status !== 'verified') {
            setIsVerificationPromptOpen(true);
        } else {
            setIsPosting(true);
        }
    };

    const handleNavigateToSettingsFromPrompt = () => {
        setIsVerificationPromptOpen(false);
        onNavigateToSettings();
    };

    const handleFindSellerToVerify = (seller: User) => {
        setIsVerificationInfoModalOpen(false);
        setSellerToVerify(seller);
    };

    const handleLocationSelect = (newLocation: string) => {
        setBrowsingLocation(newLocation);
        setIsLocationModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-base-100 dark:bg-dark-base-100">
            <Header 
                user={user} 
                mode={initialMode}
                onSellClick={handleSellClick} 
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                suggestions={suggestions}
                isSuggestionsLoading={isSuggestionsLoading}
                onSuggestionClick={handleSuggestionClick}
                onVisualSearchClick={() => setIsVisualSearchOpen(true)}
                onNavigateToSettings={onNavigateToSettings}
                onNavigateToSaved={onNavigateToSavedListings}
                onNavigateToInbox={onNavigateToInbox}
                browsingLocation={browsingLocation}
                onLocationClick={() => setIsLocationModalOpen(true)}
                onLogout={onLogout}
                onLogoClick={handleLogoClick}
                onVerifySellerClick={() => setIsVerificationInfoModalOpen(true)}
                unreadCount={unreadCount}
            />
            
             {showSaveSuccess && (
                 <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-slide-in-up">
                    <div className="flex items-center gap-2 p-3 rounded-full shadow-lg bg-success text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        <p className="font-semibold text-sm">Search saved!</p>
                    </div>
                </div>
             )}


            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="space-y-8 animate-slide-in-up">
                    {isGuideLoading && (
                        <div className="bg-base-200 dark:bg-dark-base-200 rounded-lg p-6 shadow-lg animate-pulse h-40">
                            <div className="h-6 bg-base-300 dark:bg-dark-base-300 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-base-300 dark:bg-dark-base-300 rounded w-full mb-2"></div>
                            <div className="h-4 bg-base-300 dark:bg-dark-base-300 rounded w-5/6"></div>
                        </div>
                    )}
                    {buyingGuide && !isGuideLoading && (
                        <BuyingGuideCard guide={buyingGuide} searchTerm={searchTerm} />
                    )}

                    {!searchTerm && (
                        <Advertisement type={homeScreenAds} />
                    )}

                    {searchTerm && (
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold">Results for "{searchTerm}"</h2>
                            <button 
                                onClick={handleSaveSearch} 
                                disabled={isCurrentSearchSaved}
                                className="flex items-center gap-2 text-sm font-semibold py-2 px-4 rounded-full transition-colors disabled:cursor-not-allowed text-primary bg-primary/10 hover:bg-primary/20 disabled:text-base-content/50 dark:disabled:text-dark-base-content/50 disabled:bg-base-200 dark:disabled:bg-dark-base-300"
                            >
                                <BookmarkIcon className="w-5 h-5" solid={isCurrentSearchSaved} />
                                {isCurrentSearchSaved ? 'Saved' : 'Save Search'}
                            </button>
                        </div>
                    )}
                    
                    <div className="flex flex-wrap justify-center gap-6">
                        {filteredListings.map(listing => (
                            <ListingCard 
                                key={listing.id} 
                                listing={listing} 
                                onClick={() => {
                                    onSelectListing(listing);
                                    setActiveListing(listing); // For floating assistant context
                                }} 
                                currentUser={user}
                                isSaved={savedListingIds.has(listing.id)}
                                onToggleSave={() => onToggleSave(listing.id)}
                            />
                        ))}
                    </div>
                </div>
            </main>

            {isVerificationPromptOpen && (
                <VerificationPromptModal
                    onClose={() => setIsVerificationPromptOpen(false)}
                    onGoToSettings={handleNavigateToSettingsFromPrompt}
                />
            )}

            {isPosting && (
                <PostItemFlow
                    onClose={() => setIsPosting(false)}
                    onPost={handlePostAndClose}
                />
            )}

            {isVisualSearchOpen && (
                <VisualSearchModal
                    onClose={() => setIsVisualSearchOpen(false)}
                    onSearchTermFound={handleSearchTermFound}
                />
            )}

            {isVerificationInfoModalOpen && (
                <SellerVerificationInfoModal
                    listings={listings}
                    onClose={() => setIsVerificationInfoModalOpen(false)}
                    onFindSeller={handleFindSellerToVerify}
                />
            )}
            
            {sellerToVerify && (
                <IdVerificationModal
                    seller={sellerToVerify}
                    onClose={() => setSellerToVerify(null)}
                    onVerificationSuccess={() => {
                        alert(`Successfully verified you've met ${sellerToVerify.username}!`);
                        setSellerToVerify(null);
                    }}
                />
            )}

             {isLocationModalOpen && (
                <LocationSelectModal
                    currentLocation={browsingLocation}
                    onClose={() => setIsLocationModalOpen(false)}
                    onLocationSelect={handleLocationSelect}
                />
            )}

            <FloatingAssistant 
                user={user}
                searchTerm={searchTerm}
                activeListing={activeListing}
            />
        </div>
    );
};

export default HomeScreen;
