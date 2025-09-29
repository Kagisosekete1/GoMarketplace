// FIX: Import 'useMemo' from react to fix 'Cannot find name 'useMemo'' error.
import React, { useEffect, useState, useRef, useMemo } from 'react';
import type { Listing, User, Review, ChatMessage } from '../types';
import { useSettings, formatCurrency } from '../contexts/SettingsContext';
import StarRating from './common/StarRating';
import IdVerificationModal from './FaceVerificationModal';
import ImagePreviewModal from './common/ImagePreviewModal';
import { generateAIChatResponse } from '../services/geminiService';
import Spinner from './common/Spinner';
import Advertisement from './common/Advertisement';
import ZoomableImage from './common/ZoomableImage';

const ShareIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367 2.684z" />
    </svg>
);

const LocationIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const SoldStamp: React.FC = () => (
    <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
        <div className="transform -rotate-12">
            <span className="text-white font-bold text-5xl tracking-widest uppercase border-8 border-white px-6 py-3 rounded-lg bg-black/40">
                Sold
            </span>
        </div>
    </div>
);

const PendingStamp: React.FC = () => (
    <div className="absolute inset-0 bg-amber-500/60 flex items-center justify-center pointer-events-none">
        <div className="transform -rotate-12">
            <span className="text-white font-bold text-4xl tracking-widest uppercase border-4 border-white px-6 py-3 rounded-lg bg-black/40">
                Pending
            </span>
        </div>
    </div>
);


const ShieldCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" />
    </svg>
);

const IdCardIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5z" />
    </svg>
);

const GoMarketAssistantIcon = () => (
    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-800 text-white flex items-center justify-center shadow-md shrink-0 p-1">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V8.25a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 8.25v7.5A2.25 2.25 0 006.75 18z" />
        </svg>
    </div>
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

const LeaveReviewModal: React.FC<{
    onSubmit: (rating: number, comment: string) => void;
    onClose: () => void;
}> = ({ onSubmit, onClose }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = () => {
        if (rating > 0) {
            onSubmit(rating, comment);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-base-100 dark:bg-dark-base-200 rounded-lg shadow-xl p-6 w-full max-w-md animate-slide-in-up" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">Leave a Review</h3>
                <div className="mb-4">
                    <p className="font-semibold mb-2">Your Rating</p>
                    <StarRating rating={rating} onRatingChange={setRating} size="lg" />
                </div>
                <div className="mb-6">
                    <label htmlFor="review-comment" className="font-semibold mb-2 block">Comment (optional)</label>
                    <textarea 
                        id="review-comment"
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        rows={4}
                        className="w-full p-2 border border-base-300 dark:border-dark-base-300 rounded-md bg-base-200 dark:bg-dark-base-300 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="How was your experience?"
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="py-2 px-4 rounded-lg font-bold bg-base-300 dark:bg-dark-base-300 hover:bg-base-300/80 dark:hover:bg-dark-base-300/80">Cancel</button>
                    <button onClick={handleSubmit} disabled={rating === 0} className="py-2 px-4 rounded-lg font-bold bg-primary text-primary-content hover:bg-primary-focus disabled:bg-base-300 dark:disabled:bg-dark-base-300">Submit</button>
                </div>
            </div>
        </div>
    );
};


interface ListingDetailModalProps {
    listing: Listing;
    user: User;
    onClose: () => void;
    onUpdateStatus: (listingId: string, status: 'available' | 'sold' | 'pending') => void;
    onPurchase: (listingId: string) => void;
    onAddReview: (listingId: string, review: Review) => void;
    onNavigateToProfile: (user: User) => void;
    onUpdateChat: (listingId: string, newChatHistory: ChatMessage[]) => void;
    initialTab?: 'details' | 'chat';
}

type ActiveMedia = {
    type: 'image' | 'video';
    src: string;
};

const PRICE_THRESHOLD_FOR_AD = 5000;
const PLACEHOLDER_IMAGE_URL = 'https://placehold.co/400x400/e5e7eb/a0aec0?text=Image+Not+Available';


const ListingDetailModal: React.FC<ListingDetailModalProps> = ({ listing, user, onClose, onUpdateStatus, onPurchase, onAddReview, onNavigateToProfile, onUpdateChat, initialTab = 'details' }) => {
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
    const [sellerVerified, setSellerVerified] = useState(false);
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
    const { currency } = useSettings();

    const [activeTab, setActiveTab] = useState<'details' | 'chat'>(initialTab);
    const [messages, setMessages] = useState<ChatMessage[]>(listing.chatHistory || []);
    const [chatInput, setChatInput] = useState('');
    const [imageToSend, setImageToSend] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [isAISending, setIsAISending] = useState(false);
    
    const displayImageUrls = useMemo(() => 
        listing.imageUrls?.length > 0 ? listing.imageUrls : [PLACEHOLDER_IMAGE_URL],
    [listing.imageUrls]);
    
    const [activeMedia, setActiveMedia] = useState<ActiveMedia>({
        type: listing.videoUrl ? 'video' : 'image',
        src: listing.videoUrl || displayImageUrls[0],
    });

    const chatEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const aiTimerRef = useRef<number | null>(null);
    
    useEffect(() => {
        setMessages(listing.chatHistory || []);
    }, [listing.chatHistory]);

    // Effect for scrolling and read receipts
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });

        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.senderUsername !== user.username) {
            const timeout = setTimeout(() => {
                const updatedMessages = messages.map(msg =>
                    msg.senderUsername === user.username && msg.status !== 'read'
                        ? { ...msg, status: 'read' as const }
                        : msg
                );
                onUpdateChat(listing.id, updatedMessages);
            }, 1000); // 1 sec delay to simulate reading
            return () => clearTimeout(timeout);
        }
    }, [messages, user.username, onUpdateChat, listing.id]);
    
    // Cleanup AI timer on unmount
    useEffect(() => {
        return () => {
          if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
        }
    }, []);

    // Effect to cancel AI timer if seller replies
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.senderUsername === listing.seller.username) {
             if (aiTimerRef.current) {
                clearTimeout(aiTimerRef.current);
                aiTimerRef.current = null;
             }
        }
    }, [messages, listing.seller.username]);


    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (previewImageUrl) {
                    setPreviewImageUrl(null);
                } else if (isReviewModalOpen) {
                    setIsReviewModalOpen(false);
                } else if (isVerificationModalOpen) {
                    setIsVerificationModalOpen(false);
                } else {
                    onClose();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose, isReviewModalOpen, isVerificationModalOpen, previewImageUrl]);

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}${window.location.pathname}?listingId=${listing.id}`;
        const shareData = {
            title: `Check out my listing on GoMarket: ${listing.title}`,
            text: `I'm selling my "${listing.title}" for ${formatCurrency(listing.price, currency)} on GoMarket! See more details here:`,
            url: shareUrl,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            }
        } catch (err) {
            console.log('Share action was cancelled or failed.', err);
        }
    };
    
    const handleConfirmSale = () => {
        onUpdateStatus(listing.id, 'sold');
    };

    const handleReviewSubmit = (rating: number, comment: string) => {
        const newReview: Review = {
            rating,
            comment,
            buyerName: user.username,
            date: new Date().toISOString()
        };
        onAddReview(listing.id, newReview);
        setIsReviewModalOpen(false);
    };

    const handleViewProfile = () => {
        onNavigateToProfile(listing.seller);
        onClose(); // Close the modal after navigating
    };

    const handleVerificationSuccess = () => {
        setSellerVerified(true);
        setIsVerificationModalOpen(false);
    };
    
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageToSend(file);
            setImagePreviewUrl(URL.createObjectURL(file));
        }
    };
    
    const cancelImageSend = () => {
        setImageToSend(null);
        if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
        setImagePreviewUrl(null);
    };

    const isOwner = user.username === listing.seller.username;

    const handleSendMessage = () => {
        if ((chatInput.trim() === '' && !imageToSend) || isAISending) return;

        const newMessage: ChatMessage = {
            senderUsername: user.username,
            text: chatInput.trim(),
            timestamp: new Date().toISOString(),
            status: 'sent',
            imageUrl: imagePreviewUrl || undefined,
        };

        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);
        onUpdateChat(listing.id, updatedMessages);
        
        setChatInput('');
        cancelImageSend();
    
        if (aiTimerRef.current) clearTimeout(aiTimerRef.current);

        setTimeout(() => {
            setMessages(prev => prev.map(m => m.timestamp === newMessage.timestamp ? {...m, status: 'delivered'} : m));
        }, 500);

        if (user.username !== listing.seller.username && listing.seller.aiAutoReplyEnabled) {
            aiTimerRef.current = window.setTimeout(async () => {
                 setIsAISending(true);
                 try {
                     const aiResponseText = await generateAIChatResponse(updatedMessages, listing);
                     const aiMessage: ChatMessage = {
                         senderUsername: 'GoMarketAssistant',
                         text: aiResponseText,
                         timestamp: new Date().toISOString(),
                         isAIMessage: true,
                     };
                     const finalMessages = [...updatedMessages, aiMessage];
                     setMessages(finalMessages);
                     onUpdateChat(listing.id, finalMessages);
                 } catch (error) {
                     console.error("AI auto-reply failed:", error);
                 } finally {
                     setIsAISending(false);
                     aiTimerRef.current = null;
                 }
            }, 1500);
        }
    };
    
    const isSold = listing.status === 'sold';
    const isPending = listing.status === 'pending';
    const canShare = typeof navigator.share === 'function';
    const sellerRating = getSellerRating(listing.seller);
    const isBuyerVerified = user.status === 'verified';

    const renderFooterContent = () => {
        // --- VIEWER IS THE OWNER ---
        if (isOwner) {
            if (isSold) {
                return (
                    <div className="bg-success/20 p-4 rounded-lg">
                        <h4 className="font-bold text-center text-success-content dark:text-success mb-3">You sold this item to:</h4>
                        <div className="flex items-center justify-center gap-3 bg-base-100 dark:bg-dark-base-100 p-3 rounded-lg shadow-inner">
                            {listing.buyerAvatarUrl && (
                                <button onClick={() => setPreviewImageUrl(listing.buyerAvatarUrl!)} className="shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary" aria-label={`View profile picture of ${listing.buyerName}`}>
                                    <img src={listing.buyerAvatarUrl} alt={listing.buyerName} className="w-10 h-10 rounded-full" />
                                </button>
                            )}
                            <span className="font-semibold text-base-content dark:text-dark-base-content">{listing.buyerName}</span>
                        </div>
                    </div>
                );
            }
            if (isPending) {
                return (
                    <div className="bg-amber-500/20 p-4 rounded-lg text-center">
                        <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-3">Sale pending with:</h4>
                         <div className="flex items-center justify-center gap-3 bg-base-100 dark:bg-dark-base-100 p-3 rounded-lg shadow-inner max-w-sm mx-auto">
                            {listing.buyerAvatarUrl && <img src={listing.buyerAvatarUrl} alt={listing.buyerName} className="w-10 h-10 rounded-full" />}
                            <span className="font-semibold text-base-content dark:text-dark-base-content">{listing.buyerName}</span>
                        </div>
                        <button onClick={handleConfirmSale} className="mt-4 w-full bg-accent hover:bg-accent-focus text-white font-bold py-3 px-5 rounded-lg transition-colors">
                            Confirm Sale Completion
                        </button>
                    </div>
                );
            }
            // Available item
            return (
                 <div className="flex gap-2">
                    <button
                        onClick={handleShare}
                        className="bg-secondary hover:bg-secondary-focus text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:bg-base-300 dark:disabled:bg-dark-base-300 disabled:cursor-not-allowed"
                        disabled={!canShare}
                        title={canShare ? "Share your listing" : "Sharing not supported on this browser"}
                    >
                        <ShareIcon />
                    </button>
                    <button
                        onClick={() => onUpdateStatus(listing.id, 'sold')}
                        className="flex-1 bg-primary hover:bg-primary-focus text-white font-bold py-3 px-5 rounded-lg transition-colors"
                    >
                        Mark as Sold
                    </button>
                </div>
            );
        }

        // --- VIEWER IS NOT THE OWNER ---
        if (isSold) {
             return (
                listing.buyerName === user.username && !listing.reviewLeft ? (
                    <button 
                        onClick={() => setIsReviewModalOpen(true)}
                        className="w-full bg-accent hover:bg-accent-focus text-white font-bold py-3 px-5 rounded-lg transition-colors"
                    >
                        Leave a Review
                    </button>
                ) : (
                    <button 
                        className="w-full bg-base-300 dark:bg-dark-base-300 text-base-content/70 dark:text-dark-base-content/70 font-bold py-3 px-5 rounded-lg cursor-not-allowed"
                        disabled
                    >
                       This item has been sold
                    </button>
                )
            );
        }
        if (isPending) {
            const message = listing.buyerName === user.username
                ? "Awaiting seller confirmation..."
                : "This item is pending sale.";
             return (
                 <button className="w-full bg-base-300 dark:bg-dark-base-300 text-base-content/70 dark:text-dark-base-content/70 font-bold py-3 px-5 rounded-lg cursor-not-allowed" disabled>
                    {message}
                </button>
             );
        }
        // Available item, viewer is potential buyer
        return (
            <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <ShieldCheckIcon className="w-10 h-10 text-blue-500 shrink-0 mt-1" />
                    <div>
                        <h4 className="font-bold text-blue-800 dark:text-blue-300">Safety First</h4>
                        <p className="text-sm text-blue-700/80 dark:text-blue-400/80">
                           {!isBuyerVerified 
                                ? "To buy items, please verify your account in Settings first."
                                : "You must verify the seller's ID before you can purchase. Always meet in a safe, public place."
                           }
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                     <button
                        onClick={() => setIsVerificationModalOpen(true)}
                        disabled={!isBuyerVerified}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:bg-base-300 dark:disabled:bg-dark-base-300 disabled:cursor-not-allowed"
                        title={isBuyerVerified ? "Verify seller's ID now" : "You must be verified to use this feature. See Settings."}
                    >
                        <IdCardIcon className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => onPurchase(listing.id)}
                        disabled={!isBuyerVerified || !sellerVerified}
                        className="flex-1 bg-primary hover:bg-primary-focus text-white font-bold py-3 px-5 rounded-lg transition-colors disabled:bg-base-300 dark:disabled:bg-dark-base-300 disabled:cursor-not-allowed"
                        title={
                            !isBuyerVerified ? "Please verify your account in Settings to buy items." :
                            !sellerVerified ? "Please verify the seller's ID first using the button on the left." :
                            `Buy Now for ${formatCurrency(listing.price, currency)}`
                        }
                    >
                       {sellerVerified ? `Buy Now for ${formatCurrency(listing.price, currency)}` : 'Buy Now'}
                    </button>
                </div>
             </div>
        );
    };

    const tabButtonClasses = (tabName: 'details' | 'chat') => 
        `px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
            activeTab === tabName 
            ? 'border-primary text-primary' 
            : 'border-transparent text-base-content/60 dark:text-dark-base-content/60 hover:text-base-content dark:hover:text-dark-base-content'
        }`;
    
    const ReadReceipt = ({ status }: { status: ChatMessage['status'] }) => {
        if (!status || status === 'sent') return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>; // Single check
        if (status === 'delivered') return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7m-7 10l4 4L19 7" /></svg>; // Double check
        if (status === 'read') return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0zM4 6a1 1 0 011-1h1a1 1 0 010 2H5a1 1 0 01-1-1zm3 0a1 1 0 011-1h1a1 1 0 110 2H8a1 1 0 01-1-1zm3 0a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1z" clipRule="evenodd" /></svg>; // Double check blue
        return null;
    };


    return (
        <div 
            className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4 animate-fade-in" 
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="listing-title"
        >
             {isReviewModalOpen && <LeaveReviewModal onSubmit={handleReviewSubmit} onClose={() => setIsReviewModalOpen(false)} />}
             {isVerificationModalOpen && <IdVerificationModal seller={listing.seller} onClose={() => setIsVerificationModalOpen(false)} onVerificationSuccess={handleVerificationSuccess} />}
             {previewImageUrl && <ImagePreviewModal imageUrl={previewImageUrl} altText="Enlarged image" onClose={() => setPreviewImageUrl(null)} />}
            <div 
                className="bg-base-100 dark:bg-dark-base-100 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-slide-in-up" 
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-4 flex justify-between items-center border-b border-base-200 dark:border-dark-base-300 flex-shrink-0">
                     <h2 id="listing-title" className="text-xl font-bold truncate">{listing.title}</h2>
                    <button onClick={onClose} aria-label="Close" className="text-base-content/50 dark:text-dark-base-content/50 hover:text-base-content dark:hover:text-dark-base-content text-3xl leading-none">&times;</button>
                </header>
                
                <main className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="space-y-2">
                        <div className="relative w-full aspect-video">
                            {activeMedia.type === 'image' ? (
                                <ZoomableImage src={activeMedia.src} alt={listing.title} />
                            ) : (
                                <video 
                                    src={activeMedia.src} 
                                    className="w-full h-full object-contain bg-base-200 dark:bg-dark-base-300 rounded-lg" 
                                    controls
                                    autoPlay 
                                    loop
                                    aria-label={`${listing.title} promo video`}
                                />
                            )}
                            {isSold && <SoldStamp />}
                            {isPending && <PendingStamp />}
                        </div>
                        <div className="flex gap-2 pt-2 overflow-x-auto">
                            {listing.videoUrl && (
                                <button
                                    onClick={() => setActiveMedia({ type: 'video', src: listing.videoUrl! })}
                                    className={`relative w-20 h-20 shrink-0 rounded-md overflow-hidden border-2 ${activeMedia.src === listing.videoUrl ? 'border-primary' : 'border-transparent'}`}
                                >
                                    <img src={displayImageUrls[0]} alt="video thumbnail" className="w-full h-full object-cover brightness-50" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white/80" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </button>
                            )}
                            {displayImageUrls.map((url, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveMedia({ type: 'image', src: url })}
                                    className={`w-20 h-20 shrink-0 rounded-md overflow-hidden border-2 ${activeMedia.src === url ? 'border-primary' : 'border-transparent'}`}
                                >
                                    <img src={url} alt={`thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>


                    <div className="border-b border-base-200 dark:border-dark-base-300">
                        <div className="flex -mb-px">
                            <button className={tabButtonClasses('details')} onClick={() => setActiveTab('details')}>Details</button>
                            <button className={tabButtonClasses('chat')} onClick={() => setActiveTab('chat')}>Chat</button>
                        </div>
                    </div>
                    
                    {activeTab === 'details' && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    {listing.category && <p className="text-sm font-semibold text-secondary mb-1 uppercase tracking-wider">{listing.category}</p>}
                                    <h3 className="text-3xl font-bold">{listing.title}</h3>
                                </div>
                                <p className={`text-3xl font-bold whitespace-nowrap ${isSold || isPending ? 'text-base-content/50 dark:text-dark-base-content/50 line-through' : 'text-primary'}`}>{formatCurrency(listing.price, currency)}</p>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-bold mb-2">Description</h3>
                                <p className="text-base-content/80 dark:text-dark-base-content/80 mt-2 whitespace-pre-wrap">{listing.description}</p>
                            </div>
                            
                            {listing.price > PRICE_THRESHOLD_FOR_AD && !isSold && !isPending && (
                                <div className="my-4">
                                    <Advertisement type="fnb" />
                                </div>
                            )}

                            <div 
                                onClick={handleViewProfile}
                                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleViewProfile()}
                                role="button"
                                tabIndex={0}
                                className="bg-base-200 dark:bg-dark-base-300 p-4 rounded-lg hover:bg-base-300 dark:hover:bg-dark-base-100/50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                                aria-label={`View profile of ${listing.seller.username}`}
                            >
                                <h3 className="text-sm font-bold text-base-content/70 dark:text-dark-base-content/70 mb-3">SELLER INFORMATION</h3>
                                <div className="flex items-center">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPreviewImageUrl(listing.seller.avatarUrl);
                                        }} 
                                        className="mr-3 rounded-full shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary" 
                                        aria-label={`View profile picture of ${listing.seller.username}`}
                                    >
                                        <img src={listing.seller.avatarUrl} alt={listing.seller.username} className="w-10 h-10 rounded-full" />
                                    </button>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold">{listing.seller.username}</span>
                                            {listing.seller.status === 'verified' && (
                                                <div className="flex items-center gap-1 text-xs font-semibold text-success bg-success/20 px-2 py-0.5 rounded-full" title="Verified Seller">
                                                    <ShieldCheckIcon className="w-3 h-3" />
                                                    <span>Verified</span>
                                                </div>
                                            )}
                                        </div>
                                        {listing.sellerAddress && (
                                            <div className="flex items-center text-sm text-base-content/70 dark:text-dark-base-content/70 mt-1">
                                                <LocationIcon />
                                                <span className="ml-2">{listing.sellerAddress}</span>
                                            </div>
                                        )}
                                    </div>
                                    {sellerRating.count > 0 && (
                                        <div className="text-right">
                                            <StarRating rating={sellerRating.average} />
                                            <p className="text-sm text-base-content/70 dark:text-dark-base-content/70 mt-1">{sellerRating.count} review{sellerRating.count > 1 ? 's' : ''}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'chat' && (
                        <div className="flex flex-col h-96 bg-base-200 dark:bg-dark-base-300 rounded-lg animate-fade-in">
                            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                                {messages.map((msg, index) => {
                                    const isCurrentUser = msg.senderUsername === user.username;
                                    const senderAvatar = isCurrentUser ? user.avatarUrl : (msg.isAIMessage ? '' : listing.seller.avatarUrl);
                                    return (
                                        <div key={index} className={`flex items-end gap-2 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                                            {msg.isAIMessage ? <GoMarketAssistantIcon /> : <img src={senderAvatar} alt={msg.senderUsername} className="w-6 h-6 rounded-full" />}
                                            <div className={`max-w-xs lg:max-w-sm px-4 py-2 rounded-2xl ${msg.isAIMessage ? 'bg-blue-100 dark:bg-blue-900/50 rounded-bl-none' : (isCurrentUser ? 'bg-primary text-primary-content rounded-br-none' : 'bg-base-100 dark:bg-dark-base-100 rounded-bl-none')}`}>
                                                {msg.imageUrl && (
                                                    <button
                                                        onClick={() => setPreviewImageUrl(msg.imageUrl!)}
                                                        className={`block w-full text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary rounded-lg ${msg.text ? 'mb-2' : ''}`}
                                                        aria-label="Preview chat image"
                                                    >
                                                        <img src={msg.imageUrl} alt="chat attachment" className="rounded-lg max-w-full h-auto" />
                                                    </button>
                                                )}
                                                {msg.text && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}
                                                {isCurrentUser && <div className="flex justify-end items-center text-xs mt-1 opacity-70"><ReadReceipt status={msg.status} /></div>}
                                            </div>
                                        </div>
                                    );
                                })}
                                {isAISending && (
                                    <div className="flex items-end gap-2">
                                        <GoMarketAssistantIcon />
                                        <div className="px-4 py-2 rounded-2xl bg-base-100 dark:bg-dark-base-100 rounded-bl-none">
                                            <Spinner size="sm" />
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>
                            {!isSold && !isPending && (
                                <div className="p-4 border-t border-base-300 dark:border-dark-base-100">
                                    {imagePreviewUrl && (
                                        <div className="relative w-20 h-20 mb-2 p-1 border rounded-lg">
                                            <img src={imagePreviewUrl} alt="preview" className="w-full h-full object-cover rounded"/>
                                            <button onClick={cancelImageSend} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">&times;</button>
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                         <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                                        <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-base-300 dark:bg-dark-base-100 rounded-lg hover:opacity-80 transition-opacity" aria-label="Attach image">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </button>
                                        <input
                                            type="text"
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                            placeholder={isAISending ? "Waiting for response..." : "Type a message..."}
                                            className="w-full px-4 py-2 bg-base-100 dark:bg-dark-base-100 border border-base-300 dark:border-dark-base-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                                            disabled={isAISending}
                                        />
                                        <button 
                                            onClick={handleSendMessage} 
                                            disabled={isAISending || (!chatInput.trim() && !imageToSend)}
                                            className="font-bold py-2 px-5 rounded-lg bg-primary text-primary-content hover:bg-primary-focus transition-colors w-24 flex justify-center items-center disabled:bg-primary/70 disabled:cursor-not-allowed"
                                        >
                                            {isAISending ? <Spinner size="sm" /> : 'Send'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>
                <footer className="p-4 border-t border-base-200 dark:border-dark-base-300 flex-shrink-0">
                    {renderFooterContent()}
                </footer>
            </div>
        </div>
    );
};

export default ListingDetailModal;