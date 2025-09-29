import React, { useState, useRef, useCallback, useEffect } from 'react';
import Spinner from './common/Spinner';
import { generateSearchTermFromImage } from '../services/geminiService';

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-base-content/70 dark:text-dark-base-content/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const CameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const LargeCameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-base-content/70 dark:text-dark-base-content/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

interface VisualSearchModalProps {
    onClose: () => void;
    onSearchTermFound: (term: string) => void;
}

const VisualSearchModal: React.FC<VisualSearchModalProps> = ({ onClose, onSearchTermFound }) => {
    const [view, setView] = useState<'select' | 'camera' | 'preview'>('select');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const cleanupCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            cleanupCamera();
        };
    }, [onClose, cleanupCamera]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImageUrl(URL.createObjectURL(file));
            setView('preview');
        }
    };

    const startCamera = async () => {
        try {
            setError(null);
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                    setView('camera');
                }
            } else {
                setError("Camera not supported on this device.");
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            if (err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
                setError("Camera permission denied. To use visual search, please enable camera access in your browser or system settings.");
            } else if (err instanceof DOMException && err.name === 'NotFoundError') {
                setError("No camera was found on your device. Please connect a camera and try again.");
            } else {
                setError("Could not access camera. Please ensure it's not in use by another app and that you have granted permission.");
            }
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
                context.drawImage(videoRef.current, 0, 0, videoRef.current.videoWidth, videoRef.current.videoHeight);
                canvasRef.current.toBlob(blob => {
                    if (blob) {
                        const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
                        setImageFile(file);
                        setImageUrl(URL.createObjectURL(file));
                        cleanupCamera();
                        setView('preview');
                    }
                }, 'image/jpeg');
            }
        }
    };

    const handleSearch = async () => {
        if (!imageFile) return;
        setIsLoading(true);
        setError(null);
        try {
            const term = await generateSearchTermFromImage(imageFile);
            onSearchTermFound(term);
        } catch (e) {
            setError(e instanceof Error ? e.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const reset = () => {
        cleanupCamera();
        setImageFile(null);
        if (imageUrl) URL.revokeObjectURL(imageUrl);
        setImageUrl(null);
        setError(null);
        setIsLoading(false);
        setView('select');
    };

    const renderContent = () => {
        switch (view) {
            case 'select':
                return (
                    <div className="p-8 text-center">
                        <h2 className="text-2xl font-bold mb-6">Search with an Image</h2>
                        <div className="flex flex-col sm:flex-row justify-center gap-8">
                            <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center w-40 h-40 bg-base-100 dark:bg-dark-base-300 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors p-4">
                                <UploadIcon />
                                <span className="mt-2 font-semibold">Upload Image</span>
                            </button>
                            <button onClick={startCamera} className="flex flex-col items-center justify-center w-40 h-40 bg-base-100 dark:bg-dark-base-300 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors p-4">
                                <LargeCameraIcon />
                                <span className="mt-2 font-semibold">Use Camera</span>
                            </button>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                    </div>
                );
            case 'camera':
                return (
                    <div className="relative bg-base-300 dark:bg-dark-base-300">
                        <video ref={videoRef} className="w-full h-auto max-h-[60vh] rounded-lg" autoPlay playsInline muted />
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
                            <button onClick={capturePhoto} className="p-4 rounded-full bg-primary text-primary-content hover:bg-primary-focus transition-colors shadow-lg">
                                <CameraIcon/>
                            </button>
                            <button onClick={reset} className="py-3 px-5 rounded-full font-bold bg-black/50 text-white hover:bg-black/70 transition-colors">Cancel</button>
                        </div>
                    </div>
                );
            case 'preview':
                return (
                    <div className="p-8 flex flex-col items-center">
                        <h2 className="text-2xl font-bold mb-4">Ready to Search?</h2>
                        {imageUrl && <img src={imageUrl} alt="Search preview" className={`max-h-64 w-auto rounded-lg mb-6 shadow-lg transition-opacity ${isLoading ? 'opacity-50' : ''}`} />}
                        <div className="flex gap-4">
                            <button onClick={reset} disabled={isLoading} className="py-2 px-5 rounded-lg font-bold bg-base-300 dark:bg-dark-base-300 text-base-content/70 dark:text-dark-base-content/70 hover:bg-base-300/80 dark:hover:bg-dark-base-300/80 transition-colors disabled:cursor-not-allowed disabled:opacity-70">Back</button>
                            <button onClick={handleSearch} disabled={isLoading} className="py-2 px-5 rounded-lg font-bold bg-primary text-primary-content hover:bg-primary-focus transition-colors w-48 flex justify-center items-center disabled:bg-primary/70 disabled:cursor-not-allowed">
                               {isLoading ? <Spinner size="sm" /> : 'Find Similar Items'}
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="visual-search-modal-title">
            <div className="bg-base-200 dark:bg-dark-base-200 rounded-2xl shadow-2xl w-full max-w-xl animate-slide-in-up overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-base-300 dark:border-dark-base-300">
                    <h1 id="visual-search-modal-title" className="text-xl font-bold">Visual Search</h1>
                    <button onClick={onClose} aria-label="Close" className="text-base-content/50 dark:text-dark-base-content/50 hover:text-base-content dark:hover:text-dark-base-content text-3xl leading-none">&times;</button>
                </div>
                {error && <p className="text-error bg-error/20 p-3 text-center text-sm animate-fade-in">{error}</p>}
                <div>{renderContent()}</div>
            </div>
        </div>
    );
};

export default VisualSearchModal;