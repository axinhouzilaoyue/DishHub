import React, { useState, useEffect } from 'react';
import { Routes, Route, useParams, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import DishDetailPage from './pages/DishDetailPage';
import DishForm from './components/DishForm';
import LoadingSpinner from './components/LoadingSpinner';
import { dishAPI } from './services/api';
import { Dish } from './types';

// 编辑页面组件
const EditFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [dish, setDish] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDish = async () => {
      if (!id) return;
      
      try {
        const dishData = await dishAPI.getDish(parseInt(id));
        setDish(dishData);
      } catch (err) {
        console.error('加载菜品失败:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDish();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!dish) return <Navigate to="/" replace />;

  return <DishForm dish={dish} isEditing />;
};

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dish/:id" element={<DishDetailPage />} />
        <Route path="/add" element={<DishForm />} />
        <Route path="/edit/:id" element={<EditFormPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
