import { useState, useEffect, useCallback } from 'react';
import { Address } from '@/lib/supabase';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export const useAddresses = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAddresses = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (err) {
      console.error('useAddresses error:', err);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) { setAddresses([]); return; }
    fetchAddresses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, fetchAddresses]);

  const addAddress = async (address: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('addresses')
      .insert({ ...address, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    setAddresses(prev => [...prev, data]);
    return data;
  };

  const updateAddress = async (id: string, updates: Partial<Address>) => {
    const { error } = await supabase
      .from('addresses').update(updates).eq('id', id);
    if (error) throw error;
    setAddresses(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAddress = async (id: string) => {
    const { error } = await supabase.from('addresses').delete().eq('id', id);
    if (error) throw error;
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  const setDefault = async (id: string) => {
    if (!user) return;
    // quitar default de todos
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
    // poner default al seleccionado
    await supabase.from('addresses').update({ is_default: true }).eq('id', id);
    setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === id })));
  };

  return { addresses, isLoading, addAddress, updateAddress, deleteAddress, setDefault, refetch: fetchAddresses };
};