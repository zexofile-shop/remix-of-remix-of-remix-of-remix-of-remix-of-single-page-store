# 🚀 ZexoFile E-Commerce Website - Master Prompt

Use this prompt to recreate the complete ZexoFile digital products e-commerce website with all features, UI/UX, and integrations.

---

## 📋 PROJECT OVERVIEW

Create a modern, dark-themed e-commerce website for selling digital products (courses and website templates). The platform should have:
- **Frontend**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Firebase (Realtime Database + Authentication)
- **Payments**: Razorpay API integration
- **Theme**: Dark mode with indigo/purple accent colors

---

## 🎨 DESIGN SYSTEM

### Color Palette (HSL Values)
```css
:root {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --card: 240 10% 3.9%;
  --card-foreground: 0 0% 98%;
  --primary: 239 84% 67%;        /* Indigo accent */
  --primary-foreground: 0 0% 98%;
  --secondary: 240 3.7% 15.9%;
  --muted: 240 3.7% 15.9%;
  --accent: 240 3.7% 15.9%;
  --destructive: 0 62.8% 30.6%;
  --border: 240 3.7% 15.9%;
  --ring: 239 84% 67%;
}
```

### Typography
- **Headings**: Bold, gradient text (primary to purple)
- **Body**: Clean, readable with proper contrast
- **Font Family**: System fonts (Inter-like)

### UI Components
- Use shadcn/ui components throughout
- Glassmorphism effects with backdrop blur
- Smooth animations and transitions
- Gradient buttons and accents
- Card-based layouts with hover effects

---

## 🔐 FIREBASE CONFIGURATION

### Firebase Config
```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

export const ADMIN_EMAIL = "admin@example.com"; // Set admin email
```

### Database Structure
```
firebase-database/
├── products/
│   └── {productId}/
│       ├── id: string
│       ├── title: string
│       ├── description: string
│       ├── price: number
│       ├── originalPrice?: number
│       ├── image: string
│       ├── type: "course" | "website"
│       ├── category?: string
│       ├── previewLink?: string
│       ├── deliveryLink?: string
│       ├── content?: string
│       ├── screenshots?: string[]
│       ├── youtubeUrl?: string
│       └── createdAt: number
│
├── purchases/
│   └── {purchaseId}/
│       ├── userId: string
│       ├── userEmail: string
│       ├── productId: string
│       ├── productTitle: string
│       ├── productImage: string
│       ├── productType: string
│       ├── deliveryLink: string
│       ├── amount: number
│       ├── originalAmount?: number
│       ├── couponCode?: string
│       ├── couponDiscount?: number
│       ├── razorpayPaymentId: string
│       └── purchaseDate: number
│
├── coupons/
│   └── {couponId}/
│       ├── code: string
│       ├── discountPercent: number
│       ├── minOrderValue: number
│       ├── maxUses: number
│       ├── usedCount: number
│       ├── usedBy: { [userId]: { email, usedAt } }
│       ├── active: boolean
│       └── createdAt: number
│
├── contactMessages/
│   └── {messageId}/
│       ├── name: string
│       ├── email: string
│       ├── phone?: string
│       ├── message: string
│       ├── createdAt: number
│       └── read: boolean
│
├── heroSlides/
│   └── {slideId}/
│       ├── title: string
│       ├── subtitle: string
│       ├── image: string
│       ├── buttonText: string
│       ├── buttonLink: string
│       └── order: number
│
├── testimonials/
│   └── {testimonialId}/
│       ├── name: string
│       ├── message: string
│       ├── rating: number
│       ├── createdAt: number
│       └── approved: boolean
│
├── siteContent/
│   ├── email: string
│   ├── phone: string
│   ├── whatsapp: string
│   ├── address: string
│   ├── instagram: string
│   ├── facebook: string
│   ├── twitter: string
│   └── youtube: string
│
└── customProjects/
    └── {projectId}/
        ├── userId: string
        ├── userEmail: string
        ├── title: string
        ├── type: "website" | "app" | "other"
        ├── description: string
        ├── budget: string
        ├── contact: string
        ├── status: "pending" | "in_progress" | "completed" | "rejected"
        ├── createdAt: number
        └── adminNotes?: string
```

---

## 💳 RAZORPAY INTEGRATION

### Configuration
```typescript
export const RAZORPAY_KEY_ID = 'rzp_test_XXXXXXXXXX'; // Your Razorpay Key ID

// Load script dynamically
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
```

### Payment Flow
1. User must be logged in to purchase
2. Apply coupon code (optional) with validation
3. Initiate Razorpay checkout with product details
4. On success: Save purchase to Firebase, show success modal with delivery link
5. Purchase history available in user profile

---

## 📄 PAGES & ROUTES

### 1. Landing Page (`/`)
- **Header**: Logo, navigation, cart icon with count, user profile/login
- **Hero Slider**: Auto-sliding banner with CTA buttons (Firebase-driven)
- **Best Selling Section**: Featured products carousel
- **Features Section**: Platform highlights with icons
- **How to Buy Section**: Step-by-step guide
- **Products Section**: Grid of all products
- **Testimonials Slider**: Auto-sliding customer reviews
- **Stats Section**: Numbers showcase (products, customers, etc.)
- **Contact Form**: Name, email, phone, message → saves to Firebase
- **Footer**: Links, social media, contact info

### 2. Shop Page (`/shop`)
- Product grid with filtering by type (courses/websites)
- Search functionality
- Add to cart functionality
- Quick view options

### 3. Product Detail Page (`/product/:id`)
- Large product image with screenshots gallery
- Title, description, pricing
- YouTube video embed (if available)
- Preview link button
- Coupon code input with validation
- Add to cart / Buy now buttons
- Related products section

### 4. Login Page (`/login`)
- Attractive full-page login
- Google Sign-In integration
- Animated background elements
- Redirect after successful login

### 5. Admin Panel (`/admin`) - Admin Only
Tabs:
- **Products**: CRUD operations, image upload, set delivery links
- **Hero Slides**: Manage banner slides with button text/links
- **Testimonials**: Approve/reject user reviews
- **Custom Projects**: View/manage project requests
- **Messages**: View contact form submissions, mark as read
- **Coupons**: Create/manage discount codes, view usage stats
- **Site Content**: Update contact info and social links

---

## 🧩 KEY COMPONENTS

### Header Component
- Sticky header with blur effect
- Logo on left
- Navigation links (Home, Shop, About, Contact)
- Cart icon with item count badge
- User avatar/login button
- Mobile hamburger menu

### Product Card Component
- Product image with hover zoom effect
- Title, type badge, price
- Original price strikethrough (if discounted)
- Add to cart button
- Wishlist heart icon
- Preview link button

### Cart Modal
- Slide-in modal from right
- List of cart items with images
- Remove item functionality
- Total price calculation
- Proceed to checkout button
- Requires login to checkout

### Profile Panel
- User info display
- Admin panel access button (for admins)
- My Purchases section with delivery links
- Logout button

### Coupon Input Component
- Input field with apply button
- Validation against Firebase
- Congratulations popup on success
- Display discount amount
- Error messages for invalid/expired codes

### Payment Success Modal
- Celebration animation
- Purchase details
- Direct access button to delivery link
- View profile option

---

## ✨ FEATURES CHECKLIST

### Authentication
- [x] Google Sign-In with Firebase Auth
- [x] Persistent login state
- [x] Admin role detection via email
- [x] Protected routes for admin

### Products
- [x] Dynamic product listing from Firebase
- [x] Product categories (courses/websites)
- [x] Product search and filtering
- [x] Product detail pages with galleries
- [x] YouTube video embedding
- [x] Preview links
- [x] Delivery links for digital products

### Shopping Cart
- [x] Add/remove products
- [x] Cart persistence in session
- [x] Cart item count in header
- [x] Cart modal with product details

### Payments
- [x] Razorpay integration
- [x] Coupon code system with validation
- [x] Discount calculation
- [x] Purchase history tracking
- [x] Payment success confirmation
- [x] Delivery link access after purchase

### Admin Panel
- [x] Product management (CRUD)
- [x] Image upload functionality
- [x] Hero slider management
- [x] Testimonial moderation
- [x] Contact message management
- [x] Coupon code management with usage tracking
- [x] Site content management
- [x] Custom project requests

### UI/UX
- [x] Dark theme with gradient accents
- [x] Responsive design (mobile-first)
- [x] Auto-sliding carousels
- [x] Smooth animations
- [x] Toast notifications
- [x] Loading states
- [x] Copy protection (disable right-click, Ctrl+C)

### Contact & Support
- [x] Contact form with Firebase storage
- [x] Custom project request form
- [x] Dynamic contact info from Firebase
- [x] Social media links

---

## 🛠️ DEPENDENCIES

```json
{
  "dependencies": {
    "@hookform/resolvers": "^3.10.0",
    "@radix-ui/react-*": "latest",
    "@tanstack/react-query": "^5.83.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "embla-carousel-react": "^8.6.0",
    "firebase": "^12.8.0",
    "lucide-react": "^0.462.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.61.1",
    "react-router-dom": "^6.30.1",
    "sonner": "^1.7.4",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.25.76"
  }
}
```

---

## 🚀 GETTING STARTED PROMPT

Copy and paste this to start building:

```
Create a dark-themed e-commerce website for selling digital products (courses and website templates) using React, Vite, TypeScript, Tailwind CSS, and shadcn/ui.

Backend: Firebase Realtime Database + Firebase Auth (Google Sign-In)
Payments: Razorpay API

Features needed:
1. Landing page with auto-sliding hero banner, product grid, testimonials slider, contact form
2. Shop page with product filtering and search
3. Product detail page with image gallery, YouTube embed, coupon code input
4. User authentication with Google Sign-In
5. Shopping cart with checkout flow
6. Razorpay payment integration with coupon discounts
7. User profile with purchase history and delivery links
8. Admin panel (separate page) with:
   - Product management (CRUD)
   - Hero slider management
   - Testimonial moderation
   - Contact messages view
   - Coupon code creation and usage tracking
   - Site content management

Design:
- Dark theme with indigo/purple gradients
- Glassmorphism effects
- Smooth animations
- Mobile responsive
- Copy protection enabled

Start by setting up Firebase configuration and the basic routing structure.
```

---

## 📝 NOTES

1. **Security**: The current implementation uses client-side Razorpay integration. For production, implement server-side payment verification using Firebase Cloud Functions.

2. **Image Hosting**: Use a service like ImgBB or Firebase Storage for product images.

3. **Admin Email**: Set the `ADMIN_EMAIL` constant in firebase.ts to grant admin access.

4. **Testing**: Use Razorpay test mode credentials for development.

5. **Copy Protection**: Basic protection is implemented but can be bypassed by tech-savvy users.

---

**Created for ZexoFile E-Commerce Platform**
