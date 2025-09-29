

import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { User, SavedSearch, Listing } from '../types';
import { useSettings, Currency } from '../contexts/SettingsContext';
import Spinner from './common/Spinner';
import ListingCard from './common/ListingCard';

const CreditCardIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
);

const HomeIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const UploadFileIcon = ({ className }: { className: string }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const EditIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
    </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);


interface FileUploadItemProps {
    icon: React.ReactNode;
    title: string;
    file: File | null;
    onFileSelect: (file: File) => void;
    id: string;
}

const FileUploadItem: React.FC<FileUploadItemProps> = ({ icon, title, file, onFileSelect, id }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <div className="flex items-center justify-between p-4 bg-base-200 dark:bg-dark-base-200 rounded-lg">
            <div className="flex items-center">
                <div className="mr-4 text-base-content/70 dark:text-dark-base-content/70">{icon}</div>
                <div>
                    <p className="font-semibold">{title}</p>
                    <p className={`text-sm ${file ? 'text-success' : 'text-base-content/60 dark:text-dark-base-content/60'}`}>
                        {file ? `${file.name.substring(0, 20)}... ✅` : 'Not uploaded'}
                    </p>
                </div>
            </div>
            <input type="file" id={id} ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf" />
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-full hover:bg-base-300 dark:hover:bg-dark-base-300 transition-colors"
                aria-label={`Upload ${title}`}
            >
                <UploadFileIcon className="w-6 h-6" />
            </button>
        </div>
    );
};

interface VerificationSectionProps {
    user: User;
    onUserUpdate: (user: User) => void;
}

const VerificationSection: React.FC<VerificationSectionProps> = ({ user, onUserUpdate }) => {
    const [idFile, setIdFile] = useState<File | null>(null);
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!idFile || !proofFile) {
            setError("Please upload both documents to proceed.");
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            const updatedUser = { ...user, status: 'pending_verification' as const };
            onUserUpdate(updatedUser);
            setIsLoading(false);
        }, 1500);
    };

    const handleForceVerify = () => {
        const updatedUser = { ...user, status: 'verified' as const };
        onUserUpdate(updatedUser);
    };

    if (user.status === 'verified') {
        return (
            <div>
                <div className="bg-success/20 text-success-content p-4 rounded-lg flex items-center gap-3 font-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Your account is verified.</span>
                </div>
                <p className="text-sm mt-4 text-base-content/70 dark:text-dark-base-content/70">
                    To change your identity documents, please contact support.
                </p>
            </div>
        );
    }

    if (user.status === 'pending_verification') {
        return (
            <div className="text-center p-4 bg-base-200 dark:bg-dark-base-200 rounded-lg">
                <Spinner text="Verification in progress..." />
                <p className="text-sm text-base-content/70 dark:text-dark-base-content/70 mt-4">
                    Your documents are under review. This usually takes 24-48 hours.
                </p>
                <button onClick={handleForceVerify} className="mt-4 bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">
                    (Demo) Force Verify
                </button>
            </div>
        );
    }
    
    // Status is 'unverified'
    return (
        <div>
            <p className="text-base-content/70 dark:text-dark-base-content/70 mb-4">
                To ensure a safe marketplace, please verify your identity to enable buying and selling. Your data is kept private and secure.
            </p>
            <form className="space-y-4" onSubmit={handleSubmit}>
                <FileUploadItem 
                    id="id-file-upload"
                    icon={<CreditCardIcon className="w-8 h-8"/>} 
                    title="Upload ID Document"
                    file={idFile}
                    onFileSelect={setIdFile}
                />
                <FileUploadItem 
                    id="proof-file-upload"
                    icon={<HomeIcon className="w-8 h-8"/>} 
                    title="Upload Proof of Address"
                    file={proofFile}
                    onFileSelect={setProofFile}
                />
                {error && <p className="text-sm text-center text-error pt-2">{error}</p>}
                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent hover:bg-accent-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-focus disabled:bg-base-300 dark:disabled:bg-dark-base-300 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? <Spinner size="sm" /> : 'Submit for Verification'}
                    </button>
                </div>
            </form>
        </div>
    );
};


interface SettingsScreenProps {
    user: User;
    onUserUpdate: (user: User) => void;
    onLogout: () => void;
    onBack: () => void;
    onNavigateToSubscription: () => void;
    listings: Listing[];
    savedListingIds: Set<string>;
    onSelectListing: (listing: Listing) => void;
    onToggleSave: (listingId: string) => void;
}

type ListingStatusTab = 'available' | 'pending' | 'sold';

const SettingsScreen: React.FC<SettingsScreenProps> = ({ 
    user, 
    onUserUpdate, 
    onLogout, 
    onBack, 
    onNavigateToSubscription,
    listings,
    savedListingIds,
    onSelectListing,
    onToggleSave,
}) => {
    const { theme, setTheme, currency, setCurrency, notifications, setNotifications } = useSettings();
    const currencies: Currency[] = ["Auto", "USD", "EUR", "GBP", "ZAR", "NGN"];
    
    const [name, setName] = useState(user.name);
    const [location, setLocation] = useState(user.location || '');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewAvatarUrl, setPreviewAvatarUrl] = useState(user.avatarUrl);
    const [isSaving, setIsSaving] = useState(false);
    
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
    
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

    const [isViewingMyListings, setIsViewingMyListings] = useState(false);
    const [activeTab, setActiveTab] = useState<ListingStatusTab>('available');

    const myListings = useMemo(() => {
        return listings.filter(listing => listing.seller.username === user.username);
    }, [listings, user.username]);

    const filteredListings = useMemo(() => {
        return myListings.filter(listing => listing.status === activeTab);
    }, [myListings, activeTab]);

    useEffect(() => {
        const storedSearches = localStorage.getItem('gomarket_saved_searches');
        if (storedSearches) {
            setSavedSearches(JSON.parse(storedSearches));
        }
    }, []);
    
    const hasChanges = name.trim() !== user.name || avatarFile !== null || location.trim() !== (user.location || '');

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            if (previewAvatarUrl && previewAvatarUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewAvatarUrl);
            }
            setPreviewAvatarUrl(URL.createObjectURL(file));
        }
    };

    const handleSaveChanges = () => {
        if (name.trim() === '') return;
        setIsSaving(true);
        // In a real app, you would upload avatarFile to a server and get a new URL.
        // Here we just use the local blob URL for demonstration.
        setTimeout(() => {
            const updatedUser = {
                ...user,
                name: name.trim(),
                location: location.trim(),
                avatarUrl: previewAvatarUrl,
            };
            onUserUpdate(updatedUser);
            setIsSaving(false);
            setAvatarFile(null); // Reset file state after saving
        }, 1000);
    };

    const handleDeleteSearch = (id: string) => {
        const updatedSearches = savedSearches.filter(s => s.id !== id);
        setSavedSearches(updatedSearches);
        localStorage.setItem('gomarket_saved_searches', JSON.stringify(updatedSearches));
    };

    const handleApplySearch = (term: string) => {
        localStorage.setItem('gomarket_apply_search', term);
        onBack();
    };

    if (isViewingMyListings) {
        const tabButtonClasses = (tabName: ListingStatusTab) =>
            `w-1/3 py-3 font-semibold transition-colors text-center ${
                activeTab === tabName
                ? 'text-primary border-b-2 border-primary'
                : 'text-base-content/60 dark:text-dark-base-content/60 hover:text-primary/80'
            }`;
        
        const countByStatus = (status: ListingStatusTab) => {
            return myListings.filter(l => l.status === status).length;
        }

        return (
            <div className="min-h-screen bg-base-200 dark:bg-dark-base-200 animate-fade-in">
                <header className="bg-base-100 dark:bg-dark-base-100 shadow-md sticky top-0 z-10">
                    <div className="container mx-auto p-4 flex items-center">
                        <button onClick={() => setIsViewingMyListings(false)} className="mr-4 p-2 rounded-full hover:bg-base-200 dark:hover:bg-dark-base-300 transition-colors" aria-label="Go back to settings">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h1 className="text-2xl font-bold">My Listings</h1>
                    </div>
                </header>
                <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                     {myListings.length > 0 ? (
                        <>
                            <div className="mb-6 border-b border-base-300 dark:border-dark-base-300">
                                <nav className="flex">
                                    <button onClick={() => setActiveTab('available')} className={tabButtonClasses('available')}>
                                        Active ({countByStatus('available')})
                                    </button>
                                    <button onClick={() => setActiveTab('pending')} className={tabButtonClasses('pending')}>
                                        Pending ({countByStatus('pending')})
                                    </button>
                                    <button onClick={() => setActiveTab('sold')} className={tabButtonClasses('sold')}>
                                        Sold ({countByStatus('sold')})
                                    </button>
                                </nav>
                            </div>
                            
                            {filteredListings.length > 0 ? (
                                <div className="flex flex-wrap justify-center gap-6">
                                    {filteredListings.map(listing => (
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
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    <h2 className="mt-4 text-2xl font-bold">No {activeTab} listings</h2>
                                    <p className="mt-2 text-base-content/70 dark:text-dark-base-content/70">
                                        You don't have any listings with this status.
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-20">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-base-content/30 dark:text-dark-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <h2 className="mt-4 text-2xl font-bold">You haven't posted anything yet</h2>
                            <p className="mt-2 text-base-content/70 dark:text-dark-base-content/70">
                                Go to the home screen and tap 'Sell' to create your first listing!
                            </p>
                        </div>
                    )}
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200 dark:bg-dark-base-200 animate-fade-in">
            <header className="bg-base-100 dark:bg-dark-base-100 shadow-md sticky top-0 z-10">
                <div className="container mx-auto p-4 flex items-center">
                    <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-base-200 dark:hover:bg-dark-base-300 transition-colors" aria-label="Go back">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-2xl font-bold">Settings</h1>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8 max-w-2xl">
                <div className="space-y-8">
                    
                    <div className="bg-base-100 dark:bg-dark-base-100 p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">Profile</h3>
                        <div className="flex items-start space-x-4">
                            <div className="relative group shrink-0">
                                <img src={previewAvatarUrl} alt={name} className="w-20 h-20 rounded-full object-cover" />
                                <button
                                    onClick={() => avatarInputRef.current?.click()}
                                    className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label="Change profile picture"
                                >
                                    <EditIcon className="w-8 h-8" />
                                </button>
                                <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                            </div>
                            <div className="flex-1 space-y-3">
                                <div>
                                    <label htmlFor="real-name-input" className="block text-sm font-bold mb-1 text-base-content/80 dark:text-dark-base-content/80">Real Name (for verification)</label>
                                    <input
                                        id="real-name-input"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-3 py-2 bg-base-200 dark:bg-dark-base-200 border border-base-300 dark:border-dark-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                 <div>
                                    <label htmlFor="location-input" className="block text-sm font-bold mb-1 text-base-content/80 dark:text-dark-base-content/80">Your Location</label>
                                    <input
                                        id="location-input"
                                        type="text"
                                        value={location}
                                        placeholder="e.g. Cape Town, WC"
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="w-full px-3 py-2 bg-base-200 dark:bg-dark-base-200 border border-base-300 dark:border-dark-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <p className="text-sm text-base-content/70 dark:text-dark-base-content/70">
                                    Public username: <span className="font-semibold">@{user.username}</span>
                                </p>
                            </div>
                        </div>
                        {hasChanges && (
                            <div className="mt-6 text-right">
                                <button
                                    onClick={handleSaveChanges}
                                    disabled={isSaving || name.trim() === ''}
                                    className="bg-accent hover:bg-accent-focus text-white font-bold py-2 px-5 rounded-lg transition-colors disabled:bg-base-300 dark:disabled:bg-dark-base-300 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? <Spinner size="sm" /> : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="bg-base-100 dark:bg-dark-base-100 p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">Saved Searches</h3>
                        {savedSearches.length > 0 ? (
                            <ul className="divide-y divide-base-200 dark:divide-dark-base-300">
                                {savedSearches.map(search => (
                                    <li key={search.id} className="flex justify-between items-center py-3">
                                        <button 
                                            onClick={() => handleApplySearch(search.term)}
                                            className="text-left hover:text-primary transition-colors truncate pr-4"
                                            title={`Search for "${search.term}"`}
                                        >
                                            <span className="font-semibold">{search.term}</span>
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteSearch(search.id)}
                                            className="p-2 rounded-full text-base-content/50 dark:text-dark-base-content/50 hover:bg-red-500/10 hover:text-error transition-colors"
                                            aria-label={`Delete saved search for "${search.term}"`}
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-base-content/70 dark:text-dark-base-content/70 text-center py-4">You have no saved searches.</p>
                        )}
                    </div>


                    <div className="bg-base-100 dark:bg-dark-base-100 p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">Account Verification</h3>
                        <VerificationSection user={user} onUserUpdate={onUserUpdate} />
                    </div>

                    <div className="bg-base-100 dark:bg-dark-base-100 p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">Seller Tools</h3>
                        <div className="space-y-4">
                            <button
                                onClick={() => setIsViewingMyListings(true)}
                                className="w-full flex justify-between items-center text-left p-4 bg-base-200 dark:bg-dark-base-200 rounded-lg hover:bg-base-300 dark:hover:bg-dark-base-300 transition-colors"
                            >
                                <div>
                                    <p className="font-semibold">My Listings</p>
                                    <p className="text-sm text-base-content/60 dark:text-dark-base-content/60">
                                        View and manage your active and past listings.
                                    </p>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-base-content/60 dark:text-dark-base-content/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                            </button>
                            <div className="flex justify-between items-center p-4 bg-base-200 dark:bg-dark-base-200 rounded-lg">
                                <label htmlFor="ai-reply-toggle" className="cursor-pointer pr-4">
                                    <span className="font-semibold">Enable AI Auto-Reply</span>
                                    <p className="text-sm text-base-content/60 dark:text-dark-base-content/60">
                                        Let Anita provide instant first replies to buyers.
                                    </p>
                                </label>
                                <input
                                    id="ai-reply-toggle"
                                    type="checkbox"
                                    className="toggle"
                                    checked={user.aiAutoReplyEnabled === true}
                                    onChange={(e) => onUserUpdate({ ...user, aiAutoReplyEnabled: e.target.checked })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-base-100 dark:bg-dark-base-100 p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">Subscription & Billing</h3>
                        <div className="flex justify-between items-center p-4 bg-base-200 dark:bg-dark-base-200 rounded-lg">
                           <div>
                                <p className="font-semibold">Current Plan: Free (Starter)</p>
                                <p className="text-sm text-base-content/60 dark:text-dark-base-content/60">
                                    Upgrade to unlock more features.
                                </p>
                            </div>
                            <button
                                onClick={onNavigateToSubscription}
                                className="bg-primary hover:bg-primary-focus text-primary-content font-bold py-2 px-4 rounded-lg transition-colors text-sm whitespace-nowrap"
                            >
                                View Plans
                            </button>
                        </div>
                    </div>
                    
                    <div className="bg-base-100 dark:bg-dark-base-100 rounded-lg shadow">
                        <button 
                            onClick={() => setIsPrivacyModalOpen(true)}
                            className="w-full flex justify-between items-center text-left p-6 hover:bg-base-200/50 dark:hover:bg-dark-base-200/50 transition-colors rounded-lg"
                        >
                            <div>
                                <h3 className="text-lg font-semibold">🔒 Privacy & Security</h3>
                                <p className="text-sm text-base-content/70 dark:text-dark-base-content/70 mt-1">Manage blocked users, account visibility, and security settings.</p>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-base-content/60 dark:text-dark-base-content/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>

                    <div className="bg-base-100 dark:bg-dark-base-100 p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">Preferences</h3>
                        <ul className="divide-y divide-base-200 dark:divide-dark-base-300">
                            <li className="flex justify-between items-center py-4">
                                <label htmlFor="dark-mode-toggle" className="cursor-pointer">Dark Mode</label>
                                <input 
                                    id="dark-mode-toggle"
                                    type="checkbox" 
                                    className="toggle" 
                                    checked={theme === 'dark'} 
                                    onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')} 
                                />
                            </li>
                            <li className="flex justify-between items-center py-4">
                                <label htmlFor="notifications-toggle" className="cursor-pointer">Notifications</label>
                                <input 
                                    id="notifications-toggle"
                                    type="checkbox" 
                                    className="toggle" 
                                    checked={notifications}
                                    onChange={(e) => setNotifications(e.target.checked)}
                                />
                            </li>
                            <li className="flex justify-between items-center py-4">
                                <label htmlFor="currency-select">Preferred Currency</label>
                                <select 
                                    id="currency-select"
                                    value={currency} 
                                    onChange={(e) => setCurrency(e.target.value as Currency)}
                                    className="select select-bordered bg-base-200 dark:bg-dark-base-300 border-base-300 dark:border-dark-base-300"
                                >
                                    {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </li>
                        </ul>
                    </div>

                    <div className="text-center">
                        <button onClick={onLogout} className="btn-error bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                            Logout
                        </button>
                    </div>
                </div>
                 <style>{`
                    .toggle {
                        -webkit-appearance: none;
                        appearance: none;
                        width: 3.5rem;
                        height: 2rem;
                        background-color: #e5e7eb;
                        border-radius: 9999px;
                        position: relative;
                        transition: background-color 0.2s;
                        cursor: pointer;
                        outline: none;
                    }
                    .dark .toggle { background-color: #374151; }
                    .toggle:checked { background-color: #1e40af; }
                    .toggle:focus-visible { box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #1e40af; }
                    .dark .toggle:focus-visible { box-shadow: 0 0 0 2px #111827, 0 0 0 4px #1e40af; }
                    .toggle::before {
                        content: '';
                        position: absolute;
                        top: 0.25rem;
                        left: 0.25rem;
                        width: 1.5rem;
                        height: 1.5rem;
                        background-color: white;
                        border-radius: 9999px;
                        transition: transform 0.2s;
                    }
                    .toggle:checked::before {
                        transform: translateX(1.5rem);
                    }
                    .select {
                        padding: 0.5rem 2.5rem 0.5rem 1rem;
                        border-radius: 0.5rem;
                        -webkit-appearance: none;
                        appearance: none;
                        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
                        background-position: right 0.5rem center;
                        background-repeat: no-repeat;
                        background-size: 1.5em 1.5em;
                    }
                    .dark .select {
                        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
                    }
                `}</style>
            </main>
            
            {isPrivacyModalOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" 
                    onClick={() => setIsPrivacyModalOpen(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="privacy-modal-title"
                >
                    <div 
                        className="bg-base-100 dark:bg-dark-base-100 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-slide-in-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="flex justify-between items-center p-4 sm:p-6 border-b border-base-300 dark:border-dark-base-300">
                            <h2 id="privacy-modal-title" className="text-xl font-bold">🔒 Privacy & Security</h2>
                            <button onClick={() => setIsPrivacyModalOpen(false)} aria-label="Close" className="text-base-content/50 dark:text-dark-base-content/50 hover:text-base-content dark:hover:text-dark-base-content text-3xl leading-none">&times;</button>
                        </header>
                        <main className="p-6 overflow-y-auto">
                            <p className="text-base-content/70 dark:text-dark-base-content/70 mb-6">
                                GoMarket gives you full control over your privacy and security.
                            </p>

                            {/* Security Controls */}
                            <div className="mb-6">
                                <h4 className="font-bold text-md mb-2">1. Security Controls</h4>
                                <ul className="divide-y divide-base-200 dark:divide-dark-base-300">
                                    <li className="flex justify-between items-center py-3">
                                        <label className="cursor-pointer flex-1 pr-4">
                                            <span className="font-semibold block">Blocked Users</span>
                                            <span className="text-sm text-base-content/60 dark:text-dark-base-content/60">Instantly block or unblock other users from contacting or viewing your profile.</span>
                                        </label>
                                        <button className="font-semibold py-2 px-4 rounded-lg bg-base-200 dark:bg-dark-base-200 hover:bg-base-300 dark:hover:bg-dark-base-300 transition-colors text-sm whitespace-nowrap">Manage</button>
                                    </li>
                                    <li className="flex justify-between items-center py-3">
                                        <label htmlFor="passcode-toggle-modal" className="cursor-pointer flex-1 pr-4">
                                            <span className="font-semibold block">Passcode & Touch ID</span>
                                            <span className="text-sm text-base-content/60 dark:text-dark-base-content/60">Secure your account with a passcode, fingerprint, or device authentication.</span>
                                        </label>
                                        <input id="passcode-toggle-modal" type="checkbox" className="toggle" />
                                    </li>
                                    <li className="flex justify-between items-center py-3">
                                        <label className="cursor-pointer flex-1 pr-4">
                                            <span className="font-semibold block">Two-Step Verification</span>
                                            <span className="text-sm text-base-content/60 dark:text-dark-base-content/60">Add an extra layer of protection by requiring both your password and a verification code.</span>
                                        </label>
                                        <button className="font-semibold py-2 px-4 rounded-lg bg-base-200 dark:bg-dark-base-200 hover:bg-base-300 dark:hover:bg-dark-base-300 transition-colors text-sm whitespace-nowrap">Set Up</button>
                                    </li>
                                </ul>
                            </div>

                            {/* Privacy Controls */}
                            <div className="mb-6">
                                <h4 className="font-bold text-md mb-2">2. Privacy Controls</h4>
                                <ul className="divide-y divide-base-200 dark:divide-dark-base-300">
                                    <li className="flex justify-between items-center py-3">
                                        <label htmlFor="email-privacy-select-modal" className="flex-1 pr-4">
                                            <span className="font-semibold block">Who Can See My Email</span>
                                            <span className="text-sm text-base-content/60 dark:text-dark-base-content/60">Choose whether everyone, only vendors/customers, or no one can view your email.</span>
                                        </label>
                                        <select id="email-privacy-select-modal" className="select select-bordered bg-base-200 dark:bg-dark-base-300 border-base-300 dark:border-dark-base-300 text-sm">
                                            <option>Vendors/Customers</option>
                                            <option>Everyone</option>
                                            <option>Nobody</option>
                                        </select>
                                    </li>
                                    <li className="flex justify-between items-center py-3">
                                        <label htmlFor="last-seen-toggle-modal" className="cursor-pointer flex-1 pr-4">
                                            <span className="font-semibold block">Last Seen & Online Status</span>
                                            <span className="text-sm text-base-content/60 dark:text-dark-base-content/60">Decide if others can see when you were last active or currently online.</span>
                                        </label>
                                        <input id="last-seen-toggle-modal" type="checkbox" className="toggle" defaultChecked />
                                    </li>
                                    <li className="flex justify-between items-center py-3">
                                        <label htmlFor="photo-privacy-select-modal" className="flex-1 pr-4">
                                            <span className="font-semibold block">Profile Photo</span>
                                            <span className="text-sm text-base-content/60 dark:text-dark-base-content/60">Control who can view your profile photo (everyone, contacts only, or nobody).</span>
                                        </label>
                                        <select id="photo-privacy-select-modal" className="select select-bordered bg-base-200 dark:bg-dark-base-300 border-base-300 dark:border-dark-base-300 text-sm">
                                            <option>Everyone</option>
                                            <option>Contacts Only</option>
                                            <option>Nobody</option>
                                        </select>
                                    </li>
                                    <li className="flex justify-between items-center py-3">
                                        <label htmlFor="bio-privacy-select-modal" className="flex-1 pr-4">
                                            <span className="font-semibold block">Bio</span>
                                            <span className="text-sm text-base-content/60 dark:text-dark-base-content/60">Choose who can read your bio.</span>
                                        </label>
                                        <select id="bio-privacy-select-modal" className="select select-bordered bg-base-200 dark:bg-dark-base-300 border-base-300 dark:border-dark-base-300 text-sm">
                                            <option>Everyone</option>
                                            <option>Contacts Only</option>
                                            <option>Nobody</option>
                                        </select>
                                    </li>
                                </ul>
                            </div>
                            
                            {/* Account Management */}
                            <div>
                                <h4 className="font-bold text-md mb-2">3. Account Management</h4>
                                <ul className="divide-y divide-base-200 dark:divide-dark-base-300">
                                    <li className="flex justify-between items-center py-3">
                                        <label htmlFor="auto-delete-select-modal" className="flex-1 pr-4">
                                            <span className="font-semibold block">Auto-Delete Account</span>
                                            <span className="text-sm text-base-content/60 dark:text-dark-base-content/60">You can set your account to automatically delete if inactive for a chosen period (e.g., 6 months, 1 year, or 2 years). This ensures old or unused accounts are removed for your security.</span>
                                        </label>
                                        <select id="auto-delete-select-modal" className="select select-bordered bg-base-200 dark:bg-dark-base-300 border-base-300 dark:border-dark-base-300 text-sm">
                                            <option>Never</option>
                                            <option>After 6 months</option>
                                            <option>After 1 year</option>
                                            <option>After 2 years</option>
                                        </select>
                                    </li>
                                </ul>
                            </div>
                        </main>
                        <footer className="p-4 border-t border-base-300 dark:border-dark-base-300 text-right">
                             <button onClick={() => setIsPrivacyModalOpen(false)} className="bg-primary text-primary-content font-bold py-2 px-5 rounded-lg hover:bg-primary-focus transition-colors">
                                Close
                            </button>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsScreen;