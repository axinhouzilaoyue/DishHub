import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { dishAPI } from '../services/api';
import { Dish } from '../types';
import DishForm from '../components/DishForm';

const EditDishPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [dish, setDish] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDish = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const dishData = await dishAPI.getDish(parseInt(id));
        setDish(dishData);
        setError(null);
      } catch (err) {
        console.error('加载菜品失败:', err);
        setError('菜品不存在或加载失败');
      } finally {
        setLoading(false);
      }
    };

    loadDish();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">加载中...</div>
      </div>
    );
  }

  if (error || !dish) {
    return <Navigate to="/" replace />;
  }

  return <DishForm dish={dish} isEditing />;
};

export default EditDishPage;
