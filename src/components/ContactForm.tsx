import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Send, Loader2 } from 'lucide-react';

const ContactForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('contact_messages').insert({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        message: message.trim(),
        created_at: Date.now(),
        read: false,
      });
      if (error) throw error;
      toast.success('Message sent successfully! We will get back to you soon.');
      setName(''); setEmail(''); setPhone(''); setMessage('');
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact-name">Name *</Label>
          <Input id="contact-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={50} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email">Email *</Label>
          <Input id="contact-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" maxLength={100} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-phone">Phone (Optional)</Label>
        <Input id="contact-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" maxLength={20} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-message">Message *</Label>
        <Textarea id="contact-message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How can we help you?" rows={4} maxLength={1000} />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</>) : (<><Send className="h-4 w-4 mr-2" />Send Message</>)}
      </Button>
    </form>
  );
};

export default ContactForm;
