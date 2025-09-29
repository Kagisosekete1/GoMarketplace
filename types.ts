export enum AppScreen {
  SPLASH,
  LOGIN,
  REGISTER,
  MODE_SELECT,
  HOME,
  SETTINGS,
  PROFILE,
  SUBSCRIPTION,
  PAYMENT,
  SAVED_LISTINGS,
  INBOX,
  PENDING_VERIFICATION,
}

export enum AppMode {
  BROWSE,
  SELL,
}

export enum SubscriptionPlan {
  FREE = 'Free',
  PRO = 'Pro',
  PREMIER = 'Premier',
}

export interface Review {
  rating: number;
  comment: string;
  buyerName: string;
  date: string;
}

export interface User {
  name: string; // Real name for verification
  username: string; // Public display name
  avatarUrl: string;
  status: 'verified' | 'pending_verification' | 'unverified';
  reviews?: Review[];
  idNumber?: string; // For in-person ID verification
  idDocumentUrl?: string; // URL to the verified ID document image
  location?: string; // e.g., "Cape Town, WC"
  acceptedTerms?: boolean;
  aiAutoReplyEnabled?: boolean;
}

export interface ChatMessage {
  senderUsername: string;
  text: string;
  timestamp: string;
  imageUrl?: string;
  status?: 'sent' | 'delivered' | 'read';
  isAIMessage?: boolean;
}

export interface Listing {
  id: string;
  title: string;
  price: number;
  description: string;
  imageUrls: string[];
  videoUrl?: string;
  seller: User;
  category: string;
  status: 'available' | 'sold' | 'pending';
  sellerAddress?: string;
  buyerName?: string;
  buyerAvatarUrl?: string;
  reviewLeft?: boolean;
  chatHistory?: ChatMessage[];
}

export interface BuyingGuideSource {
  uri: string;
  title: string;
}

export interface BuyingGuide {
  guide: string;
  sources: BuyingGuideSource[];
}

export interface SavedSearch {
  id: string;
  term: string;
  createdAt: string;
}