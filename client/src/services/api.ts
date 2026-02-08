import axios from 'axios';
import { AdminStats, ApiHealth, BackupExportResult, Dish, DishFormData } from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

const normalizeError = (rawError: unknown): string => {
  if (axios.isAxiosError(rawError)) {
    const data = rawError.response?.data;

    if (typeof data?.error === 'string') {
      return data.error;
    }

    if (typeof data?.error?.message === 'string') {
      return data.error.message;
    }

    if (Array.isArray(data?.error?.details?.fields)) {
      return data.error.details.fields.join('；');
    }

    if (rawError.message) {
      return rawError.message;
    }
  }

  return '请求失败，请稍后重试';
};

const withErrorHandling = async <T>(task: () => Promise<T>): Promise<T> => {
  try {
    return await task();
  } catch (err) {
    throw new Error(normalizeError(err));
  }
};

export const dishAPI = {
  // 获取所有菜品
  getAllDishes: async (params?: {
    category?: string;
    search?: string;
    tag?: string;
  }): Promise<Dish[]> => {
    return withErrorHandling(async () => {
      const response = await api.get('/dishes', { params });
      return response.data;
    });
  },

  // 获取单个菜品
  getDish: async (id: number): Promise<Dish> => {
    return withErrorHandling(async () => {
      const response = await api.get(`/dishes/${id}`);
      return response.data;
    });
  },

  // 创建菜品
  createDish: async (data: DishFormData): Promise<{ id: number; message: string }> => {
    return withErrorHandling(async () => {
      const response = await api.post('/dishes', data);
      return response.data;
    });
  },

  // 更新菜品
  updateDish: async (id: number, data: DishFormData): Promise<{ message: string }> => {
    return withErrorHandling(async () => {
      const response = await api.put(`/dishes/${id}`, data);
      return response.data;
    });
  },

  // 删除菜品
  deleteDish: async (id: number): Promise<{ message: string }> => {
    return withErrorHandling(async () => {
      const response = await api.delete(`/dishes/${id}`);
      return response.data;
    });
  },

  // 获取所有分类
  getCategories: async (): Promise<string[]> => {
    return withErrorHandling(async () => {
      const response = await api.get('/dishes/categories');
      return response.data;
    });
  },
};

export const adminAPI = {
  getHealth: async (): Promise<ApiHealth> => {
    return withErrorHandling(async () => {
      const response = await api.get('/health');
      return response.data;
    });
  },

  getStats: async (): Promise<AdminStats> => {
    return withErrorHandling(async () => {
      const response = await api.get('/admin/stats');
      return response.data;
    });
  },

  exportBackup: async (backupKey?: string): Promise<BackupExportResult> => {
    return withErrorHandling(async () => {
      const response = await api.get('/admin/backup', {
        responseType: 'blob',
        headers: backupKey ? { 'x-backup-key': backupKey } : undefined,
      });

      const disposition = String(response.headers['content-disposition'] || '');
      const filenameMatch = disposition.match(/filename="?([^";]+)"?/i);
      const filename = filenameMatch?.[1] || `dishhub-backup-${Date.now()}.sql`;

      return {
        blob: response.data,
        filename,
      };
    });
  },
};
