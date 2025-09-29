
import React from 'react';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', text }) => {
    const sizeClasses = {
        sm: 'w-6 h-6 border-2',
        md: 'w-10 h-10 border-4',
        lg: 'w-16 h-16 border-4',
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <div
                className={`animate-spin rounded-full border-primary border-t-transparent ${sizeClasses[size]}`}
            ></div>
            {text && <p className="text-base-content/80 dark:text-dark-base-content/80 text-lg animate-pulse">{text}</p>}
        </div>
    );
};

export default Spinner;