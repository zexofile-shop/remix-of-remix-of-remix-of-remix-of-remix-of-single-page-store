import { ref, push, set, get, query, orderByChild, equalTo, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import { loadRazorpayScript, RAZORPAY_KEY_ID, RazorpayPaymentResponse } from '@/lib/razorpay';
import { Product } from '@/types';

export interface PurchaseRecord {
  id?: string;
  userId: string;
  userEmail: string;
  productId: string;
  productTitle: string;
  productImage: string;
  productType: 'course' | 'website';
  deliveryLink: string;
  amount: number;
  originalAmount?: number;
  couponCode?: string;
  couponDiscount?: number;
  razorpayPaymentId: string;
  purchaseDate: number;
}

// Initialize Razorpay and open payment modal
export const initiatePayment = async (
  product: Product,
  user: { uid: string; email: string | null; displayName: string | null },
  onSuccess: (purchase: PurchaseRecord) => void,
  onFailure: (error: string) => void,
  couponData?: { couponId: string; couponCode: string; discount: number }
): Promise<void> => {
  // Load Razorpay script
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    onFailure('Failed to load payment gateway. Please try again.');
    return;
  }

  // Calculate final amount after coupon discount
  const originalAmount = product.price;
  const discount = couponData?.discount || 0;
  const finalAmount = originalAmount - discount;

  // Amount in paise (multiply by 100)
  const amountInPaise = Math.round(finalAmount * 100);

  const options = {
    key: RAZORPAY_KEY_ID,
    amount: amountInPaise,
    currency: 'INR',
    name: 'ZexoFile Shop',
    description: product.title,
    image: 'https://storage.googleapis.com/gpt-engineer-file-uploads/q8YpDSXYtTe3u4wRdDoz0sahjWH2/uploads/1769343657919-1000064780.png',
    prefill: {
      name: user.displayName || '',
      email: user.email || '',
    },
    notes: {
      productId: product.id,
      userId: user.uid,
      couponCode: couponData?.couponCode || '',
    },
    theme: {
      color: '#6366f1',
    },
    handler: async (response: RazorpayPaymentResponse) => {
      console.log('Razorpay payment success, payment ID:', response.razorpay_payment_id);
      try {
        // Save purchase to Firebase
        console.log('Saving purchase to database...');
        const purchase = await savePurchase(
          product, 
          user, 
          response.razorpay_payment_id,
          couponData
        );
        console.log('Purchase saved successfully:', purchase.id);
        
        // Update coupon usage if a coupon was used
        if (couponData) {
          console.log('Updating coupon usage...');
          await updateCouponUsage(couponData.couponId, user.uid, user.email || '');
        }
        
        onSuccess(purchase);
      } catch (error) {
        console.error('Failed to save purchase:', error);
        onFailure('Payment successful but failed to save purchase. Please contact support.');
      }
    },
    modal: {
      ondismiss: () => {
        // User closed the payment modal
      },
    },
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open();
};

// Update coupon usage
const updateCouponUsage = async (couponId: string, userId: string, userEmail: string): Promise<void> => {
  const couponRef = ref(database, `coupons/${couponId}`);
  const snapshot = await get(couponRef);
  
  if (snapshot.exists()) {
    const coupon = snapshot.val();
    await update(couponRef, {
      usedCount: (coupon.usedCount || 0) + 1,
      [`usedBy/${userId}`]: {
        email: userEmail,
        usedAt: Date.now(),
      },
    });
  }
};

// Save purchase to Firebase
const savePurchase = async (
  product: Product,
  user: { uid: string; email: string | null },
  razorpayPaymentId: string,
  couponData?: { couponId: string; couponCode: string; discount: number }
): Promise<PurchaseRecord> => {
  console.log('savePurchase called with:', { 
    productId: product.id, 
    userId: user.uid, 
    razorpayPaymentId,
    hasCoupon: !!couponData 
  });
  
  const purchasesRef = ref(database, 'purchases');
  const newPurchaseRef = push(purchasesRef);
  
  const finalAmount = product.price - (couponData?.discount || 0);
  
  // Build purchase record - ensure no undefined values
  const purchase: PurchaseRecord = {
    userId: user.uid,
    userEmail: user.email || '',
    productId: product.id,
    productTitle: product.title,
    productImage: product.image,
    productType: product.type,
    deliveryLink: product.deliveryLink || product.razorpayLink || '',
    amount: finalAmount,
    razorpayPaymentId,
    purchaseDate: Date.now(),
  };

  // Only add coupon fields if coupon was used
  if (couponData) {
    purchase.originalAmount = product.price;
    purchase.couponCode = couponData.couponCode;
    purchase.couponDiscount = couponData.discount;
  }

  console.log('Saving purchase record:', purchase);
  
  await set(newPurchaseRef, purchase);
  
  console.log('Purchase saved with ID:', newPurchaseRef.key);
  
  return { ...purchase, id: newPurchaseRef.key! };
};

// Get user's purchase history
export const getUserPurchases = async (userId: string): Promise<PurchaseRecord[]> => {
  const purchasesRef = ref(database, 'purchases');
  const userPurchasesQuery = query(purchasesRef, orderByChild('userId'), equalTo(userId));
  
  const snapshot = await get(userPurchasesQuery);
  
  if (!snapshot.exists()) {
    return [];
  }
  
  const purchases: PurchaseRecord[] = [];
  snapshot.forEach((child) => {
    purchases.push({
      id: child.key!,
      ...child.val(),
    });
  });
  
  // Sort by purchase date (newest first)
  return purchases.sort((a, b) => b.purchaseDate - a.purchaseDate);
};

// Check if user has already purchased a product
export const hasUserPurchasedProduct = async (userId: string, productId: string): Promise<boolean> => {
  const purchases = await getUserPurchases(userId);
  return purchases.some(p => p.productId === productId);
};

// Save free resource access (no payment required)
export const saveFreeResourceAccess = async (
  product: Product,
  user: { uid: string; email: string | null }
): Promise<PurchaseRecord> => {
  const purchasesRef = ref(database, 'purchases');
  const newPurchaseRef = push(purchasesRef);
  
  const purchase: PurchaseRecord = {
    userId: user.uid,
    userEmail: user.email || '',
    productId: product.id,
    productTitle: product.title,
    productImage: product.image,
    productType: product.type,
    deliveryLink: product.deliveryLink || product.razorpayLink || '',
    amount: 0,
    razorpayPaymentId: 'FREE_RESOURCE',
    purchaseDate: Date.now(),
  };

  await set(newPurchaseRef, purchase);
  
  return { ...purchase, id: newPurchaseRef.key! };
};
