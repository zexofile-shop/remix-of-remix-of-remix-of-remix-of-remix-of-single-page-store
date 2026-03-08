import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Phone, Send, MessageCircle } from 'lucide-react';
import { SupportChannels } from '@/types';
import zexofileLogo from '@/assets/zexofile-logo.png';

const Footer = () => {
  const [supportChannels, setSupportChannels] = useState<SupportChannels>({});

  useEffect(() => {
    const fetchSupport = async () => {
      const { data } = await supabase.from('support_channels').select('*').limit(1).maybeSingle();
      if (data) setSupportChannels(data);
    };
    fetchSupport();
  }, []);

  const openWhatsApp = (number?: string) => {
    if (number) window.open(`https://wa.me/${number.replace(/\D/g, '')}`, '_blank');
  };

  const openTelegram = (handle?: string) => {
    if (handle) {
      const url = handle.startsWith('http') ? handle : `https://t.me/${handle.replace('@', '')}`;
      window.open(url, '_blank');
    }
  };

  const hasSupport = supportChannels.telegram1 || supportChannels.whatsapp1 || supportChannels.phone1;

  return (
    <footer className="bg-foreground text-background">
      {hasSupport && (
        <section className="py-12 border-b border-background/10">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold text-center mb-6">Contact Support</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {supportChannels.telegram1 && (
                <button onClick={() => openTelegram(supportChannels.telegram1)} className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-full transition-colors">
                  <Send className="h-4 w-4" />Telegram 1
                </button>
              )}
              {supportChannels.telegram2 && (
                <button onClick={() => openTelegram(supportChannels.telegram2)} className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-full transition-colors">
                  <Send className="h-4 w-4" />Telegram 2
                </button>
              )}
              {supportChannels.whatsapp1 && (
                <button onClick={() => openWhatsApp(supportChannels.whatsapp1)} className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-full transition-colors">
                  <MessageCircle className="h-4 w-4" />WhatsApp 1
                </button>
              )}
              {supportChannels.whatsapp2 && (
                <button onClick={() => openWhatsApp(supportChannels.whatsapp2)} className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-full transition-colors">
                  <MessageCircle className="h-4 w-4" />WhatsApp 2
                </button>
              )}
              {supportChannels.phone1 && (
                <a href={`tel:${supportChannels.phone1}`} className="flex items-center gap-2 px-4 py-2 bg-background/10 hover:bg-background/20 rounded-full transition-colors">
                  <Phone className="h-4 w-4" />{supportChannels.phone1}
                </a>
              )}
              {supportChannels.phone2 && (
                <a href={`tel:${supportChannels.phone2}`} className="flex items-center gap-2 px-4 py-2 bg-background/10 hover:bg-background/20 rounded-full transition-colors">
                  <Phone className="h-4 w-4" />{supportChannels.phone2}
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      <div className="py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <img src={zexofileLogo} alt="ZexoFile Shop" className="h-10 w-10 object-contain" />
              <span className="text-lg font-bold">ZexoFile Shop</span>
            </div>
            <p className="text-sm text-background/70">
              © {new Date().getFullYear()} ZexoFile Shop. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
