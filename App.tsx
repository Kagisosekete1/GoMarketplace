import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { AppScreen, AppMode, SubscriptionPlan } from './types';
import type { User, Listing, Review, ChatMessage } from './types';
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import RegistrationScreen from './components/RegistrationScreen';
import ModeSelectScreen from './components/ModeSelectScreen';
import HomeScreen from './components/HomeScreen';
import SettingsScreen from './components/SettingsScreen';
import ProfileScreen from './components/ProfileScreen';
import SubscriptionScreen from './components/SubscriptionScreen';
import PaymentScreen from './components/PaymentScreen';
import SavedListingsScreen from './components/SavedListingsScreen';
import InboxScreen from './components/InboxScreen';
import ListingDetailModal from './components/ListingDetailModal';
import { mockListings } from './mockData';
import Toast from './components/common/Toast';
import PendingVerificationScreen from './components/PendingVerificationScreen';

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.SPLASH);
  const [user, setUser] = useState<User | null>(null);
  const [appMode, setAppMode] = useState<AppMode>(AppMode.BROWSE);
  const [viewingProfile, setViewingProfile] = useState<User | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  
  const [listings, setListings] = useState<Listing[]>(mockListings);
  const [savedListingIds, setSavedListingIds] = useState<Set<string>>(new Set());

  // State for the centrally managed modal
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [initialModalTab, setInitialModalTab] = useState<'details' | 'chat'>('details');

  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const unreadCount = useMemo(() => {
    if (!user) return 0;
    
    return listings.reduce((count, listing) => {
      const hasChat = listing.chatHistory && listing.chatHistory.length > 0;
      if (!hasChat) return count;

      const isSeller = listing.seller.username === user.username;
      // Check if user is a participant by checking if they sent any message
      const isParticipant = listing.chatHistory.some(msg => msg.senderUsername === user.username);

      // Only count conversations the user is actually part of
      if (isSeller || isParticipant) {
        const lastMessage = listing.chatHistory[listing.chatHistory.length - 1];
        // If the last message is not from the current user, it's unread
        if (lastMessage && lastMessage.senderUsername !== user.username) {
          return count + 1;
        }
      }
      return count;
    }, 0);
  }, [listings, user]);

  const navigateUser = useCallback((targetUser: User) => {
    if (targetUser.status === 'pending_verification') {
        setScreen(AppScreen.PENDING_VERIFICATION);
    } else {
        setScreen(AppScreen.MODE_SELECT);
    }
  }, []);

  // This effect runs once on app startup to handle the splash screen and initial routing.
  useEffect(() => {
    const splashTimer = setTimeout(() => {
      // Check for a stored user session to keep them logged in.
      const storedUserJSON = localStorage.getItem('gomarket_user_profile');
      if (storedUserJSON) {
        try {
          const storedUser = JSON.parse(storedUserJSON) as User;
          setUser(storedUser);
          navigateUser(storedUser);
        } catch (error) {
          console.error("Failed to parse stored user profile, navigating to login.", error);
          // If parsing fails, clear the bad data and go to login.
          localStorage.removeItem('gomarket_user_profile');
          setScreen(AppScreen.LOGIN);
        }
      } else {
        // No stored user, show the login screen.
        setScreen(AppScreen.LOGIN);
      }
    }, 2500); // This duration matches the splash screen's animation.

    return () => clearTimeout(splashTimer);
  }, [navigateUser]);

  // Effect to handle navigation when user status changes from pending to verified
    useEffect(() => {
        if (user && user.status === 'verified' && screen === AppScreen.PENDING_VERIFICATION) {
            setToast({ message: 'Your account has been verified!', type: 'success' });
            setScreen(AppScreen.MODE_SELECT);
        }
    }, [user, screen]);


  useEffect(() => {
    // Sync selected listing with main listings state in case it gets updated
    if (selectedListing) {
        const updatedListing = listings.find(l => l.id === selectedListing.id);
        if (updatedListing) {
            setSelectedListing(updatedListing);
        } else {
            setSelectedListing(null); // Listing was removed, so close modal
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listings]);

  const handleSelectListing = useCallback((listing: Listing, initialTab: 'details' | 'chat' = 'details') => {
    setSelectedListing(listing);
    setInitialModalTab(initialTab);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedListing(null);
  }, []);


  useEffect(() => {
    const storedSavedListings = localStorage.getItem('gomarket_saved_listings');
    if (storedSavedListings) {
      try {
        setSavedListingIds(new Set(JSON.parse(storedSavedListings)));
      } catch (e) {
        console.error("Failed to parse saved listings:", e);
      }
    }
  }, []);

  const toggleSaveListing = useCallback((listingId: string) => {
    setSavedListingIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(listingId)) {
            newSet.delete(listingId);
            setToast({ message: 'Item removed from saved list.', type: 'success' });
        } else {
            newSet.add(listingId);
            setToast({ message: 'Item saved successfully!', type: 'success' });
        }
        localStorage.setItem('gomarket_saved_listings', JSON.stringify(Array.from(newSet)));
        return newSet;
    });
  }, []);

  const handlePostItem = (newListingData: Omit<Listing, 'id' | 'seller' | 'status'>) => {
    if (!user) return;
    const newListing: Listing = {
        id: (listings.length + 1).toString(),
        ...newListingData,
        seller: user,
        status: 'available',
        chatHistory: [],
    };
    setListings([newListing, ...listings]);
    setToast({ message: 'Your listing is now live!', type: 'success' });
  };

  const handleUpdateListingStatus = (listingId: string, status: 'available' | 'sold' | 'pending') => {
      setListings(prevListings =>
        prevListings.map(l =>
          l.id === listingId ? { ...l, status } : l
        )
      );
  };
    
  const handleInitiatePurchase = (listingId: string) => {
      if (!user) return;
      setListings(prevListings =>
        prevListings.map(l =>
          l.id === listingId ? { ...l, status: 'pending' as const, buyerName: user.username, buyerAvatarUrl: user.avatarUrl } : l
        )
      );
      handleCloseModal();
  };
    
  const handleAddReview = (listingId: string, review: Review) => {
      const listing = listings.find(l => l.id === listingId);
      if (!listing) return;
      const sellerName = listing.seller.name;
  
      setListings(prevListings =>
        prevListings.map(l => {
            let newListing = { ...l };
            if (newListing.id === listingId) {
                newListing.reviewLeft = true;
            }
            if (newListing.seller.name === sellerName) {
                const updatedReviews = [...(newListing.seller.reviews || []), review];
                newListing.seller = { ...newListing.seller, reviews: updatedReviews };
            }
            return newListing;
        })
      );
  };

  const handleUpdateChat = (listingId: string, newChatHistory: ChatMessage[]) => {
    setListings(prevListings =>
        prevListings.map(l =>
          l.id === listingId ? { ...l, chatHistory: newChatHistory } : l
        )
    );
  };


  const handleLogin = useCallback((loggedInUser: User) => {
    setUser(loggedInUser);
    // Persist user profile on login/register
    localStorage.setItem('gomarket_user_profile', JSON.stringify(loggedInUser));
    navigateUser(loggedInUser);
    setToast({ message: 'Login successful. Your session is saved.', type: 'success' });
  }, [navigateUser]);

  const handleUserUpdate = useCallback((updatedUser: User) => {
      setUser(updatedUser);
      localStorage.setItem('gomarket_user_profile', JSON.stringify(updatedUser));
      setToast({ message: 'Profile updated and saved to the cloud.', type: 'success' });
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    // Clear user profile to allow re-running the new user flow
    localStorage.removeItem('gomarket_user_profile');
    setScreen(AppScreen.LOGIN);
  }, []);

  const handleModeSelect = useCallback((mode: AppMode) => {
    setAppMode(mode);
    setScreen(AppScreen.HOME);
  }, []);
  
  const handleNavigateToSettings = useCallback(() => {
    setScreen(AppScreen.SETTINGS);
  }, []);

  const handleNavigateHome = useCallback(() => {
    setViewingProfile(null); // Clear viewing profile when navigating home
    setScreen(AppScreen.HOME);
  }, []);

  const handleNavigateToProfile = useCallback((profileUser: User) => {
    setViewingProfile(profileUser);
    setScreen(AppScreen.PROFILE);
  }, []);

  const handleNavigateToSubscription = useCallback(() => {
    setScreen(AppScreen.SUBSCRIPTION);
  }, []);
  
  const handleNavigateToPayment = useCallback((plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setScreen(AppScreen.PAYMENT);
  }, []);

  const handleNavigateToSavedListings = useCallback(() => {
    setScreen(AppScreen.SAVED_LISTINGS);
  }, []);
  
  const handleNavigateToInbox = useCallback(() => {
    setScreen(AppScreen.INBOX);
  }, []);

  const handleNavigateToRegister = useCallback(() => {
    setScreen(AppScreen.REGISTER);
  }, []);

  const handleNavigateToLogin = useCallback(() => {
    setScreen(AppScreen.LOGIN);
  }, []);


  const renderCurrentScreen = () => {
    // The splash screen is always the first screen, managed by the initial state and the main useEffect.
    if (screen === AppScreen.SPLASH) {
        return <SplashScreen />;
    }

    switch (screen) {
      case AppScreen.LOGIN:
        return <LoginScreen onLogin={handleLogin} onNavigateToRegister={handleNavigateToRegister} />;
      case AppScreen.REGISTER:
        return <RegistrationScreen onRegister={handleLogin} onNavigateToLogin={handleNavigateToLogin} />;
      case AppScreen.MODE_SELECT:
        return <ModeSelectScreen onModeSelect={handleModeSelect} />;
      case AppScreen.PENDING_VERIFICATION:
        if (user) {
          return <PendingVerificationScreen user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />;
        }
        handleLogout();
        return null;
      case AppScreen.SETTINGS:
        if (user) {
          return <SettingsScreen
            user={user}
            onUserUpdate={handleUserUpdate}
            onLogout={handleLogout}
            onBack={handleNavigateHome}
            onNavigateToSubscription={handleNavigateToSubscription}
            listings={listings}
            savedListingIds={savedListingIds}
            onSelectListing={handleSelectListing}
            onToggleSave={toggleSaveListing}
          />;
        }
        handleLogout();
        return null;
      case AppScreen.PROFILE:
        if (viewingProfile) {
          return <ProfileScreen user={viewingProfile} onBack={handleNavigateHome} />;
        }
        handleNavigateHome();
        return null;
      case AppScreen.SUBSCRIPTION:
        return <SubscriptionScreen onBack={handleNavigateToSettings} onSelectPlan={handleNavigateToPayment} />;
      case AppScreen.PAYMENT:
        if (selectedPlan && user) {
            return <PaymentScreen plan={selectedPlan} user={user} onBack={handleNavigateToSubscription} onPaymentSuccess={handleNavigateHome} />;
        }
        handleNavigateToSubscription();
        return null;
      case AppScreen.SAVED_LISTINGS:
        if (user) {
          return <SavedListingsScreen 
            user={user} 
            listings={listings} 
            savedListingIds={savedListingIds}
            onToggleSave={toggleSaveListing}
            onBack={handleNavigateHome}
            onSelectListing={handleSelectListing}
          />;
        }
        handleLogout();
        return null;
       case AppScreen.INBOX:
        if (user) {
          return <InboxScreen 
            user={user} 
            listings={listings} 
            onBack={handleNavigateHome}
            onSelectListing={handleSelectListing}
          />;
        }
        handleLogout();
        return null;
      case AppScreen.HOME:
        if (user) {
          return <HomeScreen 
            user={user} 
            initialMode={appMode} 
            listings={listings}
            savedListingIds={savedListingIds}
            onToggleSave={toggleSaveListing}
            onPostItem={handlePostItem}
            onNavigateToSettings={handleNavigateToSettings} 
            onNavigateToSavedListings={handleNavigateToSavedListings}
            onNavigateToInbox={handleNavigateToInbox}
            onLogout={handleLogout} 
            onNavigateToProfile={handleNavigateToProfile} 
            onUserUpdate={handleUserUpdate} 
            onSelectListing={handleSelectListing}
            unreadCount={unreadCount}
          />;
        }
        handleLogout();
        return null;
      default:
        // This case should not be reached if the logic is correct, but it's a safe fallback.
        return <SplashScreen />;
    }
  };

  return (
    <div className="bg-base-100 dark:bg-dark-base-100 text-base-content dark:text-dark-base-content min-h-screen transition-colors duration-300">
      {renderCurrentScreen()}
      {selectedListing && user && (
          <ListingDetailModal 
              listing={selectedListing} 
              user={user}
              onClose={handleCloseModal} 
              onUpdateStatus={handleUpdateListingStatus}
              onPurchase={handleInitiatePurchase}
              onAddReview={handleAddReview}
              onNavigateToProfile={handleNavigateToProfile}
              onUpdateChat={handleUpdateChat}
              initialTab={initialModalTab}
          />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default App;