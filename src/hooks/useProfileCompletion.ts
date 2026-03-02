import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
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
    if (!user?.uid) return;
    const unsub = onValue(ref(database, `users/${user.uid}`), (snap) => {
      const val = snap.val() || {};
      const fields = [
        { done: !!val.displayName?.trim(), label: 'Name' },
        { done: !!val.phone?.trim(), label: 'Phone' },
        { done: !!val.profilePic, label: 'Profile Photo' },
      ];
      const done = fields.filter(f => f.done).length;
      setData({
        isComplete: done === fields.length,
        percent: Math.round((done / fields.length) * 100),
        missing: fields.filter(f => !f.done).map(f => f.label),
        profilePic: val.profilePic || null,
      });
    });
    return () => unsub();
  }, [user?.uid]);

  return data;
};
