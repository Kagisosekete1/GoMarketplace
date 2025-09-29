import React from 'react';

interface ImagePreviewModalProps {
  imageUrl: string;
  altText: string;
  onClose: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ imageUrl, altText, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={altText}
    >
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <img src={imageUrl} alt={altText} className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl" />
        <button
          onClick={onClose}
          aria-label="Close image preview"
          className="absolute -top-3 -right-3 bg-white/90 dark:bg-dark-base-100/90 text-base-content dark:text-dark-base-content rounded-full p-1 leading-none hover:bg-white dark:hover:bg-dark-base-100 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ImagePreviewModal;
