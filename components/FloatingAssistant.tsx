import React, { useState, useRef, useEffect } from 'react';
import { createAnitaChatSession } from '../services/geminiService';
import type { User, Listing } from '../types';
import type { Chat } from '@google/genai';
import Spinner from './common/Spinner';

// Icon for Anita's bubble
const AssistantIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

type AssistantMessage = {
    role: 'user' | 'model';
    text: string;
};

interface FloatingAssistantProps {
    user: User;
    searchTerm: string;
    activeListing: Listing | null;
}

const FloatingAssistant: React.FC<FloatingAssistantProps> = ({ user, searchTerm, activeListing }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<AssistantMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [input, setInput] = useState('');
    
    const chatSessionRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize chat session and first message when opened for the first time
    const initChat = () => {
        if (!chatSessionRef.current) {
            chatSessionRef.current = createAnitaChatSession();
            setMessages([{ 
                role: 'model', 
                text: `Hi ${user.username}! I'm Anita, your personal marketplace assistant. How can I help you today? 😊` 
            }]);
        }
    };

    const toggleAssistant = () => {
        setIsOpen(prev => {
            const nextState = !prev;
            if (nextState) {
                initChat();
            }
            return nextState;
        });
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const handleSendMessage = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: AssistantMessage = { role: 'user', text: input.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        let contextPrompt = `(Context for you, Anita: The user is ${user.username}. `;
        if (activeListing) {
            contextPrompt += `They are currently viewing the listing "${activeListing.title}" by seller ${activeListing.seller.username}. `;
        } else if (searchTerm) {
            contextPrompt += `They have searched for "${searchTerm}". `;
        } else {
            contextPrompt += `They are on the main marketplace page. `;
        }
        contextPrompt += `Give a helpful response to their message.)\n\nUser's message: "${userMessage.text}"`;

        try {
            if (!chatSessionRef.current) {
                throw new Error("Chat session not initialized.");
            }
            const response = await chatSessionRef.current.sendMessage({ message: contextPrompt });
            setMessages(prev => [...prev, { role: 'model', text: response.text }]);
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : "Sorry, I'm having a little trouble connecting right now.";
            setMessages(prev => [...prev, { role: 'model', text: errorMsg }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* The Chat Window */}
            <div 
                className={`fixed bottom-20 left-4 w-full max-w-sm h-[60vh] bg-base-100 dark:bg-dark-base-200 rounded-2xl shadow-2xl flex flex-col z-50 transition-all duration-300 ease-out ${
                    isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
                }`}
                aria-hidden={!isOpen}
            >
                {/* Header */}
                <div className="p-4 border-b border-base-300 dark:border-dark-base-300 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-accent text-white flex items-center justify-center">
                            <AssistantIcon className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold">Anita</h3>
                    </div>
                    <button onClick={() => setIsOpen(false)} aria-label="Close assistant" className="text-base-content/50 dark:text-dark-base-content/50 hover:text-base-content dark:hover:text-dark-base-content text-2xl">&times;</button>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-sm px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-primary-content' : 'bg-base-200 dark:bg-dark-base-300'}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="max-w-xs lg:max-w-sm px-4 py-2 rounded-2xl bg-base-200 dark:bg-dark-base-300">
                                <Spinner size="sm" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-base-300 dark:border-dark-base-300 flex-shrink-0">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Ask me anything..."
                            className="w-full px-4 py-2 bg-base-200 dark:bg-dark-base-300 border border-base-300 dark:border-dark-base-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                            disabled={isLoading}
                            aria-label="Chat with Anita"
                        />
                        <button onClick={handleSendMessage} disabled={isLoading || !input.trim()} className="font-bold py-2 px-5 rounded-lg bg-primary text-primary-content hover:bg-primary-focus transition-colors disabled:bg-base-300 dark:disabled:bg-dark-base-300">
                            Send
                        </button>
                    </div>
                </div>
            </div>

            {/* The Floating Bubble */}
            <button
                onClick={toggleAssistant}
                className="fixed bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-secondary to-accent text-white rounded-full shadow-lg z-50 flex items-center justify-center transform hover:scale-110 transition-transform focus:outline-none focus:ring-4 focus:ring-secondary/50"
                aria-label={isOpen ? 'Close Anita AI assistant' : 'Open Anita AI assistant'}
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                    <AssistantIcon className="w-8 h-8"/>
                )}
            </button>
        </>
    );
};

export default FloatingAssistant;
