import axios from 'axios';
import { Dish, DishFormData, CookingLog, CookingLogFormData } from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

export const dishAPI = {
  // 获取所有菜品
  getAllDishes: async (params?: {
    category?: string;
    search?: string;
    tag?: string;
  }): Promise<Dish[]> => {
    const response = await api.get('/dishes', { params });
    return response.data;
  },

  // 获取单个菜品
  getDish: async (id: number): Promise<Dish> => {
    const response = await api.get(`/dishes/${id}`);
    return response.data;
  },

  // 创建菜品
  createDish: async (data: DishFormData): Promise<{ id: number; message: string }> => {
    const response = await api.post('/dishes', data);
    return response.data;
  },

  // 更新菜品
  updateDish: async (id: number, data: DishFormData): Promise<{ message: string }> => {
    const response = await api.put(`/dishes/${id}`, data);
    return response.data;
  },

  // 删除菜品
  deleteDish: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/dishes/${id}`);
    return response.data;
  },

  // 获取所有分类
  getCategories: async (): Promise<string[]> => {
    const response = await api.get('/dishes/categories');
    return response.data;
  },
};

export const cookingLogAPI = {
  // 获取指定菜品的烹饪日志
  getCookingLogs: async (dishId: number): Promise<CookingLog[]> => {
    const response = await api.get(`/dishes/${dishId}/logs`);
    return response.data;
  },

  // 添加烹饪日志
  addCookingLog: async (dishId: number, data: CookingLogFormData): Promise<{ id: number; message: string }> => {
    const response = await api.post(`/dishes/${dishId}/logs`, data);
    return response.data;
  },
};
