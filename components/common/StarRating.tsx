import React from 'react';

const StarIcon: React.FC<{ filled: boolean; className?: string }> = ({ filled, className }) => (
    <svg 
        className={`shrink-0 ${filled ? 'text-yellow-400' : 'text-base-content/30 dark:text-dark-base-content/30'} ${className}`} 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor"
    >
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
);


interface StarRatingProps {
    rating: number;
    totalStars?: number;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    onRatingChange?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ 
    rating, 
    totalStars = 5, 
    size = 'md',
    onRatingChange 
}) => {
    const [hoverRating, setHoverRating] = React.useState(0);
    const isInteractive = onRatingChange !== undefined;

    const sizeClasses = {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-8 h-8',
    };

    const handleClick = (index: number) => {
        if (onRatingChange) {
            onRatingChange(index);
        }
    };

    const handleMouseEnter = (index: number) => {
        if (isInteractive) {
            setHoverRating(index);
        }
    };

    const handleMouseLeave = () => {
        if (isInteractive) {
            setHoverRating(0);
        }
    };

    return (
        <div className={`flex items-center gap-0.5 ${isInteractive ? 'cursor-pointer' : ''}`} onMouseLeave={handleMouseLeave}>
            {[...Array(totalStars)].map((_, i) => {
                const starIndex = i + 1;
                const displayRating = hoverRating > 0 ? hoverRating : rating;
                
                return (
                    <button
                        key={starIndex}
                        type="button"
                        disabled={!isInteractive}
                        onClick={() => handleClick(starIndex)}
                        onMouseEnter={() => handleMouseEnter(starIndex)}
                        className="focus:outline-none"
                        aria-label={`Rate ${starIndex} star${starIndex > 1 ? 's' : ''}`}
                    >
                         <StarIcon 
                            filled={starIndex <= displayRating}
                            className={sizeClasses[size]}
                         />
                    </button>
                );
            })}
        </div>
    );
};

export default StarRating;