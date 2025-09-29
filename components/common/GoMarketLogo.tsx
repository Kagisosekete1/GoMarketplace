
import React from 'react';

const HouseIcon = ({ className }: { className: string }) => (
    <svg 
        className={className} 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5}
        stroke="currentColor"
    >
        <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" 
        />
    </svg>
);


interface GoMarketLogoProps {
    iconSize?: number;
    textSize?: string;
    showText?: boolean;
    className?: string;
    direction?: 'col' | 'row';
    onClick?: () => void;
}

const GoMarketLogo: React.FC<GoMarketLogoProps> = ({ 
    iconSize = 48, 
    textSize = 'text-xl', 
    showText = true, 
    className = '',
    direction = 'col',
    onClick
}) => {
    
    const containerClasses = direction === 'col' 
        ? 'flex-col items-center gap-2' 
        : 'flex-row items-center gap-3';

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick();
        }
    };

    return (
        <div 
            className={`flex justify-center ${containerClasses} ${className} ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
            onKeyDown={onClick ? handleKeyDown : undefined}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            aria-label={onClick ? 'Go to homepage' : undefined}
        >
            <div
                className="rounded-full bg-gradient-to-br from-blue-400 to-blue-800 text-white flex items-center justify-center shadow-md shrink-0"
                style={{ width: iconSize, height: iconSize, padding: iconSize * 0.25 }}
            >
                <HouseIcon className="w-full h-full" />
            </div>
            {showText && <span className={`font-bold tracking-wide ${textSize} text-base-content dark:text-dark-base-content`}>GoMarket</span>}
        </div>
    );
};

export default GoMarketLogo;
