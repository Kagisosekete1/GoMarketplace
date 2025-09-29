
import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3500); // Disappear after 3.5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const typeClasses = {
    success: 'bg-success text-white',
    error: 'bg-error text-white',
  };

  const Icon = () => {
    if (type === 'success') {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        );
    }
    return null; // Can add error icon later
  };


  return (
    <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 p-3 rounded-full shadow-lg animate-slide-in-up flex items-center ${typeClasses[type]}`}>
      <Icon />
      <p className="font-semibold text-sm">{message}</p>
    </div>
  );
};

export default Toast;
