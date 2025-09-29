import React, { useMemo } from 'react';
import type { User, Listing } from '../types';

interface InboxScreenProps {
    user: User;
    listings: Listing[];
    onBack: () => void;
    onSelectListing: (listing: Listing, initialTab: 'details' | 'chat') => void;
}

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const diffDays = Math.floor(diffSeconds / 86400);

    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};


const InboxScreen: React.FC<InboxScreenProps> = ({ user, listings, onBack, onSelectListing }) => {

    const conversations = useMemo(() => {
        const allUsers = new Map<string, User>();
        listings.forEach(l => {
            if (l.seller) allUsers.set(l.seller.username, l.seller);
        });
        // Add current user in case they are not a seller in any listing
        allUsers.set(user.username, user);
        // A placeholder for other buyers might be needed in a real app,
        // but for mock data, we can find them from chat history.

        return listings
            .filter(listing => {
                const hasChat = listing.chatHistory && listing.chatHistory.length > 0;
                if (!hasChat) return false;
                
                const isSeller = listing.seller.username === user.username;
                const isParticipant = listing.chatHistory.some(msg => msg.senderUsername === user.username);
                
                return isSeller || isParticipant;
            })
            .sort((a, b) => {
                const lastMsgA = a.chatHistory![a.chatHistory!.length - 1];
                const lastMsgB = b.chatHistory![b.chatHistory!.length - 1];
                return new Date(lastMsgB.timestamp).getTime() - new Date(lastMsgA.timestamp).getTime();
            });
    }, [listings, user.username]);

    const getChatPartner = (listing: Listing): User | null => {
        const isSeller = listing.seller.username === user.username;
        if (isSeller) {
             const buyerUsername = listing.chatHistory?.find(m => m.senderUsername !== user.username)?.senderUsername;
             if (!buyerUsername) return null; // Should not happen with filtering logic
             // In a real app, you would look up this user's profile. Here we mock it.
             const buyerFromOtherListing = listings.find(l => l.seller.username === buyerUsername)?.seller;
             return buyerFromOtherListing || {
                 name: buyerUsername,
                 username: buyerUsername,
                 avatarUrl: `https://i.pravatar.cc/150?u=${buyerUsername}`,
                 status: 'unverified'
             };
        } else {
            return listing.seller;
        }
    };

    return (
        <div className="min-h-screen bg-base-200 dark:bg-dark-base-200 animate-fade-in">
            <header className="bg-base-100 dark:bg-dark-base-100 shadow-md sticky top-0 z-10">
                <div className="container mx-auto p-4 flex items-center">
                    <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-base-200 dark:hover:bg-dark-base-300 transition-colors" aria-label="Go back">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-2xl font-bold">Inbox</h1>
                </div>
            </header>
            <main className="container mx-auto max-w-2xl">
                {conversations.length > 0 ? (
                    <ul className="divide-y divide-base-300 dark:divide-dark-base-300">
                        {conversations.map(listing => {
                            const lastMessage = listing.chatHistory![listing.chatHistory!.length - 1];
                            const isUnread = lastMessage.senderUsername !== user.username;
                            const chatPartner = getChatPartner(listing);

                            if (!chatPartner) return null;

                            return (
                                <li key={listing.id}>
                                    <button 
                                        onClick={() => onSelectListing(listing, 'chat')}
                                        className="w-full text-left p-4 flex items-center gap-4 hover:bg-base-100/50 dark:hover:bg-dark-base-100/50 transition-colors"
                                    >
                                        <div className="relative shrink-0">
                                            <img src={chatPartner.avatarUrl} alt={chatPartner.username} className="w-14 h-14 rounded-full" />
                                            {isUnread && <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-primary ring-2 ring-base-200 dark:ring-dark-base-200"></span>}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="flex justify-between items-baseline">
                                                <p className={`font-bold truncate ${isUnread ? 'text-base-content dark:text-dark-base-content' : 'text-base-content/80 dark:text-dark-base-content/80'}`}>
                                                    {chatPartner.username}
                                                </p>
                                                <p className={`text-xs shrink-0 ${isUnread ? 'text-primary font-semibold' : 'text-base-content/60 dark:text-dark-base-content/60'}`}>
                                                    {formatDate(lastMessage.timestamp)}
                                                </p>
                                            </div>
                                            <p className={`text-sm truncate mt-1 ${isUnread ? 'text-base-content/80 dark:text-dark-base-content/80 font-medium' : 'text-base-content/60 dark:text-dark-base-content/60'}`}>
                                               {listing.title}
                                            </p>
                                            <p className={`text-sm truncate mt-1 ${isUnread ? 'text-base-content/80 dark:text-dark-base-content/80' : 'text-base-content/60 dark:text-dark-base-content/60'}`}>
                                                {lastMessage.senderUsername === user.username && 'You: '}{lastMessage.text || 'Image sent'}
                                            </p>
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <div className="text-center py-20 px-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-base-content/30 dark:text-dark-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <h2 className="mt-4 text-2xl font-bold">No Messages Yet</h2>
                        <p className="mt-2 text-base-content/70 dark:text-dark-base-content/70">
                           When you start a conversation with a buyer or seller, it will appear here.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default InboxScreen;