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
  razorpayLink?: string;
  content?: string;
  screenshots?: string[];
  youtubeUrl?: string;
  createdAt: number;
}

export interface Purchase {
  id: string;
  userId: string;
  productId: string;
  productType: 'course' | 'website';
  purchaseDate: number;
  amount: number;
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
