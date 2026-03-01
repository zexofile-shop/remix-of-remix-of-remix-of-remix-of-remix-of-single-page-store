export type ImageAspectRatio = '1:1' | '4:5' | '5:4' | '3:4' | '4:3' | '9:16' | '16:9' | '2:3' | '3:2';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  type: string;
  category?: string;
  previewLink?: string;
  razorpayLink?: string;
  deliveryLink?: string;
  content?: string;
  screenshots?: string[];
  youtubeUrl?: string;
  isFreeResource?: boolean;
  allowCustomization?: boolean;
  isOutOfStock?: boolean;
  /** Custom label for the single buy button (when dual buttons not enabled) */
  buyButtonLabel?: string;
  /** Which price should be shown as the main price on cards/details when dual buttons exist */
  displayPriceFrom?: 'base' | 'left' | 'right';
  /** Image aspect ratio for product images */
  imageAspectRatio?: ImageAspectRatio;
  // Dual pricing configuration
  leftButton?: {
    label?: string;
    description?: string;
    price: number;
    originalPrice?: number;
  };
  rightButton?: {
    label?: string;
    description?: string;
    price: number;
    originalPrice?: number;
    showForm?: boolean; // Show customization form after payment
  };
  createdAt: number;
}

export interface CartItem {
  product: Product;
  selectedOption: 'left' | 'right';
  price: number;
  label: string;
}

export interface Purchase {
  id: string;
  userId: string;
  userEmail?: string;
  productId: string;
  productTitle?: string;
  productImage?: string;
  productType: string;
  purchaseDate: number;
  amount: number;
  razorpayPaymentId?: string;
  deliveryLink?: string;
  purchaseType?: 'source_code' | 'customized' | 'left' | 'right';
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

export interface OrderSubmission {
  id: string;
  userId: string;
  userEmail: string;
  userName?: string;
  productId: string;
  productTitle: string;
  productImage: string;
  paymentType: 'left' | 'right';
  paymentAmount: number;
  razorpayPaymentId: string;
  formData?: CustomizationFormData;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: number;
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
