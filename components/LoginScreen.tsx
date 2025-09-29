import React, { useState } from 'react';
import type { User } from '../types';
import GoMarketLogo from './common/GoMarketLogo';
import Spinner from './common/Spinner';

const GoogleIcon = ({ big = false }: { big?: boolean }) => (
    <svg className={big ? "w-8 h-8 mx-auto" : "w-5 h-5 mr-3"} aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
    </svg>
);

const EyeIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const EyeSlashIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
    </svg>
);


interface LoginScreenProps {
  onLogin: (user: User) => void;
  onNavigateToRegister: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onNavigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const [isGoogleAuthModalOpen, setIsGoogleAuthModalOpen] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);


  const openGoogleAuthModal = () => {
    setError(null);
    setIsGoogleAuthModalOpen(true);
  };
  
  const closeGoogleAuthModal = () => {
    if (isGoogleLoading) return;
    setIsGoogleAuthModalOpen(false);
  }

  const handleConfirmGoogleLogin = () => {
    setIsGoogleLoading(true);
    // Mock API call to sign in and check if user exists in our "database" (localStorage)
    setTimeout(() => {
        const storedUserJSON = localStorage.getItem('gomarket_user_profile');
        let userToLogin: User;

        if (storedUserJSON) {
            // An existing user is logging in. Load their profile.
            userToLogin = JSON.parse(storedUserJSON);
            // For migrating existing users
            if (!userToLogin.username) {
                userToLogin.username = userToLogin.name.toLowerCase().replace(/\s+/g, '_');
            }
            if (!userToLogin.location) { // Add location if missing
                 userToLogin.location = 'Johannesburg, GP';
            }
            if (userToLogin.acceptedTerms === undefined) {
                userToLogin.acceptedTerms = true;
            }
        } else {
            // This is a brand new user who has never logged in before.
            userToLogin = {
                name: "Demo User",
                username: "demouser",
                avatarUrl: `https://i.pravatar.cc/150?u=demouser`,
                status: 'unverified',
                location: 'Johannesburg, GP',
                acceptedTerms: true,
            };
        }
        onLogin(userToLogin);
    }, 1500);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Mock API calls
    setTimeout(() => {
        const storedUserJSON = localStorage.getItem('gomarket_user_profile');
        if (storedUserJSON) {
            const user = JSON.parse(storedUserJSON);
            // For migrating existing users
            if (!user.username) {
                user.username = user.name.toLowerCase().replace(/\s+/g, '_');
            }
             if (!user.location) { // Add location if missing
                user.location = 'Johannesburg, GP';
            }
            if (user.acceptedTerms === undefined) {
                user.acceptedTerms = true;
            }
            onLogin(user);
        } else {
            setError('No account found. Please register first.');
            setIsLoading(false);
        }
    }, 1000);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsResettingPassword(true);
    // Simulate sending the email
    setTimeout(() => {
        setResetEmailSent(true);
        setIsResettingPassword(false);
    }, 1000);
  };

  const openForgotPasswordModal = () => {
    setError(null); // Clear main form errors
    setIsForgotPasswordModalOpen(true);
  };
  
  const closeForgotPasswordModal = () => {
    setIsForgotPasswordModalOpen(false);
    // Reset state after a short delay to allow for fade-out animation
    setTimeout(() => {
        setResetEmail('');
        setResetEmailSent(false);
        setIsResettingPassword(false);
    }, 300);
  };

  const inputClasses = "w-full px-4 py-3 bg-base-200 dark:bg-dark-base-200 border border-base-300 dark:border-dark-base-300 rounded-lg text-base-content dark:text-dark-base-content focus:outline-none focus:ring-2 focus:ring-primary transition-colors";

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200 dark:bg-dark-base-200 p-4">
      <div className="w-full max-w-sm p-8 space-y-6 bg-base-100 dark:bg-dark-base-100 rounded-2xl shadow-2xl animate-slide-in-up">
        <div className="flex flex-col items-center text-center">
            <GoMarketLogo iconSize={64} textSize="text-3xl" />
            <h1 className="text-2xl font-bold mt-6">Welcome back!</h1>
            <p className="text-base-content/70 dark:text-dark-base-content/70 mt-1">Sign in to continue to GoMarket</p>
        </div>

        <div>
            <form className="mt-6 space-y-4" onSubmit={handleFormSubmit}>
                <div>
                    <label htmlFor="email-input" className="sr-only">Email</label>
                    <input id="email-input" type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className={inputClasses} required />
                </div>
                <div className="relative">
                    <label htmlFor="password-input" className="sr-only">Password</label>
                    <input
                        id="password-input"
                        type={isPasswordVisible ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className={`${inputClasses} pr-12`}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        className="absolute inset-y-0 right-0 flex items-center px-4 text-base-content/60 dark:text-dark-base-content/60 hover:text-base-content dark:hover:text-dark-base-content transition-colors"
                        aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                    >
                        {isPasswordVisible ? <EyeSlashIcon /> : <EyeIcon />}
                    </button>
                </div>

                <div className="flex items-center justify-end">
                    <div className="text-sm">
                        <button 
                            type="button" 
                            onClick={openForgotPasswordModal} 
                            className="font-medium text-primary hover:text-primary-focus focus:outline-none focus:underline"
                        >
                            Forgot your password?
                        </button>
                    </div>
                </div>
                
                {error && <p className="text-sm text-center text-error">{error}</p>}
                
                <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent hover:bg-accent-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-focus disabled:bg-base-300 dark:disabled:bg-dark-base-300 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? <Spinner size="sm" /> : 'Sign In'}
                </button>
            </form>
        </div>
        
        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-base-300 dark:border-dark-base-300" />
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-base-100 dark:bg-dark-base-100 text-base-content/60 dark:text-dark-base-content/60">OR</span>
            </div>
        </div>

        <div>
            <button
                type="button"
                onClick={openGoogleAuthModal}
                disabled={isLoading}
                className="group relative w-full flex justify-center items-center py-3 px-4 border border-base-300 dark:border-dark-base-300 text-sm font-medium rounded-md text-base-content dark:text-dark-base-content hover:bg-base-200 dark:hover:bg-dark-base-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:cursor-not-allowed transition-colors"
            >
                <GoogleIcon/> Continue with Google
            </button>
        </div>

        <div className="text-sm text-center mt-4">
            <button 
                type="button" 
                onClick={onNavigateToRegister} 
                className="font-medium text-primary hover:text-primary-focus focus:outline-none focus:underline"
            >
                Don't have an account? Register now
            </button>
        </div>
      </div>
      
      {isGoogleAuthModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={closeGoogleAuthModal} role="dialog" aria-modal="true" aria-labelledby="google-auth-title">
            <div className="bg-base-100 dark:bg-dark-base-100 rounded-lg shadow-xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                {isGoogleLoading ? (
                    <div className="p-12 text-center">
                        <Spinner text="Connecting to cloud..." />
                    </div>
                ) : (
                    <>
                        <div className="p-6 border-b border-base-300 dark:border-dark-base-300 text-center">
                            <GoogleIcon big />
                            <h2 id="google-auth-title" className="text-xl font-semibold mt-4">Choose an account</h2>
                            <p className="text-sm text-base-content/70 dark:text-dark-base-content/70 mt-1">to continue to GoMarket AI</p>
                        </div>
                        <div className="p-2 sm:p-4">
                            <button onClick={handleConfirmGoogleLogin} className="w-full flex items-center p-3 rounded-lg hover:bg-base-200 dark:hover:bg-dark-base-200 transition-colors">
                                <img src={`https://i.pravatar.cc/150?u=demouser`} alt="Demo User" className="w-10 h-10 rounded-full" />
                                <div className="ml-4 text-left">
                                    <p className="font-semibold">Demo User</p>
                                    <p className="text-sm text-base-content/70 dark:text-dark-base-content/70">demouser@example.com</p>
                                </div>
                            </button>
                        </div>
                        <div className="p-6 border-t border-base-300 dark:border-dark-base-300 text-center">
                            <p className="text-xs text-base-content/60 dark:text-dark-base-content/60">
                                To continue, Google will share your name, email address, and profile picture with GoMarket AI.
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
      )}

      {isForgotPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={closeForgotPasswordModal} role="dialog" aria-modal="true" aria-labelledby="reset-modal-title">
            <div className="bg-base-100 dark:bg-dark-base-100 rounded-2xl shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 sm:p-6 border-b border-base-300 dark:border-dark-base-300">
                    <h2 id="reset-modal-title" className="text-xl font-bold">Reset Password</h2>
                    <button onClick={closeForgotPasswordModal} aria-label="Close" className="text-base-content/50 dark:text-dark-base-content/50 hover:text-base-content dark:hover:text-dark-base-content text-3xl leading-none">&times;</button>
                </header>
                <main className="p-4 sm:p-6">
                    {resetEmailSent ? (
                        <div className="text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-success mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-base-content/80 dark:text-dark-base-content/80">
                                If an account exists for <strong>{resetEmail}</strong>, a password reset link has been sent. Please check your inbox.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                            <p className="text-sm text-base-content/80 dark:text-dark-base-content/80">
                                Enter your email address below and we'll send you a link to reset your password.
                            </p>
                            <div>
                                <label htmlFor="reset-email-input" className="sr-only">Email Address</label>
                                <input
                                    id="reset-email-input"
                                    type="email"
                                    placeholder="Email Address"
                                    value={resetEmail}
                                    onChange={e => setResetEmail(e.target.value)}
                                    className={inputClasses}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isResettingPassword}
                                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus disabled:bg-primary/70 disabled:cursor-not-allowed transition-colors"
                            >
                                {isResettingPassword ? <Spinner size="sm" /> : 'Send Reset Link'}
                            </button>
                        </form>
                    )}
                </main>
                <footer className="p-4 sm:p-6 border-t border-base-300 dark:border-dark-base-300 text-right">
                    <button onClick={closeForgotPasswordModal} className="bg-base-200 dark:bg-dark-base-200 text-base-content dark:text-dark-base-content font-bold py-2 px-5 rounded-lg hover:bg-base-300 dark:hover:bg-dark-base-300 transition-colors">
                        {resetEmailSent ? 'Close' : 'Cancel'}
                    </button>
                </footer>
            </div>
        </div>
      )}
    </div>
  );
};

export default LoginScreen;