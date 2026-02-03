export interface AdminUser {
  id: string;
  email: string;
  userId: string;
  role: 'super_admin' | 'admin' | 'moderator';
  accessLevel: number; // 0-100 percentage
  permissions: AdminPermissions;
  createdAt: number;
  createdBy: string;
  isActive: boolean;
}

export interface AdminPermissions {
  products: boolean;
  orders: boolean;
  users: boolean;
  slides: boolean;
  messages: boolean;
  coupons: boolean;
  reviews: boolean;
  projects: boolean;
  support: boolean;
  settings: boolean;
  adminManagement: boolean; // Can manage other admins
}

export const DEFAULT_PERMISSIONS: AdminPermissions = {
  products: false,
  orders: false,
  users: false,
  slides: false,
  messages: false,
  coupons: false,
  reviews: false,
  projects: false,
  support: false,
  settings: false,
  adminManagement: false,
};

export const FULL_PERMISSIONS: AdminPermissions = {
  products: true,
  orders: true,
  users: true,
  slides: true,
  messages: true,
  coupons: true,
  reviews: true,
  projects: true,
  support: true,
  settings: true,
  adminManagement: true,
};

export const PERMISSION_LABELS: Record<keyof AdminPermissions, string> = {
  products: 'Products',
  orders: 'Orders/Submissions',
  users: 'User Stats',
  slides: 'Hero Slides',
  messages: 'Messages',
  coupons: 'Coupons',
  reviews: 'Reviews',
  projects: 'Custom Projects',
  support: 'Support Channels',
  settings: 'Site Settings',
  adminManagement: 'Admin Management',
};
