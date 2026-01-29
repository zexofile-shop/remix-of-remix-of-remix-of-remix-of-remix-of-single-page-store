export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  type: 'course' | 'website';
  category?: string;
  previewLink?: string;
  razorpayLink?: string; // Legacy field - kept for backward compatibility
  deliveryLink?: string; // Link that user gets after purchase
  content?: string;
  screenshots?: string[];
  youtubeUrl?: string;
  isFreeResource?: boolean; // Products with price 0 can be marked as free
  allowCustomization?: boolean; // Allow user to customize before purchase
  createdAt: number;
}

export interface Purchase {
  id: string;
  userId: string;
  userEmail?: string;
  productId: string;
  productTitle?: string;
  productImage?: string;
  productType: 'course' | 'website';
  purchaseDate: number;
  amount: number;
  razorpayPaymentId?: string;
  deliveryLink?: string;
  purchaseType?: 'source_code' | 'customized';
  customizationData?: CustomizationFormData;
}

export interface CustomizationFormData {
  name: string;
  instagramTelegramId?: string;
  callingNumber: string;
  whatsappNumber: string;
  alternativeNumber?: string;
  photos?: string[];
  videoDriveLink?: string;
  submittedAt: number;
}

export interface CustomProject {
  id: string;
  userId: string;
  userEmail: string;
  title: string;
  type: 'website' | 'app' | 'other';
  description: string;
  budget: string;
  contact: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  createdAt: number;
  adminNotes?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  message: string;
  rating: number;
  createdAt: number;
  approved: boolean;
}

export interface SupportChannels {
  telegram1?: string;
  telegram2?: string;
  whatsapp1?: string;
  whatsapp2?: string;
  phone1?: string;
  phone2?: string;
}
