import React from 'react';
import type { User, Review } from '../types';
import StarRating from './common/StarRating';

const ShieldCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" />
    </svg>
);

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const getSellerRating = (seller: User): { average: number; count: number } => {
    if (!seller.reviews || seller.reviews.length === 0) {
        return { average: 0, count: 0 };
    }
    const total = seller.reviews.reduce((acc, review) => acc + review.rating, 0);
    return {
        average: parseFloat((total / seller.reviews.length).toFixed(1)),
        count: seller.reviews.length,
    };
};


interface ReviewCardProps {
    review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
    return (
        <div className="bg-base-200 dark:bg-dark-base-300 p-4 rounded-lg">
            <div className="flex items-start justify-between mb-2">
                <div>
                    <p className="font-bold text-base-content dark:text-dark-base-content">{review.buyerName}</p>
                    <p className="text-xs text-base-content/60 dark:text-dark-base-content/60">{formatDate(review.date)}</p>
                </div>
                <StarRating rating={review.rating} size="sm" />
            </div>
            {review.comment && (
                <p className="text-base-content/80 dark:text-dark-base-content/80 italic">"{review.comment}"</p>
            )}
        </div>
    );
};


interface ProfileScreenProps {
    user: User;
    onBack: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onBack }) => {
    const { average: avgRating, count: reviewCount } = getSellerRating(user);

    return (
        <div className="min-h-screen bg-base-200 dark:bg-dark-base-200 animate-fade-in">
            <header className="bg-base-100 dark:bg-dark-base-100 shadow-md sticky top-0 z-10">
                <div className="container mx-auto p-4 flex items-center">
                    <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-base-200 dark:hover:bg-dark-base-300 transition-colors" aria-label="Go back">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-2xl font-bold">{user.username}'s Profile</h1>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8 max-w-2xl">
                <div className="space-y-8">
                    
                    {/* Profile Summary */}
                    <div className="bg-base-100 dark:bg-dark-base-100 p-6 rounded-lg shadow flex flex-col items-center text-center">
                        <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 rounded-full object-cover mb-4 ring-4 ring-primary/30" />
                        <h2 className="text-2xl font-bold">{user.name}</h2>
                        <p className="text-base-content/70 dark:text-dark-base-content/70">@{user.username}</p>
                        {user.status === 'verified' && (
                             <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-success/20 text-success-content text-sm font-semibold rounded-full">
                                <ShieldCheckIcon className="w-5 h-5" />
                                Verified Seller
                            </div>
                        )}
                    </div>
                    
                    {/* Reviews Section */}
                    <div className="bg-base-100 dark:bg-dark-base-100 p-6 rounded-lg shadow">
                        <h3 className="text-xl font-semibold mb-4">Seller Ratings</h3>
                        
                        {reviewCount > 0 ? (
                            <>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center mb-6">
                                    <div className="text-5xl font-bold text-primary">{avgRating.toFixed(1)}</div>
                                    <div>
                                        <StarRating rating={avgRating} size="lg" />
                                        <p className="text-base-content/70 dark:text-dark-base-content/70 mt-1">Based on {reviewCount} review{reviewCount > 1 ? 's' : ''}</p>
                                    </div>
                                </div>
                                <hr className="border-base-200 dark:border-dark-base-300 my-6"/>
                                <h4 className="text-lg font-semibold mb-4">What Buyers Are Saying</h4>
                                <div className="space-y-4">
                                    {user.reviews?.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((review, index) => (
                                        <ReviewCard key={index} review={review} />
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="text-center text-base-content/70 dark:text-dark-base-content/70 py-8">This seller doesn't have any reviews yet.</p>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
};

export default ProfileScreen;