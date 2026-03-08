import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ProfileCompletion {
  isComplete: boolean;
  percent: number;
  missing: string[];
  profilePic: string | null;
}

export const useProfileCompletion = (): ProfileCompletion => {
  const { user } = useAuth();
  const [data, setData] = useState<ProfileCompletion>({
    isComplete: false,
    percent: 0,
    missing: [],
    profilePic: null,
  });

  useEffect(() => {
    if (!user?.id) return;

    const fetchProfile = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, phone, profile_pic')
        .eq('id', user.id)
        .single();

      if (profile) {
        const fields = [
          { done: !!profile.display_name?.trim(), label: 'Name' },
          { done: !!profile.phone?.trim(), label: 'Phone' },
          { done: !!profile.profile_pic, label: 'Profile Photo' },
        ];
        const done = fields.filter(f => f.done).length;
        setData({
          isComplete: done === fields.length,
          percent: Math.round((done / fields.length) * 100),
          missing: fields.filter(f => !f.done).map(f => f.label),
          profilePic: profile.profile_pic || null,
        });
      }
    };

    fetchProfile();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('profile-completion')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${user.id}`,
      }, () => {
        fetchProfile();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  return data;
};
