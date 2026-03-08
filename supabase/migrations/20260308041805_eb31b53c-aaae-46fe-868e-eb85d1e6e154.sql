
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  phone TEXT,
  whatsapp TEXT,
  instagram TEXT,
  telegram TEXT,
  profile_pic TEXT,
  created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  permissions JSONB DEFAULT '{}',
  access_level INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  original_price NUMERIC,
  image TEXT,
  type TEXT NOT NULL DEFAULT 'course',
  category TEXT,
  preview_link TEXT,
  razorpay_link TEXT,
  delivery_link TEXT,
  content TEXT,
  screenshots TEXT[] DEFAULT '{}',
  youtube_url TEXT,
  is_free_resource BOOLEAN DEFAULT false,
  allow_customization BOOLEAN DEFAULT false,
  is_out_of_stock BOOLEAN DEFAULT false,
  buy_button_label TEXT,
  display_price_from TEXT DEFAULT 'base',
  image_aspect_ratio TEXT DEFAULT '1:1',
  left_button JSONB,
  right_button JSONB,
  created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Purchases table
CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_email TEXT,
  product_id UUID REFERENCES public.products(id),
  product_title TEXT,
  product_image TEXT,
  product_type TEXT,
  delivery_link TEXT,
  amount NUMERIC DEFAULT 0,
  original_amount NUMERIC,
  coupon_code TEXT,
  coupon_discount NUMERIC,
  razorpay_payment_id TEXT,
  purchase_date BIGINT DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT,
  purchase_type TEXT
);
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Order submissions table
CREATE TABLE public.order_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_email TEXT,
  user_name TEXT,
  product_id UUID REFERENCES public.products(id),
  product_title TEXT,
  product_image TEXT,
  payment_type TEXT,
  payment_amount NUMERIC,
  razorpay_payment_id TEXT,
  form_data JSONB,
  status TEXT DEFAULT 'pending',
  created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT
);
ALTER TABLE public.order_submissions ENABLE ROW LEVEL SECURITY;

-- Coupons table
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT DEFAULT 'fixed',
  discount_value NUMERIC NOT NULL DEFAULT 0,
  min_order NUMERIC DEFAULT 0,
  max_uses INTEGER DEFAULT 0,
  used_count INTEGER DEFAULT 0,
  used_by JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Testimonials table
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  approved BOOLEAN DEFAULT false,
  created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT
);
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Hero slides table
CREATE TABLE public.hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT
);
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- Best selling items table
CREATE TABLE public.best_selling (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0
);
ALTER TABLE public.best_selling ENABLE ROW LEVEL SECURITY;

-- Contact messages table
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Custom projects table
CREATE TABLE public.custom_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_email TEXT,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'website',
  description TEXT,
  budget TEXT,
  contact TEXT,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT
);
ALTER TABLE public.custom_projects ENABLE ROW LEVEL SECURITY;

-- Site settings table
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB DEFAULT '{}'
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Support channels table
CREATE TABLE public.support_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram1 TEXT,
  telegram2 TEXT,
  whatsapp1 TEXT,
  whatsapp2 TEXT,
  phone1 TEXT,
  phone2 TEXT
);
ALTER TABLE public.support_channels ENABLE ROW LEVEL SECURITY;

-- ===== FUNCTIONS =====

-- has_role function (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role AND is_active = true
  )
$$;

-- is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin' AND is_active = true
  )
$$;

-- get_admin_permissions function
CREATE OR REPLACE FUNCTION public.get_admin_permissions(_user_id UUID)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(permissions, '{}')
  FROM public.user_roles
  WHERE user_id = _user_id AND role = 'admin' AND is_active = true
  LIMIT 1
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== RLS POLICIES =====

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin(auth.uid()));

-- User roles
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Products (public read)
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (public.is_admin(auth.uid()));

-- Purchases
CREATE POLICY "Users can view own purchases" ON public.purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own purchases" ON public.purchases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all purchases" ON public.purchases FOR SELECT USING (public.is_admin(auth.uid()));

-- Order submissions
CREATE POLICY "Users can view own submissions" ON public.order_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own submissions" ON public.order_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own submissions" ON public.order_submissions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage submissions" ON public.order_submissions FOR ALL USING (public.is_admin(auth.uid()));

-- Coupons (public read for validation)
CREATE POLICY "Anyone can view active coupons" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL USING (public.is_admin(auth.uid()));

-- Testimonials (public read approved)
CREATE POLICY "Anyone can view approved testimonials" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Anyone can insert testimonials" ON public.testimonials FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR ALL USING (public.is_admin(auth.uid()));

-- Hero slides (public read)
CREATE POLICY "Anyone can view slides" ON public.hero_slides FOR SELECT USING (true);
CREATE POLICY "Admins can manage slides" ON public.hero_slides FOR ALL USING (public.is_admin(auth.uid()));

-- Best selling (public read)
CREATE POLICY "Anyone can view best selling" ON public.best_selling FOR SELECT USING (true);
CREATE POLICY "Admins can manage best selling" ON public.best_selling FOR ALL USING (public.is_admin(auth.uid()));

-- Contact messages
CREATE POLICY "Anyone can send messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view messages" ON public.contact_messages FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage messages" ON public.contact_messages FOR ALL USING (public.is_admin(auth.uid()));

-- Custom projects
CREATE POLICY "Users can view own projects" ON public.custom_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON public.custom_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage projects" ON public.custom_projects FOR ALL USING (public.is_admin(auth.uid()));

-- Site settings (public read)
CREATE POLICY "Anyone can view settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.site_settings FOR ALL USING (public.is_admin(auth.uid()));

-- Support channels (public read)
CREATE POLICY "Anyone can view support channels" ON public.support_channels FOR SELECT USING (true);
CREATE POLICY "Admins can manage support channels" ON public.support_channels FOR ALL USING (public.is_admin(auth.uid()));
