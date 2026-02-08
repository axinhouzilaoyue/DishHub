import { useCallback, useEffect, useMemo, useState } from 'react';
import { dishAPI } from '../services/api';
import { Dish } from '../types';

interface UseDishLibraryOptions {
  category?: string;
  search?: string;
}

export const useDishLibrary = ({ category = 'all', search = '' }: UseDishLibraryOptions) => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const normalizedSearch = useMemo(() => search.trim(), [search]);

  const loadDishes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dishAPI.getAllDishes({
        search: normalizedSearch || undefined,
        category: category !== 'all' ? category : undefined,
      });

      setDishes(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载菜品失败');
    } finally {
      setLoading(false);
    }
  }, [category, normalizedSearch]);

  useEffect(() => {
    loadDishes();
  }, [loadDishes, refreshToken]);

  return {
    dishes,
    loading,
    error,
    reload: loadDishes,
    hardRefresh: () => setRefreshToken((token) => token + 1),
  };
};
