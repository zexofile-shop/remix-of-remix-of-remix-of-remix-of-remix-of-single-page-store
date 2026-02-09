import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ref, update, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { uploadToImgBB } from '@/lib/imgbb';
import { CustomizationFormData } from '@/types';
import { Loader2, Upload, X, CheckCircle, Phone, User, Camera, Video, MessageCircle, ArrowLeft } from 'lucide-react';
import zexofileLogo from '@/assets/zexofile-logo.png';
import { z } from 'zod';

const customizationFormSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name').max(80, 'Name is too long'),
  instagramTelegramId: z.string().trim().max(80, 'Instagram/Telegram ID is too long').optional(),
  callingNumber: z.string().trim().min(5, 'Please enter your calling number').max(20, 'Calling number is too long'),
  whatsappNumber: z.string().trim().min(5, 'Please enter your WhatsApp number').max(20, 'WhatsApp number is too long'),
  alternativeNumber: z.string().trim().max(20, 'Alternative number is too long').optional(),
  photos: z.array(z.string().trim().min(1)).max(20, 'Too many photos').optional(),
  videoDriveLink: z.string().trim().max(500, 'Video link is too long').optional(),
});

const CustomizationFormPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const searchParams = new URLSearchParams(location.search);
  const orderId = searchParams.get('orderId');
  const totalForms = parseInt(searchParams.get('total') || '1', 10);
  const currentForm = parseInt(searchParams.get('current') || '1', 10);
  
  const [name, setName] = useState('');
  const [instagramTelegramId, setInstagramTelegramId] = useState('');
  const [callingNumber, setCallingNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [alternativeNumber, setAlternativeNumber] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [videoDriveLink, setVideoDriveLink] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [productTitle, setProductTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch product title
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      
      const coursesSnapshot = await get(ref(database, `courses/${productId}`));
      if (coursesSnapshot.exists()) {
        setProductTitle(coursesSnapshot.val().title);
        return;
      }
      
      const websitesSnapshot = await get(ref(database, `websites/${productId}`));
      if (websitesSnapshot.exists()) {
        setProductTitle(websitesSnapshot.val().title);
      }
    };
    fetchProduct();
  }, [productId]);

  // Pre-fill user data
  useEffect(() => {
    if (user?.displayName) {
      setName(user.displayName);
    }
  }, [user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`);
          continue;
        }
        if (file.size > 32 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 32MB)`);
          continue;
        }
        const url = await uploadToImgBB(file);
        uploadedUrls.push(url);
      }
      setPhotos([...photos, ...uploadedUrls]);
      if (uploadedUrls.length > 0) {
        toast.success(`${uploadedUrls.length} photo(s) uploaded!`);
      }
    } catch (error) {
      toast.error('Failed to upload some images');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!orderId) {
      toast.error('Invalid order');
      return;
    }

    setIsSubmitting(true);

    const parsed = customizationFormSchema.safeParse({
      name,
      instagramTelegramId,
      callingNumber,
      whatsappNumber,
      alternativeNumber,
      photos,
      videoDriveLink,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || 'Please check your details');
      setIsSubmitting(false);
      return;
    }

    const v = parsed.data;
    // IMPORTANT: Firebase RTDB rejects `undefined` values; omit optional fields instead.
    const formData: CustomizationFormData = {
      name: v.name,
      callingNumber: v.callingNumber,
      whatsappNumber: v.whatsappNumber,
      submittedAt: Date.now(),
      ...(v.instagramTelegramId?.trim() ? { instagramTelegramId: v.instagramTelegramId.trim() } : {}),
      ...(v.alternativeNumber?.trim() ? { alternativeNumber: v.alternativeNumber.trim() } : {}),
      ...(v.photos && v.photos.length > 0 ? { photos: v.photos } : {}),
      ...(v.videoDriveLink?.trim() ? { videoDriveLink: v.videoDriveLink.trim() } : {}),
    };

    try {
      // Update the order submission with form data
      await update(ref(database, `orderSubmissions/${orderId}`), {
        formData,
        status: 'pending',
      });
      
      // Check if there are more forms to fill
      const pendingForms = sessionStorage.getItem('pendingForms');
      const currentIndex = parseInt(sessionStorage.getItem('currentFormIndex') || '0', 10);
      
      if (pendingForms) {
        const formsList = JSON.parse(pendingForms) as string[];
        const nextIndex = currentIndex + 1;
        
        if (nextIndex < formsList.length) {
          // Navigate to next form
          sessionStorage.setItem('currentFormIndex', nextIndex.toString());
          const [nextProductId, nextOrderId] = formsList[nextIndex].split(':');
          toast.success(`Form ${currentForm} of ${totalForms} submitted!`);
          navigate(`/customization-form/${nextProductId}?orderId=${nextOrderId}&total=${formsList.length}&current=${nextIndex + 1}`);
          return;
        } else {
          // All forms done, clean up
          sessionStorage.removeItem('pendingForms');
          sessionStorage.removeItem('currentFormIndex');
        }
      }
      
      setShowSuccess(true);
    } catch (error) {
      console.error('Customization form submit failed:', error);
      toast.error((error as any)?.message || 'Failed to submit form');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <img src={zexofileLogo} alt="ZexoFile" className="h-12 w-12 object-contain" />
            <span className="text-2xl font-bold text-foreground">ZexoFile Shop</span>
          </div>

          <div className="bg-card border border-border rounded-3xl p-8 shadow-lg">
            <div className="w-24 h-24 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 animate-scale-in">
              <CheckCircle className="h-14 w-14 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-foreground mb-3">Thanks for Submitting!</h1>
            
            <p className="text-muted-foreground mb-6">
              Our team will contact you soon within an hour. We'll reach out via WhatsApp or call to discuss your customization.
            </p>

            <div className="flex flex-col gap-3">
              <Button onClick={() => navigate('/profile')} className="w-full py-6">
                View My Orders
              </Button>
              <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header with Logo */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <img src={zexofileLogo} alt="ZexoFile" className="h-8 w-8 object-contain" />
            <span className="font-bold text-foreground">ZexoFile Shop</span>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Customize Your Order
            {totalForms > 1 && (
              <span className="text-lg text-muted-foreground ml-2">
                ({currentForm} of {totalForms})
              </span>
            )}
          </h1>
          {productTitle && (
            <p className="text-muted-foreground">
              for "{productTitle}"
            </p>
          )}
        </div>

        {/* Form Card */}
        <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-lg">
          <div className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-base">
                <User className="h-5 w-5 text-primary" />
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="h-12 rounded-xl text-base"
              />
            </div>

            {/* Instagram/Telegram ID */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-base">
                <MessageCircle className="h-5 w-5 text-primary" />
                Instagram/Telegram ID <span className="text-muted-foreground text-sm">(Optional)</span>
              </Label>
              <Input
                value={instagramTelegramId}
                onChange={(e) => setInstagramTelegramId(e.target.value)}
                placeholder="@username"
                className="h-12 rounded-xl text-base"
              />
            </div>

            {/* Contact Numbers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-base">
                  <Phone className="h-5 w-5 text-primary" />
                  Calling Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="tel"
                  value={callingNumber}
                  onChange={(e) => setCallingNumber(e.target.value)}
                  placeholder="+91 XXXXXXXXXX"
                  className="h-12 rounded-xl text-base"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-base">
                  <MessageCircle className="h-5 w-5 text-green-500" />
                  WhatsApp Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+91 XXXXXXXXXX"
                  className="h-12 rounded-xl text-base"
                />
              </div>
            </div>

            {/* Alternative Number */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-base">
                <Phone className="h-5 w-5 text-muted-foreground" />
                Alternative Number <span className="text-muted-foreground text-sm">(Optional)</span>
              </Label>
              <Input
                type="tel"
                value={alternativeNumber}
                onChange={(e) => setAlternativeNumber(e.target.value)}
                placeholder="+91 XXXXXXXXXX"
                className="h-12 rounded-xl text-base"
              />
            </div>

            {/* Photo Upload */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base">
                <Camera className="h-5 w-5 text-primary" />
                Upload Photos <span className="text-muted-foreground text-sm">(Optional)</span>
              </Label>
              
              {photos.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-3">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={photo} 
                        alt={`Uploaded ${index + 1}`} 
                        className="w-20 h-20 object-cover rounded-xl border-2 border-border"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full h-14 rounded-xl text-base border-dashed"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Uploading...</>
                ) : (
                  <><Upload className="h-5 w-5 mr-2" />Choose Photos</>
                )}
              </Button>
            </div>

            {/* Video Drive Link */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-base">
                <Video className="h-5 w-5 text-red-500" />
                Video Drive Link <span className="text-muted-foreground text-sm">(Optional, .MP4 format)</span>
              </Label>
              <Input
                value={videoDriveLink}
                onChange={(e) => setVideoDriveLink(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="h-12 rounded-xl text-base"
              />
            </div>

            {/* Submit Button */}
            <Button 
              onClick={handleSubmit} 
              className="w-full h-14 text-lg font-semibold rounded-xl mt-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <><Loader2 className="h-6 w-6 mr-2 animate-spin" />Submitting...</>
              ) : (
                'Submit Customization Request'
              )}
            </Button>
          </div>
        </div>

        {/* Note */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Our team will contact you within an hour to discuss your customization
        </p>
      </main>
    </div>
  );
};

export default CustomizationFormPage;
