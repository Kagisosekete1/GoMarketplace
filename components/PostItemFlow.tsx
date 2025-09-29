import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
    generateListingDetailsFromImage, 
    generateDescriptionForListing, 
    createListingAssistantChatSession, 
    suggestPriceForListing, 
    generatePromotionalVideo,
    suggestCategoryForListing,
    MARKETPLACE_CATEGORIES
} from '../services/geminiService';
import Spinner from './common/Spinner';
import type { Listing } from '../types';
import { useSettings } from '../contexts/SettingsContext';
// FIX: The Currency type is defined in SettingsContext, not types.ts.
import type { Currency } from '../contexts/SettingsContext';
import type { Chat } from '@google/genai';
import Advertisement from './common/Advertisement';

interface PostItemFlowProps {
  onClose: () => void;
  onPost: (listing: Omit<Listing, 'id' | 'seller' | 'status'>) => void;
}

type ChatMessage = {
    role: 'user' | 'model';
    text: string;
};

const AssistantIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

const SparkleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);

const VideoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);


const ListingAssistant: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    isLoading: boolean;
}> = ({ isOpen, onClose, messages, onSendMessage, isLoading }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = () => {
        if (input.trim()) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 z-50 animate-fade-in" onClick={onClose}>
            <div
                className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-base-200 dark:bg-dark-base-300 shadow-2xl flex flex-col transform transition-transform duration-300"
                style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-base-300 dark:border-dark-base-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold flex items-center gap-2"><AssistantIcon /> AI Listing Assistant</h3>
                    <button onClick={onClose} aria-label="Close assistant" className="text-base-content/50 dark:text-dark-base-content/50 hover:text-base-content dark:hover:text-dark-base-content text-2xl">&times;</button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-sm px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-primary-content' : 'bg-base-100 dark:bg-dark-base-100'}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex justify-start">
                             <div className="max-w-xs lg:max-w-sm px-4 py-2 rounded-2xl bg-base-100 dark:bg-dark-base-100">
                                <Spinner size="sm" />
                             </div>
                         </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-base-300 dark:border-dark-base-100">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                            placeholder="Ask for suggestions..."
                            className="w-full px-4 py-2 bg-base-100 dark:bg-dark-base-100 border border-base-300 dark:border-dark-base-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                            disabled={isLoading}
                        />
                        <button onClick={handleSend} disabled={isLoading} className="font-bold py-2 px-5 rounded-lg bg-primary text-primary-content hover:bg-primary-focus transition-colors disabled:bg-base-300 dark:disabled:bg-dark-base-300 w-20 flex justify-center">
                            {isLoading ? <Spinner size="sm" /> : 'Send'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PostItemFlow: React.FC<PostItemFlowProps> = ({ onClose, onPost }) => {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isSuggestingPrice, setIsSuggestingPrice] = useState(false);
  const [isSuggestingCategory, setIsSuggestingCategory] = useState(false);
  const [priceJustification, setPriceJustification] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { currency } = useSettings();

  // Video Generation State
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoProgressMessage, setVideoProgressMessage] = useState<string>('');

  // AI Assistant State
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            if (isAssistantOpen) {
                setIsAssistantOpen(false);
            } else {
                onClose();
            }
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, isAssistantOpen]);

  const handleInitialImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFiles([file]);
      setImageUrls([URL.createObjectURL(file)]);
      setIsLoading(true);
      setError(null);
      try {
        const { title: aiTitle } = await generateListingDetailsFromImage(file);
        setTitle(aiTitle);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleAddImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
        setError(null);
        const newFiles = Array.from(files).slice(0, 6 - imageFiles.length);
        
        if (imageFiles.length + files.length > 6) {
            setError(`You can only upload a maximum of 6 photos. ${6 - imageFiles.length} more photo(s) were added.`);
        }

        const newImageUrls = newFiles.map(file => URL.createObjectURL(file));
        setImageFiles(prev => [...prev, ...newFiles]);
        setImageUrls(prev => [...prev, ...newImageUrls]);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    if (indexToRemove === 0) return; // Main image cannot be removed this way
    URL.revokeObjectURL(imageUrls[indexToRemove]);
    setImageFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setImageUrls(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  
  const handleGenerateDescription = useCallback(async () => {
    if (!title) {
        setError("Please provide a title first.");
        return;
    }
    setIsGeneratingDesc(true);
    setError(null);
    try {
        const aiDescription = await generateDescriptionForListing(title);
        setDescription(aiDescription);
    } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
        setIsGeneratingDesc(false);
    }
  }, [title]);

  const handleSuggestPrice = useCallback(async () => {
    if (!title) {
        setError("Please provide a title first to get a price suggestion.");
        return;
    }
    setIsSuggestingPrice(true);
    setError(null);
    setPriceJustification(null);
    try {
        const { price: suggestedPrice, justification } = await suggestPriceForListing(title, description);
        setPrice(suggestedPrice.toString());
        setPriceJustification(justification);
    } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
        setIsSuggestingPrice(false);
    }
  }, [title, description]);

  const handleSuggestCategory = useCallback(async () => {
    if (!title) {
        setError("Please provide a title first to get a category suggestion.");
        return;
    }
    setIsSuggestingCategory(true);
    setError(null);
    try {
        const { category: suggestedCategory } = await suggestCategoryForListing(title, description);
        setCategory(suggestedCategory);
    } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
        setIsSuggestingCategory(false);
    }
  }, [title, description]);

  const handleGenerateVideo = useCallback(async () => {
    if (!imageFiles[0] || !title) {
        setError("An image and title are required to generate a video.");
        return;
    }
    setIsGeneratingVideo(true);
    setVideoProgressMessage('');
    setError(null);
    try {
        const onProgress = (message: string) => {
            setVideoProgressMessage(message);
        };
        const generatedVideoUrl = await generatePromotionalVideo(title, imageFiles[0], onProgress);
        setVideoUrl(generatedVideoUrl);
    } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred during video generation.');
    } finally {
        setIsGeneratingVideo(false);
        setVideoProgressMessage('');
    }
  }, [imageFiles, title]);

  const handleOpenAssistant = () => {
    if (!chatSessionRef.current) {
        chatSessionRef.current = createListingAssistantChatSession();
        setChatMessages([{ role: 'model', text: "Hi there! How can I help you make this listing perfect? Ask me for suggestions on the title, description, or price!" }]);
    }
    setIsAssistantOpen(true);
  };

  const handleSendChatMessage = async (message: string) => {
    if (!chatSessionRef.current) return;

    setChatMessages(prev => [...prev, { role: 'user', text: message }]);
    setIsAssistantLoading(true);

    const prompt = `The user's request is: "${message}".
Here is the current listing information for context:
- Title: "${title || '(not set)'}"
- Category: "${category || '(not set)'}"
- Location: "${address || '(not set)'}"
- Price: "${price ? `$${price}` : '(not set)'}"
- Description: "${description || '(not set)'}"

Please provide a helpful response or suggestion based on their request and the listing info.`;

    try {
        const response = await chatSessionRef.current.sendMessage({ message: prompt });
        setChatMessages(prev => [...prev, { role: 'model', text: response.text }]);
    } catch (e) {
        const errorMsg = e instanceof Error ? e.message : "Sorry, I couldn't respond right now.";
        setChatMessages(prev => [...prev, { role: 'model', text: errorMsg }]);
    } finally {
        setIsAssistantLoading(false);
    }
  };

  const validateDetails = () => {
    if (!title || !price || !description || imageUrls.length === 0 || !category || !address) {
        setError("Please fill out all fields and upload at least one photo.");
        return false;
    }
    if (parseFloat(price) <= 0) {
        setError("Price must be a positive number.");
        return false;
    }
    setError(null);
    return true;
  };

  const handlePost = () => {
    if (validateDetails()) {
      setIsLoading(true);
      setError(null);

      // Mock posting delay to show loading state
      setTimeout(() => {
        onPost({ title, price: parseFloat(price), description, imageUrls, videoUrl, category, sellerAddress: address });
        setIsLoading(false);
      }, 1500);
    }
  };
  
  const resetForm = () => {
      setImageFiles([]);
      imageUrls.forEach(url => URL.revokeObjectURL(url));
      setImageUrls([]);
      setTitle('');
      setCategory('');
      setPrice('');
      setDescription('');
      setError(null);
      setVideoUrl('');
      setVideoProgressMessage('');
      setAddress('');
  };
  
  const getCurrencySymbol = (currencyCode: Currency): string => {
    const symbols: Record<Exclude<Currency, 'Auto'>, string> = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'ZAR': 'R',
        'NGN': '₦',
    };
    const effectiveCode = currencyCode === 'Auto' ? 'ZAR' : currencyCode;
    return symbols[effectiveCode];
  };

  const inputClasses = "w-full px-4 py-3 bg-base-100 dark:bg-dark-base-300 border border-base-300 dark:border-dark-base-300 rounded-lg text-base-content dark:text-dark-base-content focus:outline-none focus:ring-2 focus:ring-primary transition-colors disabled:bg-base-200 dark:disabled:bg-dark-base-300 disabled:cursor-not-allowed";
  const selectClasses = `${inputClasses} appearance-none bg-no-repeat bg-right`;
  const btnClasses = "py-3 px-5 rounded-lg font-bold transition-colors disabled:cursor-not-allowed";
  const btnPrimary = `${btnClasses} bg-primary text-primary-content hover:bg-primary-focus disabled:bg-base-300 dark:disabled:bg-dark-base-300`;
  const btnSecondary = `${btnClasses} bg-secondary text-secondary-content hover:bg-secondary-focus disabled:bg-base-300 dark:disabled:bg-dark-base-300`;
  const btnAccent = `${btnClasses} bg-accent text-primary-content hover:bg-accent-focus disabled:bg-base-300 dark:disabled:bg-dark-base-300`;
  const btnGhost = `${btnClasses} bg-transparent hover:bg-base-300/60 dark:hover:bg-dark-base-300/60 disabled:text-base-content/50 dark:disabled:text-dark-base-content/50`;
  

  const renderContent = () => {
    if (imageFiles.length === 0) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Let's start with a photo</h2>
                <p className="text-base-content/70 dark:text-dark-base-content/70 mb-8">Our AI will try to generate a title for you.</p>
                {isLoading ? (
                    <Spinner text="Analyzing your item..." />
                ) : (
                    <div className="p-8 border-2 border-dashed border-base-300 dark:border-dark-base-300 rounded-lg hover:border-primary dark:hover:border-primary transition-colors">
                        <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleInitialImageUpload} />
                        <label htmlFor="file-upload" className="cursor-pointer text-primary font-semibold">
                            Click here to upload an image
                        </label>
                        <p className="text-xs text-base-content/50 dark:text-dark-base-content/50 mt-2">PNG, JPG, GIF up to 10MB</p>
                    </div>
                )}
                 {error && <p className="text-error mt-4">{error}</p>}
                 <div className="mt-8">
                     <Advertisement type="checkers" />
                 </div>
            </div>
        );
    }

    const wordCount = description.split(/\s+/).filter(Boolean).length;
    return (
        <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-2/5">
                    <div className="relative rounded-lg overflow-hidden shadow-lg aspect-square bg-base-100 dark:bg-dark-base-100 mb-2">
                        {videoUrl ? (
                            <video src={videoUrl} className="w-full h-full object-cover" controls autoPlay loop />
                        ) : (
                            <img src={imageUrls[0]} alt="Item preview" className="w-full h-full object-cover" />
                        )}
                         {isGeneratingVideo && (
                            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center p-4 animate-fade-in">
                                <Spinner text={videoProgressMessage || 'Initializing video AI...'} />
                            </div>
                        )}
                    </div>
                    
                    <input type="file" ref={fileInputRef} onChange={handleAddImages} accept="image/*" className="hidden" multiple />
                    <div className="grid grid-cols-5 gap-2">
                        {imageUrls.slice(1).map((url, index) => (
                             <div key={url} className="relative aspect-square rounded-md overflow-hidden group">
                                <img src={url} alt={`thumbnail ${index + 2}`} className="w-full h-full object-cover" />
                                <button
                                    onClick={() => handleRemoveImage(index + 1)}
                                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                        {imageUrls.length < 6 && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-square flex items-center justify-center border-2 border-dashed border-base-300 dark:border-dark-base-300 rounded-md hover:border-primary text-base-content/40 dark:text-dark-base-content/40 hover:text-primary transition-colors"
                                aria-label="Add more photos"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            </button>
                        )}
                    </div>

                    <div className="mt-4 space-y-2">
                        <button
                            onClick={handleGenerateVideo}
                            disabled={isGeneratingVideo || !title || !!videoUrl}
                            className={`w-full flex items-center justify-center ${btnPrimary}`}
                        >
                            {isGeneratingVideo ? <Spinner size="sm" /> : (
                                <>
                                    <VideoIcon />
                                    <span className="ml-2">{videoUrl ? 'Video Created' : 'Create Promo Video'}</span>
                                </>
                            )}
                        </button>
                        <button onClick={resetForm} className={`w-full ${btnGhost} text-base-content/70 dark:text-dark-base-content/70`}>
                            Use a different photo
                        </button>
                    </div>
                </div>
                <div className="flex-1 space-y-4">
                    <div>
                        <label htmlFor="title-input" className="block text-sm font-bold mb-1 text-base-content/80 dark:text-dark-base-content/80">Title</label>
                        <input id="title-input" type="text" placeholder="e.g. Vintage Leather Sofa" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClasses} />
                    </div>
                    <div>
                        <label htmlFor="category-select" className="block text-sm font-bold mb-1 text-base-content/80 dark:text-dark-base-content/80">Category</label>
                         <div className="flex items-center gap-2">
                            <select
                                id="category-select"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className={`${selectClasses} flex-1`}
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`
                                }}
                            >
                                <option value="" disabled>Select a category</option>
                                {MARKETPLACE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <button
                                onClick={handleSuggestCategory}
                                disabled={isSuggestingCategory || !title}
                                className={btnSecondary}
                                title="Suggest category with AI"
                            >
                                {isSuggestingCategory ? <Spinner size="sm" /> : <SparkleIcon />}
                                <span className="ml-2 hidden sm:inline">Suggest</span>
                            </button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="address-input" className="block text-sm font-bold mb-1 text-base-content/80 dark:text-dark-base-content/80">Your Location</label>
                        <input id="address-input" type="text" placeholder="e.g. Cape Town, Western Cape" value={address} onChange={e => setAddress(e.target.value)} className={inputClasses} />
                        <p className="text-xs text-base-content/50 dark:text-dark-base-content/50 mt-1">Provide a general location for buyers.</p>
                    </div>
                    <div>
                        <label htmlFor="price-input" className="block text-sm font-bold mb-1 text-base-content/80 dark:text-dark-base-content/80">Price ({getCurrencySymbol(currency)})</label>
                        <div className="flex items-center gap-2">
                            <input
                                id="price-input" 
                                type="number" 
                                placeholder="0.00" 
                                value={price} 
                                min="0" 
                                onChange={(e) => { setPrice(e.target.value); setPriceJustification(null); }} 
                                className={`${inputClasses} flex-1`}
                            />
                            <button 
                                onClick={handleSuggestPrice} 
                                disabled={isSuggestingPrice || !title}
                                className={btnSecondary}
                                title="Suggest price with AI"
                            >
                                {isSuggestingPrice ? <Spinner size="sm" /> : <SparkleIcon />}
                                <span className="ml-2 hidden sm:inline">Suggest</span>
                            </button>
                        </div>
                        {priceJustification && (
                            <p className="text-xs text-base-content/70 dark:text-dark-base-content/70 p-2 bg-base-100 dark:bg-dark-base-100/50 rounded-md mt-2 animate-fade-in">
                                <strong>AI Suggestion:</strong> {priceJustification}
                            </p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="details-input" className="block text-sm font-bold mb-1 text-base-content/80 dark:text-dark-base-content/80">Details</label>
                        <textarea id="details-input" placeholder="Describe your item..." value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className={`${inputClasses} h-auto resize-y`}></textarea>
                        <div className="flex justify-between items-center mt-1 pr-1">
                             <button onClick={handleGenerateDescription} disabled={isGeneratingDesc || !title} className={`${btnGhost} !text-secondary !text-sm !px-2 disabled:!text-base-content/50 dark:disabled:!text-dark-base-content/50`}>
                                {isGeneratingDesc ? <Spinner size="sm"/> : 'Generate with AI'}
                            </button>
                            <p className="text-xs text-base-content/50 dark:text-dark-base-content/50">{wordCount} words</p>
                        </div>
                    </div>
                </div>
            </div>

            {error && <p className="text-error mt-6 text-center">{error}</p>}
            
            <div className="mt-8 pt-6 border-t border-base-300 dark:border-dark-base-300 flex justify-end">
                <button onClick={handlePost} disabled={isLoading} className={`${btnAccent} w-full md:w-auto`}>
                    {isLoading ? <Spinner size="sm" /> : 'Post item'}
                </button>
            </div>
        </div>
    );
  };

  return (
    <div 
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" 
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
    >
        <ListingAssistant
            isOpen={isAssistantOpen}
            onClose={() => setIsAssistantOpen(false)}
            messages={chatMessages}
            onSendMessage={handleSendChatMessage}
            isLoading={isAssistantLoading}
        />
      <div className="bg-base-200 dark:bg-dark-base-200 rounded-2xl shadow-2xl w-full max-w-4xl p-6 sm:p-8 overflow-y-auto max-h-[90vh] animate-slide-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6">
            <h1 id="modal-title" className="text-3xl font-bold">Post an item</h1>
            <div className="flex items-center gap-2">
                <button onClick={handleOpenAssistant} className={`flex items-center gap-2 ${btnGhost} !rounded-lg`} aria-label="Open AI Assistant">
                    <AssistantIcon/> <span className="hidden md:inline">AI Assistant</span>
                </button>
                <button onClick={onClose} aria-label="Close" className="text-base-content/50 dark:text-dark-base-content/50 hover:text-base-content dark:hover:text-dark-base-content text-3xl leading-none">&times;</button>
            </div>
        </div>
        <div>
            {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default PostItemFlow;