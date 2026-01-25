import { useState } from 'react';
import { ref, push } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Send } from 'lucide-react';

interface CustomProjectFormProps {
  onAuthRequired: () => void;
}

const CustomProjectForm = ({ onAuthRequired }: CustomProjectFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'website' | 'app' | 'other'>('website');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [contact, setContact] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      onAuthRequired();
      return;
    }

    if (!title || !description || !budget || !contact) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);

    try {
      await push(ref(database, 'customProjects'), {
        userId: user.uid,
        userEmail: user.email,
        title,
        type,
        description,
        budget,
        contact,
        status: 'pending',
        createdAt: Date.now(),
      });

      toast.success('Project request submitted! We will contact you soon.');
      setTitle('');
      setDescription('');
      setBudget('');
      setContact('');
    } catch (error) {
      toast.error('Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="custom" className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Request Custom Project
            </h2>
            <p className="text-muted-foreground">
              Have a unique idea? Let us build it for you!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-2xl shadow-card">
            <div className="space-y-2">
              <Label htmlFor="project-title">Project Title</Label>
              <Input
                id="project-title"
                placeholder="e.g., Birthday Surprise Website"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-type">Project Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="app">Mobile App</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                placeholder="Describe your project in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-budget">Budget Range (₹)</Label>
              <Select value={budget} onValueChange={setBudget}>
                <SelectTrigger>
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="500-1000">₹500 - ₹1,000</SelectItem>
                  <SelectItem value="1000-2500">₹1,000 - ₹2,500</SelectItem>
                  <SelectItem value="2500-5000">₹2,500 - ₹5,000</SelectItem>
                  <SelectItem value="5000+">₹5,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-contact">Contact (Email/Phone)</Label>
              <Input
                id="project-contact"
                placeholder="Your email or phone number"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default CustomProjectForm;
