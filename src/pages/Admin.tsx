import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, push, set, remove, update, get } from 'firebase/database';
import { database, ADMIN_EMAIL, SUPER_ADMIN_EMAILS } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Product, CustomProject, Purchase, Testimonial, SupportChannels, OrderSubmission, ImageAspectRatio } from '@/types';
import { Coupon, ContactMessage } from '@/types/coupon';
import { AdminUser, AdminPermissions, DEFAULT_PERMISSIONS, FULL_PERMISSIONS, PERMISSION_LABELS } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { 
  Trash2, Edit, Plus, X, LogOut, Package, Users, FileText, Settings, Image, Star, 
  MessageSquare, DollarSign, Youtube, Images, Upload, Loader2, Link, ArrowLeft, Shield,
  Mail, Ticket, Eye, EyeOff, Percent, Phone, Send, ShoppingBag, User, ClipboardList, UserCog, Crown,
  Palette, Snowflake, Sun, Cloud, Droplets, TreeDeciduous, Sparkles
} from 'lucide-react';
import { uploadToImgBB } from '@/lib/imgbb';
import zexofileLogo from '@/assets/zexofile-logo.png';
import ThemeManager from '@/components/ThemeManager';

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
  socialWhatsapp?: string;
}

interface UserData {
  id: string;
  email: string;
  createdAt?: number;
}

interface UserStats {
  email: string;
  totalPurchases: number;
  totalSpent: number;
  products: { title: string; amount: number; date: number }[];
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
        <div className="relative w-full h-20 rounded-lg overflow-hidden bg-secondary/30 group">
          <img src={value} alt="Preview" className="w-full h-full object-contain" />
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
          <Upload className="h-3 w-3 mr-1" />
          Upload
        </Button>
        <Button
          type="button"
          variant={showUrlInput ? "default" : "outline"}
          size="sm"
          onClick={() => setShowUrlInput(true)}
          className="flex-1"
        >
          <Link className="h-3 w-3 mr-1" />
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
            className="w-full text-sm"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <><Loader2 className="h-3 w-3 mr-2 animate-spin" />Uploading...</>
            ) : (
              <><Upload className="h-3 w-3 mr-2" />Choose Image</>
            )}
          </Button>
        </div>
      ) : (
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="text-sm" />
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
              <img src={screenshot} alt={`Screenshot ${index + 1}`} className="w-14 h-14 object-cover rounded border border-border" />
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
        <Button type="button" variant={!showUrlInput ? "default" : "outline"} size="sm" onClick={() => setShowUrlInput(false)} className="flex-1">
          <Upload className="h-3 w-3 mr-1" />Upload
        </Button>
        <Button type="button" variant={showUrlInput ? "default" : "outline"} size="sm" onClick={() => setShowUrlInput(true)} className="flex-1">
          <Link className="h-3 w-3 mr-1" />URL
        </Button>
      </div>
      {!showUrlInput ? (
        <div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} disabled={isUploading} className="hidden" />
          <Button type="button" variant="outline" className="w-full text-sm" disabled={isUploading} onClick={() => fileInputRef.current?.click()}>
            {isUploading ? <><Loader2 className="h-3 w-3 mr-2 animate-spin" />Uploading...</> : <><Plus className="h-3 w-3 mr-2" />Add Screenshot</>}
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input value={urlValue} onChange={(e) => setUrlValue(e.target.value)} placeholder="https://..." className="text-sm" />
          <Button type="button" onClick={handleAddUrl} variant="outline" size="icon"><Plus className="h-3 w-3" /></Button>
        </div>
      )}
    </div>
  );
};

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const [allPurchases, setAllPurchases] = useState<Purchase[]>([]);
  const [orderSubmissions, setOrderSubmissions] = useState<OrderSubmission[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customProjects, setCustomProjects] = useState<CustomProject[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [heroSlides, setHeroSlides] = useState<SliderImage[]>([]);
  const [bestSelling, setBestSelling] = useState<BestSellingItem[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent>({});
  const [supportChannels, setSupportChannels] = useState<SupportChannels>({});
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productType, setProductType] = useState<string>('course');
  const [buyButtonLabel, setBuyButtonLabel] = useState('');

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
  const [isFreeResource, setIsFreeResource] = useState(false);
  const [allowCustomization, setAllowCustomization] = useState(false);
  const [isOutOfStock, setIsOutOfStock] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState<ImageAspectRatio>('4:3');
  
  // Dual button configuration
  const [enableDualButtons, setEnableDualButtons] = useState(false);
  const [displayPriceFrom, setDisplayPriceFrom] = useState<'base' | 'left' | 'right'>('base');
  const [leftButtonLabel, setLeftButtonLabel] = useState('Source Code');
  const [leftButtonDescription, setLeftButtonDescription] = useState('');
  const [leftButtonPrice, setLeftButtonPrice] = useState('');
  const [leftButtonOriginalPrice, setLeftButtonOriginalPrice] = useState('');
  const [rightButtonLabel, setRightButtonLabel] = useState('Get Customized');
  const [rightButtonDescription, setRightButtonDescription] = useState('');
  const [rightButtonPrice, setRightButtonPrice] = useState('');
  const [rightButtonOriginalPrice, setRightButtonOriginalPrice] = useState('');
  const [rightButtonShowForm, setRightButtonShowForm] = useState(true);

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

  // Admin management state
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminRole, setAdminRole] = useState<'admin' | 'moderator'>('moderator');
  const [adminAccessLevel, setAdminAccessLevel] = useState([50]);
  const [adminPermissions, setAdminPermissions] = useState<AdminPermissions>(DEFAULT_PERMISSIONS);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  
  // Check if current user is super admin (both emails have full power)
  const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(user?.email || '');

  // Calculate real stats
  const totalUsers = allUsers.length;
  const totalRevenue = allPurchases.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Calculate user stats
  const userStats: UserStats[] = allUsers.map(u => {
    const userPurchases = allPurchases.filter(p => p.userId === u.id);
    return {
      email: u.email,
      totalPurchases: userPurchases.length,
      totalSpent: userPurchases.reduce((sum, p) => sum + (p.amount || 0), 0),
      products: userPurchases.map(p => ({
        title: p.productTitle || p.productId,
        amount: p.amount || 0,
        date: p.purchaseDate,
      })),
    };
  }).filter(s => s.totalPurchases > 0).sort((a, b) => b.totalSpent - a.totalSpent);

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
    const submissionsRef = ref(database, 'orderSubmissions');
    const usersRef = ref(database, 'users');
    const coursesRef = ref(database, 'courses');
    const websitesRef = ref(database, 'websites');
    const projectsRef = ref(database, 'customProjects');
    const testimonialsRef = ref(database, 'testimonials');
    const slidesRef = ref(database, 'heroSlides');
    const bestSellingRef = ref(database, 'bestSelling');
    const siteContentRef = ref(database, 'siteContent');
    const supportRef = ref(database, 'supportChannels');
    const messagesRef = ref(database, 'contactMessages');
    const couponsRef = ref(database, 'coupons');

    const unsubscribePurchases = onValue(purchasesRef, (snapshot) => {
      const data = snapshot.val();
      const list: Purchase[] = data ? Object.entries(data).map(([id, value]: [string, any]) => ({ ...value, id })) : [];
      setAllPurchases(list);
    });

    const unsubscribeSubmissions = onValue(submissionsRef, (snapshot) => {
      const data = snapshot.val();
      const list: OrderSubmission[] = data ? Object.entries(data).map(([id, value]: [string, any]) => ({ ...value, id })) : [];
      setOrderSubmissions(list.sort((a, b) => b.createdAt - a.createdAt));
    });

    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      const usersList: UserData[] = data ? Object.entries(data).map(([id, value]: [string, any]) => ({ ...value, id })) : [];
      setAllUsers(usersList);
    });

    const unsubscribeCourses = onValue(coursesRef, (snapshot) => {
      const data = snapshot.val();
      const coursesList: Product[] = data ? Object.entries(data).map(([id, value]: [string, any]) => ({ ...value, id, type: 'course' as const })) : [];
      setProducts((prev) => {
        const websites = prev.filter(p => p.type === 'website');
        return [...coursesList, ...websites];
      });
    });

    const unsubscribeWebsites = onValue(websitesRef, (snapshot) => {
      const data = snapshot.val();
      const websitesList: Product[] = data ? Object.entries(data).map(([id, value]: [string, any]) => ({ ...value, id, type: 'website' as const })) : [];
      setProducts((prev) => {
        const courses = prev.filter(p => p.type === 'course');
        return [...courses, ...websitesList];
      });
    });

    const unsubscribeProjects = onValue(projectsRef, (snapshot) => {
      const data = snapshot.val();
      const list: CustomProject[] = data ? Object.entries(data).map(([id, value]: [string, any]) => ({ ...value, id })) : [];
      setCustomProjects(list);
    });

    const unsubscribeTestimonials = onValue(testimonialsRef, (snapshot) => {
      const data = snapshot.val();
      const list: Testimonial[] = data ? Object.entries(data).map(([id, value]: [string, any]) => ({ ...value, id })) : [];
      setTestimonials(list);
    });

    const unsubscribeSlides = onValue(slidesRef, (snapshot) => {
      const data = snapshot.val();
      const list: SliderImage[] = data ? Object.entries(data).map(([id, value]: [string, any]) => ({ ...value, id })) : [];
      setHeroSlides(list.sort((a, b) => a.order - b.order));
    });

    const unsubscribeBestSelling = onValue(bestSellingRef, (snapshot) => {
      const data = snapshot.val();
      const list: BestSellingItem[] = data ? Object.entries(data).map(([id, value]: [string, any]) => ({ ...value, id })) : [];
      setBestSelling(list.sort((a, b) => a.order - b.order));
    });

    const unsubscribeSiteContent = onValue(siteContentRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setSiteContent(data);
    });

    const unsubscribeSupport = onValue(supportRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setSupportChannels(data);
    });

    const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      const list: ContactMessage[] = data ? Object.entries(data).map(([id, value]: [string, any]) => ({ ...value, id })) : [];
      setContactMessages(list.sort((a, b) => b.createdAt - a.createdAt));
    });

    const unsubscribeCoupons = onValue(couponsRef, (snapshot) => {
      const data = snapshot.val();
      const list: Coupon[] = data ? Object.entries(data).map(([id, value]: [string, any]) => ({ ...value, id })) : [];
      setCoupons(list.sort((a, b) => b.createdAt - a.createdAt));
    });

    // Fetch admin users
    const adminsRef = ref(database, 'adminUsers');
    const unsubscribeAdmins = onValue(adminsRef, (snapshot) => {
      const data = snapshot.val();
      const list: AdminUser[] = data ? Object.entries(data).map(([id, value]: [string, any]) => ({ ...value, id })) : [];
      setAdminUsers(list.sort((a, b) => b.createdAt - a.createdAt));
    });

    return () => {
      unsubscribePurchases();
      unsubscribeSubmissions();
      unsubscribeUsers();
      unsubscribeCourses();
      unsubscribeWebsites();
      unsubscribeProjects();
      unsubscribeTestimonials();
      unsubscribeSlides();
      unsubscribeBestSelling();
      unsubscribeSiteContent();
      unsubscribeSupport();
      unsubscribeMessages();
      unsubscribeCoupons();
      unsubscribeAdmins();
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
    setIsFreeResource(false);
    setAllowCustomization(false);
    setIsOutOfStock(false);
    setImageAspectRatio('4:3');
    setBuyButtonLabel('');
    setEditingProduct(null);
    // Reset dual button config
    setEnableDualButtons(false);
    setDisplayPriceFrom('base');
    setLeftButtonLabel('Source Code');
    setLeftButtonDescription('');
    setLeftButtonPrice('');
    setLeftButtonOriginalPrice('');
    setRightButtonLabel('Get Customized');
    setRightButtonDescription('');
    setRightButtonPrice('');
    setRightButtonOriginalPrice('');
    setRightButtonShowForm(true);
  };

  const handleSaveProduct = async () => {
    if (!title || !description || !price || !image) {
      toast.error('Please fill all required fields');
      return;
    }

    const priceNum = parseFloat(price);
    const productData: any = {
      title,
      description,
      price: priceNum,
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      image,
      previewLink,
      razorpayLink,
      deliveryLink: razorpayLink,
      content,
      screenshots: screenshots.length > 0 ? screenshots : null,
      youtubeUrl: youtubeUrl || null,
      isFreeResource: priceNum === 0 ? isFreeResource : false,
      allowCustomization,
      isOutOfStock,
      imageAspectRatio,
      displayPriceFrom: enableDualButtons ? displayPriceFrom : 'base',
      buyButtonLabel: buyButtonLabel || null,
      createdAt: Date.now(),
    };

    // Add dual button configuration if enabled
    if (enableDualButtons) {
      productData.leftButton = {
        label: leftButtonLabel || 'Source Code',
        description: leftButtonDescription || description,
        price: leftButtonPrice ? parseFloat(leftButtonPrice) : priceNum,
        originalPrice: leftButtonOriginalPrice ? parseFloat(leftButtonOriginalPrice) : null,
      };
      productData.rightButton = {
        label: rightButtonLabel || 'Get Customized',
        description: rightButtonDescription || description,
        price: rightButtonPrice ? parseFloat(rightButtonPrice) : priceNum,
        originalPrice: rightButtonOriginalPrice ? parseFloat(rightButtonOriginalPrice) : null,
        showForm: rightButtonShowForm,
      };
    }

    // Store in courses or websites node based on type (custom types go to courses)
    const dbPath = productType === 'website' ? 'websites' : 'courses';

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
    const dbPath = product.type === 'website' ? 'websites' : 'courses';
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
    setIsFreeResource(product.isFreeResource || false);
    setAllowCustomization(product.allowCustomization || false);
    setIsOutOfStock(product.isOutOfStock || false);
    setImageAspectRatio(product.imageAspectRatio || '4:3');
    setBuyButtonLabel(product.buyButtonLabel || '');
    // Load dual button config
    if (product.leftButton || product.rightButton) {
      setEnableDualButtons(true);
      setDisplayPriceFrom(
        product.displayPriceFrom || (product.leftButton ? 'left' : product.rightButton ? 'right' : 'base')
      );
      setLeftButtonLabel(product.leftButton?.label || 'Source Code');
      setLeftButtonDescription(product.leftButton?.description || '');
      setLeftButtonPrice(product.leftButton?.price?.toString() || '');
      setLeftButtonOriginalPrice(product.leftButton?.originalPrice?.toString() || '');
      setRightButtonLabel(product.rightButton?.label || 'Get Customized');
      setRightButtonDescription(product.rightButton?.description || '');
      setRightButtonPrice(product.rightButton?.price?.toString() || '');
      setRightButtonOriginalPrice(product.rightButton?.originalPrice?.toString() || '');
      setRightButtonShowForm(product.rightButton?.showForm ?? true);
    } else {
      setEnableDualButtons(false);
      setDisplayPriceFrom('base');
    }
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

  const handleUpdateSubmissionStatus = async (submissionId: string, status: string) => {
    try {
      await update(ref(database, `orderSubmissions/${submissionId}`), { status });
      toast.success('Order status updated!');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

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

  const handleToggleTestimonialApproval = async (testimonial: Testimonial) => {
    try {
      await update(ref(database, `testimonials/${testimonial.id}`), { approved: !testimonial.approved });
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

  const handleToggleBestSelling = async (productId: string) => {
    const existing = bestSelling.find(b => b.productId === productId);
    try {
      if (existing) {
        await remove(ref(database, `bestSelling/${existing.id}`));
        toast.success('Removed from best selling');
      } else {
        await push(ref(database, 'bestSelling'), { productId, order: bestSelling.length + 1 });
        toast.success('Added to best selling!');
      }
    } catch (error) {
      toast.error('Failed to update best selling');
    }
  };

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

  const handleSaveSupportChannels = async () => {
    try {
      await update(ref(database, 'supportChannels'), supportChannels);
      toast.success('Support channels saved!');
    } catch (error) {
      toast.error('Failed to save');
    }
  };

  // Admin Management Functions
  const handleAddAdmin = async () => {
    if (!adminEmail) {
      toast.error('Please enter an email');
      return;
    }

    // Find user by email
    const foundUser = allUsers.find(u => u.email.toLowerCase() === adminEmail.toLowerCase());
    if (!foundUser) {
      toast.error('User not found. They must sign up first.');
      return;
    }

    // Check if already an admin
    if (adminUsers.find(a => a.email.toLowerCase() === adminEmail.toLowerCase())) {
      toast.error('This user is already an admin');
      return;
    }

    try {
      await push(ref(database, 'adminUsers'), {
        email: adminEmail.toLowerCase(),
        userId: foundUser.id,
        role: adminRole,
        accessLevel: adminAccessLevel[0],
        permissions: adminPermissions,
        createdAt: Date.now(),
        createdBy: user?.email || '',
        isActive: true,
      });
      toast.success('Admin added successfully!');
      resetAdminForm();
    } catch (error) {
      toast.error('Failed to add admin');
    }
  };

  const handleUpdateAdmin = async () => {
    if (!editingAdmin) return;

    try {
      await update(ref(database, `adminUsers/${editingAdmin.id}`), {
        role: adminRole,
        accessLevel: adminAccessLevel[0],
        permissions: adminPermissions,
      });
      toast.success('Admin updated!');
      resetAdminForm();
    } catch (error) {
      toast.error('Failed to update admin');
    }
  };

  const handleToggleAdminStatus = async (admin: AdminUser) => {
    try {
      await update(ref(database, `adminUsers/${admin.id}`), { isActive: !admin.isActive });
      toast.success(admin.isActive ? 'Admin deactivated' : 'Admin activated');
    } catch (error) {
      toast.error('Failed to update admin status');
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm('Remove this admin?')) return;
    try {
      await remove(ref(database, `adminUsers/${adminId}`));
      toast.success('Admin removed!');
    } catch (error) {
      toast.error('Failed to remove admin');
    }
  };

  const resetAdminForm = () => {
    setShowAdminForm(false);
    setAdminEmail('');
    setAdminRole('moderator');
    setAdminAccessLevel([50]);
    setAdminPermissions(DEFAULT_PERMISSIONS);
    setEditingAdmin(null);
  };

  const startEditAdmin = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setAdminEmail(admin.email);
    setAdminRole(admin.role as 'admin' | 'moderator');
    setAdminAccessLevel([admin.accessLevel]);
    setAdminPermissions(admin.permissions);
    setShowAdminForm(true);
  };

  const togglePermission = (key: keyof AdminPermissions) => {
    setAdminPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const selectAllPermissions = () => {
    setAdminPermissions(FULL_PERMISSIONS);
  };

  const clearAllPermissions = () => {
    setAdminPermissions(DEFAULT_PERMISSIONS);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
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
        <div className="container mx-auto px-3 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <img src={zexofileLogo} alt="ZexoFile" className="h-8 w-8 object-contain" />
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-foreground flex items-center gap-1">
                <Shield className="h-4 w-4 text-primary" />
                Admin Panel
              </h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Logout</span>
          </Button>
        </div>
      </header>

      {/* Stats */}
      <div className="container mx-auto px-3 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl border border-blue-500/20">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-500/20 rounded-lg">
                <Users className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Users</p>
                <p className="text-lg font-bold text-foreground">{totalUsers}</p>
              </div>
            </div>
          </div>
          <div className="p-3 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl border border-green-500/20">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-green-500/20 rounded-lg">
                <DollarSign className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Revenue</p>
                <p className="text-lg font-bold text-foreground">₹{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="p-3 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl border border-purple-500/20">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-500/20 rounded-lg">
                <Package className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Products</p>
                <p className="text-lg font-bold text-foreground">{products.length}</p>
              </div>
            </div>
          </div>
          <div className="p-3 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-xl border border-orange-500/20">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-orange-500/20 rounded-lg">
                <ShoppingBag className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Orders</p>
                <p className="text-lg font-bold text-foreground">{allPurchases.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="submissions" className="w-full">
          <TabsList className="flex flex-wrap w-full gap-1 h-auto p-1 mb-4 overflow-x-auto">
            <TabsTrigger value="submissions" className="flex items-center gap-1 text-xs px-2 py-1.5 relative">
              <ClipboardList className="h-3 w-3" />
              <span className="hidden xs:inline">Orders</span>
              {orderSubmissions.filter(s => s.status === 'pending').length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {orderSubmissions.filter(s => s.status === 'pending').length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-1 text-xs px-2 py-1.5">
              <Package className="h-3 w-3" />
              <span className="hidden xs:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-1 text-xs px-2 py-1.5">
              <Users className="h-3 w-3" />
              <span className="hidden xs:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="slides" className="flex items-center gap-1 text-xs px-2 py-1.5">
              <Image className="h-3 w-3" />
              <span className="hidden xs:inline">Slides</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-1 text-xs px-2 py-1.5 relative">
              <Mail className="h-3 w-3" />
              <span className="hidden xs:inline">Messages</span>
              {contactMessages.filter(m => !m.read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {contactMessages.filter(m => !m.read).length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="coupons" className="flex items-center gap-1 text-xs px-2 py-1.5">
              <Ticket className="h-3 w-3" />
              <span className="hidden xs:inline">Coupons</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-1 text-xs px-2 py-1.5">
              <Star className="h-3 w-3" />
              <span className="hidden xs:inline">Reviews</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-1 text-xs px-2 py-1.5">
              <FileText className="h-3 w-3" />
              <span className="hidden xs:inline">Projects</span>
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-1 text-xs px-2 py-1.5">
              <Send className="h-3 w-3" />
              <span className="hidden xs:inline">Support</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1 text-xs px-2 py-1.5">
              <Settings className="h-3 w-3" />
              <span className="hidden xs:inline">Settings</span>
            </TabsTrigger>
            <TabsTrigger value="themes" className="flex items-center gap-1 text-xs px-2 py-1.5">
              <Palette className="h-3 w-3" />
              <span className="hidden xs:inline">Themes</span>
            </TabsTrigger>
            {isSuperAdmin && (
              <TabsTrigger value="admins" className="flex items-center gap-1 text-xs px-2 py-1.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                <Crown className="h-3 w-3 text-amber-500" />
                <span className="hidden xs:inline">Admins</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Submissions/Orders Tab */}
          <TabsContent value="submissions" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Order Submissions</h3>
              <p className="text-xs text-muted-foreground">{orderSubmissions.length} total orders</p>
            </div>
            
            {orderSubmissions.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">User</TableHead>
                      <TableHead className="text-xs">Product</TableHead>
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs">Amount</TableHead>
                      <TableHead className="text-xs">Date</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderSubmissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="text-xs">
                          <div>
                            <p className="font-medium">{submission.userName || 'N/A'}</p>
                            <p className="text-muted-foreground">{submission.userEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-2">
                            <img src={submission.productImage} alt="" className="w-8 h-8 rounded object-cover" />
                            <span className="max-w-[120px] truncate">{submission.productTitle}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {submission.paymentType === 'right' ? 'Customized' : 'Source Code'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-medium text-green-600">₹{submission.paymentAmount}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(submission.createdAt).toLocaleDateString()}
                          <br />
                          {new Date(submission.createdAt).toLocaleTimeString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] ${getStatusColor(submission.status)}`}>
                            {submission.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select value={submission.status} onValueChange={(v) => handleUpdateSubmissionStatus(submission.id, v)}>
                            <SelectTrigger className="w-24 h-7 text-[10px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8 bg-secondary/30 rounded-xl text-sm">No orders yet</p>
            )}

            {/* Form Data Details */}
            {orderSubmissions.filter(s => s.formData).length > 0 && (
              <div className="space-y-3 mt-6">
                <h4 className="font-semibold text-sm">Customization Form Details</h4>
                {orderSubmissions.filter(s => s.formData).map((submission) => (
                  <div key={submission.id} className="p-4 bg-card border border-border rounded-xl">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <p className="font-medium text-sm">{submission.productTitle}</p>
                        <p className="text-xs text-muted-foreground">{submission.userEmail}</p>
                      </div>
                      <Badge className={`text-[10px] ${getStatusColor(submission.status)}`}>
                        {submission.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">Name:</span>
                        <p className="font-medium">{submission.formData?.name}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Calling:</span>
                        <p className="font-medium">{submission.formData?.callingNumber}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">WhatsApp:</span>
                        <p className="font-medium">{submission.formData?.whatsappNumber}</p>
                      </div>
                      {submission.formData?.instagramTelegramId && (
                        <div>
                          <span className="text-muted-foreground">IG/TG:</span>
                          <p className="font-medium">{submission.formData.instagramTelegramId}</p>
                        </div>
                      )}
                      {submission.formData?.alternativeNumber && (
                        <div>
                          <span className="text-muted-foreground">Alt Number:</span>
                          <p className="font-medium">{submission.formData.alternativeNumber}</p>
                        </div>
                      )}
                      {submission.formData?.videoDriveLink && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Video Link:</span>
                          <a href={submission.formData.videoDriveLink} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline block truncate">
                            {submission.formData.videoDriveLink}
                          </a>
                        </div>
                      )}
                    </div>
                    {submission.formData?.photos && submission.formData.photos.length > 0 && (
                      <div className="mt-3">
                        <span className="text-xs text-muted-foreground">Photos:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {submission.formData.photos.map((photo, i) => (
                            <a key={i} href={photo} target="_blank" rel="noopener noreferrer">
                              <img src={photo} alt="" className="w-16 h-16 rounded-lg object-cover border border-border hover:opacity-80" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Products</h3>
              <Button size="sm" onClick={() => { resetForm(); setShowProductForm(true); }}>
                <Plus className="h-4 w-4 mr-1" />Add
              </Button>
            </div>

            {showProductForm && (
              <div className="border border-border rounded-xl p-4 space-y-4 bg-card">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-sm">{editingProduct ? 'Edit Product' : 'New Product'}</h4>
                  <Button variant="ghost" size="sm" onClick={() => { resetForm(); setShowProductForm(false); }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Type / Category *</Label>
                    <Input 
                      value={productType} 
                      onChange={(e) => setProductType(e.target.value)} 
                      placeholder="e.g. course, website, template, app..."
                      list="product-types"
                      className="h-9 text-sm" 
                    />
                    <datalist id="product-types">
                      <option value="course" />
                      <option value="website" />
                      <option value="template" />
                      <option value="app" />
                      <option value="design" />
                      <option value="plugin" />
                    </datalist>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Title *</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">MRP</Label>
                    <Input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Selling Price *</Label>
                    <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div className="col-span-full space-y-1">
                    <Label className="text-xs flex items-center gap-1"><Image className="h-3 w-3" />Main Image *</Label>
                    <ImageUploadField value={image} onChange={setImage} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Image Aspect Ratio</Label>
                    <Select value={imageAspectRatio} onValueChange={(v) => setImageAspectRatio(v as ImageAspectRatio)}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1:1">1:1 (Square)</SelectItem>
                        <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                        <SelectItem value="3:4">3:4 (Portrait)</SelectItem>
                        <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                        <SelectItem value="9:16">9:16 (Vertical)</SelectItem>
                        <SelectItem value="4:5">4:5 (Instagram)</SelectItem>
                        <SelectItem value="5:4">5:4 (Landscape)</SelectItem>
                        <SelectItem value="3:2">3:2 (Photo)</SelectItem>
                        <SelectItem value="2:3">2:3 (Tall)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground">Images will fit this ratio on shop & product pages.</p>
                  </div>
                  <div className="col-span-full space-y-1">
                    <Label className="text-xs flex items-center gap-1"><Images className="h-3 w-3" />Screenshots</Label>
                    <ScreenshotUploadField screenshots={screenshots} onAdd={(url) => setScreenshots([...screenshots, url])} onRemove={(i) => setScreenshots(screenshots.filter((_, idx) => idx !== i))} />
                  </div>
                  <div className="col-span-full space-y-1">
                    <Label className="text-xs flex items-center gap-1"><Youtube className="h-3 w-3 text-red-500" />YouTube URL</Label>
                    <Input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Preview Link</Label>
                    <Input value={previewLink} onChange={(e) => setPreviewLink(e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Delivery Link</Label>
                    <Input value={razorpayLink} onChange={(e) => setRazorpayLink(e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div className="col-span-full space-y-1">
                    <Label className="text-xs">Description *</Label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="text-sm" />
                  </div>
                  <div className="col-span-full space-y-1">
                    <Label className="text-xs">Content</Label>
                    <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3} className="text-sm" />
                  </div>
                  
                  {/* Toggles */}
                  <div className="col-span-full flex flex-wrap gap-4">
                    {parseFloat(price) === 0 && (
                      <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <Switch checked={isFreeResource} onCheckedChange={setIsFreeResource} />
                        <Label className="text-xs text-green-700 dark:text-green-400">Free Resource</Label>
                      </div>
                    )}
                    <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <Switch checked={allowCustomization} onCheckedChange={setAllowCustomization} />
                      <Label className="text-xs text-purple-700 dark:text-purple-400">Allow Customization</Label>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-lg">
                      <Switch checked={isOutOfStock} onCheckedChange={setIsOutOfStock} />
                      <Label className="text-xs text-destructive">Out of Stock</Label>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Switch checked={enableDualButtons} onCheckedChange={setEnableDualButtons} />
                      <Label className="text-xs text-blue-700 dark:text-blue-400">Dual Pay Buttons</Label>
                    </div>
                  </div>

                  {/* Single Buy Button Label (only when dual buttons disabled) */}
                  {!enableDualButtons && (
                    <div className="col-span-full space-y-1">
                      <Label className="text-xs">Buy Button Label</Label>
                      <Input 
                        value={buyButtonLabel} 
                        onChange={(e) => setBuyButtonLabel(e.target.value)} 
                        placeholder="Buy Now (leave empty for default)" 
                        className="h-9 text-sm" 
                      />
                      <p className="text-[10px] text-muted-foreground">Custom text for the buy button. Default: "Buy Now"</p>
                    </div>
                  )}

                  {/* Dual Button Configuration */}
                  {enableDualButtons && (
                    <div className="col-span-full border border-border rounded-lg p-4 space-y-4 bg-secondary/20">
                      <h5 className="font-medium text-sm">Dual Button Configuration</h5>

                      <div className="space-y-1">
                        <Label className="text-xs">Main price to show</Label>
                        <Select value={displayPriceFrom} onValueChange={(v) => setDisplayPriceFrom(v as any)}>
                          <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="base">Base price</SelectItem>
                            <SelectItem value="left">Left button price</SelectItem>
                            <SelectItem value="right">Right button price</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-[11px] text-muted-foreground">This price will be shown on product card & product page.</p>
                      </div>
                      
                      {/* Left Button */}
                      <div className="space-y-3 p-3 bg-card rounded-lg border border-border">
                        <p className="text-xs font-medium text-blue-600">Left Button (Source Code)</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Label</Label>
                            <Input value={leftButtonLabel} onChange={(e) => setLeftButtonLabel(e.target.value)} placeholder="Source Code" className="h-8 text-sm" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Price</Label>
                            <Input type="number" value={leftButtonPrice} onChange={(e) => setLeftButtonPrice(e.target.value)} placeholder={price} className="h-8 text-sm" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Original Price</Label>
                            <Input type="number" value={leftButtonOriginalPrice} onChange={(e) => setLeftButtonOriginalPrice(e.target.value)} className="h-8 text-sm" />
                          </div>
                          <div className="col-span-2 space-y-1">
                            <Label className="text-xs">Description</Label>
                            <Input value={leftButtonDescription} onChange={(e) => setLeftButtonDescription(e.target.value)} placeholder="Description for this option" className="h-8 text-sm" />
                          </div>
                        </div>
                      </div>

                      {/* Right Button */}
                      <div className="space-y-3 p-3 bg-card rounded-lg border border-border">
                        <p className="text-xs font-medium text-purple-600">Right Button (Customized)</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Label</Label>
                            <Input value={rightButtonLabel} onChange={(e) => setRightButtonLabel(e.target.value)} placeholder="Get Customized" className="h-8 text-sm" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Price</Label>
                            <Input type="number" value={rightButtonPrice} onChange={(e) => setRightButtonPrice(e.target.value)} placeholder={price} className="h-8 text-sm" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Original Price</Label>
                            <Input type="number" value={rightButtonOriginalPrice} onChange={(e) => setRightButtonOriginalPrice(e.target.value)} className="h-8 text-sm" />
                          </div>
                          <div className="col-span-2 space-y-1">
                            <Label className="text-xs">Description</Label>
                            <Input value={rightButtonDescription} onChange={(e) => setRightButtonDescription(e.target.value)} placeholder="Description for this option" className="h-8 text-sm" />
                          </div>
                          <div className="col-span-2 flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <Switch checked={rightButtonShowForm} onCheckedChange={setRightButtonShowForm} />
                            <Label className="text-xs text-purple-700 dark:text-purple-400">Show Form After Payment</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <Button onClick={handleSaveProduct} className="w-full">{editingProduct ? 'Update' : 'Add'} Product</Button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {products.map((product) => (
                <div key={product.id} className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="relative">
                    <img src={product.image} alt={product.title} className="w-full h-32 object-contain bg-secondary/30" />
                    <Badge className={`absolute top-2 left-2 text-xs ${product.type === 'course' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                      {product.type}
                    </Badge>
                    <Switch
                      checked={bestSelling.some(b => b.productId === product.id)}
                      onCheckedChange={() => handleToggleBestSelling(product.id)}
                      className="absolute top-2 right-2"
                    />
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-sm truncate">{product.title}</h4>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {product.price === 0 && product.isFreeResource ? (
                        <span className="font-bold text-sm text-green-600">FREE</span>
                      ) : (
                        <span className="font-bold text-sm text-primary">₹{product.price}</span>
                      )}
                      {product.isOutOfStock && (
                        <Badge className="text-[10px] bg-destructive/10 text-destructive border border-destructive/20">
                          Out of Stock
                        </Badge>
                      )}
                      {product.allowCustomization && (
                        <Badge variant="outline" className="text-[10px]">Customizable</Badge>
                      )}
                      {(product.leftButton || product.rightButton) && (
                        <Badge variant="outline" className="text-[10px] border-blue-500 text-blue-600">Dual Pay</Badge>
                      )}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" className="flex-1 text-xs h-8" onClick={() => handleEditProduct(product)}>
                        <Edit className="h-3 w-3 mr-1" />Edit
                      </Button>
                      <Button size="sm" variant="destructive" className="flex-1 text-xs h-8" onClick={() => handleDeleteProduct(product)}>
                        <Trash2 className="h-3 w-3 mr-1" />Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {products.length === 0 && <p className="text-center text-muted-foreground py-8 bg-secondary/30 rounded-xl text-sm">No products yet</p>}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">User Analytics</h3>
              <Badge variant="outline" className="text-xs">
                {allUsers.length} Total Users
              </Badge>
            </div>

            {/* All Users List */}
            <div className="space-y-3 mb-6">
              <h4 className="text-sm font-medium text-muted-foreground">All Registered Users</h4>
              <div className="max-h-[300px] overflow-y-auto border border-border rounded-xl">
                {allUsers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Email</TableHead>
                        <TableHead className="text-xs">Joined</TableHead>
                        <TableHead className="text-xs">Purchases</TableHead>
                        <TableHead className="text-xs">Total Spent</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allUsers.map((user) => {
                        const userPurchases = allPurchases.filter(p => p.userId === user.id);
                        const totalSpent = userPurchases.reduce((sum, p) => sum + (p.amount || 0), 0);
                        return (
                          <TableRow key={user.id}>
                            <TableCell className="text-xs font-medium">{user.email}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                            </TableCell>
                            <TableCell className="text-xs">{userPurchases.length}</TableCell>
                            <TableCell className="text-xs font-semibold text-green-600">
                              ₹{totalSpent.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-6 text-sm">No users registered yet</p>
                )}
              </div>
            </div>

            {/* User Purchase Statistics */}
            <h4 className="text-sm font-medium text-muted-foreground">Top Buyers</h4>
            <div className="space-y-3">
              {userStats.map((stats, idx) => (
                <div key={idx} className="p-4 bg-card border border-border rounded-xl">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{stats.email}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span>{stats.totalPurchases} purchases</span>
                          <span className="font-semibold text-green-600">₹{stats.totalSpent.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {stats.products.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Products purchased:</p>
                      <div className="flex flex-wrap gap-2">
                        {stats.products.map((p, i) => (
                          <span key={i} className="px-2 py-1 text-xs bg-secondary rounded-full">
                            {p.title} (₹{p.amount})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {userStats.length === 0 && <p className="text-center text-muted-foreground py-8 bg-secondary/30 rounded-xl text-sm">No purchases yet</p>}
          </TabsContent>

          {/* Slides Tab */}
          <TabsContent value="slides" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Hero Slides</h3>
              <Button size="sm" onClick={() => setShowSlideForm(true)}><Plus className="h-4 w-4 mr-1" />Add</Button>
            </div>
            {showSlideForm && (
              <div className="border border-border rounded-xl p-4 space-y-3 bg-card">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-sm">New Slide</h4>
                  <Button variant="ghost" size="sm" onClick={() => setShowSlideForm(false)}><X className="h-4 w-4" /></Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">Image *</Label>
                    <ImageUploadField value={slideImageUrl} onChange={setSlideImageUrl} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Title</Label>
                    <Input value={slideTitle} onChange={(e) => setSlideTitle(e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Order</Label>
                    <Input type="number" value={slideOrder} onChange={(e) => setSlideOrder(e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">Subtitle</Label>
                    <Input value={slideSubtitle} onChange={(e) => setSlideSubtitle(e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Button Text</Label>
                    <Input value={slideButtonText} onChange={(e) => setSlideButtonText(e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Button Link</Label>
                    <Input value={slideButtonLink} onChange={(e) => setSlideButtonLink(e.target.value)} className="h-9 text-sm" />
                  </div>
                </div>
                <Button onClick={handleAddSlide} className="w-full">Add Slide</Button>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {heroSlides.map((slide) => (
                <div key={slide.id} className="relative group rounded-xl overflow-hidden border border-border">
                  <img src={slide.imageUrl} alt={slide.title || 'Slide'} className="w-full aspect-video object-cover" />
                  <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteSlide(slide.id)}>
                      <Trash2 className="h-4 w-4 mr-1" />Delete
                    </Button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-background to-transparent">
                    <p className="text-xs text-foreground">Order: {slide.order} {slide.title && `• ${slide.title}`}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Contact Messages</h3>
              <p className="text-xs text-muted-foreground">{contactMessages.filter(m => !m.read).length} unread</p>
            </div>
            <div className="space-y-3">
              {contactMessages.map((message) => (
                <div key={message.id} className={`p-3 bg-card border rounded-xl ${message.read ? 'border-border' : 'border-primary/50 bg-primary/5'}`}>
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{message.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{message.email}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">{new Date(message.createdAt).toLocaleDateString()}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleToggleMessageRead(message.id, message.read)}>
                        {message.read ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3 text-primary" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteMessage(message.id)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap">{message.message}</p>
                </div>
              ))}
            </div>
            {contactMessages.length === 0 && <p className="text-center text-muted-foreground py-8 bg-secondary/30 rounded-xl text-sm">No messages</p>}
          </TabsContent>

          {/* Coupons Tab */}
          <TabsContent value="coupons" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Coupons</h3>
              <Button size="sm" onClick={() => setShowCouponForm(true)}><Plus className="h-4 w-4 mr-1" />Create</Button>
            </div>
            {showCouponForm && (
              <div className="border border-border rounded-xl p-4 space-y-3 bg-card">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-sm">New Coupon</h4>
                  <Button variant="ghost" size="sm" onClick={() => setShowCouponForm(false)}><X className="h-4 w-4" /></Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Code *</Label>
                    <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Discount % *</Label>
                    <div className="relative">
                      <Input type="number" value={couponDiscount} onChange={(e) => setCouponDiscount(e.target.value)} className="h-9 text-sm pr-8" />
                      <Percent className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Min Order</Label>
                    <Input type="number" value={couponMinOrder} onChange={(e) => setCouponMinOrder(e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Max Uses *</Label>
                    <Input type="number" value={couponMaxUses} onChange={(e) => setCouponMaxUses(e.target.value)} className="h-9 text-sm" />
                  </div>
                </div>
                <Button onClick={handleAddCoupon} className="w-full">Create Coupon</Button>
              </div>
            )}
            <div className="space-y-3">
              {coupons.map((coupon) => (
                <div key={coupon.id} className={`p-3 bg-card border rounded-xl ${coupon.active ? 'border-green-500/30' : 'border-border opacity-60'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary">{coupon.code}</span>
                        <Badge variant="outline" className={`text-[10px] ${coupon.active ? 'border-green-500 text-green-600' : ''}`}>
                          {coupon.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span>{coupon.discountPercent}% OFF</span>
                        {coupon.minOrderValue > 0 && <span>Min: ₹{coupon.minOrderValue}</span>}
                        <span>Used: {coupon.usedCount}/{coupon.maxUses}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Switch checked={coupon.active} onCheckedChange={() => handleToggleCouponActive(coupon.id, coupon.active)} />
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteCoupon(coupon.id)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  {coupon.usedBy && Object.keys(coupon.usedBy).length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <p className="text-[10px] text-muted-foreground mb-1">Used by:</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(coupon.usedBy).map(([userId, usage]) => (
                          <span key={userId} className="px-1.5 py-0.5 text-[10px] bg-secondary rounded">{usage.email}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {coupons.length === 0 && <p className="text-center text-muted-foreground py-8 bg-secondary/30 rounded-xl text-sm">No coupons</p>}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-4">
            <h3 className="font-semibold">Testimonials</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="p-3 bg-card border border-border rounded-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{testimonial.name}</p>
                      <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className={`h-3 w-3 ${i < testimonial.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted'}`} />)}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Switch checked={testimonial.approved} onCheckedChange={() => handleToggleTestimonialApproval(testimonial)} />
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteTestimonial(testimonial.id)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{testimonial.message}</p>
                </div>
              ))}
            </div>
            {testimonials.length === 0 && <p className="text-center text-muted-foreground py-8 bg-secondary/30 rounded-xl text-sm">No testimonials</p>}
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4">
            <h3 className="font-semibold">Custom Projects</h3>
            <div className="space-y-3">
              {customProjects.map((project) => (
                <div key={project.id} className="p-3 bg-card border border-border rounded-xl">
                  <div className="flex justify-between items-start gap-2 flex-wrap">
                    <div>
                      <p className="font-medium text-sm">{project.title}</p>
                      <p className="text-[10px] text-muted-foreground">{project.userEmail} • {project.type} • {project.budget}</p>
                    </div>
                    <Select value={project.status} onValueChange={(v) => handleUpdateProjectStatus(project, v)}>
                      <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{project.description}</p>
                  <p className="text-[10px] mt-1">Contact: {project.contact}</p>
                </div>
              ))}
            </div>
            {customProjects.length === 0 && <p className="text-center text-muted-foreground py-8 bg-secondary/30 rounded-xl text-sm">No projects</p>}
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-4">
            <h3 className="font-semibold">Support Channels</h3>
            <p className="text-xs text-muted-foreground">Configure support contact options. These will be shown in the footer.</p>
            
            <div className="p-4 bg-card border border-border rounded-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1"><Send className="h-3 w-3 text-blue-500" />Telegram 1</Label>
                  <Input value={supportChannels.telegram1 || ''} onChange={(e) => setSupportChannels({...supportChannels, telegram1: e.target.value})} placeholder="@username or https://t.me/..." className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1"><Send className="h-3 w-3 text-blue-500" />Telegram 2</Label>
                  <Input value={supportChannels.telegram2 || ''} onChange={(e) => setSupportChannels({...supportChannels, telegram2: e.target.value})} placeholder="@username or https://t.me/..." className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1"><MessageSquare className="h-3 w-3 text-green-500" />WhatsApp 1</Label>
                  <Input value={supportChannels.whatsapp1 || ''} onChange={(e) => setSupportChannels({...supportChannels, whatsapp1: e.target.value})} placeholder="+91XXXXXXXXXX" className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1"><MessageSquare className="h-3 w-3 text-green-500" />WhatsApp 2</Label>
                  <Input value={supportChannels.whatsapp2 || ''} onChange={(e) => setSupportChannels({...supportChannels, whatsapp2: e.target.value})} placeholder="+91XXXXXXXXXX" className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1"><Phone className="h-3 w-3" />Phone 1</Label>
                  <Input value={supportChannels.phone1 || ''} onChange={(e) => setSupportChannels({...supportChannels, phone1: e.target.value})} placeholder="+91XXXXXXXXXX" className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1"><Phone className="h-3 w-3" />Phone 2</Label>
                  <Input value={supportChannels.phone2 || ''} onChange={(e) => setSupportChannels({...supportChannels, phone2: e.target.value})} placeholder="+91XXXXXXXXXX" className="h-9 text-sm" />
                </div>
              </div>
              <Button onClick={handleSaveSupportChannels} className="w-full mt-4">Save Support Channels</Button>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <h3 className="font-semibold">Site Settings</h3>
            <div className="p-4 bg-card border border-border rounded-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Email</Label>
                  <Input value={siteContent.contactEmail || ''} onChange={(e) => setSiteContent({...siteContent, contactEmail: e.target.value})} className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Phone</Label>
                  <Input value={siteContent.contactPhone || ''} onChange={(e) => setSiteContent({...siteContent, contactPhone: e.target.value})} className="h-9 text-sm" />
                </div>
                <div className="col-span-full space-y-1">
                  <Label className="text-xs">Address</Label>
                  <Input value={siteContent.contactAddress || ''} onChange={(e) => setSiteContent({...siteContent, contactAddress: e.target.value})} className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Instagram</Label>
                  <Input value={siteContent.socialInstagram || ''} onChange={(e) => setSiteContent({...siteContent, socialInstagram: e.target.value})} className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Facebook</Label>
                  <Input value={siteContent.socialFacebook || ''} onChange={(e) => setSiteContent({...siteContent, socialFacebook: e.target.value})} className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Twitter</Label>
                  <Input value={siteContent.socialTwitter || ''} onChange={(e) => setSiteContent({...siteContent, socialTwitter: e.target.value})} className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">YouTube</Label>
                  <Input value={siteContent.socialYoutube || ''} onChange={(e) => setSiteContent({...siteContent, socialYoutube: e.target.value})} className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">WhatsApp Channel</Label>
                  <Input value={siteContent.socialWhatsapp || ''} onChange={(e) => setSiteContent({...siteContent, socialWhatsapp: e.target.value})} placeholder="https://wa.me/..." className="h-9 text-sm" />
                </div>
              </div>
              <Button className="w-full mt-4" onClick={async () => {
                try {
                  await update(ref(database, 'siteContent'), siteContent);
                  toast.success('Settings saved!');
                } catch (error) {
                  toast.error('Failed to save');
                }
              }}>Save Settings</Button>
            </div>
          </TabsContent>

          {/* Admin Management Tab - Super Admin Only */}
          {isSuperAdmin && (
            <TabsContent value="admins" className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-500" />
                    Admin Management
                  </h3>
                  <p className="text-xs text-muted-foreground">Manage admin users, roles, and permissions</p>
                </div>
                <Button size="sm" onClick={() => { resetAdminForm(); setShowAdminForm(true); }}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add Admin
                </Button>
              </div>

              {/* Add/Edit Admin Form */}
              {showAdminForm && (
                <div className="p-4 bg-card border border-border rounded-xl space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-sm">{editingAdmin ? 'Edit Admin' : 'Add New Admin'}</h4>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={resetAdminForm}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">User Email *</Label>
                      <Input
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="user@example.com"
                        disabled={!!editingAdmin}
                        className="h-9 text-sm"
                      />
                      <p className="text-[10px] text-muted-foreground">User must be registered on the platform</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Role</Label>
                      <Select value={adminRole} onValueChange={(v: 'admin' | 'moderator') => setAdminRole(v)}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin (Full Access)</SelectItem>
                          <SelectItem value="moderator">Moderator (Limited Access)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs">Access Level: {adminAccessLevel[0]}%</Label>
                      <span className="text-[10px] text-muted-foreground">
                        {adminAccessLevel[0] < 30 ? 'Low' : adminAccessLevel[0] < 70 ? 'Medium' : 'High'} Access
                      </span>
                    </div>
                    <Slider
                      value={adminAccessLevel}
                      onValueChange={setAdminAccessLevel}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs">Section Permissions</Label>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={selectAllPermissions}>
                          Select All
                        </Button>
                        <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={clearAllPermissions}>
                          Clear All
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {(Object.keys(PERMISSION_LABELS) as (keyof AdminPermissions)[]).map((key) => (
                        <div key={key} className="flex items-center space-x-2">
                          <Checkbox
                            id={`perm-${key}`}
                            checked={adminPermissions[key]}
                            onCheckedChange={() => togglePermission(key)}
                          />
                          <label
                            htmlFor={`perm-${key}`}
                            className="text-xs font-medium cursor-pointer"
                          >
                            {PERMISSION_LABELS[key]}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={editingAdmin ? handleUpdateAdmin : handleAddAdmin}
                  >
                    {editingAdmin ? 'Update Admin' : 'Add Admin'}
                  </Button>
                </div>
              )}

              {/* Admin List */}
              <div className="space-y-3">
                {/* Super Admin (You) */}
                <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/20 rounded-full">
                        <Crown className="h-5 w-5 text-amber-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{ADMIN_EMAIL}</p>
                          <Badge className="bg-amber-500 text-white text-[10px]">Super Admin</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Full access to all sections • Cannot be removed</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-green-500 text-green-600">Active</Badge>
                  </div>
                </div>

                {/* Other Admins */}
                {adminUsers.map((admin) => (
                  <div 
                    key={admin.id} 
                    className={`p-4 bg-card border rounded-xl ${admin.isActive ? 'border-border' : 'border-red-500/30 opacity-60'}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${admin.role === 'admin' ? 'bg-primary/20' : 'bg-secondary'}`}>
                          <UserCog className={`h-5 w-5 ${admin.role === 'admin' ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{admin.email}</p>
                            <Badge variant="outline" className="text-[10px] capitalize">{admin.role}</Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">Access: {admin.accessLevel}%</span>
                            <span className="text-[10px] text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              Added {new Date(admin.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {(Object.keys(admin.permissions) as (keyof AdminPermissions)[])
                              .filter(key => admin.permissions[key])
                              .slice(0, 4)
                              .map((key) => (
                                <Badge key={key} variant="secondary" className="text-[9px] px-1.5 py-0">
                                  {PERMISSION_LABELS[key]}
                                </Badge>
                              ))}
                            {Object.values(admin.permissions).filter(Boolean).length > 4 && (
                              <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                                +{Object.values(admin.permissions).filter(Boolean).length - 4} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={admin.isActive}
                          onCheckedChange={() => handleToggleAdminStatus(admin)}
                        />
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEditAdmin(admin)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteAdmin(admin.id)}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {adminUsers.length === 0 && (
                  <p className="text-center text-muted-foreground py-8 bg-secondary/30 rounded-xl text-sm">
                    No additional admins. Click "Add Admin" to add team members.
                  </p>
                )}
              </div>
            </TabsContent>
          )}

          {/* Themes Tab */}
          <TabsContent value="themes" className="space-y-4">
            <ThemeManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
