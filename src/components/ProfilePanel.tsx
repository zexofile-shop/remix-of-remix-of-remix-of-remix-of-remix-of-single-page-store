import { useState, useEffect, useRef } from 'react';
import { ref, onValue, push, set, remove, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Product, CustomProject, Purchase, Testimonial } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Trash2, Edit, Plus, X, LogOut, Package, Users, FileText, Settings, Image, Star, MessageSquare, DollarSign, Youtube, Images, Upload, Loader2, Link } from 'lucide-react';
import { uploadToImgBB } from '@/lib/imgbb';

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SliderImage {
  id: string;
  imageUrl: string;
  title?: string;
  subtitle?: string;
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

const ProfilePanel = ({ isOpen, onClose }: ProfilePanelProps) => {
  const { user, isAdmin, logout } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [allPurchases, setAllPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customProjects, setCustomProjects] = useState<CustomProject[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [heroSlides, setHeroSlides] = useState<SliderImage[]>([]);
  const [bestSelling, setBestSelling] = useState<BestSellingItem[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent>({});
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  
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
  const [newScreenshot, setNewScreenshot] = useState('');

  // Slide form state
  const [showSlideForm, setShowSlideForm] = useState(false);
  const [slideImageUrl, setSlideImageUrl] = useState('');
  const [slideTitle, setSlideTitle] = useState('');
  const [slideSubtitle, setSlideSubtitle] = useState('');
  const [slideOrder, setSlideOrder] = useState('1');

  // Calculate real stats
  const totalUsers = allUsers.length;
  const totalRevenue = allPurchases.reduce((sum, p) => sum + (p.amount || 0), 0);

  useEffect(() => {
    if (!user) return;

    // Fetch user purchases
    const purchasesRef = ref(database, 'purchases');
    const unsubscribePurchases = onValue(purchasesRef, (snapshot) => {
      const data = snapshot.val();
      const list: Purchase[] = data
        ? Object.entries(data)
            .map(([id, value]: [string, any]) => ({ ...value, id }))
        : [];
      setPurchases(list.filter((p) => p.userId === user.uid));
      setAllPurchases(list);
    });

    if (isAdmin) {
      // Fetch all users
      const usersRef = ref(database, 'users');
      const unsubscribeUsers = onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        const usersList: UserData[] = data
          ? Object.entries(data).map(([id, value]: [string, any]) => ({ ...value, id }))
          : [];
        setAllUsers(usersList);
      });

      // Fetch all products
      const coursesRef = ref(database, 'courses');
      const websitesRef = ref(database, 'websites');
      const projectsRef = ref(database, 'customProjects');
      const testimonialsRef = ref(database, 'testimonials');
      const slidesRef = ref(database, 'heroSlides');
      const bestSellingRef = ref(database, 'bestSelling');
      const siteContentRef = ref(database, 'siteContent');

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
      };
    }

    return () => unsubscribePurchases();
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
    setNewScreenshot('');
    setEditingProduct(null);
  };

  const handleAddScreenshot = () => {
    if (newScreenshot.trim()) {
      setScreenshots([...screenshots, newScreenshot.trim()]);
      setNewScreenshot('');
    }
  };

  const handleRemoveScreenshot = (index: number) => {
    setScreenshots(screenshots.filter((_, i) => i !== index));
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
      razorpayLink, // This is now used as deliveryLink
      deliveryLink: razorpayLink, // Store as deliveryLink as well
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
        order: parseInt(slideOrder) || 1,
      });
      toast.success('Slide added!');
      setSlideImageUrl('');
      setSlideTitle('');
      setSlideSubtitle('');
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

  // Site content functions
  const handleUpdateSiteContent = async (key: keyof SiteContent, value: string) => {
    try {
      await update(ref(database, 'siteContent'), { [key]: value });
      toast.success('Content updated!');
    } catch (error) {
      toast.error('Failed to update content');
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
    toast.success('Logged out successfully');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{isAdmin ? 'Admin Panel' : 'My Profile'}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="mb-6 p-4 bg-secondary/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Logged in as</p>
            <p className="font-medium">{user?.email}</p>
            {isAdmin && (
              <span className="inline-block mt-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                Admin
              </span>
            )}
          </div>

          {/* Admin Stats */}
          {isAdmin && (
            <div className="grid grid-cols-2 gap-4 mb-6">
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
            </div>
          )}

          {isAdmin ? (
            <Tabs defaultValue="slides" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="slides" className="flex items-center gap-1">
                  <Image className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">Slides</span>
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">Products</span>
                </TabsTrigger>
                <TabsTrigger value="testimonials" className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">Reviews</span>
                </TabsTrigger>
                <TabsTrigger value="projects" className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">Projects</span>
                </TabsTrigger>
                <TabsTrigger value="content" className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">Content</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-1">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">Settings</span>
                </TabsTrigger>
              </TabsList>

              {/* Hero Slides Tab */}
              <TabsContent value="slides" className="mt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Hero Slider Images (16:9)</h3>
                  <Button size="sm" onClick={() => setShowSlideForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Slide
                  </Button>
                </div>

                {showSlideForm && (
                  <div className="border border-border rounded-lg p-4 space-y-4">
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
                    </div>
                    <Button onClick={handleAddSlide} className="w-full">Add Slide</Button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {heroSlides.map((slide) => (
                    <div key={slide.id} className="relative group rounded-lg overflow-hidden">
                      <img
                        src={slide.imageUrl}
                        alt={slide.title || 'Slide'}
                        className="w-full aspect-video object-cover"
                      />
                      <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteSlide(slide.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-xs font-medium text-foreground bg-background/80 px-2 py-1 rounded">
                          Order: {slide.order} {slide.title && `• ${slide.title}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {heroSlides.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No slides yet. Add your first slide!
                  </p>
                )}
              </TabsContent>

              {/* Products Tab */}
              <TabsContent value="products" className="mt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Manage Products</h3>
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
                  <div className="border border-border rounded-lg p-4 space-y-4">
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
                        <Label>MRP / Original Price (जो काटी जाएगी)</Label>
                        <Input
                          type="number"
                          value={originalPrice}
                          onChange={(e) => setOriginalPrice(e.target.value)}
                          placeholder="e.g., 150000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Selling Price / Discount Price * (जो दिखेगी)</Label>
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
                      
                      {/* Screenshots Section */}
                      <div className="col-span-2 space-y-2">
                        <Label className="flex items-center gap-2">
                          <Images className="h-4 w-4" />
                          Screenshots (Additional Images)
                        </Label>
                        <ScreenshotUploadField
                          screenshots={screenshots}
                          onAdd={(url) => setScreenshots([...screenshots, url])}
                          onRemove={(index) => setScreenshots(screenshots.filter((_, i) => i !== index))}
                        />
                      </div>

                      {/* YouTube URL */}
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
                        <Label>Product Delivery Link (Payment ke baad user ko milega)</Label>
                        <Input
                          value={razorpayLink}
                          onChange={(e) => setRazorpayLink(e.target.value)}
                          placeholder="https://drive.google.com/... or download link"
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label>Description *</Label>
                        <Textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label>Content / Access Info</Label>
                        <Textarea
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          placeholder="Content access details after purchase"
                        />
                      </div>
                    </div>

                    <Button onClick={handleSaveProduct} className="w-full">
                      {editingProduct ? 'Update Product' : 'Add Product'}
                    </Button>
                  </div>
                )}

                <div className="space-y-2">
                  {products.map((product) => {
                    const isBestSelling = bestSelling.some(b => b.productId === product.id);
                    return (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium text-sm">{product.title}</p>
                            <p className="text-xs text-muted-foreground">
                              ₹{product.price} • {product.type}
                              {product.screenshots && product.screenshots.length > 0 && (
                                <span className="ml-2 text-blue-500">📷 {product.screenshots.length}</span>
                              )}
                              {product.youtubeUrl && (
                                <span className="ml-2 text-red-500">▶️</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Switch
                              checked={isBestSelling}
                              onCheckedChange={() => handleToggleBestSelling(product.id)}
                            />
                            <span className="text-xs text-muted-foreground">Best</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduct(product)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {products.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No products yet. Add your first product!
                    </p>
                  )}
                </div>
              </TabsContent>

              {/* Testimonials Tab */}
              <TabsContent value="testimonials" className="mt-4 space-y-4">
                <h3 className="font-semibold">Manage Testimonials</h3>
                <div className="space-y-2">
                  {testimonials.map((testimonial) => (
                    <div
                      key={testimonial.id}
                      className="p-4 bg-secondary/30 rounded-lg space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{testimonial.name}</p>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < testimonial.rating ? 'text-gold fill-gold' : 'text-muted'
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
                  {testimonials.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No testimonials yet.
                    </p>
                  )}
                </div>
              </TabsContent>

              {/* Projects Tab */}
              <TabsContent value="projects" className="mt-4 space-y-4">
                <h3 className="font-semibold">Custom Project Requests</h3>
                <div className="space-y-2">
                  {customProjects.map((project) => (
                    <div
                      key={project.id}
                      className="p-4 bg-secondary/30 rounded-lg space-y-2"
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
                  {customProjects.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No project requests yet.
                    </p>
                  )}
                </div>
              </TabsContent>

              {/* Site Content Tab */}
              <TabsContent value="content" className="mt-4 space-y-4">
                <h3 className="font-semibold">Site Content & Policies</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>What We Offer Description</Label>
                    <Textarea
                      value={siteContent.whatWeOffer || ''}
                      onChange={(e) => setSiteContent(prev => ({ ...prev, whatWeOffer: e.target.value }))}
                      placeholder="Describe what you offer..."
                      rows={3}
                    />
                    <Button size="sm" onClick={() => handleUpdateSiteContent('whatWeOffer', siteContent.whatWeOffer || '')}>
                      Save
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Why Choose Us Description</Label>
                    <Textarea
                      value={siteContent.whyChooseUs || ''}
                      onChange={(e) => setSiteContent(prev => ({ ...prev, whyChooseUs: e.target.value }))}
                      placeholder="Why should customers choose you..."
                      rows={3}
                    />
                    <Button size="sm" onClick={() => handleUpdateSiteContent('whyChooseUs', siteContent.whyChooseUs || '')}>
                      Save
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Privacy Policy</Label>
                    <Textarea
                      value={siteContent.privacyPolicy || ''}
                      onChange={(e) => setSiteContent(prev => ({ ...prev, privacyPolicy: e.target.value }))}
                      placeholder="Your privacy policy..."
                      rows={5}
                    />
                    <Button size="sm" onClick={() => handleUpdateSiteContent('privacyPolicy', siteContent.privacyPolicy || '')}>
                      Save
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Refund Policy</Label>
                    <Textarea
                      value={siteContent.refundPolicy || ''}
                      onChange={(e) => setSiteContent(prev => ({ ...prev, refundPolicy: e.target.value }))}
                      placeholder="Your refund policy..."
                      rows={5}
                    />
                    <Button size="sm" onClick={() => handleUpdateSiteContent('refundPolicy', siteContent.refundPolicy || '')}>
                      Save
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="mt-4 space-y-4">
                <h3 className="font-semibold">Contact & Social Settings</h3>
                
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
              </TabsContent>
            </Tabs>
          ) : (
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                My Purchases
              </h3>
              {purchases.length > 0 ? (
                <div className="space-y-3">
                  {purchases.map((purchase: any) => (
                    <div
                      key={purchase.id}
                      className="p-4 bg-secondary/30 rounded-lg flex items-center gap-4"
                    >
                      {purchase.productImage && (
                        <img 
                          src={purchase.productImage} 
                          alt={purchase.productTitle || 'Product'} 
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{purchase.productTitle || `Product #${purchase.productId}`}</p>
                        <p className="text-sm text-muted-foreground">
                          ₹{purchase.amount} • {new Date(purchase.purchaseDate).toLocaleDateString()}
                        </p>
                        {purchase.razorpayPaymentId && (
                          <p className="text-xs text-muted-foreground">
                            Payment ID: {purchase.razorpayPaymentId}
                          </p>
                        )}
                      </div>
                      {purchase.deliveryLink && (
                        <Button 
                          size="sm" 
                          onClick={() => window.open(purchase.deliveryLink, '_blank')}
                          className="flex-shrink-0"
                        >
                          Access
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No purchases yet. Start shopping!
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfilePanel;
