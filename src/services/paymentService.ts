import { supabase } from '@/integrations/supabase/client';
import { loadRazorpayScript, RAZORPAY_KEY_ID, RazorpayPaymentResponse } from '@/lib/razorpay';
import { Product } from '@/types';

export interface PurchaseRecord {
  id?: string;
  user_id: string;
  user_email: string;
  product_id: string;
  product_title: string;
  product_image: string;
  product_type: string;
  delivery_link: string;
  amount: number;
  original_amount?: number;
  coupon_code?: string;
  coupon_discount?: number;
  razorpay_payment_id: string;
  purchase_date: number;
}

export const initiatePayment = async (
  product: Product,
  user: { uid: string; email: string | null; displayName: string | null },
  onSuccess: (purchase: PurchaseRecord) => void,
  onFailure: (error: string) => void,
  couponData?: { couponId: string; couponCode: string; discount: number }
): Promise<void> => {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    onFailure('Failed to load payment gateway. Please try again.');
    return;
  }

  const originalAmount = product.price;
  const discount = couponData?.discount || 0;
  const finalAmount = originalAmount - discount;
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
    theme: { color: '#6366f1' },
    handler: async (response: RazorpayPaymentResponse) => {
      try {
        const purchase = await savePurchase(product, user, response.razorpay_payment_id, couponData);
        if (couponData) {
          await updateCouponUsage(couponData.couponId, user.uid, user.email || '');
        }
        onSuccess(purchase);
      } catch (error) {
        console.error('Failed to save purchase:', error);
        onFailure('Payment successful but failed to save purchase. Please contact support.');
      }
    },
    modal: { ondismiss: () => {} },
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open();
};

const updateCouponUsage = async (couponId: string, userId: string, userEmail: string): Promise<void> => {
  const { data: coupon } = await supabase
    .from('coupons')
    .select('used_count, used_by')
    .eq('id', couponId)
    .single();

  if (coupon) {
    const usedBy = (coupon.used_by as Record<string, any>) || {};
    usedBy[userId] = { email: userEmail, usedAt: Date.now() };

    await supabase
      .from('coupons')
      .update({
        used_count: (coupon.used_count || 0) + 1,
        used_by: usedBy,
      })
      .eq('id', couponId);
  }
};

const savePurchase = async (
  product: Product,
  user: { uid: string; email: string | null },
  razorpayPaymentId: string,
  couponData?: { couponId: string; couponCode: string; discount: number }
): Promise<PurchaseRecord> => {
  const finalAmount = product.price - (couponData?.discount || 0);

  const purchase: any = {
    user_id: user.uid,
    user_email: user.email || '',
    product_id: product.id,
    product_title: product.title,
    product_image: product.image,
    product_type: product.type,
    delivery_link: product.deliveryLink || product.razorpayLink || '',
    amount: finalAmount,
    razorpay_payment_id: razorpayPaymentId,
    purchase_date: Date.now(),
  };

  if (couponData) {
    purchase.original_amount = product.price;
    purchase.coupon_code = couponData.couponCode;
    purchase.coupon_discount = couponData.discount;
  }

  const { data, error } = await supabase
    .from('purchases')
    .insert(purchase)
    .select()
    .single();

  if (error) throw error;
  return { ...purchase, id: data.id };
};

export const getUserPurchases = async (userId: string): Promise<PurchaseRecord[]> => {
  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .eq('user_id', userId)
    .order('purchase_date', { ascending: false });

  if (error) throw error;
  return (data || []) as PurchaseRecord[];
};

export const hasUserPurchasedProduct = async (userId: string, productId: string): Promise<boolean> => {
  const { data } = await supabase
    .from('purchases')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .limit(1);

  return (data || []).length > 0;
};

export const saveFreeResourceAccess = async (
  product: Product,
  user: { uid: string; email: string | null }
): Promise<PurchaseRecord> => {
  const purchase = {
    user_id: user.uid,
    user_email: user.email || '',
    product_id: product.id,
    product_title: product.title,
    product_image: product.image,
    product_type: product.type,
    delivery_link: product.deliveryLink || product.razorpayLink || '',
    amount: 0,
    razorpay_payment_id: 'FREE_RESOURCE',
    purchase_date: Date.now(),
  };

  const { data, error } = await supabase
    .from('purchases')
    .insert(purchase)
    .select()
    .single();

  if (error) throw error;
  return { ...purchase, id: data.id };
};
