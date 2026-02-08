import React, { useState, useEffect } from 'react';
import { Routes, Route, useParams, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import DishDetailPage from './pages/DishDetailPage';
import DishForm from './components/DishForm';
import LoadingSpinner from './components/LoadingSpinner';
import { dishAPI } from './services/api';
import { Dish } from './types';
import LibraryPage from './pages/LibraryPage';
import SettingsPage from './pages/SettingsPage';
import LogsPage from './pages/LogsPage';
import OrderPage from './pages/OrderPage';

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
        setDish(null);
      } finally {
        setLoading(false);
      }
    };

    loadDish();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!dish) return <Navigate to="/library" replace />;

  return <DishForm dish={dish} isEditing />;
};

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/library/:id" element={<LibraryPage />} />
        <Route path="/dish/:id" element={<DishDetailPage />} />
        <Route path="/dish/new" element={<DishForm />} />
        <Route path="/dish/:id/edit" element={<EditFormPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/logs" element={<LogsPage />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
