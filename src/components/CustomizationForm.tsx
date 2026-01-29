import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { uploadToImgBB } from '@/lib/imgbb';
import { CustomizationFormData } from '@/types';
import { Loader2, Upload, X, CheckCircle, Phone, User, Camera, Video, MessageCircle } from 'lucide-react';

interface CustomizationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomizationFormData) => void;
  productTitle: string;
}

const CustomizationForm = ({ isOpen, onClose, onSubmit, productTitle }: CustomizationFormProps) => {
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!callingNumber.trim()) {
      toast.error('Please enter your calling number');
      return;
    }
    if (!whatsappNumber.trim()) {
      toast.error('Please enter your WhatsApp number');
      return;
    }

    setIsSubmitting(true);
    
    const formData: CustomizationFormData = {
      name: name.trim(),
      instagramTelegramId: instagramTelegramId.trim() || undefined,
      callingNumber: callingNumber.trim(),
      whatsappNumber: whatsappNumber.trim(),
      alternativeNumber: alternativeNumber.trim() || undefined,
      photos: photos.length > 0 ? photos : undefined,
      videoDriveLink: videoDriveLink.trim() || undefined,
      submittedAt: Date.now(),
    };

    try {
      await onSubmit(formData);
      setShowSuccess(true);
    } catch (error) {
      toast.error('Failed to submit form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (showSuccess) {
      // Reset form
      setName('');
      setInstagramTelegramId('');
      setCallingNumber('');
      setWhatsappNumber('');
      setAlternativeNumber('');
      setPhotos([]);
      setVideoDriveLink('');
      setShowSuccess(false);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {showSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center animate-scale-in">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Thanks for Submitting!</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Our team will contact you soon within an hour. We'll reach out via WhatsApp or call.
            </p>
            <Button onClick={handleClose} className="mt-4">
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">
                Customize Your Order
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Fill in the details below to customize "{productTitle}"
              </p>
            </DialogHeader>

            <div className="space-y-5 mt-4">
              {/* Name */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Full Name *
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              {/* Instagram/Telegram ID */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  Instagram/Telegram ID (Optional)
                </Label>
                <Input
                  value={instagramTelegramId}
                  onChange={(e) => setInstagramTelegramId(e.target.value)}
                  placeholder="@username"
                />
              </div>

              {/* Contact Numbers */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    Calling Number *
                  </Label>
                  <Input
                    type="tel"
                    value={callingNumber}
                    onChange={(e) => setCallingNumber(e.target.value)}
                    placeholder="+91 XXXXXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-green-500" />
                    WhatsApp Number *
                  </Label>
                  <Input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+91 XXXXXXXXXX"
                  />
                </div>
              </div>

              {/* Alternative Number */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Alternative Number (Optional)
                </Label>
                <Input
                  type="tel"
                  value={alternativeNumber}
                  onChange={(e) => setAlternativeNumber(e.target.value)}
                  placeholder="+91 XXXXXXXXXX"
                />
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-primary" />
                  Upload Photos (Optional)
                </Label>
                
                {photos.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={photo} 
                          alt={`Uploaded ${index + 1}`} 
                          className="w-16 h-16 object-cover rounded-lg border border-border"
                        />
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
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
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading...</>
                  ) : (
                    <><Upload className="h-4 w-4 mr-2" />Choose Photos</>
                  )}
                </Button>
              </div>

              {/* Video Drive Link */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-red-500" />
                  Video Drive Link (Optional, .MP4 format)
                </Label>
                <Input
                  value={videoDriveLink}
                  onChange={(e) => setVideoDriveLink(e.target.value)}
                  placeholder="https://drive.google.com/..."
                />
              </div>

              {/* Submit Button */}
              <Button 
                onClick={handleSubmit} 
                className="w-full py-6 text-base font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Submitting...</>
                ) : (
                  'Submit Customization Request'
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CustomizationForm;
