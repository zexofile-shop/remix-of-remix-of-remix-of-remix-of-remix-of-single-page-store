import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, push, set, remove, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Product, CustomProject, Purchase, Testimonial } from '@/types';
import { Coupon, ContactMessage } from '@/types/coupon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  Trash2, Edit, Plus, X, LogOut, Package, Users, FileText, Settings, Image, Star, 
  MessageSquare, DollarSign, Youtube, Images, Upload, Loader2, Link, ArrowLeft, Shield,
  Mail, Ticket, Eye, EyeOff, Percent
} from 'lucide-react';
import { uploadToImgBB } from '@/lib/imgbb';
import zexofileLogo from '@/assets/zexofile-logo.png';

interface SliderImage {
  id: string;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  order: number;
}

interface BestSellingItem {
  id: string;
  productId: string;
  order: number;
}

interface SiteContent {
  whatWeOffer?: string;
  whyChooseUs?: string;
  howToBuy?: string;
  privacyPolicy?: string;
  refundPolicy?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  socialInstagram?: string;
  socialFacebook?: string;
  socialTwitter?: string;
  socialYoutube?: string;
}

interface UserData {
  id: string;
  email: string;
  createdAt?: number;
}

// Image Upload Field Component
const ImageUploadField = ({ value, onChange, placeholder = "Enter image URL or upload" }: { 
  value: string; 
  onChange: (url: string) => void; 
  placeholder?: string;
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 32 * 1024 * 1024) {
      toast.error('Image size must be less than 32MB');
      return;
    }

    setIsUploading(true);
    try {
      const imageUrl = await uploadToImgBB(file);
      onChange(imageUrl);
      toast.success('Image uploaded!');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {value && (
        <div className="relative w-full h-24 rounded-lg overflow-hidden bg-secondary/30 group">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <button
            onClick={() => onChange('')}
            className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={!showUrlInput ? "default" : "outline"}
          size="sm"
          onClick={() => setShowUrlInput(false)}
          className="flex-1"
        >
          <Upload className="h-4 w-4 mr-1" />
          Upload
        </Button>
        <Button
          type="button"
          variant={showUrlInput ? "default" : "outline"}
          size="sm"
          onClick={() => setShowUrlInput(true)}
          className="flex-1"
        >
          <Link className="h-4 w-4 mr-1" />
          URL
        </Button>
      </div>
      {!showUrlInput ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading...</>
            ) : (
              <><Upload className="h-4 w-4 mr-2" />Choose Image</>
            )}
          </Button>
        </div>
      ) : (
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </div>
  );
};

// Screenshot Upload Field Component
const ScreenshotUploadField = ({ screenshots, onAdd, onRemove }: {
  screenshots: string[];
  onAdd: (url: string) => void;
  onRemove: (index: number) => void;
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setIsUploading(true);
    try {
      const imageUrl = await uploadToImgBB(file);
      onAdd(imageUrl);
      toast.success('Screenshot uploaded!');
    } catch (error) {
      toast.error('Failed to upload');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddUrl = () => {
    if (urlValue.trim()) {
      onAdd(urlValue.trim());
      setUrlValue('');
    }
  };

  return (
    <div className="space-y-2">
      {screenshots.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {screenshots.map((screenshot, index) => (
            <div key={index} className="relative group">
              <img src={screenshot} alt={`Screenshot ${index + 1}`} className="w-16 h-16 object-cover rounded border border-border" />
              <button
                onClick={() => onRemove(index)}
                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={!showUrlInput ? "default" : "outline"}
          size="sm"
          onClick={() => setShowUrlInput(false)}
          className="flex-1"
        >
          <Upload className="h-4 w-4 mr-1" />
          Upload
        </Button>
        <Button
          type="button"
          variant={showUrlInput ? "default" : "outline"}
          size="sm"
          onClick={() => setShowUrlInput(true)}
          className="flex-1"
        >
          <Link className="h-4 w-4 mr-1" />
          URL
        </Button>
      </div>
      {!showUrlInput ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading...</>
            ) : (
              <><Plus className="h-4 w-4 mr-2" />Add Screenshot</>
            )}
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input value={urlValue} onChange={(e) => setUrlValue(e.target.value)} placeholder="https://example.com/screenshot.jpg" />
          <Button type="button" onClick={handleAddUrl} variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const [allPurchases, setAllPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customProjects, setCustomProjects] = useState<CustomProject[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [heroSlides, setHeroSlides] = useState<SliderImage[]>([]);
  const [bestSelling, setBestSelling] = useState<BestSellingItem[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent>({});
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productType, setProductType] = useState<'course' | 'website'>('course');

  // Product form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [image, setImage] = useState('');
  const [previewLink, setPreviewLink] = useState('');
  const [razorpayLink, setRazorpayLink] = useState('');
  const [content, setContent] = useState('');
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState('');

  // Slide form state
  const [showSlideForm, setShowSlideForm] = useState(false);
  const [slideImageUrl, setSlideImageUrl] = useState('');
  const [slideTitle, setSlideTitle] = useState('');
  const [slideSubtitle, setSlideSubtitle] = useState('');
  const [slideButtonText, setSlideButtonText] = useState('');
  const [slideButtonLink, setSlideButtonLink] = useState('');
  const [slideOrder, setSlideOrder] = useState('1');

  // Coupon form state
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState('');
  const [couponMinOrder, setCouponMinOrder] = useState('');
  const [couponMaxUses, setCouponMaxUses] = useState('');

  // Calculate real stats
  const totalUsers = allUsers.length;
  const totalRevenue = allPurchases.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Redirect non-admin users
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (!isAdmin) {
      navigate('/');
      toast.error('Access denied. Admin only.');
    }
  }, [user, isAdmin, navigate]);

  useEffect(() => {
    if (!user || !isAdmin) return;

    // Fetch all data
    const purchasesRef = ref(database, 'purchases');
    const usersRef = ref(database, 'users');
    const coursesRef = ref(database, 'courses');
    const websitesRef = ref(database, 'websites');
    const projectsRef = ref(database, 'customProjects');
    const testimonialsRef = ref(database, 'testimonials');
    const slidesRef = ref(database, 'heroSlides');
    const bestSellingRef = ref(database, 'bestSelling');
    const siteContentRef = ref(database, 'siteContent');
    const messagesRef = ref(database, 'contactMessages');
    const couponsRef = ref(database, 'coupons');

    const unsubscribePurchases = onValue(purchasesRef, (snapshot) => {
      const data = snapshot.val();
      const list: Purchase[] = data
        ? Object.entries(data).map(([id, value]: [string, any]) => ({ ...value, id }))
        : [];
      setAllPurchases(list);
    });

    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      const usersList: UserData[] = data
        ? Object.entries(data).map(([id, value]: [string, any]) => ({ ...value, id }))
        : [];
      setAllUsers(usersList);
    });

    const unsubscribeCourses = onValue(coursesRef, (snapshot) => {
      const data = snapshot.val();
      const coursesList: Product[] = data
        ? Object.entries(data).map(([id, value]: [string, any]) => ({
            ...value,
            id,
            type: 'course' as const,
          }))
        : [];
      setProducts((prev) => {
        const websites = prev.filter(p => p.type === 'website');
        return [...coursesList, ...websites];
      });
    });

    const unsubscribeWebsites = onValue(websitesRef, (snapshot) => {
      const data = snapshot.val();
      const websitesList: Product[] = data
        ? Object.entries(data).map(([id, value]: [string, any]) => ({
            ...value,
            id,
            type: 'website' as const,
          }))
        : [];
      setProducts((prev) => {
        const courses = prev.filter(p => p.type === 'course');
        return [...courses, ...websitesList];
      });
    });

    const unsubscribeProjects = onValue(projectsRef, (snapshot) => {
      const data = snapshot.val();
      const list: CustomProject[] = data
        ? Object.entries(data).map(([id, value]: [string, any]) => ({ ...value, id }))
        : [];
      setCustomProjects(list);
    });

    const unsubscribeTestimonials = onValue(testimonialsRef, (snapshot) => {
      const data = snapshot.val();
      const list: Testimonial[] = data
        ? Object.entries(data).map(([id, value]: [string, any]) => ({ ...value, id }))
        : [];
      setTestimonials(list);
    });

    const unsubscribeSlides = onValue(slidesRef, (snapshot) => {
      const data = snapshot.val();
      const list: SliderImage[] = data
        ? Object.entries(data).map(([id, value]: [string, any]) => ({ ...value, id }))
        : [];
      setHeroSlides(list.sort((a, b) => a.order - b.order));
    });

    const unsubscribeBestSelling = onValue(bestSellingRef, (snapshot) => {
      const data = snapshot.val();
      const list: BestSellingItem[] = data
        ? Object.entries(data).map(([id, value]: [string, any]) => ({ ...value, id }))
        : [];
      setBestSelling(list.sort((a, b) => a.order - b.order));
    });

    const unsubscribeSiteContent = onValue(siteContentRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSiteContent(data);
      }
    });

    const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      const list: ContactMessage[] = data
        ? Object.entries(data).map(([id, value]: [string, any]) => ({ ...value, id }))
        : [];
      setContactMessages(list.sort((a, b) => b.createdAt - a.createdAt));
    });

    const unsubscribeCoupons = onValue(couponsRef, (snapshot) => {
      const data = snapshot.val();
      const list: Coupon[] = data
        ? Object.entries(data).map(([id, value]: [string, any]) => ({ ...value, id }))
        : [];
      setCoupons(list.sort((a, b) => b.createdAt - a.createdAt));
    });

    return () => {
      unsubscribePurchases();
      unsubscribeUsers();
      unsubscribeCourses();
      unsubscribeWebsites();
      unsubscribeProjects();
      unsubscribeTestimonials();
      unsubscribeSlides();
      unsubscribeBestSelling();
      unsubscribeSiteContent();
      unsubscribeMessages();
      unsubscribeCoupons();
    };
  }, [user, isAdmin]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setOriginalPrice('');
    setImage('');
    setPreviewLink('');
    setRazorpayLink('');
    setContent('');
    setScreenshots([]);
    setYoutubeUrl('');
    setEditingProduct(null);
  };

  const handleSaveProduct = async () => {
    if (!title || !description || !price || !image) {
      toast.error('Please fill all required fields');
      return;
    }

    const productData = {
      title,
      description,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      image,
      previewLink,
      razorpayLink,
      deliveryLink: razorpayLink,
      content,
      screenshots: screenshots.length > 0 ? screenshots : null,
      youtubeUrl: youtubeUrl || null,
      createdAt: Date.now(),
    };

    const dbPath = productType === 'course' ? 'courses' : 'websites';

    try {
      if (editingProduct) {
        await update(ref(database, `${dbPath}/${editingProduct.id}`), productData);
        toast.success('Product updated!');
      } else {
        await push(ref(database, dbPath), productData);
        toast.success('Product added!');
      }
      resetForm();
      setShowProductForm(false);
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const dbPath = product.type === 'course' ? 'courses' : 'websites';
    try {
      await remove(ref(database, `${dbPath}/${product.id}`));
      toast.success('Product deleted!');
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductType(product.type);
    setTitle(product.title);
    setDescription(product.description);
    setPrice(product.price.toString());
    setOriginalPrice(product.originalPrice?.toString() || '');
    setImage(product.image);
    setPreviewLink(product.previewLink || '');
    setRazorpayLink(product.razorpayLink || '');
    setContent(product.content || '');
    setScreenshots(product.screenshots || []);
    setYoutubeUrl(product.youtubeUrl || '');
    setShowProductForm(true);
  };

  const handleUpdateProjectStatus = async (project: CustomProject, status: string) => {
    try {
      await update(ref(database, `customProjects/${project.id}`), { status });
      toast.success('Project status updated!');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Slide functions
  const handleAddSlide = async () => {
    if (!slideImageUrl) {
      toast.error('Please enter an image URL');
      return;
    }

    try {
      await push(ref(database, 'heroSlides'), {
        imageUrl: slideImageUrl,
        title: slideTitle,
        subtitle: slideSubtitle,
        buttonText: slideButtonText,
        buttonLink: slideButtonLink,
        order: parseInt(slideOrder) || 1,
      });
      toast.success('Slide added!');
      setSlideImageUrl('');
      setSlideTitle('');
      setSlideSubtitle('');
      setSlideButtonText('');
      setSlideButtonLink('');
      setSlideOrder('1');
      setShowSlideForm(false);
    } catch (error) {
      toast.error('Failed to add slide');
    }
  };

  const handleDeleteSlide = async (slideId: string) => {
    if (!confirm('Delete this slide?')) return;
    try {
      await remove(ref(database, `heroSlides/${slideId}`));
      toast.success('Slide deleted!');
    } catch (error) {
      toast.error('Failed to delete slide');
    }
  };

  // Testimonial functions
  const handleToggleTestimonialApproval = async (testimonial: Testimonial) => {
    try {
      await update(ref(database, `testimonials/${testimonial.id}`), { 
        approved: !testimonial.approved 
      });
      toast.success(testimonial.approved ? 'Testimonial hidden' : 'Testimonial approved!');
    } catch (error) {
      toast.error('Failed to update testimonial');
    }
  };

  const handleDeleteTestimonial = async (testimonialId: string) => {
    if (!confirm('Delete this testimonial?')) return;
    try {
      await remove(ref(database, `testimonials/${testimonialId}`));
      toast.success('Testimonial deleted!');
    } catch (error) {
      toast.error('Failed to delete testimonial');
    }
  };

  // Best selling functions
  const handleToggleBestSelling = async (productId: string) => {
    const existing = bestSelling.find(b => b.productId === productId);
    
    try {
      if (existing) {
        await remove(ref(database, `bestSelling/${existing.id}`));
        toast.success('Removed from best selling');
      } else {
        await push(ref(database, 'bestSelling'), {
          productId,
          order: bestSelling.length + 1,
        });
        toast.success('Added to best selling!');
      }
    } catch (error) {
      toast.error('Failed to update best selling');
    }
  };

  // Contact message functions
  const handleToggleMessageRead = async (messageId: string, currentRead: boolean) => {
    try {
      await update(ref(database, `contactMessages/${messageId}`), { read: !currentRead });
      toast.success(currentRead ? 'Marked as unread' : 'Marked as read');
    } catch (error) {
      toast.error('Failed to update message');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Delete this message?')) return;
    try {
      await remove(ref(database, `contactMessages/${messageId}`));
      toast.success('Message deleted!');
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  // Coupon functions
  const handleAddCoupon = async () => {
    if (!couponCode || !couponDiscount || !couponMaxUses) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await push(ref(database, 'coupons'), {
        code: couponCode.toUpperCase().trim(),
        discountPercent: parseInt(couponDiscount),
        minOrderValue: parseInt(couponMinOrder) || 0,
        maxUses: parseInt(couponMaxUses),
        usedCount: 0,
        usedBy: {},
        active: true,
        createdAt: Date.now(),
      });
      toast.success('Coupon created!');
      setCouponCode('');
      setCouponDiscount('');
      setCouponMinOrder('');
      setCouponMaxUses('');
      setShowCouponForm(false);
    } catch (error) {
      toast.error('Failed to create coupon');
    }
  };

  const handleToggleCouponActive = async (couponId: string, currentActive: boolean) => {
    try {
      await update(ref(database, `coupons/${couponId}`), { active: !currentActive });
      toast.success(currentActive ? 'Coupon deactivated' : 'Coupon activated');
    } catch (error) {
      toast.error('Failed to update coupon');
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await remove(ref(database, `coupons/${couponId}`));
      toast.success('Coupon deleted!');
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Site
            </Button>
            <div className="flex items-center gap-3">
              <img src={zexofileLogo} alt="ZexoFile" className="h-10 w-10 object-contain" />
              <div>
                <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Admin Panel
                </h1>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Stats */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl border border-blue-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl border border-green-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">₹{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl border border-purple-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Package className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Products</p>
                <p className="text-2xl font-bold text-foreground">{products.length}</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-xl border border-orange-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <FileText className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Orders</p>
                <p className="text-2xl font-bold text-foreground">{allPurchases.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="slides" className="w-full">
          <TabsList className="flex flex-wrap w-full gap-1 h-auto p-1 mb-6">
            <TabsTrigger value="slides" className="flex items-center gap-1 flex-1 min-w-[80px]">
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Slides</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-1 flex-1 min-w-[80px]">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-1 flex-1 min-w-[80px] relative">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Messages</span>
              {contactMessages.filter(m => !m.read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {contactMessages.filter(m => !m.read).length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="coupons" className="flex items-center gap-1 flex-1 min-w-[80px]">
              <Ticket className="h-4 w-4" />
              <span className="hidden sm:inline">Coupons</span>
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="flex items-center gap-1 flex-1 min-w-[80px]">
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">Reviews</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-1 flex-1 min-w-[80px]">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Projects</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-1 flex-1 min-w-[80px]">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1 flex-1 min-w-[80px]">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Hero Slides Tab */}
          <TabsContent value="slides" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">Hero Slider Images</h3>
              <Button size="sm" onClick={() => setShowSlideForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Slide
              </Button>
            </div>

            {showSlideForm && (
              <div className="border border-border rounded-xl p-6 space-y-4 bg-card">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">New Slide</h4>
                  <Button variant="ghost" size="sm" onClick={() => setShowSlideForm(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label className="flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      Slide Image (16:9 aspect ratio)*
                    </Label>
                    <ImageUploadField
                      value={slideImageUrl}
                      onChange={setSlideImageUrl}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Title (optional)</Label>
                    <Input
                      value={slideTitle}
                      onChange={(e) => setSlideTitle(e.target.value)}
                      placeholder="Slide title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Order</Label>
                    <Input
                      type="number"
                      value={slideOrder}
                      onChange={(e) => setSlideOrder(e.target.value)}
                      min="1"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Subtitle (optional)</Label>
                    <Input
                      value={slideSubtitle}
                      onChange={(e) => setSlideSubtitle(e.target.value)}
                      placeholder="Slide subtitle"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Button Text (e.g., "Play Now")</Label>
                    <Input
                      value={slideButtonText}
                      onChange={(e) => setSlideButtonText(e.target.value)}
                      placeholder="Play Now"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Button Link</Label>
                    <Input
                      value={slideButtonLink}
                      onChange={(e) => setSlideButtonLink(e.target.value)}
                      placeholder="https://example.com or /shop"
                    />
                  </div>
                </div>
                <Button onClick={handleAddSlide} className="w-full">Add Slide</Button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {heroSlides.map((slide) => (
                <div key={slide.id} className="relative group rounded-xl overflow-hidden border border-border">
                  <img
                    src={slide.imageUrl}
                    alt={slide.title || 'Slide'}
                    className="w-full aspect-video object-cover"
                  />
                  <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteSlide(slide.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background to-transparent">
                    <p className="text-xs font-medium text-foreground">
                      Order: {slide.order} {slide.title && `• ${slide.title}`}
                    </p>
                    {slide.buttonText && (
                      <p className="text-xs text-muted-foreground">Button: {slide.buttonText}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {heroSlides.length === 0 && (
              <p className="text-center text-muted-foreground py-12 bg-secondary/30 rounded-xl">
                No slides yet. Add your first slide!
              </p>
            )}
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">Manage Products</h3>
              <Button
                size="sm"
                onClick={() => {
                  resetForm();
                  setShowProductForm(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>

            {showProductForm && (
              <div className="border border-border rounded-xl p-6 space-y-4 bg-card">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">
                    {editingProduct ? 'Edit Product' : 'New Product'}
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowProductForm(false);
                      resetForm();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={productType}
                      onValueChange={(v) => setProductType(v as 'course' | 'website')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="course">Course</SelectItem>
                        <SelectItem value="website">Website</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>MRP / Original Price</Label>
                    <Input
                      type="number"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      placeholder="e.g., 150000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Selling Price *</Label>
                    <Input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g., 109999"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label className="flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      Main Image *
                    </Label>
                    <ImageUploadField
                      value={image}
                      onChange={setImage}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label className="flex items-center gap-2">
                      <Images className="h-4 w-4" />
                      Screenshots
                    </Label>
                    <ScreenshotUploadField
                      screenshots={screenshots}
                      onAdd={(url) => setScreenshots([...screenshots, url])}
                      onRemove={(index) => setScreenshots(screenshots.filter((_, i) => i !== index))}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label className="flex items-center gap-2">
                      <Youtube className="h-4 w-4 text-red-500" />
                      YouTube Video URL
                    </Label>
                    <Input 
                      value={youtubeUrl} 
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Preview Link</Label>
                    <Input
                      value={previewLink}
                      onChange={(e) => setPreviewLink(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Delivery Link (after purchase)</Label>
                    <Input
                      value={razorpayLink}
                      onChange={(e) => setRazorpayLink(e.target.value)}
                      placeholder="Product access link"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Description *</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Detailed Content (HTML supported)</Label>
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
                <Button onClick={handleSaveProduct} className="w-full">
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product.id} className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="relative">
                    <img src={product.image} alt={product.title} className="w-full h-40 object-cover" />
                    <span className={`absolute top-2 left-2 px-2 py-0.5 text-xs rounded-full ${
                      product.type === 'course' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'
                    }`}>
                      {product.type}
                    </span>
                    <Switch
                      checked={bestSelling.some(b => b.productId === product.id)}
                      onCheckedChange={() => handleToggleBestSelling(product.id)}
                      className="absolute top-2 right-2"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium truncate">{product.title}</h4>
                    <p className="text-sm text-muted-foreground truncate">{product.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-bold text-primary">₹{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">₹{product.originalPrice}</span>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEditProduct(product)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleDeleteProduct(product)}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {products.length === 0 && (
              <p className="text-center text-muted-foreground py-12 bg-secondary/30 rounded-xl">
                No products yet. Add your first product!
              </p>
            )}
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">Contact Messages</h3>
              <p className="text-sm text-muted-foreground">
                {contactMessages.filter(m => !m.read).length} unread
              </p>
            </div>
            <div className="space-y-3">
              {contactMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 bg-card border rounded-xl space-y-2 ${
                    message.read ? 'border-border' : 'border-primary/50 bg-primary/5'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{message.name}</p>
                      <p className="text-xs text-muted-foreground">{message.email}</p>
                      {message.phone && (
                        <p className="text-xs text-muted-foreground">{message.phone}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleMessageRead(message.id, message.read)}
                        title={message.read ? 'Mark as unread' : 'Mark as read'}
                      >
                        {message.read ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4 text-primary" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMessage(message.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{message.message}</p>
                </div>
              ))}
            </div>
            {contactMessages.length === 0 && (
              <p className="text-center text-muted-foreground py-12 bg-secondary/30 rounded-xl">
                No messages yet.
              </p>
            )}
          </TabsContent>

          {/* Coupons Tab */}
          <TabsContent value="coupons" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">Manage Coupons</h3>
              <Button size="sm" onClick={() => setShowCouponForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Coupon
              </Button>
            </div>

            {showCouponForm && (
              <div className="border border-border rounded-xl p-6 space-y-4 bg-card">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">New Coupon</h4>
                  <Button variant="ghost" size="sm" onClick={() => setShowCouponForm(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Coupon Code *</Label>
                    <Input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="e.g., SAVE20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount Percent *</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={couponDiscount}
                        onChange={(e) => setCouponDiscount(e.target.value)}
                        placeholder="e.g., 20"
                        min="1"
                        max="100"
                      />
                      <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum Order Value</Label>
                    <Input
                      type="number"
                      value={couponMinOrder}
                      onChange={(e) => setCouponMinOrder(e.target.value)}
                      placeholder="e.g., 500 (0 for no min)"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Uses *</Label>
                    <Input
                      type="number"
                      value={couponMaxUses}
                      onChange={(e) => setCouponMaxUses(e.target.value)}
                      placeholder="e.g., 100"
                      min="1"
                    />
                  </div>
                </div>
                <Button onClick={handleAddCoupon} className="w-full">Create Coupon</Button>
              </div>
            )}

            <div className="space-y-3">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className={`p-4 bg-card border rounded-xl ${
                    coupon.active ? 'border-green-500/30' : 'border-border opacity-60'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-lg text-primary">{coupon.code}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          coupon.active 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}>
                          {coupon.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{coupon.discountPercent}% OFF</span>
                        {coupon.minOrderValue > 0 && (
                          <span>Min: ₹{coupon.minOrderValue}</span>
                        )}
                        <span>Used: {coupon.usedCount}/{coupon.maxUses}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={coupon.active}
                        onCheckedChange={() => handleToggleCouponActive(coupon.id, coupon.active)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCoupon(coupon.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Users who used this coupon */}
                  {coupon.usedBy && Object.keys(coupon.usedBy).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Used by:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(coupon.usedBy).map(([userId, usage]) => (
                          <span 
                            key={userId} 
                            className="px-2 py-1 text-xs bg-secondary rounded-full"
                            title={new Date(usage.usedAt).toLocaleString()}
                          >
                            {usage.email}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {coupons.length === 0 && (
              <p className="text-center text-muted-foreground py-12 bg-secondary/30 rounded-xl">
                No coupons yet. Create your first coupon!
              </p>
            )}
          </TabsContent>

          {/* Testimonials Tab */}
          <TabsContent value="testimonials" className="space-y-4">
            <h3 className="font-semibold text-lg">Manage Testimonials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="p-4 bg-card border border-border rounded-xl space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{testimonial.name}</p>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < testimonial.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Switch
                          checked={testimonial.approved}
                          onCheckedChange={() => handleToggleTestimonialApproval(testimonial)}
                        />
                        <span className="text-xs text-muted-foreground">
                          {testimonial.approved ? 'Visible' : 'Hidden'}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTestimonial(testimonial.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{testimonial.message}</p>
                </div>
              ))}
            </div>
            {testimonials.length === 0 && (
              <p className="text-center text-muted-foreground py-12 bg-secondary/30 rounded-xl">
                No testimonials yet.
              </p>
            )}
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4">
            <h3 className="font-semibold text-lg">Custom Project Requests</h3>
            <div className="space-y-3">
              {customProjects.map((project) => (
                <div
                  key={project.id}
                  className="p-4 bg-card border border-border rounded-xl space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{project.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {project.userEmail} • {project.type} • Budget: {project.budget}
                      </p>
                    </div>
                    <Select
                      value={project.status}
                      onValueChange={(v) => handleUpdateProjectStatus(project, v)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                  <p className="text-xs">Contact: {project.contact}</p>
                </div>
              ))}
            </div>
            {customProjects.length === 0 && (
              <p className="text-center text-muted-foreground py-12 bg-secondary/30 rounded-xl">
                No project requests yet.
              </p>
            )}
          </TabsContent>

          {/* Site Content Tab */}
          <TabsContent value="content" className="space-y-4">
            <h3 className="font-semibold text-lg">Site Content & Policies</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 p-4 bg-card border border-border rounded-xl">
                <Label>What We Offer Description</Label>
                <Textarea
                  value={siteContent.whatWeOffer || ''}
                  onChange={(e) => setSiteContent(prev => ({ ...prev, whatWeOffer: e.target.value }))}
                  placeholder="Describe what you offer..."
                  rows={3}
                />
                <Button size="sm" onClick={() => update(ref(database, 'siteContent'), { whatWeOffer: siteContent.whatWeOffer || '' }).then(() => toast.success('Saved!'))}>
                  Save
                </Button>
              </div>

              <div className="space-y-2 p-4 bg-card border border-border rounded-xl">
                <Label>Why Choose Us Description</Label>
                <Textarea
                  value={siteContent.whyChooseUs || ''}
                  onChange={(e) => setSiteContent(prev => ({ ...prev, whyChooseUs: e.target.value }))}
                  placeholder="Why should customers choose you..."
                  rows={3}
                />
                <Button size="sm" onClick={() => update(ref(database, 'siteContent'), { whyChooseUs: siteContent.whyChooseUs || '' }).then(() => toast.success('Saved!'))}>
                  Save
                </Button>
              </div>

              <div className="space-y-2 p-4 bg-card border border-border rounded-xl">
                <Label>Privacy Policy</Label>
                <Textarea
                  value={siteContent.privacyPolicy || ''}
                  onChange={(e) => setSiteContent(prev => ({ ...prev, privacyPolicy: e.target.value }))}
                  placeholder="Your privacy policy..."
                  rows={5}
                />
                <Button size="sm" onClick={() => update(ref(database, 'siteContent'), { privacyPolicy: siteContent.privacyPolicy || '' }).then(() => toast.success('Saved!'))}>
                  Save
                </Button>
              </div>

              <div className="space-y-2 p-4 bg-card border border-border rounded-xl">
                <Label>Refund Policy</Label>
                <Textarea
                  value={siteContent.refundPolicy || ''}
                  onChange={(e) => setSiteContent(prev => ({ ...prev, refundPolicy: e.target.value }))}
                  placeholder="Your refund policy..."
                  rows={5}
                />
                <Button size="sm" onClick={() => update(ref(database, 'siteContent'), { refundPolicy: siteContent.refundPolicy || '' }).then(() => toast.success('Saved!'))}>
                  Save
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <h3 className="font-semibold text-lg">Contact & Social Settings</h3>
            
            <div className="p-6 bg-card border border-border rounded-xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input
                    value={siteContent.contactEmail || ''}
                    onChange={(e) => setSiteContent(prev => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input
                    value={siteContent.contactPhone || ''}
                    onChange={(e) => setSiteContent(prev => ({ ...prev, contactPhone: e.target.value }))}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Address</Label>
                  <Input
                    value={siteContent.contactAddress || ''}
                    onChange={(e) => setSiteContent(prev => ({ ...prev, contactAddress: e.target.value }))}
                    placeholder="Your address"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Instagram URL</Label>
                  <Input
                    value={siteContent.socialInstagram || ''}
                    onChange={(e) => setSiteContent(prev => ({ ...prev, socialInstagram: e.target.value }))}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Facebook URL</Label>
                  <Input
                    value={siteContent.socialFacebook || ''}
                    onChange={(e) => setSiteContent(prev => ({ ...prev, socialFacebook: e.target.value }))}
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Twitter URL</Label>
                  <Input
                    value={siteContent.socialTwitter || ''}
                    onChange={(e) => setSiteContent(prev => ({ ...prev, socialTwitter: e.target.value }))}
                    placeholder="https://twitter.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>YouTube URL</Label>
                  <Input
                    value={siteContent.socialYoutube || ''}
                    onChange={(e) => setSiteContent(prev => ({ ...prev, socialYoutube: e.target.value }))}
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </div>

              <Button 
                className="mt-6 w-full"
                onClick={async () => {
                  try {
                    await update(ref(database, 'siteContent'), {
                      contactEmail: siteContent.contactEmail || '',
                      contactPhone: siteContent.contactPhone || '',
                      contactAddress: siteContent.contactAddress || '',
                      socialInstagram: siteContent.socialInstagram || '',
                      socialFacebook: siteContent.socialFacebook || '',
                      socialTwitter: siteContent.socialTwitter || '',
                      socialYoutube: siteContent.socialYoutube || '',
                    });
                    toast.success('Settings saved!');
                  } catch (error) {
                    toast.error('Failed to save settings');
                  }
                }}
              >
                Save All Settings
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
