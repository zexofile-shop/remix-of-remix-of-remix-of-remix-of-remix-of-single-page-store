export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  minOrderValue: number;
  maxUses: number;
  usedCount: number;
  usedBy: { [userId: string]: { email: string; usedAt: number } };
  active: boolean;
  createdAt: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: number;
  read: boolean;
}
